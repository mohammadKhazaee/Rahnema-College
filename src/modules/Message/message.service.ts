import { FindSession, SessionStore } from '../../sessionStore';
import { getIo } from '../../socket';
import { SendMessageReason } from '../../utility/errors/error-reason';
import { ForbiddenError, NotFoundError } from '../../utility/errors/userFacingError';
import { imageUrlPath } from '../../utility/path-adjuster';
import { PaginationDto } from '../Common/dto/pagination-dto';
import { UserService } from '../User/user.service';
import { UserRelationService } from '../UserRelation/user-relation.service';
import { CreateMessageDto } from './dto/createMessageDto';
import { MessageEntity } from './entity/message.entity';
import { MessageRepository } from './message.repository';
import {
    ChatersId,
    ChatHistoryList,
    ChatHitoryRecord,
    CreateMessage,
    GetMessageDao,
} from './model/message';

export class MessageService {
    constructor(
        private messageRepo: MessageRepository,
        private userService: UserService,
        private relationService: UserRelationService,
        private sessionStore: SessionStore
    ) {}

    unSeenCount(username: string) {
        return this.messageRepo.unSeenCount(username);
    }

    async getChats(
        { chaterId, username }: ChatersId,
        { p: page, c: count }: PaginationDto
    ): Promise<GetMessageDao[]> {
        const relationState = await this.relationService.fetchRelationStatus({
            followerId: username,
            followedId: chaterId,
        });

        if (
            relationState === 'blocked' ||
            relationState === 'gotBlocked' ||
            relationState === 'twoWayBlocked'
        )
            throw new ForbiddenError('Blocked', 'you or targeted user have blocked eachother');

        const skip = (page - 1) * count;
        const messageEntities = await this.messageRepo.getChats(
            { chaterId, username },
            { take: count, skip }
        );

        await this.messageRepo.update(messageEntities.map((m) => ({ ...m, isSeen: true })));

        return this.formatChatMessages(messageEntities, username);
    }

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

        let newMessage: CreateMessage;
        if ('image' in messageDto) {
            const url = imageUrlPath(messageDto.image.path);
            newMessage = {
                receiverId,
                senderId,
                content: url,
                isImage: true,
                createdAt: new Date(),
            };
        } else {
            newMessage = {
                receiverId,
                senderId,
                isImage: false,
                content: messageDto.content,
                createdAt: new Date(),
            };
        }

        await this.messageRepo.create(newMessage);

        await this.sendFriendMessage({ username: senderId, friendId: receiverId }, newMessage);

        return { message: 'succes' };
    }

    async chatHistory(username: string, pagDto: PaginationDto) {
        const isUserValid = await this.userService.doesUserExists({ username });
        if (!isUserValid) throw new NotFoundError('this user does not exists');

        const skip = (pagDto.p - 1) * pagDto.c;
        const history = await this.messageRepo.retrieveHistory(username, skip, pagDto.c);

        const chatList = await this.formatChatHistory(history, username);

        return chatList;
    }

    private async sendFriendMessage({ username, friendId }: FindSession, message: CreateMessage) {
        const socketId = await this.sessionStore.findReceiverSession({ username, friendId });
        if (!socketId) return;

        getIo().to(socketId).emit('pvMessage', message);
    }

    private async formatChatHistory(chats: ChatHitoryRecord[], username: string) {
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

    private formatChatMessages(chats: MessageEntity[], username: string): GetMessageDao[] {
        return chats.map((m) => {
            if (m.isImage)
                return {
                    messageId: m.messageId,
                    isOwned: m.senderId === username,
                    createdAt: m.createdAt,
                    image: m.content,
                };
            return {
                messageId: m.messageId,
                isOwned: m.senderId === username,
                createdAt: m.createdAt,
                content: m.content,
            };
        });
    }
}
