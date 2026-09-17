import { useState } from 'react';
import { FileUpload } from './components/FileUpload';
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
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center gap-6 p-8">
      <h1 className="text-2xl font-semibold">PDF Text Extractor</h1>
      <FileUpload onFile={handleFile} />

      {status.kind === 'loading' && (
        <p className="text-sm text-gray-500">Extracting text…</p>
      )}
      {status.kind === 'error' && (
        <p className="text-sm text-red-600">{status.message}</p>
      )}
      {status.kind === 'done' && <TextOutput text={status.text} />}
    </div>
  );
}

export default App;
