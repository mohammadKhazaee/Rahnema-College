import {
    Entity,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    PrimaryColumn,
} from 'typeorm';
import { PostEntity } from './post.entity';
import { UserEntity } from '../../User/entity/user.entity';

@Entity('bookmarks')
export class BookmarkEntity {
    @PrimaryColumn({ collation: 'utf8_bin' })
    userId!: string;

    @ManyToOne(() => UserEntity, (user) => user.bookmarks)
    @JoinColumn({ name: 'userId' })
    user!: UserEntity;

    @PrimaryColumn()
    postId!: string;

    @ManyToOne(() => PostEntity, (post) => post.bookmarks)
    @JoinColumn({ name: 'postId' })
    post!: PostEntity;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
