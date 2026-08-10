# Open Dev Kits

Free, open-source developer utilities — no ads, no paywall, no account required.
Everything runs entirely client-side: nothing you type or upload ever leaves your browser.

## Features

- **17 tools** across generators, converters, formatters, and utilities (see below)
- **Command palette** (`Cmd/Ctrl+K`) to jump to any tool instantly
- **Recently used tools** tracked locally and surfaced on the home page and sidebar
- **4 selectable themes** — Ocean Dark/Light and Slate Dark/Warm Light — picked from a dropdown, persisted across visits
- **Installable PWA** with offline support — keeps working without a connection once cached
- **Mobile-first UX** — tool-aware top bar, safe-area padding, iOS zoom-prevention, responsive layouts throughout

## Tools

### Generator
| Tool | Description |
|------|-------------|
| UUID Generator | Generate UUIDs in v1, v4, or v7 format — individually or in bulk |
| Password Generator | Generate strong, random passwords with custom length and character sets |
| Hash Generator | Compute SHA-1, SHA-256, and SHA-512 digests live via the Web Crypto API |
| Lorem Ipsum | Generate placeholder copy in paragraphs, sentences, or words |

### Converter
| Tool | Description |
|------|-------------|
| QR Code Generator | Generate QR codes from any URL or text with custom colors and sizes |
| Base64 | Encode text to Base64 or decode Base64 back to plain text with full UTF-8 support |
| JSON Formatter | Prettify, minify, and validate JSON with error highlighting |
| JWT Decoder | Decode JWT tokens to inspect header and payload claims without a secret |
| Unix Timestamp | Convert epoch seconds to human-readable dates and back, with live clock |
| Number Base Converter | Convert integers between decimal, hex, binary, and octal — all fields sync live |
| URL Encoder/Decoder | Encode text for safe use in URLs or decode percent-encoded strings |
| Color Converter | Convert colors between HEX, RGB, HSL, and OKLCH with a live swatch preview |

### Formatter
| Tool | Description |
|------|-------------|
| Text Manager | Transform, clean, and analyze text — case conversion, sorting, deduplication, and more |

### Utility
| Tool | Description |
|------|-------------|
| HTTP Status Codes | Searchable reference for all standard HTTP status codes with descriptions |
| Image → Base64 | Drag and drop any image to get a data URI ready for CSS or HTML |
| Regex Tester | Test regular expressions against sample text with live match highlighting and capture groups |
| Diff Checker | Compare two blocks of text line-by-line and highlight what changed |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Adding a Tool

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full guide. The short version:

1. Create `src/tools/<tool-id>/index.js` with metadata.
2. Create `src/tools/<tool-id>/MyTool.vue` with your component.
3. Register the import in `src/tools/registry.js`.

## Tech Stack

- [Vue 3](https://vuejs.org/) + [Vite](https://vite.dev/)
- [Vue Router 4](https://router.vuejs.org/) (hash history)
- [Tailwind CSS v4](https://tailwindcss.com/) + [daisyUI](https://daisyui.com/)
- [Lucide Vue](https://lucide.dev/)
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) for offline support
- [qrcode](https://www.npmjs.com/package/qrcode), [uuid](https://www.npmjs.com/package/uuid)

## License

MIT
