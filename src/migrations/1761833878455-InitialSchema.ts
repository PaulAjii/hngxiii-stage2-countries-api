import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1761833878455 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`country\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`name\` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL UNIQUE,
        \`capital\` varchar(255) NULL,
        \`region\` varchar(255) NULL,
        \`population\` int NOT NULL,
        \`currency_code\` varchar(255) NULL,
        \`exchange_rate\` double NULL,
        \`estimated_gdp\` double NULL,
        \`flag_url\` varchar(255) NULL,
        \`last_refreshed_at\` datetime NOT NULL,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`country\``);
  }
}
