export function getPaginationPages(
  current: number,
  total: number,
): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "…", total];
  if (current >= total - 3)
    return [1, "…", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "…", current - 1, current, current + 1, "…", total];
}

// Narrow layout (e.g. mobile) has no room for the full sliding window of
// page numbers, so collapse down to first, current, current + 1, and last —
// e.g. selecting page 2 shows "1, 2, 3, …, last". The first and last pages
// stay visible at all times; a "…" fills any gap in between.
export function getCompactPaginationPages(
  current: number,
  total: number,
): (number | "…")[] {
  if (total <= 4) return Array.from({ length: total }, (_, i) => i + 1);

  const page = Math.min(Math.max(current, 1), total);
  const nums = Array.from(
    new Set([1, page, Math.min(page + 1, total), total]),
  ).sort((a, b) => a - b);

  const result: (number | "…")[] = [];
  nums.forEach((n, i) => {
    if (i > 0 && n - nums[i - 1] > 1) result.push("…");
    result.push(n);
  });
  return result;
}
