import { useState } from 'react';

import { FileUpload } from './components/FileUpload';
import { ImportantNotes } from './components/ImportantNotes';
import { TextOutput } from './components/TextOutput';
import { extractText, PdfExtractionError } from './lib/extractText';

type Status =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'done'; text: string }
  | { kind: 'error'; message: string };

function App() {
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  async function handleFile(file: File) {
    setStatus({ kind: 'loading' });
    try {
      const text = await extractText(file);
      if (!text) {
        setStatus({
          kind: 'error',
          message: 'No extractable text was found in this PDF.',
        });
        return;
      }
      setStatus({ kind: 'done', text });
    } catch (err) {
      const message =
        err instanceof PdfExtractionError
          ? err.message
          : 'Something went wrong extracting text from this PDF.';
      setStatus({ kind: 'error', message });
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center gap-6 p-8">
      <h1 className="text-2xl font-semibold">PDF Text Extractor</h1>

      <div className="flex w-full flex-col gap-6 sm:flex-row sm:items-start sm:justify-center">
        <div className="flex flex-1 flex-col items-center gap-6">
          <FileUpload onFile={handleFile} />

          {status.kind === 'loading' && (
            <p className="text-sm text-gray-500">Extracting text…</p>
          )}
          {status.kind === 'error' && (
            <p className="text-sm text-red-600">{status.message}</p>
          )}
          {status.kind === 'done' && (
            <TextOutput text={status.text} />
          )}
        </div>

        <ImportantNotes />
      </div>
    </main>
  );
}

export default App;
