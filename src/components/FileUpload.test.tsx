import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { FileUpload } from './FileUpload';

function selectFile(input: HTMLElement, file: File) {
  Object.defineProperty(input, 'files', { value: [file] });
  fireEvent.change(input);
}

describe('FileUpload', () => {
  it('calls onFile for a PDF', () => {
    const onFile = vi.fn();
    render(<FileUpload onFile={onFile} />);
    const file = new File(['%PDF-1.4'], 'doc.pdf', {
      type: 'application/pdf',
    });

    selectFile(
      screen.getByLabelText('Choose PDF file', { selector: 'input' }),
      file,
    );

    expect(onFile).toHaveBeenCalledWith(file);
  });

  it('rejects a non-PDF file and shows an error', () => {
    const onFile = vi.fn();
    render(<FileUpload onFile={onFile} />);
    const file = new File(['hello'], 'doc.txt', {
      type: 'text/plain',
    });

    selectFile(
      screen.getByLabelText('Choose PDF file', { selector: 'input' }),
      file,
    );

    expect(onFile).not.toHaveBeenCalled();
    expect(
      screen.getByText('Please select a PDF file.'),
    ).toBeInTheDocument();
  });

  it('rejects a PDF larger than the size limit and shows an error', () => {
    const onFile = vi.fn();
    render(<FileUpload onFile={onFile} />);
    const file = new File(['%PDF-1.4'], 'doc.pdf', {
      type: 'application/pdf',
    });
    Object.defineProperty(file, 'size', { value: 21 * 1024 * 1024 });

    selectFile(
      screen.getByLabelText('Choose PDF file', { selector: 'input' }),
      file,
    );

    expect(onFile).not.toHaveBeenCalled();
    expect(
      screen.getByText('File is too large. Max size is 20 MB.'),
    ).toBeInTheDocument();
  });
});
