import { createHash } from 'node:crypto';
import type { KnowledgeDocument } from './sources';

export type KnowledgeChunk = {
  id: string; // e.g. help#4-0
  documentId: string;
  documentTitle: string;
  sectionTitle: string;
  url: string;
  content: string;
  contentHash: string; // used to skip unchanged chunks on ingest
};

// one chunk per section; long sections split by sentence with 1-sentence overlap
export const MAX_CHUNK_CHARS = 700;

export function splitSentences(text: string): string[] {
  return text.match(/[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$/g)?.map(s => s.trim()).filter(Boolean) ?? [];
}

export function splitBody(body: string, maxChars = MAX_CHUNK_CHARS): string[] {
  if (body.length <= maxChars) return [body];
  const sentences = splitSentences(body);
  const parts: string[] = [];
  let current: string[] = [];
  for (const sentence of sentences) {
    const candidate = [...current, sentence].join(' ');
    if (candidate.length > maxChars && current.length) {
      parts.push(current.join(' '));
      current = [current[current.length - 1], sentence]; // overlap
    } else {
      current.push(sentence);
    }
  }
  if (current.length) parts.push(current.join(' '));
  return parts;
}

export function hashContent(content: string) {
  return createHash('sha256').update(content).digest('hex');
}

export function chunkDocuments(documents: KnowledgeDocument[], maxChars = MAX_CHUNK_CHARS): KnowledgeChunk[] {
  return documents.flatMap(doc =>
    doc.sections.flatMap((section, sectionIndex) =>
      splitBody(section.body, maxChars).map((part, partIndex) => {
        // keep titles so the chunk reads on its own
        const content = `${doc.title} — ${section.title}\n${part}`;
        return {
          id: `${doc.id}#${sectionIndex}-${partIndex}`,
          documentId: doc.id,
          documentTitle: doc.title,
          sectionTitle: section.title,
          url: doc.url,
          content,
          contentHash: hashContent(content),
        };
      }),
    ),
  );
}
