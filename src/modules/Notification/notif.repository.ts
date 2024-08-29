import { Repository, DataSource } from 'typeorm';
import { NotificationEntity } from './entity/notification.entity';
import { CreateNotif } from './model/notifications';

export class NotifRepository {
    private notifRepo: Repository<NotificationEntity>;

    constructor(dataSource: DataSource) {
        this.notifRepo = dataSource.getRepository(NotificationEntity);
    }

    create(createNotif: CreateNotif) {
        return this.notifRepo.save(createNotif);
    }
}
