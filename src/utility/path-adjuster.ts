export const convertToFsPaths = (paths: string[]) => {
    if (process.platform === 'win32')
        return paths.map((p) => p.replace(/[/]]/g, '\\'));
    return paths;
};

export const imageUrlPath = (path: string) => path.replace(/\\/g, '/');
