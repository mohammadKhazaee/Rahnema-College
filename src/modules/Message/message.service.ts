import { ForbiddenError, NotFoundError } from '../../utility/errors';
import { imageUrlPath } from '../../utility/path-adjuster';
import { UserService } from '../User/user.service';
import { UserRelationService } from '../UserRelation/user-relation.service';
import { CreateMessageDto } from './dto/createMessageDto';
import { MessageRepository } from './message.repository';
import { CreateMessage } from './model/message';

export class MessageService {
    constructor(
        private messageRepo: MessageRepository,
        private userService: UserService,
        private relationService: UserRelationService
    ) {}

    async addMessage(messageDto: CreateMessageDto, receiverId: string, senderId: string) {
        if (receiverId === senderId) throw new ForbiddenError('Users cant message themselves');

        await this.relationService.fetchRelationStatus({
            followerId: receiverId,
            followedId: senderId,
        });

        if ('image' in messageDto) {
            const url = imageUrlPath(messageDto.image.path);
            const newMessage: CreateMessage = {
                receiverId,
                senderId,
                content: url,
                isImage: true,
            };
            await this.messageRepo.create(newMessage);
            return 'succes';
        }

        const newMessage: CreateMessage = {
            receiverId,
            senderId,
            isImage: false,
            content: messageDto.content,
        };
        await this.messageRepo.create(newMessage);
        return 'succes';
    }
}
