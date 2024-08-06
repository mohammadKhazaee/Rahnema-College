import {
    Entity,
    PrimaryColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class UserEntity {
    @PrimaryColumn()
    username!: string;

    @Column()
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

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
