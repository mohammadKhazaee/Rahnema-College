import { UserRelationService } from '../modules/UserRelation/user-relation.service';
import { PostService } from '../modules/Post/post.service';
import { UserProfileDao } from '../modules/User/model/user';
import { UserService } from '../modules/User/user.service';
export class SocialService {
    constructor(
        private userService: UserService,
        private followService: UserRelationService,
        private postService: PostService
    ) {}

    async getUserInfo(username: string): Promise<UserProfileDao> {
        const user = await this.userService.getUser({ username });

        const [followersCount, followingsCount, postCount] = await Promise.all([
            this.followService.getFollowersCount(username),
            this.followService.getFollowingsCount(username),
            this.postService.getPostCount(username),
        ]);

        return {
            email: user.email,
            username,
            imageUrl: user.imageUrl,
            fName: user.fName,
            lName: user.lName,
            isPrivate: user.isPrivate,
            bio: user.bio,
            followersCount,
            followingsCount,
            postCount,
        };
    }
}
