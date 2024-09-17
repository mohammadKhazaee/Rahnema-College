import { HttpError } from '../../utility/errors';
import { PostService } from '../Post/post.service';
import { UserProfileDao, UserSearchResult } from '../User/model/user';
import { UserService } from '../User/user.service';
import { UserRelationService } from '../UserRelation/user-relation.service';

export class SocialService {
    constructor(
        private userService: UserService,
        private followService: UserRelationService,
        private postService: PostService
    ) {}

    async getUserInfo(username: string, mainUser: string): Promise<UserProfileDao> {
        const user = await this.userService.fetchUser({ username });

        if (!user) throw new HttpError(401, 'user not found');

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

    async searchUsers(
        query: string,
        currentUsername: string,
        page: number,
        count: number
    ): Promise<UserSearchResult[]> {
        const { users, followersCount } = await this.userService.searchUsers(
            query,
            currentUsername,
            page,
            count
        );

        if (users.length === 0) {
            return [];
        }

        const searchResults: UserSearchResult[] = await Promise.all(
            users.map(async (user, index) => {
                const relationState = await this.followService.fetchRelationStatus({
                    followerId: currentUsername,
                    followedId: user.username,
                });

                return {
                    username: user.username,
                    imageUrl: user.imageUrl,
                    fName: user.fName,
                    lName: user.lName,
                    followersCount: followersCount[index],
                    relationState,
                };
            })
        );

        return searchResults;
    }
}
