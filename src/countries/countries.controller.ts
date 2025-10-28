import { Controller, Get, Post } from '@nestjs/common';
import { CountriesService } from './countries.service';

@Controller('countries')
export class CountriesController {
  constructor(private countriesService: CountriesService) {}

  @Get()
  getAllCountries() {
    return this.countriesService.getAllCountries();
  }

  @Post('refresh')
  addCountries() {
    return this.countriesService.addCountries();
  }
}
