// Shared types for legal page content modules (terms, privacy, cancellation).
// All legal documents in src/content/legal/*.tsx export a `LegalDocument`.

export interface LegalSubsection {
  id?: string;
  heading: string;
  body: string[];
  list?: string[];
}

export interface LegalSection {
  id: string;
  heading: string;
  body: string[];
  list?: string[];
  subsections?: LegalSubsection[];
}

export interface LegalDocument {
  title: string;
  effective_date: string; // YYYY-MM-DD
  is_draft: boolean;
  intro: string;
  contact_email: string;
  sections: LegalSection[];
}
