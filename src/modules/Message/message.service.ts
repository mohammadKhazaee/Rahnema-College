import { SendMessageReason } from '../../utility/errors/error-reason';
import { ForbiddenError, NotFoundError } from '../../utility/errors/userFacingError';
import { imageUrlPath } from '../../utility/path-adjuster';
import { PaginationDto } from '../Common/dto/pagination-dto';

import { UserService } from '../User/user.service';
import { UserRelationService } from '../UserRelation/user-relation.service';
import { CreateMessageDto } from './dto/createMessageDto';
import { MessageRepository } from './message.repository';
import { ChatHistoryList, ChatHitoryRecord, CreateMessage } from './model/message';

export class MessageService {
    constructor(
        private messageRepo: MessageRepository,
        private userService: UserService,
        private relationService: UserRelationService
    ) {}

    async addMessage(
        messageDto: CreateMessageDto,
        receiverId: string,
        senderId: string
    ): Promise<{ message: string } | ForbiddenError> {
        if (receiverId === senderId)
            return new ForbiddenError(
                SendMessageReason.SelfMessage,
                'Users cant message themselves'
            );

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
            return { message: 'succes' };
        }

        const newMessage: CreateMessage = {
            receiverId,
            senderId,
            isImage: false,
            content: messageDto.content,
        };
        await this.messageRepo.create(newMessage);
        return { message: 'succes' };
    }

    async chatHistory(username: string, pagDto: PaginationDto) {
        const isUserValid = await this.userService.doesUserExists({ username });
        if (!isUserValid) throw new NotFoundError('this user does not exists');

        const skip = (pagDto.p - 1) * pagDto.c;
        const history = await this.messageRepo.retrieveHistory(username, skip, pagDto.c);

        const chatList = await this.formatChat(history, username);
        return chatList;
    }

    private async formatChat(chats: ChatHitoryRecord[], username: string) {
        const formatedChat: ChatHistoryList[] = await Promise.all(
            chats.map(async (chat) => ({
                chatId: chat.messageId,
                contact: {
                    username: chat.receiverId !== username ? chat.receiverId : chat.senderId,
                    imageUrl: chat.senderId !== username ? chat.senderImage : chat.receiverImage,
                    fname: chat.senderId !== username ? chat.senderfName : chat.receiverfName,
                    lname: chat.senderId !== username ? chat.senderlName : chat.receiverlName,
                    lastMessage: {
                        content: chat.content,
                        createdAt: chat.createdAt,
                    },
                    unseenCount: await this.messageRepo.unseenCount(chat.senderId, chat.receiverId),
                },
            }))
        );
        return formatedChat;
    }
}
