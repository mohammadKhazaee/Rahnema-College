import 'reflect-metadata';
import dotenv from 'dotenv-flow';
import { DataSource } from 'typeorm';
import { UserEntity } from './modules/User/entity/user.entity';
import { TagEntity } from './modules/Post/entity/tag.entity';
import { PostEntity } from './modules/Post/entity/post.entity';
import { PostImageEntity } from './modules/Post/entity/post-image.entity';
import { PostCommentEntity } from './modules/Post/entity/post-comment.entity';
import { PostLikeEntity } from './modules/Post/entity/post-Likes.entity';
import { BookmarkEntity } from './modules/Post/entity/bookmark.entity';
import { CommentLikeEntity } from './modules/Post/entity/comment-Likes.entity';
import { UserRelationEntity } from './modules/Follow/entity/following.entity';
import { NotificationEntity } from './modules/Notification/entity/notification.entity';
import { PostNotifEntity } from './modules/Notification/entity/post-notif.entity';
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
        UserRelationEntity,
        PostCommentEntity,
        PostLikeEntity,
        BookmarkEntity,
        CommentLikeEntity,
        NotificationEntity,
        PostNotifEntity,
    ],
    migrations: [],
    subscribers: [],
});
