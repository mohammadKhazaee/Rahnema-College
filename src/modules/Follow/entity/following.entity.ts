import {
    Entity,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    PrimaryColumn,
} from 'typeorm';
import { UserEntity } from '../../User/entity/user.entity';


@Entity('followings')
export class FollowingEntity {
    @PrimaryColumn()
    followerId!: string;

    @ManyToOne(() => UserEntity, (follower) => follower.followings)
    @JoinColumn({ name: 'followerId' })
    follower!: UserEntity;

    @PrimaryColumn()
    followedId!: string;

    @ManyToOne(() => UserEntity, (followed) => followed.followers)
    @JoinColumn({ name: 'followedId' })
    followed!: UserEntity;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
