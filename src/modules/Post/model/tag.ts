export interface CreateTag {
    name: string;
}

export interface Tag {
    tagId: string;
    name: string;
}

export interface SearchTagsResponse {
    tags: string[];
}
