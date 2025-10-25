import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Country {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  capital: string;

  @Column()
  region: string;

  @Column()
  population: number;

  @Column()
  currency_code: string;

  @Column()
  exchange_rate: number;

  @Column()
  estimated_gdp: number;

  @Column()
  flag_url: string;

  @Column({ default: new Date().toISOString() })
  last_refreshed_at: string;
}
