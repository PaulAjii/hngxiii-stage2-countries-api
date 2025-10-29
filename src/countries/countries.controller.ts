import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { CountriesService } from './countries.service';
import { QueryDto } from './dto/query.dto';

@Controller('countries')
export class CountriesController {
  constructor(private countriesService: CountriesService) {}

  @Get()
  getAllCountries(@Query() filterQuery: QueryDto) {
    return this.countriesService.filterCountry(filterQuery);
  }

  @Get(':name')
  getSingleCountry(@Param('name') name: string) {
    return this.countriesService.getSingleCountry(name);
  }

  @Delete(':name')
  @HttpCode(204)
  deleteCountry(@Param('name') name: string) {
    return this.countriesService.deleteCountry(name);
  }

  @Post('refresh')
  addCountries() {
    return this.countriesService.addCountries();
  }
}

@Controller('status')
export class StatusController {
  constructor(private countriesService: CountriesService) {}

  @Get()
  getStatus() {
    return this.countriesService.getStatus();
  }
}
