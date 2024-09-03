import { Repository, DataSource, In } from 'typeorm';
import { NotificationEntity } from './entity/notification.entity';
import { CreateNotif } from './model/notifications';
import { PaginationDto } from '../Post/dto/get-posts-dto';

export class NotifRepository {
    private notifRepo: Repository<NotificationEntity>;

    constructor(private dataSource: DataSource) {
        this.notifRepo = dataSource.getRepository(NotificationEntity);
    }

    notifList(username: string, { p: page, c: take }: PaginationDto) {
        const skip = (page - 1) * take;

        return this.notifRepo.find({
            where: { receiverId: username },
            relations: {
                emiter: true,
                receiver: true,
            },
            order: { updatedAt: 'DESC' },
            skip,
            take,
        });
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
