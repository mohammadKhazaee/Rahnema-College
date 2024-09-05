import { Repository, DataSource, In } from 'typeorm';
import { NotificationEntity } from './entity/notification.entity';
import {
    CreateNotif,
    isNormalNotifEntity,
    NormalNotifEntity,
    notifType,
} from './model/notifications';
import { PaginationDto } from '../Post/dto/get-posts-dto';
import { FriendNotifEntity, friendNotifType, isFriendNotifEntity } from './model/friend-notifs';

export class NotifRepository {
    private notifRepo: Repository<NotificationEntity>;

    constructor(private dataSource: DataSource) {
        this.notifRepo = dataSource.getRepository(NotificationEntity);
    }

    async notifList(
        username: string,
        { p: page, c: take }: PaginationDto
    ): Promise<NormalNotifEntity[]> {
        const skip = (page - 1) * take;

        const notifList = await this.notifRepo.find({
            where: {
                receiverId: username,
                type: In([notifType]),
            },
            relations: {
                emiter: true,
                receiver: true,
            },
            order: { updatedAt: 'DESC' },
            skip,
            take,
        });
        if (notifList.every((n) => isNormalNotifEntity(n))) return notifList;
        throw new Error();
    }

    async friendNotifList(
        username: string,
        { p: page, c: take }: PaginationDto
    ): Promise<FriendNotifEntity[]> {
        const skip = (page - 1) * take;

        const notifList = await this.notifRepo.find({
            where: {
                receiverId: username,
                type: In([friendNotifType]),
            },
            relations: {
                emiter: true,
                receiver: true,
            },
            order: { updatedAt: 'DESC' },
            skip,
            take,
        });
        if (notifList.every((n) => isFriendNotifEntity(n))) return notifList;
        throw new Error();
    }

    create(createNotif: CreateNotif) {
        return this.notifRepo.save(createNotif);
    }

    updateBulk(notifEntities: NotificationEntity[]) {
        return this.notifRepo
            .createQueryBuilder()
            .update()
            .set({ isSeen: true })
            .where({ notifId: In(notifEntities.map((n) => n.notifId)) })
            .execute();
    }
}
