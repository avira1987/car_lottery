import { IsString } from 'class-validator';

export class EnterLotteryDto {
  @IsString()
  lotteryId: string;
}
