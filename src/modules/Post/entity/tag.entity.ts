import {
    Entity,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    PrimaryGeneratedColumn,
    OneToMany,
} from 'typeorm';
import { PostsTagedEntity } from './posts-taged.entity';

@Entity('tags')
export class TagEntity {
    @PrimaryGeneratedColumn()
    tagId!: number;

    @Column()
    name!: string;

    @OneToMany(() => PostsTagedEntity, (r) => r.tag)
    posts!: PostsTagedEntity[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
