import { IsNumber, IsString, Min, Max, IsIn } from 'class-validator';

export class PlaySlideDto {
  @IsNumber()
  @Min(1)
  @Max(100)
  userNumber: number;

  @IsString()
  @IsIn(['LIVE', 'AUTO'])
  mode: 'LIVE' | 'AUTO';
}
