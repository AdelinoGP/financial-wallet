import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { UsersService } from "src/users/users.service";
import { JwtService } from "@nestjs/jwt";
import { UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { LoginDto, RegisterDto } from "src/users/user.dto";
import { PrivateUserModel } from "src/users/user.entity";
import { KycStatus } from "@prisma/client";

describe("AuthService", () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const internalUser = {
    id: "1",
    email: "test@test.com",
    password: "hashedPassword",
    firstName: "john",
    lastName: "doe",
    documentId: "39210487028",
    kycStatus: KycStatus.PENDING,
    balanceCents: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            createUser: jest.fn(),
            findInternalUserByEmail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("register", () => {
    it("should hash the password and create a user", async () => {
      const registerDto: RegisterDto = {
        email: "test@test.com",
        password: "password",
        firstName: "john",
        lastName: "doe",
        documentId: "39210487028",
      };
      const hashedPassword = "hashedPassword";
      const user: PrivateUserModel = {
        id: "1",
        email: "test@test.com",
        firstName: "john",
        lastName: "doe",
        documentId: "39210487028",
        balanceCents: 0,
        createdAt: new Date(),
      };

      jest.spyOn(bcrypt, "hash").mockImplementation(() => Promise.resolve(hashedPassword));
      jest.spyOn(usersService, "createUser").mockResolvedValue(user);

      const result = await service.register(registerDto);

      expect(bcrypt.hash).toHaveBeenCalledWith("password", expect.any(String));
      expect(usersService.createUser).toHaveBeenCalledWith({ ...registerDto, password: hashedPassword });
      expect(result).toEqual(user);
    });
  });

  describe("login", () => {
    it("should throw UnauthorizedException if user is not found", async () => {
      const loginDto: LoginDto = { email: "test@test.com", password: "password" };

      jest.spyOn(usersService, "findInternalUserByEmail").mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException if password does not match", async () => {
      const loginDto: LoginDto = { email: "test@test.com", password: "password" };

      jest.spyOn(usersService, "findInternalUserByEmail").mockResolvedValue(internalUser);
      jest.spyOn(bcrypt, "compare").mockImplementation(() => Promise.resolve(false));

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it("should return user and token if credentials are valid", async () => {
      const loginDto: LoginDto = { email: "test@test.com", password: "password" };
      const token = "jwtToken";

      jest.spyOn(usersService, "findInternalUserByEmail").mockResolvedValue(internalUser);
      jest.spyOn(bcrypt, "compare").mockImplementation(() => Promise.resolve(true));
      jest.spyOn(jwtService, "sign").mockReturnValue(token);

      const result = await service.login(loginDto);

      expect(result).toEqual({
        user: {
          id: internalUser.id,
          email: internalUser.email,
          firstName: internalUser.firstName,
          lastName: internalUser.lastName,
          documentId: internalUser.documentId,
          balanceCents: internalUser.balanceCents,
          createdAt: internalUser.createdAt,
        },
        token,
      });
    });
  });
});
