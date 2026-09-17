import { describe, expect, it, vi } from 'vitest'

vi.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: {},
  getDocument: vi.fn(),
}))
vi.mock('pdfjs-dist/build/pdf.worker.min.mjs?url', () => ({ default: 'worker-url' }))

import { getDocument } from 'pdfjs-dist'
import { extractText, PdfExtractionError } from './extractText'

function fakeFile(): File {
  return { arrayBuffer: async () => new ArrayBuffer(0) } as unknown as File
}

describe('extractText', () => {
  it('concatenates text items across pages', async () => {
    const doc = {
      numPages: 2,
      getPage: vi.fn(async (pageNumber: number) => ({
        getTextContent: async () => ({
          items: [{ str: `page${pageNumber}-a` }, { str: `page${pageNumber}-b` }],
        }),
      })),
    }
    vi.mocked(getDocument).mockReturnValue({ promise: Promise.resolve(doc) } as never)

    const text = await extractText(fakeFile())

    expect(text).toBe('page1-a page1-b\n\npage2-a page2-b')
  })

  it('throws PdfExtractionError for a file pdfjs cannot parse', async () => {
    vi.mocked(getDocument).mockReturnValue({ promise: Promise.reject(new Error('bad pdf')) } as never)

    await expect(extractText(fakeFile())).rejects.toThrow(PdfExtractionError)
  })
})
