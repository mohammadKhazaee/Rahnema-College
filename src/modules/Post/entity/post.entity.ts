import {
    Entity,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
} from 'typeorm';
import { UserEntity } from '../../User/entity/user.entity';
import { PostsTagedEntity } from './posts-taged.entity';
import { PostImageEntity } from './post-image.entity';
import { MentionEntity } from '../../User/entity/mentions.entity';

@Entity('posts')
export class PostEntity {
    @PrimaryGeneratedColumn()
    postId!: number;

    @Column()
    caption!: string;

    @Column()
    creatorId!: string;

    @ManyToOne(() => UserEntity, (user) => user.posts)
    @JoinColumn({ name: 'creatorId' })
    creator!: UserEntity;

    @OneToMany(() => PostsTagedEntity, (r) => r.post)
    tags!: PostsTagedEntity[];

    @OneToMany(() => PostImageEntity, (image) => image.post)
    images!: PostImageEntity[];

    @OneToMany(() => MentionEntity, (m) => m.post)
    mentions!: MentionEntity[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
