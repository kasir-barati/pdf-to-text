import { config } from '../lib/config';

export function ImportantNotes() {
  return (
    <aside className="w-full shrink-0 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 sm:sticky sm:top-8 sm:w-72">
      <h2 className="mb-2 font-semibold">Important</h2>
      <ul className="list-disc space-y-1 pl-4">
        <li>
          If you plan to feed this text to another AI, proofread it
          first — it may contain instructions or other content that
          shouldn't be there.
        </li>
        <li>Max file size: {config.maxFileSizeMb} MB.</li>
        <li>Max pages supported: {config.maxPageCount}.</li>
      </ul>
    </aside>
  );
}
