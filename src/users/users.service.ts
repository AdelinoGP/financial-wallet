import { Injectable } from "@nestjs/common";
import { RegisterDto, UpdateUserDto } from "./user.dto";
import {
  InternalUserFields,
  InternalUserModel,
  PrivateUserFields,
  PrivateUserModel,
  PublicUserFields,
  PublicUserModel,
} from "./user.entity";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(registerDto: RegisterDto): Promise<PrivateUserModel> {
    const userdata = registerDto;

    const user = await this.prisma.user.create({
      data: {
        ...userdata,
      },
      select: { ...PrivateUserFields },
    });
    return user;
  }

  async findPrivateUserById(userId: string): Promise<PrivateUserModel | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { ...PrivateUserFields },
    });
    return user;
  }

  async findUserById(userId: string): Promise<PublicUserModel | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { ...PublicUserFields },
    });
    return user;
  }

  async findUserByDocumentId(documentId: string): Promise<PublicUserModel | null> {
    const user = await this.prisma.user.findUnique({
      where: { documentId: documentId },
      select: { ...PublicUserFields },
    });
    return user;
  }

  async findUserByEmail(email: string): Promise<PublicUserModel | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: email },
      select: { ...PublicUserFields },
    });
    return user;
  }

  async findInternalUserById(userId: string): Promise<InternalUserModel | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { ...InternalUserFields },
    });
    return user;
  }

  async findInternalUserByEmail(email: string): Promise<InternalUserModel | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: email },
      select: { ...InternalUserFields },
    });
    return user;
  }

  //TODO: Set this endpoint to be used only by admin users
  async getAllUsers(): Promise<PublicUserModel[]> {
    const users = await this.prisma.user.findMany({
      select: { ...PublicUserFields },
    });
    return users;
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<PrivateUserModel> {
    const user = await this.prisma.user.update({
      where: { id: id },
      data: { ...updateUserDto },
      select: { ...PrivateUserFields },
    });
    return user;
  }
}
