import { explorePostsDto } from '../Post/model/post';
import { PostService } from '../Post/post.service';
import { UserProfileDao } from '../User/model/user';
import { UserService } from '../User/user.service';
import { UserRelationService } from '../UserRelation/user-relation.service';

export class SocialService {
    constructor(
        private userService: UserService,
        private followService: UserRelationService,
        private postService: PostService
    ) {}

    async getUserInfo(username: string, mainUser: string): Promise<UserProfileDao> {
        const user = await this.userService.getUser({ username });

        const [followersCount, followingsCount, postCount, relationState] = await Promise.all([
            this.followService.getFollowersCount(username),
            this.followService.getFollowingsCount(username),
            this.postService.getPostCount(username),
            this.followService.fetchRelationStatus({ followerId: mainUser, followedId: username }),
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
            relationState,
        };
    }

    async getSocialExplore(username: string) {
        const explore = await this.postService.exlorePosts(username);
        const returnExplore: explorePostsDto[] = await Promise.all(
            explore.map(async (p) => ({
                ...p,
                creator: {
                    ...p.creator,
                    followersCount: await this.followService.getFollowersCount(p.creator.username),
                },
            }))
        );
        return returnExplore;
    }
}
