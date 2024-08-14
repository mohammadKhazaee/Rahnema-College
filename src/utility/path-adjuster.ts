export const fsPath = (path: string) => {
    if (process.platform === 'win32') return path.replace(/[/]]/g, '\\');
    return path;
};

export const imageUrlPath = (path: string) => path.replace(/\\/g, '/');
