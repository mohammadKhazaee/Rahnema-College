import { Repository, DataSource } from 'typeorm';
import { PostNotifEntity } from './entity/post-notif.entity';
import { CreatePostNotif } from './model/post-notif';

export class PostNotifRepository {
    private postNotifRepo: Repository<PostNotifEntity>;

    constructor(dataSource: DataSource) {
        this.postNotifRepo = dataSource.getRepository(PostNotifEntity);
    }

    create(createNotif: CreatePostNotif) {
        const newNotif = this.postNotifRepo.create(createNotif);
        return this.postNotifRepo.insert(newNotif);
    }

    findOneByNotifId(notifId: string) {
        return this.postNotifRepo.findOne({
            where: { notifId },
            relations: { post: { images: true } },
        });
    }
}
