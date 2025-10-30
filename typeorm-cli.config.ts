import { DataSource, DataSourceOptions } from 'typeorm';
import { Country } from './src/countries/countries.entity';
import * as dotenv from 'dotenv';

dotenv.config();

export const config: DataSourceOptions = {
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [Country],
  synchronize: false,
  migrations: ['src/migrations/*.ts'],
};

const dataSource = new DataSource(config);
export default dataSource;
