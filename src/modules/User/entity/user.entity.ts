import {
    Entity,
    PrimaryColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { PostEntity } from '../../Post/entity/post.entity';
import { FollowingEntity } from './following.entity';
import { MentionEntity } from './mentions.entity';

@Entity('users')
export class UserEntity {
    @PrimaryColumn()
    username!: string;

    @Column({ unique: true })
    email!: string;

    @Column()
    password!: string;

    @Column()
    fName!: string;

    @Column()
    lName!: string;

    @Column()
    imageUrl!: string;

    @Column({ nullable: true })
    bio!: string;

    @Column({ default: true })
    isPrivate!: boolean;

    @OneToMany(() => PostEntity, (post) => post.creator)
    posts!: PostEntity[];

    @OneToMany(() => FollowingEntity, (f) => f.follower)
    followings!: FollowingEntity[];

    @OneToMany(() => FollowingEntity, (f) => f.followed)
    followers!: FollowingEntity[];

    @OneToMany(() => MentionEntity, (m) => m.mentioned)
    mentions!: MentionEntity[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
