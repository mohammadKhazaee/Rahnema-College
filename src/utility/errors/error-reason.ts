// Auth endpoints

export enum SignupUserReason {
    DupUser = 'DupUser',
    InvalidUsername = 'InvalidUsername',
    InvalidEmail = 'InvalidEmail',
    InvalidPassword = 'InvalidPassword',
    InvalidConfirmPassword = 'InvalidConfirmPassword',
    NotSamePasswords = 'NotSamePasswords',
}

export enum LoginUserReason {
    WrongEmail = 'WrongEmail',
    WrongPassword = 'WrongPassword',
    InvalidUsername = 'InvalidUsername',
    InvalidEmail = 'InvalidEmail',
    InvalidPassword = 'InvalidPassword',
    InvalidRememberMe = 'InvalidRememberMe',
}

export enum SendResetEmailReason {
    NonExistUser = 'NonExistUser',
    InvalidUsername = 'InvalidUsername',
    InvalidEmail = 'InvalidEmail',
}

export enum ResetPasswordReason {
    NonExistUser = 'NonExistUser',
    InvalidToken = 'InvalidToken',
    InvalidNewPassword = 'InvalidNewPassword',
    InvalidConfirmPassword = 'InvalidConfirmPassword',
    NotSamePasswords = 'NotSamePasswords',
}

// Post endpoints

export enum CreatePostReason {
    Unauthenticated = 'Unauthenticated',
    InvalidCaption = 'InvalidCaption',
    InvalidImages = 'InvalidImages',
    InvalidIsCloseFriend = 'InvalidIsCloseFriend',
    InvalidMentions = 'InvalidMentions',
    NotFoundMentions = 'NotFoundMentions',
}

export enum UpdatePostReason {
    Unauthenticated = 'Unauthenticated',
    InvalidPostId = 'InvalidPostId',
    InvalidCaption = 'InvalidCaption',
    InvalidImages = 'InvalidImages',
    InvalidDeletedImages = 'InvalidDeletedImages',
    InvalidIsCloseFriend = 'InvalidIsCloseFriend',
    InvalidMentions = 'InvalidMentions',
    PostNotFound = 'PostNotFound',
    NonCreator = 'NonCreator',
    NotFoundMentions = 'NotFoundMentions',
}

export enum GetPostReason {
    Unauthenticated = 'Unauthenticated',
    InvalidPostId = 'InvalidPostId',
    NotFoundPost = 'NotFoundPost',
    BlockedCreator = 'BlockedCreator',
    FollowerOnly = 'FollowerOnly',
    FriendOnly = 'FriendOnly',
}

export enum GetUserPostsReason {
    Unauthenticated = 'Unauthenticated',
    NotFoundUser = 'NotFoundUser',
    BlockedCreator = 'BlockedCreator',
    FollowerOnly = 'FollowerOnly',
}

export enum CreateCommentReason {
    Unauthenticated = 'Unauthenticated',
    InvalidPostId = 'InvalidPostId',
    InvalidType = 'InvalidType',
    InvalidContent = 'InvalidContent',
    InvalidParentId = 'InvalidParentId',
    NotFoundPost = 'NotFoundPost',
    BlockedCreator = 'BlockedCreator',
    FollowerOnly = 'FollowerOnly',
    FriendOnly = 'FriendOnly',
    NotFoundComment = 'NotFoundComment',
    BlockedCommentor = 'BlockedCommentor',
}

export enum GetCommentsReason {
    Unauthenticated = 'Unauthenticated',
    NotFoundPost = 'NotFoundPost',
    BlockedCreator = 'BlockedCreator',
    FollowerOnly = 'FollowerOnly',
    FriendOnly = 'FriendOnly',
}

export enum LikePostReason {
    Unauthenticated = 'Unauthenticated',
    NotFoundPost = 'NotFoundPost',
    BlockedCreator = 'BlockedCreator',
    FollowerOnly = 'FollowerOnly',
    FriendOnly = 'FriendOnly',
}

export enum BookmarkPostReason {
    Unauthenticated = 'Unauthenticated',
    NotFoundPost = 'NotFoundPost',
    BlockedCreator = 'BlockedCreator',
    FollowerOnly = 'FollowerOnly',
    FriendOnly = 'FriendOnly',
}

export enum LikeCommentReason {
    Unauthenticated = 'Unauthenticated',
    NotFoundComment = 'NotFoundComment',
    NotFoundPost = 'NotFoundPost',
    BlockedCreator = 'BlockedCreator',
    FollowerOnly = 'FollowerOnly',
    FriendOnly = 'FriendOnly',
    BlockedCommentor = 'BlockedCommentor',
}

