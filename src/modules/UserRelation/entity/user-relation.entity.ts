import {
    Entity,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Column,
    PrimaryGeneratedColumn,
    Unique,
} from 'typeorm';
import { UserEntity } from '../../User/entity/user.entity';
import { userRelationStatus, UserRelationStatus } from '../model/user-relation';

@Entity('user_relations')
@Unique(['followerId', 'followedId'])
export class UserRelationEntity {
    @PrimaryGeneratedColumn('uuid')
    relationId!: string;

    @Column()
    followerId!: string;

    @ManyToOne(() => UserEntity, (follower) => follower.followings, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'followerId' })
    follower!: UserEntity;

    @Column()
    followedId!: string;

    @ManyToOne(() => UserEntity, (followed) => followed.followers, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'followedId' })
    followed!: UserEntity;

    @Column({ default: userRelationStatus.requestedFollow })
    status!: UserRelationStatus;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
