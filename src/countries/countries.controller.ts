import { Controller, Get, Post, Query } from '@nestjs/common';
import { CountriesService } from './countries.service';
import { QueryDto } from './dto/query.dto';

@Controller('countries')
export class CountriesController {
  constructor(private countriesService: CountriesService) {}

  @Get()
  getAllCountries(@Query() filterQuery: QueryDto) {
    return this.countriesService.filterCountry(filterQuery);
  }

  @Post('refresh')
  addCountries() {
    return this.countriesService.addCountries();
  }
}
