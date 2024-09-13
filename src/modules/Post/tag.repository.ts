import { Repository, DataSource, In } from 'typeorm';
import { TagEntity } from './entity/tag.entity';
import { CreateTag, Tag } from './model/tag';
import { DbPagination } from '../Common/model/db-pagination';

export class TagRepository {
    private tagRepo: Repository<TagEntity>;

    constructor(dataSource: DataSource) {
        this.tagRepo = dataSource.getRepository(TagEntity);
    }

    findTagsByNames(names: string[]): Promise<Tag[]> {
        return this.tagRepo.findBy({ name: In(names) });
    }

    saveBulk(names: CreateTag[]): Promise<Tag[]> {
        return this.tagRepo.save(names);
    }
    async searchTags(searchPattern: string, { take, skip }: DbPagination): Promise<Tag[]> {
        return this.tagRepo
            .createQueryBuilder('tag')
            .where('tag.name LIKE :searchPattern', { searchPattern: `%${searchPattern}%` })
            .orderBy('tag.name', 'ASC')
            .take(take)
            .skip(skip)
            .getMany();
    }

    async getTagCountByPattern(searchPattern: string): Promise<number> {
        return this.tagRepo
            .createQueryBuilder('tag')
            .where('tag.name LIKE :searchPattern', { searchPattern: `%${searchPattern}%` })
            .getCount();
    }
}
