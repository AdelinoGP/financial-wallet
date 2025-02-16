import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UsersService } from "src/users/users.service";
import { JwtService } from "@nestjs/jwt";
import { LoginDto, RegisterDto } from "src/users/user.dto";
import * as bcrypt from "bcrypt";
import { PrivateUserModel, PublicUserModel } from "src/users/user.entity";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  async register(createUserDto: RegisterDto): Promise<PublicUserModel> {
    createUserDto.password = await this.hashPassword(createUserDto.password);
    const user = await this.usersService.createUser(createUserDto);
    return user;
  }

  async login(dto: LoginDto): Promise<{ user: PrivateUserModel; token: string }> {
    const internalUser = await this.usersService.findInternalUserByEmail(dto.email);

    if (!internalUser || !(await bcrypt.compare(dto.password, internalUser.password)))
      throw new UnauthorizedException("Credenciais inválidas");

    const user: PrivateUserModel = {
      id: internalUser.id,
      email: internalUser.email,
      firstName: internalUser.firstName,
      lastName: internalUser.lastName,
      documentId: internalUser.documentId,
      balanceCents: internalUser.balanceCents,
      createdAt: internalUser.createdAt,
    };
    const token = this.generateToken(user.id);

    return { user, token };
  }

  private generateToken(userId: string): string {
    const payload = { sub: userId };
    return this.jwtService.sign(payload);
  }
}
