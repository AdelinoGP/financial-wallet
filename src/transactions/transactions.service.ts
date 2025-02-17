import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from "@nestjs/common";
import { Transaction, TransactionStatus, TransactionType } from "@prisma/client";
import { CreateTransactionDto } from "src/transactions/transaction.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { InternalUserModel } from "src/users/user.entity";

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async createTransaction(sender: InternalUserModel, createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    const { receiverId, amount } = createTransactionDto;

    if (sender.id === receiverId) throw new ConflictException("User cannot send money to themselves");

    if (sender.balanceCents < amount) throw new NotAcceptableException("Insufficient funds");

    const receiver = await this.prisma.user.findUnique({ where: { id: receiverId } });
    if (!receiver || !sender) throw new NotFoundException("User not found");

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

        return await tx.transaction.update({
          where: { id: transaction.id },
          data: { status: TransactionStatus.COMPLETED },
        });
      });
    } catch (error) {
      await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: TransactionStatus.FAILED },
      });
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

    let reverseTransaction = await this.prisma.transaction.create({
      data: {
        senderId: oldTransaction.senderId,
        receiverId: oldTransaction.receiverId,
        amount: oldTransaction.amount,
        status: TransactionStatus.PENDING,
        type: TransactionType.REVERSAL,
      },
    });

    if (reverseTransaction.type == TransactionType.NON_REFUNDABLE || !reverseTransaction.senderId)
      throw new BadRequestException("Non Refundable Transactions cannot be reversed");

    //Revert sender's and receiver's balance, if anything goes bad return funds and set the transaction to FAILED
    try {
      await this.prisma.$transaction(async (tx) => {
        //Revert the values
        await tx.user.update({
          where: { id: reverseTransaction.senderId! },
          data: { balanceCents: { increment: reverseTransaction.amount } },
        });

        await tx.user.update({
          where: { id: reverseTransaction.receiverId },
          data: { balanceCents: { decrement: reverseTransaction.amount } },
        });

        await tx.transaction.update({
          where: { id: oldTransaction.id },
          data: { status: TransactionStatus.REVERSED },
        });

        reverseTransaction = await tx.transaction.update({
          where: { id: reverseTransaction.id },
          data: { status: TransactionStatus.COMPLETED },
        });
      });
    } catch (error) {
      await this.prisma.transaction.update({
        where: { id: reverseTransaction.id },
        data: { status: TransactionStatus.FAILED },
      });
      throw error;
    }

    return reverseTransaction;
  }

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

    let prismaTransaction: Transaction;
    try {
      prismaTransaction = await this.prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: user.id },
          data: { balanceCents: { increment: amount } },
        });

        return await tx.transaction.update({
          where: { id: transaction.id },
          data: { status: TransactionStatus.COMPLETED },
        });
      });
    } catch (error) {
      prismaTransaction = await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: TransactionStatus.FAILED },
      });
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

  async logTransaction(transactionId: string): Promise<void> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    console.log(`Transaction ID: ${transaction.id}`);
    console.log(`Sender ID: ${transaction.senderId}`);
    console.log(`Receiver ID: ${transaction.receiverId}`);
    console.log(`Amount: ${transaction.amount}`);
    console.log(`Status: ${transaction.status}`);
    console.log(`Type: ${transaction.type}`);
    console.log(`Created At: ${transaction.createdAt}`);
  }
}
