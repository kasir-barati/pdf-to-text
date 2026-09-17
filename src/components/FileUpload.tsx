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
    <div className="flex flex-col items-center gap-2">
      <label className="cursor-pointer rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50">
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
