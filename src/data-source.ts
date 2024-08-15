import 'reflect-metadata';
import dotenv from 'dotenv-flow';
import { DataSource } from 'typeorm';
import { UserEntity } from './modules/User/entity/user.entity';
import { TagEntity } from './modules/Post/entity/tag.entity';
import { PostEntity } from './modules/Post/entity/post.entity';
import { PostImageEntity } from './modules/Post/entity/post-image.entity';
import { FollowingEntity } from './modules/User/entity/following.entity';
dotenv.config();

export const AppDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_IP,
    port: +process.env.DB_PORT!,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    synchronize: true,
    logging: false,
    entities: [
        UserEntity,
        TagEntity,
        PostEntity,
        PostImageEntity,
        FollowingEntity,
    ],
    migrations: [],
    subscribers: [],
});
