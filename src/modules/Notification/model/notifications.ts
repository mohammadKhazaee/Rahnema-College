import { Brand } from '../../../utility/brand';

export type NotifType = CommonNotifType | FriendNotifType;

export type CommonNotifType = Brand<
    'like' | 'mention' | 'acceptedFollow' | 'followedBy' | 'incommingReq',
    'CommonNotifType'
>;

export type FriendNotifType = Brand<
    'comment' | 'like' | 'follow',
    'FriendNotifType'
>;
