import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

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

  const pageTexts: string[] = [];
  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber++) {
    const page = await doc.getPage(pageNumber);
    const content = await page.getTextContent();
    const pageText = content.items
      .filter((item): item is TextItem => 'str' in item)
      .map((item) => item.str)
      .join(' ');
    pageTexts.push(pageText);
  }

  return pageTexts.join('\n\n').trim();
}
