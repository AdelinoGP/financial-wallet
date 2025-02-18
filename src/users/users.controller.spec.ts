import { Test, TestingModule } from "@nestjs/testing";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { KycStatus } from "@prisma/client";

describe("UsersController", () => {
  let controller: UsersController;
  let service: UsersService;
  const publicUser = {
    id: "1",
    email: "test@test.com",
    firstName: "john",
    lastName: "doe",
    documentId: "39210487028",
    balanceCents: 0,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            createUser: jest.fn(),
            findPrivateUserById: jest.fn(),
            findUserById: jest.fn(),
            findUserByDocumentId: jest.fn(),
            findUserByEmail: jest.fn(),
            findInternalUserByEmail: jest.fn(),
            getAllUsers: jest.fn(),
            updateUser: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getPrivate", () => {
    it("should return a private user by id", async () => {
      const user = { ...publicUser, password: "password", kycStatus: KycStatus.VERIFIED };
      jest.spyOn(service, "findPrivateUserById").mockResolvedValue(publicUser);

      expect(await controller.getPrivate(user)).toBe(publicUser);
      expect(service.findPrivateUserById).toHaveBeenCalledWith(user.id);
    });
  });

  describe("getUser", () => {
    it("should return a user by id", async () => {
      const id = "1";
      jest.spyOn(service, "findUserById").mockResolvedValue(publicUser);

      expect(await controller.getUser(id)).toBe(publicUser);
      expect(service.findUserById).toHaveBeenCalledWith(id);
    });
  });

  describe("getUserByDocumentId", () => {
    it("should return a user by documentId", async () => {
      const documentId = "39210487028";
      jest.spyOn(service, "findUserByDocumentId").mockResolvedValue(publicUser);

      expect(await controller.getUserByDocumentId(documentId)).toBe(publicUser);
      expect(service.findUserByDocumentId).toHaveBeenCalledWith(documentId);
    });
  });

  describe("getUserByEmail", () => {
    it("should return a user by email", async () => {
      const email = "test@example.com";
      jest.spyOn(service, "findUserByEmail").mockResolvedValue(publicUser);

      expect(await controller.getUserByEmail(email)).toBe(publicUser);
      expect(service.findUserByEmail).toHaveBeenCalledWith(email);
    });
  });

  describe("updateUser", () => {
    it("should update a user", async () => {
      const user = { ...publicUser, password: "password", kycStatus: KycStatus.VERIFIED };
      const id = "1";
      const updateUserDto = { email: "updated.email@example.com" };
      const expectedResult = { ...publicUser };
      expectedResult.email = updateUserDto.email;
      jest.spyOn(service, "updateUser").mockResolvedValue(expectedResult);

      expect(await controller.updateUser(user, updateUserDto)).toBe(expectedResult);
      expect(service.updateUser).toHaveBeenCalledWith(id, updateUserDto);
    });
  });
});
