import { Test, TestingModule } from "@nestjs/testing";
import { TransactionsService } from "./transactions.service";
import { PrismaService } from "../prisma/prisma.service";
import { ConflictException, NotAcceptableException, NotFoundException, BadRequestException } from "@nestjs/common";
import { KycStatus, TransactionStatus, TransactionType } from "@prisma/client";

describe("TransactionsService", () => {
  let service: TransactionsService;
  let prismaService: PrismaService;

  const sender = {
    id: "1",
    email: "john.doe@example.com",
    firstName: "John",
    password: "password",
    lastName: "Doe",
    documentId: "10933656092",
    kycStatus: KycStatus.PENDING,
    balanceCents: 400,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const receiver = {
    id: "2",
    email: "jane.doe@example.com",
    firstName: "Jane",
    password: "password",
    lastName: "Doe",
    documentId: "39210487028",
    kycStatus: KycStatus.VERIFIED,
    balanceCents: 1000,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const transactionPending = {
    id: "1",
    senderId: "1",
    receiverId: "2",
    amount: 500,
    status: TransactionStatus.PENDING,
    type: TransactionType.TRANSFER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const transactionCompleted = {
    id: "1",
    senderId: "1",
    receiverId: "2",
    amount: 500,
    status: TransactionStatus.COMPLETED,
    type: TransactionType.TRANSFER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const reversalPending = {
    id: "2",
    senderId: "1",
    receiverId: "2",
    amount: 500,
    status: TransactionStatus.PENDING,
    type: TransactionType.REVERSAL,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const reversalCompleted = {
    id: "2",
    senderId: "1",
    receiverId: "2",
    amount: 500,
    status: TransactionStatus.COMPLETED,
    type: TransactionType.REVERSAL,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const transactionReversed = {
    id: "1",
    senderId: "1",
    receiverId: "2",
    amount: 500,
    status: TransactionStatus.REVERSED,
    type: TransactionType.TRANSFER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const transactions = [transactionPending, transactionCompleted, reversalPending, reversalCompleted];
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            transaction: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("createTransaction", () => {
    it("should throw ConflictException if sender and receiver are the same", async () => {
      const createTransactionDto = { receiverId: "1", amount: 500 };

      await expect(service.createTransaction(sender, createTransactionDto)).rejects.toThrow(ConflictException);
    });

    it("should throw NotAcceptableException if sender has insufficient funds", async () => {
      const createTransactionDto = { receiverId: "2", amount: 100000 };

      await expect(service.createTransaction(sender, createTransactionDto)).rejects.toThrow(NotAcceptableException);
    });

    it("should throw NotFoundException if receiver is not found", async () => {
      const createTransactionDto = { receiverId: "2", amount: 100 };
      jest.spyOn(prismaService.user, "findUnique").mockResolvedValue(null);

      await expect(service.createTransaction(sender, createTransactionDto)).rejects.toThrow(NotFoundException);
    });

    it("should create a transaction and update balances", async () => {
      const createTransactionDto = { receiverId: "2", amount: 200 };

      jest.spyOn(prismaService.user, "findUnique").mockResolvedValue(receiver);
      jest.spyOn(prismaService.transaction, "create").mockResolvedValue(transactionPending);
      jest.spyOn(prismaService.transaction, "update").mockResolvedValue(transactionCompleted);

      const mockTx = {
        user: {
          update: jest.fn().mockResolvedValueOnce({}).mockResolvedValueOnce({}),
        },
        transaction: {
          update: jest.fn().mockResolvedValueOnce(transactionCompleted),
        },
      };

      jest.spyOn(prismaService, "$transaction").mockImplementation(async (callback) => {
        return await callback(mockTx as any);
      });

      const result = await service.createTransaction(sender, createTransactionDto);

      expect(result.status).toBe(TransactionStatus.COMPLETED);
      expect(result.type).toBe(TransactionType.TRANSFER);
      expect(result.id).toBe(transactionCompleted.id);
      expect(result.senderId).toBe(transactionCompleted.senderId);
      expect(result.receiverId).toBe(transactionCompleted.receiverId);
      expect(result.amount).toBe(transactionCompleted.amount);
      expect(result.createdAt).toEqual(transactionCompleted.createdAt);
      expect(result.updatedAt).toEqual(transactionCompleted.updatedAt);

      expect(prismaService.$transaction).toHaveBeenCalled();

      expect(mockTx.user.update).toHaveBeenNthCalledWith(1, {
        where: { id: sender.id },
        data: { balanceCents: { decrement: transactionPending.amount } },
      });
      expect(mockTx.user.update).toHaveBeenNthCalledWith(2, {
        where: { id: receiver.id },
        data: { balanceCents: { increment: transactionPending.amount } },
      });
      expect(mockTx.transaction.update).toHaveBeenCalledWith({
        where: { id: transactionPending.id },
        data: { status: TransactionStatus.COMPLETED },
      });
    });
  });

  describe("reverseTransaction", () => {
    it("should throw Error if transaction is not found", async () => {
      jest.spyOn(prismaService.transaction, "findUnique").mockResolvedValue(null);

      await expect(service.reverseTransaction(sender, "1")).rejects.toThrow(Error);
    });

    it("should throw BadRequestException if transaction is not completed", async () => {
      jest.spyOn(prismaService.transaction, "findUnique").mockResolvedValue(transactionPending);

      await expect(service.reverseTransaction(sender, "1")).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException if sender is not the original sender", async () => {
      jest.spyOn(prismaService.transaction, "findUnique").mockResolvedValue(transactionCompleted);

      await expect(service.reverseTransaction(receiver, "1")).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException if transaction is non-refundable", async () => {
      const nonRefundableTransaction = { ...transactionCompleted, type: TransactionType.NON_REFUNDABLE };
      jest.spyOn(prismaService.transaction, "findUnique").mockResolvedValue(nonRefundableTransaction);

      await expect(service.reverseTransaction(sender, "1")).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException if senderId is null", async () => {
      const transactionWithNullSender = { ...transactionCompleted, senderId: null };
      jest.spyOn(prismaService.transaction, "findUnique").mockResolvedValue(transactionWithNullSender);

      await expect(service.reverseTransaction(sender, "1")).rejects.toThrow(BadRequestException);
    });

    it("should reverse a transaction and update balances", async () => {
      jest.spyOn(prismaService.transaction, "findUnique").mockResolvedValue(transactionCompleted);
      jest.spyOn(prismaService.transaction, "create").mockResolvedValue(reversalPending);

      const mockTx = {
        user: {
          update: jest.fn().mockResolvedValueOnce(sender).mockResolvedValueOnce(sender),
        },
        transaction: {
          update: jest.fn().mockResolvedValueOnce(transactionReversed).mockResolvedValueOnce(reversalCompleted),
        },
      };

      jest.spyOn(prismaService, "$transaction").mockImplementation(async (callback) => {
        return await callback(mockTx as any);
      });

      const result = await service.reverseTransaction(sender, "1");

      expect(result.status).toBe(TransactionStatus.COMPLETED);
      expect(result.type).toBe(TransactionType.REVERSAL);
      expect(result.id).toBe(reversalCompleted.id);
      expect(result.senderId).toBe(reversalCompleted.senderId);
      expect(result.receiverId).toBe(reversalCompleted.receiverId);
      expect(result.amount).toBe(reversalCompleted.amount);
      expect(result.createdAt).toEqual(reversalCompleted.createdAt);
      expect(result.updatedAt).toEqual(reversalCompleted.updatedAt);

      expect(prismaService.$transaction).toHaveBeenCalled();

      expect(mockTx.user.update).toHaveBeenNthCalledWith(1, {
        where: { id: reversalPending.senderId },
        data: { balanceCents: { increment: reversalPending.amount } },
      });
      expect(mockTx.user.update).toHaveBeenNthCalledWith(2, {
        where: { id: reversalPending.receiverId },
        data: { balanceCents: { decrement: reversalPending.amount } },
      });
      expect(mockTx.transaction.update).toHaveBeenNthCalledWith(1, {
        where: { id: transactionPending.id },
        data: { status: TransactionStatus.REVERSED },
      });
      expect(mockTx.transaction.update).toHaveBeenNthCalledWith(2, {
        where: { id: reversalPending.id },
        data: { status: TransactionStatus.COMPLETED },
      });
    });
  });

  describe("getTransactionById", () => {
    it("should throw NotFoundException if transaction is not found", async () => {
      jest.spyOn(prismaService.transaction, "findUnique").mockResolvedValue(null);

      await expect(service.getTransactionById("1")).rejects.toThrow(NotFoundException);
    });

    it("should return the transaction if found", async () => {
      jest.spyOn(prismaService.transaction, "findUnique").mockResolvedValue(transactionCompleted);

      const result = await service.getTransactionById("1");

      expect(result).toEqual(transactionCompleted);
    });
  });

  describe("getAllTransactions", () => {
    it("should return all transactions", async () => {
      jest.spyOn(prismaService.transaction, "findMany").mockResolvedValue(transactions);

      const result = await service.getAllTransactions();

      expect(result).toEqual(transactions);
    });
  });

  describe("getTransactionsByUser", () => {
    it("should return transactions for a user", async () => {
      jest.spyOn(prismaService.transaction, "findMany").mockResolvedValue(transactions);

      const result = await service.getTransactionsByUser(sender);

      expect(result).toEqual(transactions);
    });
  });
});
