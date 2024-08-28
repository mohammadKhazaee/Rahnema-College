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

@Entity('post_likes')
export class PostLikeEntity {
    @PrimaryColumn()
    userId!: string;

    @ManyToOne(() => UserEntity, (user) => user.likes, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'userId' })
    user!: UserEntity;

    @PrimaryColumn()
    postId!: string;

    @ManyToOne(() => PostEntity, (post) => post.likes, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'postId' })
    post!: PostEntity;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
