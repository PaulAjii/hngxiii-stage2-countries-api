import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from './countries.entity';
import { QueryDto } from './dto/query.dto';
import type { CountryApiResponse, ExchangeRateApiResponse } from './interfaces';

@Injectable()
export class CountriesService {
  constructor(
    @InjectRepository(Country)
    private countriesRepository: Repository<Country>,
  ) {}

  async getAllCountries(): Promise<Country[]> {
    try {
      const countries = await this.countriesRepository.find();
      return countries;
    } catch (error: any) {
      console.error('Error fetching countries:');
      throw error;
    }
  }

  async addCountries(): Promise<void> {
    try {
      const countriesResponse = await fetch(
        'https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies',
      );
      const countriesData =
        (await countriesResponse.json()) as CountryApiResponse[];

      await Promise.all(
        countriesData.map(async (c) => {
          let currencyCode: string | null = null;
          let exchangeRate: number | null = null;
          let estimatedGdp: number | null = null;
          if (c.currencies && c.currencies.length > 0) {
            const exchangeRateResponse = await fetch(
              'https://open.er-api.com/v6/latest/USD',
            );
            const exchangeRateData =
              (await exchangeRateResponse.json()) as ExchangeRateApiResponse;
            currencyCode = c.currencies[0].code;

            if (!currencyCode) {
              exchangeRate = null;
              estimatedGdp = null;
            }
            exchangeRate = exchangeRateData.rates[currencyCode] || null;
            estimatedGdp = exchangeRate
              ? (c.population * Math.random() * 1000 + 1000) / exchangeRate
              : null;
          } else {
            currencyCode = null;
            exchangeRate = null;
            estimatedGdp = 0;
          }

          return await this.countriesRepository.save({
            name: c.name,
            capital: c.capital,
            region: c.region,
            population: c.population,
            currency_code: currencyCode,
            flag_url: c.flag,
            exchange_rate: exchangeRate,
            estimated_gdp: estimatedGdp,
          });
        }),
      );
    } catch (error) {
      console.error('Error adding countries:', error);
      throw error;
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
}
