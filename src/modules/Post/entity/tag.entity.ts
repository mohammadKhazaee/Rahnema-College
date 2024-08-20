import {
    Entity,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    PrimaryGeneratedColumn,
    ManyToMany,
} from 'typeorm';
import { PostEntity } from './post.entity';

@Entity('tags')
export class TagEntity {
    @PrimaryGeneratedColumn('uuid')
    tagId!: string;

    @Column()
    name!: string;

    @ManyToMany(() => PostEntity, (p) => p.tags)
    posts!: PostEntity[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
