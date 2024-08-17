import { Repository, DataSource, In } from 'typeorm';
import { TagEntity } from './entity/tag.entity';
import { CreateTag, Tag } from './model/tag';

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
}
