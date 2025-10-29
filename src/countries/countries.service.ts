import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from './countries.entity';
import { QueryDto } from './dto/query.dto';
import { StatusDto } from './dto/status.dto';
import type { CountryApiResponse, ExchangeRateApiResponse } from './interfaces';
import generateRandomNumber from './utils/generate_random';
import { ILike, DataSource } from 'typeorm';

interface StatusInterface {
  total_countries: string;
  last_refreshed_at: string;
}

@Injectable()
export class CountriesService {
  constructor(
    @InjectRepository(Country)
    private countriesRepository: Repository<Country>,
    private dataSource: DataSource,
  ) {}

  async addCountries(): Promise<void> {
    let exchangeRateData: ExchangeRateApiResponse;
    try {
      const exchangeRateResponse = await fetch(
        'https://open.er-api.com/v6/latest/USD',
      );
      if (!exchangeRateResponse.ok)
        throw new Error('Failed to fetch exchange rates');
      exchangeRateData =
        (await exchangeRateResponse.json()) as ExchangeRateApiResponse;
    } catch (error) {
      console.error('External API Error:', error);
      throw new ServiceUnavailableException(
        'External data source unavavailable',
      );
    }

    let countriesData: CountryApiResponse[];
    try {
      const countriesResponse = await fetch(
        'https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies',
      );
      if (!countriesResponse.ok) throw new Error('Failed to fetch countries');
      countriesData = (await countriesResponse.json()) as CountryApiResponse[];
    } catch (error) {
      console.error('External API Error:', error);
      throw new ServiceUnavailableException(
        'External data source unavavailable',
      );
    }

    const refreshTime = new Date();
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const c of countriesData) {
        const randomMultiplier = generateRandomNumber(1000, 2000);

        let currencyCode: string | null = null;
        let exchangeRate: number | null = null;
        let estimatedGdp: number | null = null;

        if (c.currencies && c.currencies.length > 0) {
          currencyCode = c.currencies[0].code;
          if (currencyCode) {
            exchangeRate = exchangeRateData.rates[currencyCode] || null;
          }

          estimatedGdp = exchangeRate
            ? (c.population * randomMultiplier) / exchangeRate
            : null;
        } else {
          estimatedGdp = 0;
        }

        const existingCountry = await queryRunner.manager.findOne(Country, {
          where: { name: ILike(c.name) },
        });

        const countryToSave = existingCountry || new Country();

        countryToSave.name = c.name;
        countryToSave.capital = c.capital;
        countryToSave.region = c.region;
        countryToSave.population = c.population;
        countryToSave.currency_code = currencyCode;
        countryToSave.flag_url = c.flag;
        countryToSave.exchange_rate = exchangeRate;
        countryToSave.estimated_gdp = estimatedGdp;

        countryToSave.last_refreshed_at = refreshTime;

        await queryRunner.manager.save(countryToSave);
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error adding countries:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async filterCountry(filterQuery: QueryDto): Promise<Country[]> {
    try {
      const options = {
        where: {},
        order: {},
      };

      if (filterQuery.region) {
        options.where['region'] = filterQuery.region;
      }

      if (filterQuery.currency) {
        options.where['currency_code'] = filterQuery.currency;
      }

      if (filterQuery.sort) {
        const [field, order] = filterQuery.sort.split('_');
        if (field === 'gdp' && (order === 'asc' || order === 'desc')) {
          options.order = {
            estimated_gdp: order.toUpperCase() as 'ASC' | 'DESC',
          };
        }
      }

      const countries = await this.countriesRepository.find(options);

      return countries;
    } catch (error) {
      console.error('Problem');
      throw error;
    }
  }

  async getSingleCountry(name: string): Promise<Country> {
    try {
      if (!name) {
        throw new BadRequestException('Country name is required');
      }
      const country = await this.countriesRepository.findOneOrFail({
        where: { name },
      });

      if (!country) {
        throw new NotFoundException('Country not found');
      }
      return country;
    } catch (error) {
      console.error('Error fetching country');
      throw error;
    }
  }

  async getStatus(): Promise<StatusDto> {
    const status = (await this.countriesRepository
      .createQueryBuilder('country')
      .select('COUNT(country.id)', 'total_countries')
      .addSelect('MAX(country.last_refreshed_at)', 'last_refreshed_at')
      .getRawOne()) as StatusInterface;

    const totalCountries = parseInt(status.total_countries, 10);

    if (totalCountries === 0) {
      return {
        total_countries: 0,
        last_refreshed_at: null,
      };
    }

    return {
      total_countries: totalCountries,
      last_refreshed_at: status.last_refreshed_at,
    };
  }
}
