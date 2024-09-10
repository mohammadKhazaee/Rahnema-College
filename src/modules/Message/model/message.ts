export interface Message {
    messageId: string;
    receiverId: string;
    senderId: string;
    isImage: boolean;
    content: string;
}
