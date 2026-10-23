/**
 * Legal pages of the public website. Text may use **bold** and [label](href)
 * links (site paths, https or mailto). The Dutch version is the reference text.
 */
export type LegalSection = {
  /** Anchor, so other pages can link to a section. */
  id: string;
  title: string;
  paragraphs: string[];
  list?: string[];
  table?: { headers: string[]; rows: string[][] };
};

export type LegalDocument = {
  metaTitle: string;
  title: string;
  lead: string;
  sections: LegalSection[];
};

export type LegalContent = {
  updated: (date: string) => string;
  contents: string;
  /** Shown on the French and English versions. */
  translationNote?: string;
  privacy: LegalDocument;
  cookies: LegalDocument;
  terms: LegalDocument;
  notice: LegalDocument;
};
