import { IsEmail, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsUUID()
  employeeId: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
