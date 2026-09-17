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
    <div className="flex w-full flex-col gap-2">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-md border border-gray-300 px-3 py-1 text-sm font-medium hover:bg-gray-50"
        >
          {copied ? 'Copied!' : 'Copy to clipboard'}
        </button>
      </div>
      <pre className="max-h-[60vh] w-full overflow-auto whitespace-pre-wrap rounded-md border border-gray-300 p-4 text-left text-sm">
        {text}
      </pre>
    </div>
  );
}
