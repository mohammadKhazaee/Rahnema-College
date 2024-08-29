import { CreateLikeNotif } from './model/notifications';
import { NotifRepository } from './notif.repository';
import { PostNotifRepository } from './post-notif.repository';

export class NotifService {
    constructor(
        private notifRepo: NotifRepository,
        private postNotifRepo: PostNotifRepository
    ) {}

    async createLikeNotif({ emiterId, postId }: CreateLikeNotif) {
        const createdNotif = await this.notifRepo.create({
            type: 'like',
            emiterId,
        });

        return this.postNotifRepo.create({
            notifId: createdNotif.notifId,
            postId: postId,
        });
    }
}
