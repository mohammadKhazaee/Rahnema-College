import {
    Entity,
    PrimaryColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    ManyToMany,
} from 'typeorm';
import { PostEntity } from '../../Post/entity/post.entity';
import { PostCommentEntity } from '../../Post/entity/post-comment.entity';
import { PostLikeEntity } from '../../Post/entity/post-Likes.entity';
import { BookmarkEntity } from '../../Post/entity/bookmark.entity';
import { UserRelationEntity } from '../../Follow/entity/following.entity';
import { NotificationEntity } from '../../Notification/entity/notification.entity';

@Entity('users')
export class UserEntity {
    @PrimaryColumn()
    username!: string;

    @Column({ unique: true })
    email!: string;

    @Column()
    password!: string;

    @Column()
    fName!: string;

    @Column()
    lName!: string;

    @Column()
    imageUrl!: string;

    @Column({ nullable: true })
    bio!: string;

    @Column({ default: true })
    isPrivate!: boolean;

    @OneToMany(() => PostEntity, (post) => post.creator)
    posts!: PostEntity[];

    @OneToMany(() => UserRelationEntity, (f) => f.follower)
    followings!: UserRelationEntity[];

    @OneToMany(() => UserRelationEntity, (f) => f.followed)
    followers!: UserRelationEntity[];

    @OneToMany(() => NotificationEntity, (notif) => notif.emiter)
    emitedNotifs!: NotificationEntity[];

    @OneToMany(() => NotificationEntity, (notif) => notif.receiver)
    receivedNotifs!: NotificationEntity[];

    @ManyToMany(() => PostEntity, (m) => m.mentions)
    mentions!: PostEntity[];

    @OneToMany(() => PostCommentEntity, (comment) => comment.post, {
        cascade: ['insert', 'update'],
    })
    comments!: PostCommentEntity[];

    @OneToMany(() => PostLikeEntity, (like) => like.post, {
        cascade: ['insert', 'update'],
    })
    likes!: PostLikeEntity[];

    @OneToMany(() => BookmarkEntity, (bookmark) => bookmark.post, {
        cascade: ['insert', 'update'],
    })
    bookmarks!: BookmarkEntity[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
