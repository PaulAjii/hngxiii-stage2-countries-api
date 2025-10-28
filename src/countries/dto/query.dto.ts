import { IsOptional, IsString } from 'class-validator';

export class QueryDto {
  @IsOptional()
  @IsString({ message: 'Region must be a string' })
  region: string;

  @IsOptional()
  @IsString({ message: 'Currency must be a string' })
  currency: string;

  @IsOptional()
  @IsString({ message: 'Sort must be a string' })
  sort: string;
}
