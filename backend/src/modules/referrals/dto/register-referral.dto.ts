import { IsString, IsOptional } from 'class-validator';

export class RegisterReferralDto {
  @IsString()
  referralCode: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  deviceFingerprint?: string;
}
