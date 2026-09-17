import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';

import { config } from './config';

GlobalWorkerOptions.workerSrc = pdfWorker;

export class PdfExtractionError extends Error {}

export async function extractText(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();

  let pageCount: number;
  let doc: Awaited<ReturnType<typeof getDocument>['promise']>;

  try {
    doc = await getDocument({ data: buffer }).promise;
    pageCount = doc.numPages;
  } catch {
    throw new PdfExtractionError(
      'Could not read this file as a PDF. It may be corrupt or not a valid PDF.',
    );
  }

  if (pageCount > config.maxPageCount) {
    throw new PdfExtractionError(
      `This PDF has ${pageCount} pages, exceeding the ${config.maxPageCount} page limit.`,
    );
  }

  const pageTexts: string[] = [];

  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber++) {
    const page = await doc.getPage(pageNumber);
    const content = await page.getTextContent();
    const items = content.items.filter(
      (item): item is TextItem => 'str' in item,
    );
    pageTexts.push(joinTextItems(items));
  }

  return pageTexts.join('\n\n').trim();
}

/**
 * Joins a page's text items, using each item's line position to tell a
 * wrapped line (single newline) from a paragraph break (blank line): a
 * vertical gap much bigger than the line's own height means a break.
 */
function joinTextItems(items: TextItem[]): string {
  let pageText = '';
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    pageText += item.str;

    const next = items[i + 1];
    if (!next) {
      continue;
    }

    if (!item.hasEOL) {
      pageText += ' ';
      continue;
    }

    const lineGap = Math.abs(item.transform[5] - next.transform[5]);
    pageText += lineGap > item.height * 1.5 ? '\n\n' : '\n';
  }
  return pageText;
}
