import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from "@nestjs/common";
import { KycStatus, Transaction, TransactionStatus, TransactionType } from "@prisma/client";
import { CreateTransactionDto } from "src/transactions/transaction.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { InternalUserModel } from "src/users/user.entity";
import { AuditService } from "src/audit/audit.service";

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService
  ) {}

  async createTransaction(sender: InternalUserModel, createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    const { receiverId, amount } = createTransactionDto;

    if (sender.kycStatus !== KycStatus.VERIFIED) {
      await this.auditService.logAction(sender.id, "KYC_Alert", "User is not Verified.");
      throw new ForbiddenException("User is not Verified.");
    }

    if (sender.id === receiverId) throw new ConflictException("User cannot send money to themselves");

    if (sender.balanceCents < amount) throw new NotAcceptableException("Insufficient funds");

    const receiver = await this.prisma.user.findUnique({ where: { id: receiverId } });
    if (!receiver || !sender) throw new NotFoundException("User not found");

    if (receiver.kycStatus !== KycStatus.VERIFIED) {
      await this.auditService.logAction(sender.id, "KYC_Alert", "Receiver is not Verified");
      throw new ForbiddenException("Receiver is not Verified");
    }

    //AML Rule, block transactions above 20k
    if (amount > 20000 * 100) {
      await this.auditService.logAction(sender.id, "AML_ALERT", `Tried to transfer more than $${amount}`);
      throw new ForbiddenException("Transaction amount exceeds the limit");
    }

    //AML Rule, block above 5 transactions in 20 minutes
    const recentTransactions = await this.prisma.transaction.count({
      where: { senderId: sender.id, createdAt: { gte: new Date(Date.now() - 20 * 60 * 1000) } },
    });

    if (recentTransactions > 5) {
      await this.auditService.logAction(
        sender.id,
        "AML_ALERT",
        "User tried to make too many transactions in a short period"
      );
      throw new ForbiddenException("Too many transactions in a short period");
    }

    //Create transaction, set status to PENDING until processed
    const transaction = await this.prisma.transaction.create({
      data: {
        senderId: sender.id,
        receiverId,
        amount,
        status: TransactionStatus.PENDING,
        type: TransactionType.TRANSFER,
      },
    });
    this.logTransaction(transaction, "Create");

    //Update sender's and receiver's balance, if anything goes bad return funds and set the transaction to FAILED
    let prismaTransaction: Transaction;
    try {
      prismaTransaction = await this.prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: sender.id },
          data: { balanceCents: { decrement: transaction.amount } },
        });

        await tx.user.update({
          where: { id: receiverId },
          data: { balanceCents: { increment: transaction.amount } },
        });

        const completedTransaction = await tx.transaction.update({
          where: { id: transaction.id },
          data: { status: TransactionStatus.COMPLETED },
        });
        this.logTransaction(completedTransaction, "Create");

        return completedTransaction;
      });
    } catch (error) {
      const failedTransaction = await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: TransactionStatus.FAILED },
      });
      this.logTransaction(failedTransaction, "Create");
      throw error;
    }

    return prismaTransaction;
  }

  async reverseTransaction(sender: InternalUserModel, transactionId: string): Promise<Transaction> {
    const oldTransaction = await this.prisma.transaction.findUnique({ where: { id: transactionId } });

    if (!oldTransaction) throw new Error("Transaction not found");
    if (oldTransaction.status !== TransactionStatus.COMPLETED)
      throw new BadRequestException("Only completed transactions can be reversed");
    if (oldTransaction.senderId !== sender.id)
      throw new BadRequestException("Only the sender can reverse the transaction");
    if (oldTransaction.type == TransactionType.NON_REFUNDABLE || !oldTransaction.senderId)
      throw new BadRequestException("Non Refundable Transactions cannot be reversed");

    //Create reversal, set status to PENDING until processed
    let reverseTransaction = await this.prisma.transaction.create({
      data: {
        senderId: oldTransaction.senderId,
        receiverId: oldTransaction.receiverId,
        amount: oldTransaction.amount,
        status: TransactionStatus.PENDING,
        type: TransactionType.REVERSAL,
      },
    });
    this.logTransaction(reverseTransaction, "Reverse");

    //Revert sender's and receiver's balance, if anything goes bad return funds and set the transaction to FAILED
    try {
      reverseTransaction = await this.prisma.$transaction(async (tx) => {
        //Revert the values
        await tx.user.update({
          where: { id: reverseTransaction.senderId! },
          data: { balanceCents: { increment: reverseTransaction.amount } },
        });

        await tx.user.update({
          where: { id: reverseTransaction.receiverId },
          data: { balanceCents: { decrement: reverseTransaction.amount } },
        });

        const reversedTransaction = await tx.transaction.update({
          where: { id: oldTransaction.id },
          data: { status: TransactionStatus.REVERSED },
        });

        this.logTransaction(reversedTransaction, "Reverse");

        const completedReversal = await tx.transaction.update({
          where: { id: reverseTransaction.id },
          data: { status: TransactionStatus.COMPLETED },
        });

        this.logTransaction(completedReversal, "Reverse");
        return completedReversal;
      });
    } catch (error) {
      const failedReversal = await this.prisma.transaction.update({
        where: { id: reverseTransaction.id },
        data: { status: TransactionStatus.FAILED },
      });

      this.logTransaction(failedReversal, "Reverse");
      throw error;
    }

    return reverseTransaction;
  }

  //TODO: Remove or make this function admin only on production
  async addFunds(user: InternalUserModel, amount: number): Promise<Transaction> {
    const transaction = await this.prisma.transaction.create({
      data: {
        senderId: null,
        receiverId: user.id,
        amount,
        status: TransactionStatus.PENDING,
        type: TransactionType.NON_REFUNDABLE,
      },
    });
    this.logTransaction(transaction, "AddFunds");

    let prismaTransaction: Transaction;
    try {
      prismaTransaction = await this.prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: user.id },
          data: { balanceCents: { increment: amount } },
        });

        const completedTransaction = await tx.transaction.update({
          where: { id: transaction.id },
          data: { status: TransactionStatus.COMPLETED },
        });

        this.logTransaction(completedTransaction, "AddFunds");
        return completedTransaction;
      });
    } catch (error) {
      const failedTransaction = await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: TransactionStatus.FAILED },
      });
      this.logTransaction(failedTransaction, "AddFunds");
      throw error;
    }

    return prismaTransaction;
  }

  async getTransactionById(transactionId: string): Promise<Transaction | null> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) throw new NotFoundException("Transaction not found");

    return transaction;
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return await this.prisma.transaction.findMany();
  }

  async getTransactionsByUser(user: InternalUserModel): Promise<Transaction[]> {
    return await this.prisma.transaction.findMany({
      where: {
        OR: [{ senderId: user.id }, { receiverId: user.id }],
      },
    });
  }

  async logTransaction(transaction: Transaction, functionName: string) {
    const loggedMessage = `[Transaction] New ${transaction.type} Transaction, ID: ${transaction.id},
      From Sender ID: ${transaction.senderId} to Receiver ID: ${transaction.receiverId},
      Amount: ${transaction.amount}, Status: ${transaction.status}, Type: ${transaction.type},
      CalledBy: ${functionName}`;
    console.log(loggedMessage);

    await this.prisma.transactionLogs.create({
      data: {
        transactionId: transaction.id,
        status: transaction.status,
        loggedMessage: loggedMessage,
      },
    });
  }

  async getTransactionLogs() {
    return await this.prisma.transactionLogs.findMany({});
  }
}
