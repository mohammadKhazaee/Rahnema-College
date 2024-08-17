import multer from 'multer';
import * as fs from 'fs';
import { v4 } from 'uuid';
import { convertToFsPaths } from './path-adjuster';

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
    buffer: Buffer;
    size: number;
    destination: string;
    filename: string;
    path: string;
}

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
