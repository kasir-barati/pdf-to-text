import { describe, expect, it, vi } from 'vitest';

vi.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: {},
  getDocument: vi.fn(),
}));
vi.mock('pdfjs-dist/build/pdf.worker.min.mjs?url', () => ({
  default: 'worker-url',
}));
vi.mock('./config', () => ({
  config: {
    maxFileSizeMb: 20,
    maxPageCount: 2,
    maxCharacterCount: 100,
  },
}));

import { getDocument } from 'pdfjs-dist';

import { extractText, PdfExtractionError } from './extractText';

function fakeFile(): File {
  return {
    arrayBuffer: async () => new ArrayBuffer(0),
  } as unknown as File;
}

describe('extractText', () => {
  it('concatenates text items across pages', async () => {
    const doc = {
      numPages: 2,
      getPage: vi.fn(async (pageNumber: number) => ({
        getTextContent: async () => ({
          items: [
            { str: `page${pageNumber}-a` },
            { str: `page${pageNumber}-b` },
          ],
        }),
      })),
    };
    vi.mocked(getDocument).mockReturnValue({
      promise: Promise.resolve(doc),
    } as never);

    const text = await extractText(fakeFile());

    expect(text).toBe('page1-a page1-b\n\npage2-a page2-b');
  });

  it('preserves paragraph breaks as blank lines and wraps lines within a paragraph', async () => {
    const doc = {
      numPages: 1,
      getPage: vi.fn(async () => ({
        getTextContent: async () => ({
          items: [
            {
              str: 'line one',
              hasEOL: true,
              height: 10,
              transform: [0, 0, 0, 0, 0, 100],
            },
            {
              str: 'line two',
              hasEOL: true,
              height: 10,
              transform: [0, 0, 0, 0, 0, 90],
            },
            {
              str: 'new paragraph',
              hasEOL: false,
              height: 10,
              transform: [0, 0, 0, 0, 0, 60],
            },
            {
              str: 'last line',
              hasEOL: false,
              height: 10,
              transform: [0, 0, 0, 0, 0, 50],
            },
          ],
        }),
      })),
    };
    vi.mocked(getDocument).mockReturnValue({
      promise: Promise.resolve(doc),
    } as never);

    const text = await extractText(fakeFile());

    expect(text).toBe(
      'line one\nline two\n\nnew paragraph last line',
    );
  });

  it('throws PdfExtractionError for a file pdfjs cannot parse', async () => {
    vi.mocked(getDocument).mockReturnValue({
      promise: Promise.reject(new Error('bad pdf')),
    } as never);

    await expect(extractText(fakeFile())).rejects.toThrow(
      PdfExtractionError,
    );
  });

  it('throws PdfExtractionError when the page count exceeds the limit', async () => {
    const doc = { numPages: 3, getPage: vi.fn() };
    vi.mocked(getDocument).mockReturnValue({
      promise: Promise.resolve(doc),
    } as never);

    await expect(extractText(fakeFile())).rejects.toThrow(
      PdfExtractionError,
    );
  });

  it('throws PdfExtractionError when extracted text exceeds the character limit', async () => {
    const doc = {
      numPages: 1,
      getPage: vi.fn(async () => ({
        getTextContent: async () => ({
          items: [{ str: 'x'.repeat(101) }],
        }),
      })),
    };
    vi.mocked(getDocument).mockReturnValue({
      promise: Promise.resolve(doc),
    } as never);

    await expect(extractText(fakeFile())).rejects.toThrow(
      PdfExtractionError,
    );
  });
});
