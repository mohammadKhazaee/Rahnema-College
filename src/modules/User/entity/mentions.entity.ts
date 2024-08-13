import {
    Entity,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    PrimaryColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { PostEntity } from '../../Post/entity/post.entity';

@Entity('mentions')
export class MentionEntity {
    @PrimaryColumn()
    mentionedId!: string;

    @ManyToOne(() => UserEntity, (user) => user.mentions)
    @JoinColumn({ name: 'mentionedId' })
    mentioned!: UserEntity;

    @PrimaryColumn()
    postId!: number;

    @ManyToOne(() => PostEntity, (post) => post.mentions)
    @JoinColumn({ name: 'postId' })
    post!: PostEntity;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
