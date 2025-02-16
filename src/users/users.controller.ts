import { Body, Controller, Get, Put } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UpdateUserDto } from "src/users/user.dto";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getUser(@Body("id") id: string) {
    return await this.usersService.findUserById(id);
  }

  @Get("document")
  async getUserByDocumentId(@Body("documentId") documentId: string) {
    return await this.usersService.findUserByDocumentId(documentId);
  }

  @Get("email")
  async getUserByEmail(@Body("email") email: string) {
    return await this.usersService.findUserByEmail(email);
  }

  @Put()
  async updateUser(@Body("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.updateUser(id, updateUserDto);
  }
}
