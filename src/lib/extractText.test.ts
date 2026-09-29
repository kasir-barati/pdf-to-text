import { afterEach, describe, expect, it, vi } from 'vitest';

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
import { logger } from './logger';

function fakeFile(): File {
  return {
    arrayBuffer: async () => new ArrayBuffer(0),
  } as unknown as File;
}

function mockLoadingTask(promise: Promise<unknown>) {
  const destroy = vi.fn().mockResolvedValue(undefined);
  vi.mocked(getDocument).mockReturnValue({
    promise,
    destroy,
  } as never);
  return { destroy };
}

describe('extractText', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('concatenates text items across pages', async () => {
    const doc = {
      numPages: 2,
      getPage: vi.fn(async (pageNumber: number) => ({
        getTextContent: async () => ({
          items: [
            {
              str: `page${pageNumber}-a`,
              height: 10,
              width: 30,
              transform: [0, 0, 0, 0, 0, 100],
            },
            {
              str: `page${pageNumber}-b`,
              height: 10,
              width: 30,
              transform: [0, 0, 0, 0, 40, 100],
            },
          ],
        }),
      })),
    };
    const loadingTask = mockLoadingTask(Promise.resolve(doc));

    const text = await extractText(fakeFile());

    expect(text).toBe('page1-a page1-b\n\npage2-a page2-b');
    expect(loadingTask.destroy).toHaveBeenCalled();
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
    mockLoadingTask(Promise.resolve(doc));

    const text = await extractText(fakeFile());

    expect(text).toBe(
      'line one\nline two\n\nnew paragraph last line',
    );
  });

  it('joins per-glyph RTL items without spaces and normalizes presentation forms', async () => {
    const glyph = (str: string, x: number, width: number) => ({
      str,
      height: 9,
      width,
      transform: [0, 0, 0, 0, x, 100],
    });
    const doc = {
      numPages: 1,
      getPage: vi.fn(async () => ({
        getTextContent: async () => ({
          items: [
            glyph('\uFEDF', 415, 2.5),
            glyph('\uFE8E', 412, 2.5),
            glyph('\uFB8E', 409, 3),
            glyph(' ', 400, 60),
            glyph('\uFEDF', 390, 2.5),
          ],
        }),
      })),
    };
    mockLoadingTask(Promise.resolve(doc));

    const text = await extractText(fakeFile());

    expect(text).toBe('\u0644\u0627\u06A9 \u0644');
  });

  it('throws PdfExtractionError, logs the underlying error, and destroys the loading task for a file pdfjs cannot parse', async () => {
    const loggerError = vi
      .spyOn(logger, 'error')
      .mockImplementation(() => {});
    const cause = new Error('bad pdf');
    const loadingTask = mockLoadingTask(Promise.reject(cause));

    await expect(extractText(fakeFile())).rejects.toThrow(
      PdfExtractionError,
    );
    expect(loggerError).toHaveBeenCalledWith(
      'Failed to load PDF document',
      cause,
    );
    expect(loadingTask.destroy).toHaveBeenCalled();
  });

  it('throws PdfExtractionError when the page count exceeds the limit and still destroys the loading task', async () => {
    const doc = { numPages: 3, getPage: vi.fn() };
    const loadingTask = mockLoadingTask(Promise.resolve(doc));

    await expect(extractText(fakeFile())).rejects.toThrow(
      PdfExtractionError,
    );
    expect(loadingTask.destroy).toHaveBeenCalled();
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
    mockLoadingTask(Promise.resolve(doc));

    await expect(extractText(fakeFile())).rejects.toThrow(
      PdfExtractionError,
    );
  });

  it('logs and rethrows an unexpected error while reading pages, and still destroys the loading task', async () => {
    const loggerError = vi
      .spyOn(logger, 'error')
      .mockImplementation(() => {});
    const cause = new Error('worker crashed');
    const doc = {
      numPages: 1,
      getPage: vi.fn().mockRejectedValue(cause),
    };
    const loadingTask = mockLoadingTask(Promise.resolve(doc));

    await expect(extractText(fakeFile())).rejects.toThrow(cause);
    expect(loggerError).toHaveBeenCalledWith(
      'Failed to extract text',
      cause,
    );
    expect(loadingTask.destroy).toHaveBeenCalled();
  });
});
