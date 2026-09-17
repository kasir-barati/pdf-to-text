import { useState } from 'react';

interface TextOutputProps {
  text: string;
}

export function TextOutput({ text }: TextOutputProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="flex w-full flex-col overflow-hidden rounded-lg border border-gray-200">
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2">
        <span className="text-sm font-medium text-gray-600">
          Extracted text
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium hover:bg-gray-100"
        >
          {copied ? 'Copied!' : 'Copy to clipboard'}
        </button>
      </div>
      <pre className="max-h-[60vh] w-full overflow-auto p-4 text-left text-sm whitespace-pre-wrap">
        {text}
      </pre>
    </section>
  );
}
