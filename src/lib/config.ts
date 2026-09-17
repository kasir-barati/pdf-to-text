const DEFAULT_MAX_FILE_SIZE_MB = 20;
const DEFAULT_MAX_PAGE_COUNT = 50;

function parsePositiveInt(
  value: string | undefined,
  fallback: number,
): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const config = {
  maxFileSizeMb: parsePositiveInt(
    import.meta.env.VITE_MAX_FILE_SIZE_MB,
    DEFAULT_MAX_FILE_SIZE_MB,
  ),
  maxPageCount: parsePositiveInt(
    import.meta.env.VITE_MAX_PAGE_COUNT,
    DEFAULT_MAX_PAGE_COUNT,
  ),
};
