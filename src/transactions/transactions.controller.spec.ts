import { Test, TestingModule } from "@nestjs/testing";
import { TransactionsController } from "./transactions.controller";
import { TransactionsService } from "./transactions.service";
import { BadRequestException } from "@nestjs/common";
import { KycStatus } from "@prisma/client";

describe("TransactionsController", () => {
  let controller: TransactionsController;
  let service: TransactionsService;

  const mockUser = {
    id: "1",
    email: "john.doe@example.com",
    firstName: "John",
    password: "password",
    lastName: "Doe",
    documentId: "10933656092",
    kycStatus: KycStatus.PENDING,
    balanceCents: 2000,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        {
          provide: TransactionsService,
          useValue: {
            createTransaction: jest.fn(),
            reverseTransaction: jest.fn(),
            addFunds: jest.fn(),
            getTransactionsByUser: jest.fn(),
            getTransactionById: jest.fn(),
            getAllTransactions: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
    service = module.get<TransactionsService>(TransactionsService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("create", () => {
    it("should call service.createTransaction with correct parameters", async () => {
      const createTransactionDto = { receiverId: "2", amount: 100 };
      await controller.create(mockUser, createTransactionDto);
      expect(service.createTransaction).toHaveBeenCalledWith(mockUser, createTransactionDto);
    });
  });

  describe("reverse", () => {
    it("should throw BadRequestException if transactionId is not provided", async () => {
      await expect(controller.reverse(mockUser, "")).rejects.toThrow(BadRequestException);
    });

    it("should call service.reverseTransaction with correct parameters", async () => {
      const transactionId = "123";
      await controller.reverse(mockUser, transactionId);
      expect(service.reverseTransaction).toHaveBeenCalledWith(mockUser, transactionId);
    });
  });

  describe("getByUser", () => {
    it("should call service.getTransactionsByUser with correct parameters", async () => {
      await controller.getByUser(mockUser);
      expect(service.getTransactionsByUser).toHaveBeenCalledWith(mockUser);
    });
  });

  describe("findOne", () => {
    it("should throw BadRequestException if transactionId is not provided", async () => {
      await expect(controller.findOne("")).rejects.toThrow(BadRequestException);
    });

    it("should call service.getTransactionById with correct parameters", async () => {
      const transactionId = "123";
      await controller.findOne(transactionId);
      expect(service.getTransactionById).toHaveBeenCalledWith(transactionId);
    });
  });

  describe("findAll", () => {
    it("should call service.getAllTransactions", async () => {
      await controller.findAll();
      expect(service.getAllTransactions).toHaveBeenCalled();
    });
  });
});
