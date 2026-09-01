import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CheckInDto {
  @IsUUID()
  employeeId: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  facePhotoBase64?: string;
}
