import { CATEGORIES, COLOR_LABELS, DRESS_STYLES } from "@/lib/catalog";

const MAX_QUERY_LENGTH = 100;
const MAX_TERMS = 8;

/** Trimmed, whitespace-collapsed search text, or undefined when empty. */
export function normalizeSearchQuery(value: string | undefined) {
  const q = value?.replace(/\s+/g, " ").trim().slice(0, MAX_QUERY_LENGTH);
  return q || undefined;
}

function fold(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

/**
 * Vietnamese phrases (diacritics folded) mapped to the slug they mean.
 * Catalog content is in English, so "áo thun đen" is also searched as "t-shirts black".
 */
const SYNONYMS: [phrase: string, slug: string][] = [
  ...CATEGORIES.map(({ id, label }) => [label, id] as [string, string]),
  ...DRESS_STYLES.map(({ id, label }) => [label, id] as [string, string]),
  ...Object.entries(COLOR_LABELS).map(([id, label]) => [label, id] as [string, string]),
  ["ao phong", "t-shirts"],
  ["quan dui", "shorts"],
  ["quan sooc", "shorts"],
  ["quan soc", "shorts"],
  ["so mi", "shirts"],
  ["quan jean", "jeans"],
  ["quan bo", "jeans"],
  ["di tiec", "party"],
  ["di lam", "formal"],
  ["tap gym", "gym"],
];

const PHRASES = SYNONYMS.map(([phrase, slug]) => ({ words: fold(phrase).split(" "), slug })).sort(
  (a, b) => b.words.length - a.words.length,
);

/** Generic words that only narrow results when translated ("áo đen" → "black"). */
const STOPWORDS = new Set(["ao", "quan", "mau", "cho", "cua", "va"]);

function tokenize(q: string) {
  return q
    .toLowerCase()
    .split(/[^\p{L}\p{N}-]+/u)
    .map((token) => token.replace(/^-+|-+$/g, ""))
    .filter(Boolean)
    .slice(0, MAX_TERMS);
}

/**
 * GROQ `match` patterns for a search query. A product must match every
 * pattern of either `terms` (what the shopper typed, prefix-matched) or
 * `altTerms` (the same query with Vietnamese labels translated to slugs).
 * Both are empty when there is nothing to search for.
 */
export function searchTerms(q: string | undefined) {
  const tokens = q ? tokenize(q) : [];
  const terms = tokens.map((token) => `${token}*`);

  const folded = tokens.map(fold);
  const altTerms: string[] = [];
  for (let i = 0; i < folded.length; ) {
    const phrase = PHRASES.find(({ words }) =>
      words.every((word, offset) => folded[i + offset] === word),
    );
    if (phrase) {
      altTerms.push(phrase.slug);
      i += phrase.words.length;
    } else {
      if (!STOPWORDS.has(folded[i])) altTerms.push(terms[i]);
      i += 1;
    }
  }

  return { terms, altTerms: altTerms.length > 0 ? altTerms : terms };
}
