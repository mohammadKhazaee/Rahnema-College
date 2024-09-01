import { Repository, DataSource } from 'typeorm';
import { FollowNotifEntity } from './entity/follow-notif.entity';
import { CreateFollowNotifEntity } from './model/follow-notif';

export class FollowNotifRepository {
    private followNotifRepo: Repository<FollowNotifEntity>;

    constructor(dataSource: DataSource) {
        this.followNotifRepo = dataSource.getRepository(FollowNotifEntity);
    }

    create(createNotif: CreateFollowNotifEntity) {
        const newNotif = this.followNotifRepo.create(createNotif);
        return this.followNotifRepo.insert(newNotif);
    }

    async delete(followId: string) {
        const follow = await this.followNotifRepo.findOneBy({ followId });
        if (!follow) throw new Error();
        await this.followNotifRepo.remove(follow);
        return follow;
    }
}
