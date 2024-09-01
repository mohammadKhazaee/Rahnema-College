import { UserRelationService } from '../modules/UserRelation/user-relation.service';
import { PostService } from '../modules/Post/post.service';
import { UserProfileDao } from '../modules/User/model/user';
import { UserService } from '../modules/User/user.service';
import { explorePostsDto } from '../modules/Post/model/post';
export class SocialService {
    constructor(
        private userService: UserService,
        private followService: UserRelationService,
        private postService: PostService
    ) { }

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

    async getSocialExplore(username: string) {
        const explore = await this.postService.exlorePosts(username)
        const returnExplore: explorePostsDto[] = await Promise.all(
            explore.map(async (p) => ({
                ...p,
                creator: {
                    ...p.creator,
                    followersCount: await this.followService.getFollowersCount(p.creator.username)
                }
            }))
        )
        return returnExplore
    }
}
