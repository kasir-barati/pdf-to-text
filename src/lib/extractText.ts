import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';

import { config } from './config';
import { logger } from './logger';

GlobalWorkerOptions.workerSrc = pdfWorker;

export class PdfExtractionError extends Error {}

export async function extractText(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();

  const loadingTask = getDocument({ data: buffer });

  try {
    const doc = await loadingTask.promise.catch((err: unknown) => {
      // if the error object contains raw PDF data, then the retention policy of logs becomes more relevant
      logger.error('Failed to load PDF document', err);

      throw new PdfExtractionError(
        'Could not read this file as a PDF. It may be corrupt or not a valid PDF.',
      );
    });
    const pageCount = doc.numPages;

    if (pageCount > config.maxPageCount) {
      throw new PdfExtractionError(
        `This PDF has ${pageCount} pages, exceeding the ${config.maxPageCount} page limit.`,
      );
    }

    const pageTexts: string[] = [];
    let characterCount = 0;

    for (let pageNumber = 1; pageNumber <= pageCount; pageNumber++) {
      const page = await doc.getPage(pageNumber);
      const content = await page.getTextContent();
      const items = content.items.filter(
        (item): item is TextItem => 'str' in item,
      );
      const pageText = normalizeArabicPresentationForms(
        joinTextItems(items),
      );

      characterCount += pageText.length;
      if (characterCount > config.maxCharacterCount) {
        throw new PdfExtractionError(
          `This PDF's extracted text exceeds the ${config.maxCharacterCount.toLocaleString()} character limit.`,
        );
      }

      pageTexts.push(pageText);
    }

    return pageTexts.join('\n\n').trim();
  } catch (err) {
    if (!(err instanceof PdfExtractionError)) {
      logger.error('Failed to extract text', err);
    }
    throw err;
  } finally {
    await loadingTask.destroy();
  }
}

/**
 * @description
 * Arabic/Persian PDFs embed pre-shaped glyphs (isolated/initial/medial/final forms) instead of base letters; NFKC maps them back to the base letters.
 */
function normalizeArabicPresentationForms(text: string): string {
  const ARABIC_PRESENTATION_FORMS = /[\uFB50-\uFDFF\uFE70-\uFEFF]+/g;

  return text.replace(ARABIC_PRESENTATION_FORMS, (run) =>
    run.normalize('NFKC'),
  );
}

/**
 * @description
 * Arabic/Persian PDFs emit one item per glyph, so a space is only added when the items are on different lines or visibly apart.
 * Previously the letters were spaced-out in Arabic and Persian PDF files.
 */
function needsSpaceBetween(item: TextItem, next: TextItem): boolean {
  if (/\s$/.test(item.str) || /^\s/.test(next.str)) {
    return false;
  }

  const height = Math.max(item.height, next.height);
  const sameLine =
    Math.abs(item.transform[5] - next.transform[5]) < height * 0.5;

  if (!sameLine) {
    return true;
  }

  const gap = Math.max(
    next.transform[4] - (item.transform[4] + item.width),
    item.transform[4] - (next.transform[4] + next.width),
  );

  return gap > height * 0.1;
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
      if (needsSpaceBetween(item, next)) {
        pageText += ' ';
      }
      continue;
    }

    const lineGap = Math.abs(item.transform[5] - next.transform[5]);
    pageText += lineGap > item.height * 1.5 ? '\n\n' : '\n';
  }
  return pageText;
}