// Dashboard endpoints

export enum GetUserInfoReason {
    Unauthenticated = 'Unauthenticated',
    NotFoundUsername = 'NotFoundUsername',
}

export enum ExploreReason {
    Unauthenticated = 'Unauthenticated',
}

export enum GetNotifsReason {
    Unauthenticated = 'Unauthenticated',
}

export enum GetFriendNotifsReason {
    Unauthenticated = 'Unauthenticated',
}

export enum SearchUsersReason {
    Unauthenticated = 'Unauthenticated',
}

export enum SearchTagsReason {
    Unauthenticated = 'Unauthenticated',
}

export enum MentionedPostsReason {
    Unauthenticated = 'Unauthenticated',
}

export enum BookmarkedPostsReason {
    Unauthenticated = 'Unauthenticated',
}

export enum PostsByTagReason {
    Unauthenticated = 'Unauthenticated',
}

export enum SendMessageReason {
    Unauthenticated = 'Unauthenticated',
    InvalidContent = 'InvalidContent',
    InvalidImage = 'InvalidImage',
    SelfMessage = 'SelfMessage',
    NoReceiver = 'NoReceiver',
    Blocked = 'Blocked',
}

export enum EditProfileReason {
    Unauthenticated = 'Unauthenticated',
    NotFoundUsername = 'NotFoundUsername',
    DupEmail = 'DupEmail',
    InvalidEmail = 'InvalidEmail',
    InvalidFName = 'InvalidFName',
    InvalidLName = 'InvalidLName',
    InvalidImage = 'InvalidImage',
    InvalidBio = 'InvalidBio',
    InvalidIsPrivate = 'InvalidIsPrivate',
    InvalidPassword = 'InvalidPassword',
    InvalidConfirmPassword = 'InvalidConfirmPassword',
    NotSamePasswords = 'NotSamePasswords',
}

// UserRelation endpoints

export enum FollowReqReason {
    Unauthenticated = 'Unauthenticated',
    SelfFollow = 'SelfFollow',
    NotFoundUser = 'NotFoundUser',
    Blocked = 'Blocked',
    DupRequest = 'DupRequest',
    AlreadyFollowed = 'AlreadyFollowed',
}

export enum CancelFollowReason {
    Unauthenticated = 'Unauthenticated',
    SelfCancel = 'SelfCancel',
    NotFoundRequest = 'NotFoundRequest',
}

export enum RejectFollowReason {
    Unauthenticated = 'Unauthenticated',
    SelfReject = 'SelfReject',
    NotFoundRequest = 'NotFoundRequest',
}

export enum AcceptFollowReason {
    Unauthenticated = 'Unauthenticated',
    SelfAccept = 'SelfAccept',
    NotFoundRequest = 'NotFoundRequest',
}

export enum RemoveFollowerReason {
    Unauthenticated = 'Unauthenticated',
    SelfUnfollow = 'SelfUnfollow',
    NotFoundUser = 'NotFoundUser',
    NotFollower = 'NotFollower',
}

export enum UnfollowReason {
    Unauthenticated = 'Unauthenticated',
    SelfUnfollow = 'SelfUnfollow',
    NotFoundUser = 'NotFoundUser',
    NotFollowing = 'NotFollowing',
}

export enum GetFollowersReason {
    Unauthenticated = 'Unauthenticated',
    NotFoundUser = 'NotFoundUser',
}

export enum GetFollowingsReason {
    Unauthenticated = 'Unauthenticated',
    NotFoundUser = 'NotFoundUser',
}

export enum BlockReason {
    Unauthenticated = 'Unauthenticated',
    SelfBlock = 'SelfBlock',
    AlreadyBlocked = 'AlreadyBlocked',
}

export enum UnblockReason {
    Unauthenticated = 'Unauthenticated',
    SelfUnblock = 'SelfUnblock',
    NotBlocked = 'NotBlocked',
}

export enum AddFriendReason {
    Unauthenticated = 'Unauthenticated',
    SelfFriend = 'SelfFriend',
    NotFoundUser = 'NotFoundUser',
    AlreadyFriend = 'AlreadyFriend',
    NotFollowing = 'NotFollowing',
}

export enum RemoveFriendReason {
    Unauthenticated = 'Unauthenticated',
    NotFoundUser = 'NotFoundUser',
    NotFriend = 'NotFriend',
}

export enum FriendListReason {
    Unauthenticated = 'Unauthenticated',
}

export enum BlockListReason {
    Unauthenticated = 'Unauthenticated',
}
