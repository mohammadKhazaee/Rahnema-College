import { ForbiddenError, NotFoundError } from '../../utility/errors';
import { imageUrlPath } from '../../utility/path-adjuster';
import { PaginationDto } from '../Common/dto/pagination-dto';

import { UserService } from '../User/user.service';
import { UserRelationService } from '../UserRelation/user-relation.service';
import { CreateMessageDto } from './dto/createMessageDto';
import { MessageEntity } from './entity/message.entity';
import { MessageRepository } from './message.repository';
import { ChatHistoryList, CreateMessage } from './model/message';

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

    async chatHistory(username: string, pagDto: PaginationDto) {
        const isUserValid = await this.userService.doesUserExists({ username });
        if (!isUserValid) throw new NotFoundError('this user does not exists');
        const skip = (pagDto.p - 1) * pagDto.c;
        const history = await this.messageRepo.retrieveHistory(username, skip, pagDto.c);
        console.log(history);

        // const result = await this.formatLastMessages(history, username);
        // return result;
    }

    //     private async formatLastMessages(chats: MessageEntity[], username: string) {
    //         // const uniqueChats = chats.reduce((chatHistory: ChatHistoryList[], message) => {
    //         //     const contact = message.senderId === username ? message.receiver : message.sender;
    //         //     console.log(contact);
    //         //     const existingChatIndex = chatHistory.findIndex(
    //         //         (chat) => chat.contact.username === contact.username
    //         //     );

    //         //     if (existingChatIndex === -1) {
    //         //         const returnChats: ChatHistoryList = {
    //         //             chatId: message.messageId,
    //         //             contact: {
    //         //                 username: contact.username,
    //         //                 imageUrl: contact.imageUrl,
    //         //                 fname: contact.fName,
    //         //                 lname: contact.lName,
    //         //                 lastMessage: {
    //         //                     content: message.content,
    //         //                     createdAt: message.createdAt,
    //         //                 },
    //         //                 unseenCount: 0,
    //         //             },
    //         //         };
    //         //         chatHistory.push(returnChats);
    //         //     }

    //         //     if (message.createdAt > chatHistory[existingChatIndex].contact.lastMessage.createdAt) {
    //         //         chatHistory[existingChatIndex].contact.lastMessage = {
    //         //             content: message.content,
    //         //             createdAt: message.createdAt,
    //         //         };
    //         //     }
    //         //     return chatHistory;
    //         // }, []);
    //         const contact = chats.filter((c) => c.senderId !== username || c.receiverId !== username);
    //         const lastMsg = this.getLastMessage(contact);
    //         if (!lastMsg) throw new NotFoundError('did not find any chat');
    //         const unseenCount = await this.messageRepo.unseenCount(
    //             lastMsg.senderId,
    //             lastMsg.receiverId
    //         );

    //         const formatedChat: ChatHistoryList[] = await Promise.all(
    //             contact.map((chat) => ({
    //                 chatId: chat.messageId,
    //                 contact: {
    //                     username: chat.sender.username,
    //                     fname: chat.sender.fName,
    //                     lname: chat.sender.lName,
    //                     imageUrl: chat.sender.imageUrl,
    //                     lastMessage: {
    //                         content: lastMsg.content,
    //                         createdAt: lastMsg.createdAt,
    //                     },
    //                     unseenCount,
    //                 },
    //             }))
    //         );

    //         return formatedChat;
    //     }
    //     private latestMessage(firstMessage: MessageEntity, secondMessage: MessageEntity) {
    //         let latestMsg;
    //         if (firstMessage.createdAt > secondMessage.createdAt) {
    //             latestMsg = firstMessage;
    //         }
    //         latestMsg = secondMessage;
    //         return latestMsg;
    //     }

    //     private userChatPage(chats: MessageEntity[]) {
    //         for (let i = 0; i < chats.length; i++) {
    //             for (let j = 0; j < chats.length; j++) {
    //                 if (chats[i].senderId === chats[j].senderId) {
    //                     const newMessage = this.latestMessage(chats[i], chats[j]);
    //                     return newMessage;
    //                 }
    //             }
    //         }
    //     }

    //     private getLastMessage(chats: MessageEntity[]) {
    //         for (let i = 0; i < chats.length; i++) {
    //             for (let j = 0; j < chats.length; j++) {
    //                 if (chats[i] === chats[j]) {
    //                     if (chats[i].createdAt > chats[j].createdAt) {
    //                         const newMessage = chats[i];
    //                         chats.splice(j, 1);
    //                         return newMessage;
    //                     }
    //                     const newMessage = chats[j];
    //                     chats.splice(i, 1);
    //                     return newMessage;
    //                 }
    //             }
    //         }
    //     }
    // }
}
