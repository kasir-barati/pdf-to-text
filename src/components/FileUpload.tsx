import { useState, type ChangeEvent } from 'react';

import { config } from '../lib/config';

interface FileUploadProps {
  onFile: (file: File) => void;
}

export function FileUpload({ onFile }: FileUploadProps) {
  const [error, setError] = useState<string | null>(null);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      return;
    }

    if (file.type !== 'application/pdf') {
      setError('Please select a PDF file.');
      return;
    }

    const maxBytes = config.maxFileSizeMb * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(
        `File is too large. Max size is ${config.maxFileSizeMb} MB.`,
      );
      return;
    }

    setError(null);
    onFile(file);
  }

  return (
    <div className="flex w-full flex-col items-center gap-3 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="size-10 text-gray-400"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 16.5V9m0 0-3 3m3-3 3 3M6 20.25h12A2.25 2.25 0 0 0 20.25 18V9.75a2.25 2.25 0 0 0-.659-1.591l-4.5-4.5A2.25 2.25 0 0 0 13.5 3H6A2.25 2.25 0 0 0 3.75 5.25v13.5A2.25 2.25 0 0 0 6 20.25Z"
        />
      </svg>
      <p className="text-sm text-gray-500">
        Select a PDF to extract its text
      </p>
      <label className="cursor-pointer rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700">
        Choose PDF file
        <input
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleChange}
        />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
