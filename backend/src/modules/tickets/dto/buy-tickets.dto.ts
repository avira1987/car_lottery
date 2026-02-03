import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class BuyTicketsDto {
  @IsNumber()
  @Min(1)
  count: number;

  @IsOptional()
  @IsString()
  lotteryId?: string;
}
