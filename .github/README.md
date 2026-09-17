# PDF Text Extractor

A small web app to upload a PDF and get back its extracted text content, with no manual copy-pasting required.

**Live demo:** https://kasir-barati.github.io/pdf-to-text/

## Usage

1. Open the app and choose a PDF file.
2. Its extracted text appears below the upload button.
3. Use "Copy to clipboard" to copy the text.

> [!CAUTION]
>
> Please read the [Potential Security Vulnerabilities](https://github.com/kasir-barati/pdf-to-text/issues/1) before incorporating this into your React app or when you want to move this feature into backend.

## How it Works

Everything runs client-side, in the browser — no backend or file upload to a server. The PDF is read locally and its text layer is extracted using [`pdfjs-dist`](https://www.npmjs.com/package/pdfjs-dist) (Mozilla's pdf.js).

## Limitation

- Only the existing text layer is extracted. Scanned or image-only PDFs (no embedded text) return no text — that would require OCR.
- Tables are not recognized as such: their cell text is extracted in reading order without preserving column/row structure.

## Development

```
npm ci
npm run dev
```

## Possible Future Features

- Drag-and-drop upload
- Per-page text breakdown instead of one big blob
- Download extracted text as a `.txt` file
- Responsiveness can be improved.
- Dark/light mode switch.
