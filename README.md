# Open Dev Kits

Free, open-source developer utilities — no ads, no paywall, no account required.

## Tools

| Tool | Category | Description |
|------|----------|-------------|
| QR Code Generator | Converter | Generate QR codes from any URL or text |
| UUID Generator | Generator | Generate UUIDs in v1, v4, or v7 format |
| Password Generator | Generator | Cryptographically random passwords with configurable character sets |
| Text Manager | Formatter | Case conversion, sorting, cleaning, and more |
| Base64 | Converter | Encode/decode Base64 with full UTF-8 support |

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
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Lucide Vue](https://lucide.dev/)
- [qrcode](https://www.npmjs.com/package/qrcode), [uuid](https://www.npmjs.com/package/uuid)

## License

MIT
