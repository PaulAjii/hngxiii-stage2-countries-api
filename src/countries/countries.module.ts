import { Module } from '@nestjs/common';
import { CountriesService } from './countries.service';
import { CountriesController, StatusController } from './countries.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Country } from './countries.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Country])],
  providers: [CountriesService],
  controllers: [CountriesController, StatusController],
})
export class CountriesModule {}
