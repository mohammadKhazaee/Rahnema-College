export const convertToFsPaths = (paths: string[]) => {
    if (process.platform === 'win32')
        return paths.map((p) => 'src' + p.replace(/[/]]/g, '\\'));
    return paths.map((p) => 'src' + p);
};

export const imageUrlPath = (path: string) => path.replace(/\\/g, '/').slice(3);
