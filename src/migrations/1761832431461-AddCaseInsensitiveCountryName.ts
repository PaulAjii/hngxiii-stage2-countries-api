import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCaseInsensitiveCountryName1761832431461
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`country\` MODIFY \`name\` VARCHAR(255) COLLATE utf8mb4_unicode_ci UNIQUE;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`country\` MODIFY \`name\` VARCHAR(255) COLLATE utf8mb4_bin UNIQUE;`,
    );
  }
}
