export const normalizeVaultName = (
    name: string
): string => {
    return name
        .trim()
        .replace(/\s+/g, " ");
};