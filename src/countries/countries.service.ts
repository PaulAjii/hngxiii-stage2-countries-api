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
import generateImage from './utils/generate_image';
import { ILike, DataSource } from 'typeorm';
import fs from 'node:fs';
import path from 'node:path';
import { ReadStream } from 'fs';

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

  private async fetchWithTimeout(url: string, timeoutMs: number = 8000) {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return (await response.json()) as
        | CountryApiResponse[]
        | ExchangeRateApiResponse;
    } catch (error: any) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(`Request timed out`);
        }
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  async addCountries(): Promise<void> {
    let exchangeRateData: ExchangeRateApiResponse;
    let countriesData: CountryApiResponse[];
    try {
      exchangeRateData = (await this.fetchWithTimeout(
        'https://open.er-api.com/v6/latest/USD',
      )) as ExchangeRateApiResponse;
    } catch (error) {
      console.log(error);
      throw new ServiceUnavailableException({
        error: 'External data source unavailable',
        details: 'Could not fetch data from Exchange Rate API',
      });
    }

    try {
      countriesData = (await this.fetchWithTimeout(
        'https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies',
      )) as CountryApiResponse[];
    } catch (error) {
      console.log(error);
      throw new ServiceUnavailableException({
        error: 'External data source unavailable',
        details: 'Could not fetch data from RestCountries API',
      });
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

      try {
        const totalCountries = await this.countriesRepository.count();
        const top5Countries = (await this.countriesRepository.find({
          order: { estimated_gdp: 'DESC' },
          select: ['name', 'estimated_gdp'],
          take: 5,
        })) as { name: string; estimated_gdp: number }[];
        await generateImage(totalCountries, top5Countries, refreshTime);
      } catch (imageError) {
        console.log('Failed to generate image: ', imageError);
      }
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
      const country = await this.countriesRepository.findOne({
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

  async deleteCountry(name: string): Promise<void> {
    if (!name || typeof name !== 'string') {
      throw new BadRequestException('Country name is required');
    }

    const result = await this.countriesRepository.delete({ name });
    if (result.affected === 0) {
      throw new NotFoundException('Country not found');
    }

    return;
  }

  getSummaryImage(): ReadStream {
    const imagePath = path.resolve(process.cwd(), 'cache', 'summary.png');

    if (!fs.existsSync(imagePath)) {
      throw new NotFoundException('Summary image not found');
    }

    return fs.createReadStream(imagePath);
  }
}
