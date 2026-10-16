import { POSTS } from "./posts";

// ---------------------------------------------------------------------------
// SCRIPTURE INDEX -- added 2026-09-11 ("Idea 1" from the brainstorm round).
// One shared page (/verses) listing every `scripture` block cited across
// every post, grouped by Bible book in real canonical order (Genesis ->
// Revelation, the same convention a printed concordance uses), each entry
// linking to the post it's from. Deliberately reachable only via a small
// button inside each post's own Scripture Focus box -- per Brian's explicit
// ask, NOT on the nav or homepage.
// ---------------------------------------------------------------------------

const BIBLE_BOOK_ORDER = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
  "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", "1 Kings", "2 Kings",
  "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther", "Job",
  "Psalm", "Proverbs", "Ecclesiastes", "Song of Solomon",
  "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel",
  "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum",
  "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi",
  "Matthew", "Mark", "Luke", "John", "Acts", "Romans",
  "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", "Philippians",
  "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy",
  "Titus", "Philemon", "Hebrews", "James", "1 Peter", "2 Peter",
  "1 John", "2 John", "3 John", "Jude", "Revelation",
];
// A `scripture` block's `reference` can be several references cited
// together ("Romans 6:11; Romans 6:1-7; Colossians 3:3") and often carries
// a trailing translation abbreviation ("Psalm 34:18 NLT") or a comma before
// one ("Colossians 3:1, NLT"). This pulls out just the book name from the
// FIRST reference in the string -- multi-reference boxes are indexed under
// that first book, in one place, rather than guessing how to split a
// combined citation apart (see the design note shown on the page itself).
function extractReferenceBook(firstRef) {
  const m = firstRef.match(/^((?:[123]\s+)?[A-Za-z]+(?:\s+[A-Za-z]+)*?)\s+\d+:\d+/);
  return m ? m[1].trim() : firstRef.trim();
}
// Sort key for ordering entries *within* a book by chapter, then verse --
// so "Psalm 34:18" lands before "Psalm 100:5", not just in whatever order
// the posts happen to appear in.
function chapterVerseSortKey(chapterVerse) {
  const m = chapterVerse.match(/(\d+):(\d+)/);
  return m ? [Number(m[1]), Number(m[2])] : [9999, 9999];
}
// Built from the Scripture Focus boxes of every post (`entries`, from
// loadScriptureEntries(): one {id, reference, verse} per box), so it can never
// drift out of sync with the actual post content.
export function buildScriptureIndex(rawEntries) {
  const postById = new Map(POSTS.map((p) => [p.id, p]));
  const entries = [];
  for (const raw of rawEntries) {
    const firstRef = raw.reference.split(";")[0].trim();
    const book = extractReferenceBook(firstRef);
    const chapterVerse = firstRef
      .slice(book.length)
      .replace(/^,?\s*/, "")
      .replace(/,?\s*[A-Z]{2,5}$/, "")
      .trim();
    entries.push({ book, chapterVerse, verseText: raw.verse, post: postById.get(raw.id) });
  }

  const byBook = new Map();
  for (const entry of entries) {
    if (!byBook.has(entry.book)) byBook.set(entry.book, []);
    byBook.get(entry.book).push(entry);
  }

  const sortedBooks = Array.from(byBook.keys()).sort((a, b) => {
    const ia = BIBLE_BOOK_ORDER.indexOf(a);
    const ib = BIBLE_BOOK_ORDER.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

  return sortedBooks.map((book) => ({
    book,
    entries: [...byBook.get(book)].sort((a, b) => {
      const [ac, av] = chapterVerseSortKey(a.chapterVerse);
      const [bc, bv] = chapterVerseSortKey(b.chapterVerse);
      return ac - bc || av - bv;
    }),
  }));
}
