export interface CountryApiResponse {
  name: string;
  capital: string;
  region: string;
  population: number;
  currencies: {
    code: string;
    name: string;
    symbol: string;
  }[];
  flag: string;
  independent: boolean;
}

export interface ExchangeRateApiResponse {
  rates: {
    [key: string]: number;
  };
}
