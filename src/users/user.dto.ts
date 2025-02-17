import { IsString, IsEmail, MinLength, IsNotEmpty, IsUUID, IsOptional } from "class-validator";
import { IsCPF } from "class-validator-cpf";

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  lastName: string;

  @IsCPF({ message: "Invalid CPF" })
  documentId: string;

  @IsString()
  @MinLength(8, { message: "Password must be at least 8 characters" })
  password: string;

  @IsEmail()
  email: string;
}

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: "Password must be at least 8 characters" })
  password: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @MinLength(8, { message: "Password must be at least 8 characters" })
  password?: string;
}
