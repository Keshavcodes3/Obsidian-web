export const normalizeWorkspaceName = (
    name: string
): string => {

    return name
        .trim()
        .replace(/\s+/g, " ");
};