export const MAX_SLUG_LENGTH = 120;
const COPY_TOKEN = 'copy';

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Prefer trimming at a hyphen boundary; fall back to hard slice.
function clipForSuffix(base: string, suffix: string) {
  const room = Math.max(1, MAX_SLUG_LENGTH - suffix.length);
  if (base.length <= room) return base.replace(/-+$/g, '');

  // Try to cut at the last '-' within the room to avoid breaking a word.
  const candidate = base.slice(0, room);
  const lastDash = candidate.lastIndexOf('-');
  const clipped = (
    lastDash > room * 0.6 ? candidate.slice(0, lastDash) : candidate
  ) // heuristic
    .replace(/-+$/g, '');

  return clipped || base.slice(0, room).replace(/-+$/g, '');
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_SLUG_LENGTH);
}

export async function uniqueSlugForTitle<T extends { slug: string }>(
  title: string,
  ProcModel: import('mongoose').Model<T>,
) {
  const base = slugify(title);

  // 1) If base is free, use it.
  const exists = await ProcModel.exists({ slug: base });
  if (!exists) return base;

  // 2) Find all existing "copy" variants and pick the next number.
  const pattern = new RegExp(
    `^${escapeRegex(base)}(?:-${COPY_TOKEN}(?:-(\\d+))?)?$`,
  );

  const matches = await ProcModel.find(
    { slug: { $regex: pattern } },
    { slug: 1, _id: 0 },
  ).lean();

  let hasPlainCopy = false;
  let maxN = 1;
  for (const m of matches) {
    const s = (m as any).slug as string;
    const m2 = s.match(pattern);
    if (!m2) continue;
    if (s === `${base}-${COPY_TOKEN}`) hasPlainCopy = true;
    const n = m2[1] ? parseInt(m2[1], 10) : 1;
    if (Number.isFinite(n)) maxN = Math.max(maxN, n);
  }

  const nextNum = hasPlainCopy ? maxN + 1 : 1;
  const suffix = nextNum === 1 ? `-${COPY_TOKEN}` : `-${COPY_TOKEN}-${nextNum}`;
  const clippedBase = clipForSuffix(base, suffix);
  return `${clippedBase}${suffix}`;
}
