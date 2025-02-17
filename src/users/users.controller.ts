import { BadRequestException, Body, Controller, Get, HttpStatus, Put, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UpdateUserDto } from "src/users/user.dto";
import { AuthGuard } from "@nestjs/passport";
import { CurrentUser } from "src/decorators/currentUser.decorator";
import { InternalUserModel } from "./user.entity";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(AuthGuard("jwt"))
  async getPrivate(@CurrentUser() user: InternalUserModel) {
    return await this.usersService.findPrivateUserById(user.id);
  }

  @Get("id")
  async getUser(@Body("id") id: string) {
    if (!id) {
      throw new BadRequestException({
        message: ["Id is required"],
        error: "Bad Request",
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }
    return await this.usersService.findUserById(id);
  }

  @Get("email")
  async getUserByEmail(@Body("email") email: string) {
    if (!email) {
      throw new BadRequestException({
        message: ["Email is required"],
        error: "Bad Request",
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }
    return await this.usersService.findUserByEmail(email);
  }

  @Get("document")
  @UseGuards(AuthGuard("jwt"))
  async getUserByDocumentId(@Body("documentId") documentId: string) {
    if (!documentId) {
      throw new BadRequestException({
        message: ["Document Id is required"],
        error: "Bad Request",
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }
    return await this.usersService.findUserByDocumentId(documentId);
  }

  @Put()
  @UseGuards(AuthGuard("jwt"))
  async updateUser(@CurrentUser() user: InternalUserModel, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.updateUser(user.id, updateUserDto);
  }
}
