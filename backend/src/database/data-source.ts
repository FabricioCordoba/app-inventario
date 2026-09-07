import { config } from 'dotenv';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { entities } from './entities';

config({ path: join(__dirname, '../../.env') });

export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '3306', 10),
  username: process.env.DB_USERNAME ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_DATABASE ?? 'bv_barker_inventarios',
  entities,
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',
  timezone: 'Z',
});
