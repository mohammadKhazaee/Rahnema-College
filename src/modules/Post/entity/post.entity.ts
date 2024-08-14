import {
    Entity,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
    ManyToMany,
    JoinTable,
} from 'typeorm';
import { UserEntity } from '../../User/entity/user.entity';
import { PostImageEntity } from './post-image.entity';
import { TagEntity } from './tag.entity';

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

    @ManyToMany(() => TagEntity, (t) => t.posts, {
        cascade: true,
    })
    @JoinTable({
        name: 'posts_taged',
        joinColumn: {
            name: 'postId',
            referencedColumnName: 'postId',
        },
        inverseJoinColumn: {
            name: 'tagId',
            referencedColumnName: 'tagId',
        },
    })
    tags!: TagEntity[];

    @OneToMany(() => PostImageEntity, (image) => image.post, {
        cascade: true,
    })
    images!: PostImageEntity[];

    @ManyToMany(() => UserEntity, (m) => m.mentions, {
        cascade: true,
    })
    @JoinTable({
        name: 'mentions',
        joinColumn: {
            name: 'postId',
            referencedColumnName: 'postId',
        },
        inverseJoinColumn: {
            name: 'mentionedId',
            referencedColumnName: 'username',
        },
    })
    mentions!: UserEntity[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
