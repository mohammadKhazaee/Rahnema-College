import 'reflect-metadata';
import dotenv from 'dotenv-flow';
import { DataSource } from 'typeorm';
import { UserEntity } from './modules/User/entity/user.entity';
import { AuthEntity } from './modules/Auth/entity/auth.entity';

dotenv.config();

export const AppDataSource = new DataSource({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    synchronize: true,
    logging: false,
    entities: [UserEntity, AuthEntity],
    migrations: [],
    subscribers: [],
});
