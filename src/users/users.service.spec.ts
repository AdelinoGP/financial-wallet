import { Test, TestingModule } from "@nestjs/testing";
import { UsersService } from "./users.service";
import { PrismaService } from "src/prisma/prisma.service";
import { RegisterDto, UpdateUserDto } from "./user.dto";
import { PrivateUserFields, PublicUserFields, InternalUserFields } from "./user.entity";
import { KycStatus, PrismaClient } from "@prisma/client";
import { mockDeep } from "jest-mock-extended";

describe("UsersService", () => {
  let service: UsersService;
  let prismaService: PrismaService;

  const mockUser = {
    id: "1",
    email: "john.doe@example.com",
    firstName: "John",
    password: "password",
    lastName: "Doe",
    documentId: "10933656092",
    kycStatus: KycStatus.PENDING,
    balanceCents: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const secondMockUser = {
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

  const mockUsers = [mockUser, secondMockUser];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
    expect(prismaService).toBeDefined();
  });

  it("should create a user", async () => {
    const registerDto: RegisterDto = {
      firstName: mockUser.firstName,
      lastName: mockUser.lastName,
      documentId: mockUser.documentId,
      password: mockUser.password,
      email: mockUser.email,
    };
    jest.spyOn(prismaService.user, "create").mockResolvedValue(mockUser);

    const result = await service.createUser(registerDto);
    expect(result).toEqual(mockUser);
    expect(prismaService.user.create).toHaveBeenCalledWith({
      data: { ...registerDto },
      select: {
        ...PrivateUserFields,
      },
    });
  });

  it("should find a user by ID", async () => {
    const userId = "1";
    jest.spyOn(prismaService.user, "findUnique").mockResolvedValueOnce(mockUser);

    const result = await service.findUserById(userId);
    expect(result).toEqual(mockUser);
    expect(prismaService.user.findUnique).toHaveBeenCalledWith({
      where: { id: userId },
      select: {
        ...PublicUserFields,
      },
    });
  });

  it("should find a user by document ID", async () => {
    const documentId = "10933656092";
    jest.spyOn(prismaService.user, "findUnique").mockResolvedValue(mockUser);

    const result = await service.findUserByDocumentId(documentId);
    expect(result).toEqual(mockUser);
    expect(prismaService.user.findUnique).toHaveBeenCalledWith({
      where: { documentId: documentId },
      select: {
        ...PublicUserFields,
      },
    });
  });

  it("should find a user by email", async () => {
    const email = "test@example.com";

    jest.spyOn(prismaService.user, "findUnique").mockResolvedValue(mockUser);

    const result = await service.findUserByEmail(email);
    expect(result).toEqual(mockUser);
    expect(prismaService.user.findUnique).toHaveBeenCalledWith({
      where: { email: email },
      select: {
        ...PublicUserFields,
      },
    });
  });

  it("should find an internal user by email", async () => {
    const email = "internal@example.com";

    jest.spyOn(prismaService.user, "findUnique").mockResolvedValue(mockUser);

    const result = await service.findInternalUserByEmail(email);
    expect(result).toEqual(mockUser);
    expect(prismaService.user.findUnique).toHaveBeenCalledWith({
      where: { email: email },
      select: {
        ...InternalUserFields,
      },
    });
  });

  it("should get all users", async () => {
    jest.spyOn(prismaService.user, "findMany").mockResolvedValue(mockUsers);

    const result = await service.getAllUsers();
    expect(result).toEqual(mockUsers);
    expect(prismaService.user.findMany).toHaveBeenCalledWith({
      select: {
        ...PublicUserFields,
      },
    });
  });

  it("should update a user", async () => {
    const userId = "1";
    const updateUserDto: UpdateUserDto = {
      email: "updated.email@example.com",
    };
    const updatedMockUser = {
      id: "1",
      email: "updated.email@example.com",
      firstName: "John",
      password: "password",
      lastName: "Doe",
      documentId: "10933656092",
      kycStatus: KycStatus.PENDING,
      balanceCents: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    jest.spyOn(prismaService.user, "update").mockResolvedValue(updatedMockUser);

    const result = await service.updateUser(userId, updateUserDto);
    expect(result).toEqual(updatedMockUser);
    expect(prismaService.user.update).toHaveBeenCalledWith({
      where: { id: userId },
      data: { ...updateUserDto },
      select: {
        ...PrivateUserFields,
      },
    });
  });
});
