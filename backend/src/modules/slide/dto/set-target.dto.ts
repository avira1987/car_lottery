import { IsNumber, Min, Max } from 'class-validator';

export class SetTargetDto {
  @IsNumber()
  @Min(1)
  @Max(100)
  targetNumber: number;
}
