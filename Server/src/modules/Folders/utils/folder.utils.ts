export const normalizeFolderName = (name: string): string => {
    if (!name) return "";
    return name
        .trim()
        .replace(/\s+/g, " ")
        .substring(0, 100);
};
