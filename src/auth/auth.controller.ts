import { Controller, Post, Body, HttpStatus, HttpException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto, RegisterDto } from "src/users/user.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Registers a new user.
   * @param dto - The data transfer object containing registration details.
   * @returns A promise that resolves to the result of the registration process.
   */
  @Post("register")
  async register(@Body() dto: RegisterDto) {
    try {
      return await this.authService.register(dto);
    } catch (error) {
      if (error.code === "P2002")
        throw new HttpException(
          {
            message: ["A user with this email or document ID already exists."],
            error: "Conflict",
            statusCode: HttpStatus.CONFLICT,
          },
          HttpStatus.CONFLICT
        );
      throw error;
    }
  }

  /**
   * Logs in an existing user.
   * @param dto - The data transfer object containing login details.
   * @returns A promise that resolves to the result of the login process.
   */
  @Post("login")
  async login(@Body() dto: LoginDto) {
    return await this.authService.login(dto);
  }
}
