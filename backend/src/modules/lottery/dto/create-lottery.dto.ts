import { IsString, IsDateString, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateLotteryDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsDateString()
  drawDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxEntries?: number;
}
