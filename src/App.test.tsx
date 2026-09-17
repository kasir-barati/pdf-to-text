import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('./lib/extractText', async () => {
  const actual = await vi.importActual<
    typeof import('./lib/extractText')
  >('./lib/extractText');
  return { ...actual, extractText: vi.fn() };
});

import App from './App';
import { extractText, PdfExtractionError } from './lib/extractText';
import { logger } from './lib/logger';

function selectFile(file: File) {
  const input = screen.getByLabelText('Choose PDF file', {
    selector: 'input',
  });
  Object.defineProperty(input, 'files', { value: [file] });
  fireEvent.change(input);
}

function pdfFile() {
  return new File(['%PDF-1.4'], 'doc.pdf', {
    type: 'application/pdf',
  });
}

describe('App', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows the extracted text on success', async () => {
    vi.mocked(extractText).mockResolvedValue('hello world');

    render(<App />);
    selectFile(pdfFile());

    await waitFor(() =>
      expect(screen.getByText('hello world')).toBeInTheDocument(),
    );
  });

  it('shows a message when no text is extractable', async () => {
    vi.mocked(extractText).mockResolvedValue('');

    render(<App />);
    selectFile(pdfFile());

    await waitFor(() =>
      expect(
        screen.getByText(
          'No extractable text was found in this PDF.',
        ),
      ).toBeInTheDocument(),
    );
  });

  it('shows the PdfExtractionError message on a known failure', async () => {
    vi.mocked(extractText).mockRejectedValue(
      new PdfExtractionError('This PDF has too many pages.'),
    );

    render(<App />);
    selectFile(pdfFile());

    await waitFor(() =>
      expect(
        screen.getByText('This PDF has too many pages.'),
      ).toBeInTheDocument(),
    );
  });

  it('shows a generic message and logs unexpected errors', async () => {
    const error = new Error('boom');
    vi.mocked(extractText).mockRejectedValue(error);
    const loggerError = vi
      .spyOn(logger, 'error')
      .mockImplementation(() => {});

    render(<App />);
    selectFile(pdfFile());

    await waitFor(() =>
      expect(
        screen.getByText(
          'Something went wrong extracting text from this PDF.',
        ),
      ).toBeInTheDocument(),
    );
    expect(loggerError).toHaveBeenCalledWith(
      'Unexpected extraction error',
      error,
    );
  });
});
