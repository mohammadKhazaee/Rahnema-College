import 'reflect-metadata';
import dotenv from 'dotenv-flow';
import { DataSource } from 'typeorm';
import { UserEntity } from './modules/User/entity/user.entity';
import { TagEntity } from './modules/Post/entity/tag.entity';
import { PostEntity } from './modules/Post/entity/post.entity';
import { PostImageEntity } from './modules/Post/entity/post-image.entity';
import { PostsTagedEntity } from './modules/Post/entity/posts-taged.entity';
import { FollowingEntity } from './modules/User/entity/following.entity';
import { MentionEntity } from './modules/User/entity/mentions.entity';
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
    entities: [
        UserEntity,
        TagEntity,
        PostEntity,
        PostImageEntity,
        PostsTagedEntity,
        FollowingEntity,
        MentionEntity,
    ],
    migrations: [],
    subscribers: [],
});
