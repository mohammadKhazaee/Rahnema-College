import multer from 'multer';
import * as fs from 'fs';
import { v4 } from 'uuid';
import { convertToFsPaths } from './path-adjuster';
import { z } from 'zod';

export type IFiles =
    | {
          [fieldname: string]: Express.Multer.File[];
      }
    | Express.Multer.File[]
    | undefined;

export interface IFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination: string;
    filename: string;
    path: string;
}

export const zodFileSchema = z.object({
    fieldname: z.string({ message: '1' }),
    originalname: z.string({ message: '2' }),
    encoding: z.string({ message: '3' }),
    mimetype: z.string({ message: '4' }),
    size: z.number({ message: '6' }),
    destination: z.string({ message: '7' }),
    filename: z.string({ message: '8' }),
    path: z.string({ message: '9' }),
});

export class FileParser {
    private storageConfig() {
        return multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, 'src/images');
            },
            filename: (req, file, cb) => {
                cb(null, `${v4()} - ${file.originalname}`);
            },
        });
    }

    // @ts-ignore
    private fileFilter = () => (req, file, cb) => {
        cb(
            null,
            file.mimetype === 'image/png' ||
                file.mimetype === 'image/jpg' ||
                file.mimetype === 'image/avif' ||
                file.mimetype === 'image/jpeg'
        );
    };

    fileParser() {
        return multer({
            storage: this.storageConfig(),
            fileFilter: this.fileFilter(),
        });
    }

    async deleteFiles(paths: string[]) {
        try {
            await Promise.all(
                convertToFsPaths(paths).map((p) => this.deleteFile(p))
            );
        } catch (err) {
            console.log(err);
        }
        return 'iamges deleted';
    }

    private deleteFile(path: string) {
        return new Promise((resolve, reject) => {
            fs.unlink(path, (err) => {
                console.log(err);

                if (err) return reject(err);
                resolve('image deleted');
            });
        });
    }
}
