import { MigrationInterface, QueryRunner } from 'typeorm';

export class PasswordResetTokens1757265601000 implements MigrationInterface {
  name = 'PasswordResetTokens1757265601000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE password_reset_tokens (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        usuario_id BIGINT UNSIGNED NOT NULL,
        token_hash CHAR(64) NOT NULL,
        expires_at DATETIME(3) NOT NULL,
        used_at DATETIME(3) NULL,
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        UNIQUE KEY UQ_password_reset_tokens_hash (token_hash),
        KEY IDX_password_reset_tokens_user_id (usuario_id),
        KEY IDX_password_reset_tokens_expires_at (expires_at),
        CONSTRAINT FK_password_reset_tokens_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS password_reset_tokens');
  }
}