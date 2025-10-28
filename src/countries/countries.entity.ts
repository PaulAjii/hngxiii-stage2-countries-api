import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Country {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  capital: string;

  @Column({ nullable: true })
  region: string;

  @Column()
  population: number;

  @Column({ type: 'varchar', nullable: true })
  currency_code: string | null;

  @Column({ type: 'float', nullable: true })
  exchange_rate: number | null;

  @Column({ type: 'float', nullable: true })
  estimated_gdp: number | null;

  @Column({ nullable: true })
  flag_url: string;

  @UpdateDateColumn()
  last_refreshed_at: Date;
}
