import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';

export class StatusDto {
  @IsNotEmpty()
  @IsNumber()
  total_countries: number;

  @IsOptional()
  @IsString()
  last_refreshed_at: string | null;
}
