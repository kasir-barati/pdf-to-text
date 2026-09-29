import { useState } from 'react';

import { FileUpload } from './components/FileUpload';
import { ImportantNotes } from './components/ImportantNotes';
import { TextOutput } from './components/TextOutput';
import { extractText, PdfExtractionError } from './lib/extractText';
import { logger } from './lib/logger';

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
      if (!(err instanceof PdfExtractionError)) {
        logger.error('Unexpected extraction error', err);
      }
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

      <div className="grid w-full min-w-0 gap-6 sm:grid-cols-[minmax(0,1fr)_18rem] sm:items-start sm:justify-center">
        <div className="order-1 min-w-0 rounded-lg border border-gray-200 bg-white p-6 shadow-sm sm:col-start-1 sm:row-start-1">
          <FileUpload onFile={handleFile} />
        </div>

        <ImportantNotes className="order-2 sm:col-start-2 sm:row-span-2 sm:row-start-1" />

        {status.kind !== 'idle' && (
          <div className="order-3 min-w-0 rounded-lg border border-gray-200 bg-white p-6 shadow-sm sm:col-start-1 sm:row-start-2">
            {status.kind === 'loading' && (
              <p className="text-center text-sm text-gray-500">
                Extracting text…
              </p>
            )}
            {status.kind === 'error' && (
              <p className="text-center text-sm text-red-600">
                {status.message}
              </p>
            )}
            {status.kind === 'done' && (
              <TextOutput text={status.text} />
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default App;
