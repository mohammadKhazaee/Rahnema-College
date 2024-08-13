import {
    Entity,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { PostEntity } from './post.entity';

@Entity('post_image')
export class PostImageEntity {
    @PrimaryGeneratedColumn()
    imageId!: number;

    @Column({ unique: true })
    url!: string;

    @Column()
    postId!: string;

    @ManyToOne(() => PostEntity, (post) => post.images)
    @JoinColumn({ name: 'postId' })
    post!: PostEntity;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
