import {
    Entity,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    PrimaryColumn,
} from 'typeorm';
import { TagEntity } from './tag.entity';
import { PostEntity } from './post.entity';

@Entity('posts_taged')
export class PostsTagedEntity {
    @PrimaryColumn()
    tagId!: number;

    @ManyToOne(() => TagEntity, (tag) => tag.posts)
    @JoinColumn({ name: 'tagId' })
    tag!: TagEntity;

    @PrimaryColumn()
    postId!: number;

    @ManyToOne(() => PostEntity, (post) => post.tags)
    @JoinColumn({ name: 'postId' })
    post!: PostEntity;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
