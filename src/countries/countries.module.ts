import { Module } from '@nestjs/common';
import { CountriesService } from './countries.service';
import { CountriesController, StatusController } from './countries.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Country } from './countries.entity';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [TypeOrmModule.forFeature([Country]), HttpModule],
  providers: [CountriesService],
  controllers: [CountriesController, StatusController],
})
export class CountriesModule {}
