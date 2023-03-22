import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: '172.30.1.85',
  port: 3306,
  username: 'root',
  password: '1234',
  database: 'test2',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: true,
  migrations: [__dirname + '/**/migrations/*.js'],
  migrationsTableName: 'migrations',
});
