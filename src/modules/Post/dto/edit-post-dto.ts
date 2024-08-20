import { z } from 'zod';

const editImagesDto = z.preprocess(
    (val) => JSON.parse(String(val)),
    z.object({ imageId: z.number(), url: z.string() })
);

export const editPostDto = z.object({
    caption: z.string().optional(),
    mentions: z.array(z.string().min(3).regex(/^\w+$/)).optional(),
    oldImages: z.array(editImagesDto).optional(),
});

export type EditImagesDto = z.infer<typeof editImagesDto>;

export type EditPostDto = z.infer<typeof editPostDto>;
