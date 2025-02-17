import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { LoginDto, RegisterDto } from "src/users/user.dto";
import { KycStatus } from "@prisma/client";
import { UsersService } from "src/users/users.service";
import { JwtService } from "@nestjs/jwt";

describe("AuthController", () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            createUser: jest.fn(),
            findUserById: jest.fn(),
            findUserByDocumentId: jest.fn(),
            findUserByEmail: jest.fn(),
            findInternalUserByEmail: jest.fn(),
            getAllUsers: jest.fn(),
            updateUser: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue("token"),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("register", () => {
    it("should call AuthService.register with correct parameters", async () => {
      const dto: RegisterDto = {
        firstName: "test",
        lastName: "last",
        documentId: "02170114033",
        email: "test@example.com",
        password: "test",
      };
      await controller.register(dto);
      expect(authService.register).toHaveBeenCalledWith(dto);
    });

    it("should return the result of AuthService.register", async () => {
      const result = {
        id: "1",
        email: "test@example.com",
        firstName: "test",
        lastName: "last",
        documentId: "02170114033",
        kycStatus: KycStatus.PENDING,
        balanceCents: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(authService, "register").mockResolvedValueOnce(result);
      const dto: RegisterDto = {
        firstName: "test",
        lastName: "last",
        documentId: "02170114033",
        email: "test@example.com",
        password: "test",
      };
      expect(await controller.register(dto)).toBe(result);
    });
  });

  describe("login", () => {
    it("should call AuthService.login with correct parameters", async () => {
      const dto: LoginDto = { email: "test@example.com", password: "test" };
      await controller.login(dto);
      expect(authService.login).toHaveBeenCalledWith(dto);
    });

    it("should return the result of AuthService.login", async () => {
      const result = {
        user: {
          id: "1",
          email: "test@example.com",
          firstName: "test",
          lastName: "last",
          documentId: "02170114033",
          kycStatus: KycStatus.PENDING,
          balanceCents: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        token: "token",
      };
      jest.spyOn(authService, "login").mockResolvedValueOnce(result);
      const dto: LoginDto = { email: "test@example.com", password: "test" };
      expect(await controller.login(dto)).toBe(result);
    });
  });
});
