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

export enum CreatePostReason {
    Unauthenticated = 'Unauthenticated',
    InvalidCaption = 'InvalidCaption',
    InvalidMentions = 'InvalidMentions',
    NotFoundMentions = 'NotFoundMentions',
}

export enum GetPostReason {
    InvalidPostId = 'InvalidPostId',
    NotFoundPost = 'NotFoundPost',
}

export enum GetUserInfoReason {
    Unauthenticated = 'Unauthenticated',
}

export enum EditProfileReason {
    Unauthenticated = 'Unauthenticated',
    DupEmail = 'DupEmail',
    InvalidEmail = 'InvalidEmail',
    InvalidFName = 'InvalidFName',
    InvalidLName = 'InvalidLName',
    InvalidBio = 'InvalidBio',
    InvalidIsPrivate = 'InvalidIsPrivate',
    InvalidPassword = 'InvalidPassword',
    InvalidConfirmPassword = 'InvalidConfirmPassword',
    NoSamePasswords = 'NoSamePasswords',
}

export enum FollowUserReason {
    Unauthenticated = 'Unauthenticated',
    DupFollow = 'DupFollow',
    NotFoundUsernames = 'NotFoundUsernames',
    FollowYourself = 'FollowYourself',
}
