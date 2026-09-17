# PDF Text Extractor

## Goal

A small web app where a user uploads a PDF and gets back its extracted text content, with no manual copy-pasting required.

## Acceptance Criteria

- [ ] Web interface to upload a PDF file
- [ ] Output showing the extracted text content of the PDF
- [ ] Live, viewable demo (GitHub Pages)

## Architecture

No backend required. This runs entirely client-side:

- **Frontend:** React (via Vite for fast setup and easy static builds).
- **PDF parsing:** [`pdfjs-dist`](https://www.npmjs.com/package/pdfjs-dist) (Mozilla's pdf.js) — extracts the text layer directly in the browser
- **Hosting:** GitHub Pages, served straight from the built static output

**Flow:**

1. User selects a PDF via a file input
2. File is read into an `ArrayBuffer`
3. `pdfjs-dist` loads the document and reads each page's text content
4. Extracted text is concatenated and displayed in the UI

**Known limitation:** this extracts the existing text layer only. Scanned/image-only PDFs (no embedded text) would need OCR (e.g. Tesseract.js) — out of scope unless the client asks for it.

## Tech Stack

- React + Vite
  - Write unit tests only using vitest.
- pdfjs-dist
- TailwindCSS
- GitHub Actions for building and deploying it.
  - Look at /home/mjb/projects/kasir-barati.github.io/.github/workflows/gh-build-pages.yml for reference.

## Steps

1. Scaffold the app with Vite (`npm create vite@latest`)
2. Install and configure `pdfjs-dist` (including its worker file)
3. Build the upload UI (drag-and-drop or file picker)
4. Implement text extraction logic
5. Display extracted text (with a "copy to clipboard" button as a nice-to-have)
6. Handle basic edge cases: non-PDF files, empty/corrupt PDFs, large files
7. Write a clear README (setup, usage, limitations)
8. Set up GitHub Pages deployment
9. Final pass: test on a few real-world PDFs, polish UI

## Deployment: GitHub Pages

1. Set `base` in `vite.config.js` to match the repo name (e.g. `/pdf-text-extractor/`)
2. Add a deploy script using the `gh-pages` package, or a GitHub Actions workflow that builds and publishes the `dist/` folder to the `gh-pages` branch
3. Enable GitHub Pages in the repo settings, pointing to the `gh-pages` branch
4. Verify the live URL loads and works end-to-end after deploy

## Deliverables

- Live GitHub Pages link in the `.github/README.md`
- Documented limitation in the `.github/README.md`
- Document these as potential future features:
  - Copy-to-clipboard button
  - Drag-and-drop upload
  - Per-page text breakdown instead of one big blob
  - Download extracted text as a `.txt` file
