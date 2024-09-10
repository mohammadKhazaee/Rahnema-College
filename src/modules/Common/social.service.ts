import { PaginationDto } from './dto/pagination-dto';
import { ExplorePostsDto, FindExplorePosts } from '../Post/model/post';
import { PostService } from '../Post/post.service';
import { UserEntity } from '../User/entity/user.entity';
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

    async getSocialExplore(username: string, paginationDto: PaginationDto) {
        // all post creators
        const followings = (
            await this.followService.fetchRelations({
                followerId: [username],
                status: ['follow', 'friend'],
            })
        ).map((f) => f.followedId);

        if (followings.length === 0) return [];

        // creators that we're their friend
        const friendCreators = (
            await this.followService.fetchRelations({
                followerId: followings,
                followedId: [username],
                status: ['friend'],
            })
        ).map((f) => f.followerId);

        const NonFriendCreators = followings.filter((f) => !friendCreators.includes(f));

        const findExplorePostsData: FindExplorePosts = { friendCreators, NonFriendCreators };

        const explore = await this.postService.explorePosts(
            username,
            findExplorePostsData,
            paginationDto
        );
        const returnExplore: ExplorePostsDto[] = await Promise.all(
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

    async searchUsers(
        query: string,
        currentUsername: string,
        page: number,
        count: number
    ): Promise<UserSearchResult[]> {
        const users: UserEntity[] = await this.userService.searchUsers(
            query,
            currentUsername,
            page,
            count
        );

        const searchResults: UserSearchResult[] = await Promise.all(
            users.map(async (user) => {
                const [followersCount, relationState] = await Promise.all([
                    this.followService.getFollowersCount(user.username),
                    this.followService.fetchRelationStatus({
                        followerId: currentUsername,
                        followedId: user.username,
                    }),
                ]);

                let mappedRelationState: UserSearchResult['relationState'];
                switch (relationState) {
                    case 'followed':
                        mappedRelationState = 'follow';
                        break;
                    case 'requested':
                        mappedRelationState = 'requestedFollow';
                        break;

                    default:
                        mappedRelationState = 'notFollowed';
                }

                return {
                    username: user.username,
                    imageUrl: user.imageUrl,
                    fName: user.fName,
                    lName: user.lName,
                    followersCount,
                    relationState: mappedRelationState,
                };
            })
        );

        // Sort by followers count
        searchResults.sort((a, b) => b.followersCount - a.followersCount);

        return searchResults;
    }
}
