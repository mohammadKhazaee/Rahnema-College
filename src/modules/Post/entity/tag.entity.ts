import {
    Entity,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    PrimaryGeneratedColumn,
    ManyToMany,
    PrimaryColumn,
} from 'typeorm';
import { PostEntity } from './post.entity';

@Entity('tags')
export class TagEntity {
    @PrimaryColumn('uuid')
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
