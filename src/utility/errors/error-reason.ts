// Auth endpoints

export enum SignupUserReason {
    DupUser = 'DupUser',
    InvalidUsername = 'InvalidUsername',
    InvalidEmail = 'InvalidEmail',
    InvalidPassword = 'InvalidPassword',
    InvalidConfirmPassword = 'InvalidConfirmPassword',
    NoSamePasswords = 'NoSamePasswords',
}

export enum LoginUserReason {
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
    NoSamePasswords = 'NoSamePasswords',
}

// Post endpoints

export enum CreatePostReason {
    Unauthenticated = 'Unauthenticated',
    InvalidCaption = 'InvalidCaption',
    InvalidImage = 'InvalidImage',
    InvalidIsCloseFriend = 'InvalidIsCloseFriend',
    InvalidMentions = 'InvalidMentions',
    NotFoundMentions = 'NotFoundMentions',
}

export enum UpdatePostReason {
    Unauthenticated = 'Unauthenticated',
    InvalidPostId = 'InvalidPostId',
    InvalidCaption = 'InvalidCaption',
    InvalidImage = 'InvalidImage',
    InvalidDeletedImages = 'InvalidDeletedImages',
    InvalidIsCloseFriend = 'InvalidIsCloseFriend',
    InvalidMentions = 'InvalidMentions',
    PostNotFound = 'PostNotFound',
    NonCreator = 'NonCreator',
    NotFoundMentions = 'NotFoundMentions',
}

export enum GetPostReason {
    InvalidPostId = 'InvalidPostId',
    NotFoundPost = 'NotFoundPost',
    Blocked = 'Blocked',
    FollowerOnly = 'FollowerOnly',
    FriendOnly = 'FriendOnly',
}

export enum GetUserPostsReason {
    NotFoundUser = 'NotFoundUser',
    Blocked = 'Blocked',
    FollowerOnly = 'FollowerOnly',
}

export enum CreateCommentReason {
    InvalidPostId = 'InvalidPostId',
    InvalidType = 'InvalidType',
    InvalidContent = 'InvalidContent',
    InvalidParentId = 'InvalidParentId',
    NotFoundPost = 'NotFoundPost',
    BlockedByCreator = 'BlockedByCreator',
    FollowerOnly = 'FollowerOnly',
    FriendOnly = 'FriendOnly',
    NotFoundComment = 'NotFoundComment',
    BlockedByCommentor = 'BlockedByCommentor',
}

export enum GetCommentsReason {
    NotFoundPost = 'NotFoundPost',
    BlockedByCreator = 'BlockedByCreator',
    FollowerOnly = 'FollowerOnly',
    FriendOnly = 'FriendOnly',
}

export enum LikePostReason {
    NotFoundPost = 'NotFoundPost',
    BlockedByCreator = 'BlockedByCreator',
    FollowerOnly = 'FollowerOnly',
    FriendOnly = 'FriendOnly',
}

export enum BookmarkPostReason {
    NotFoundPost = 'NotFoundPost',
    BlockedByCreator = 'BlockedByCreator',
    FollowerOnly = 'FollowerOnly',
    FriendOnly = 'FriendOnly',
}

export enum LikeCommentReason {
    NotFoundComment = 'NotFoundComment',
    NotFoundPost = 'NotFoundPost',
    BlockedByCreator = 'BlockedByCreator',
    FollowerOnly = 'FollowerOnly',
    FriendOnly = 'FriendOnly',
    BlockedByCommentor = 'BlockedByCommentor',
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

export enum PostsByTagReason {
    Unauthenticated = 'Unauthenticated',
}

export enum SendMessageReason {
    Unauthenticated = 'Unauthenticated',
    InvalidContent = 'InvalidContent',
    InvalidImage = 'InvalidImage',
    SelfMessage = 'SelfMessage',
}

export enum EditProfileReason {
    Unauthenticated = 'Unauthenticated',
    NotFoundUsername = 'NotFoundUsername',
    DupEmail = 'DupEmail',
    InvalidEmail = 'InvalidEmail',
    InvalidFName = 'InvalidFName',
    InvalidLName = 'InvalidLName',
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
    Blocked = 'Blocked',
    DupRequest = 'DupRequest',
    AlreadyFollowed = 'AlreadyFollowed',
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

export enum RemoveFollowingReason {
    Unauthenticated = 'Unauthenticated',
    SelfUnfollow = 'SelfUnfollow',
    NotFoundUser = 'NotFoundUser',
    NotFollowing = 'NotFollowing',
}

export enum UnfollowReason {
    Unauthenticated = 'Unauthenticated',
    SelfUnfollow = 'SelfUnfollow',
    NotFoundUser = 'NotFoundUser',
    NotFollower = 'NotFollower',
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
