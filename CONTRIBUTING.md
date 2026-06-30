# Contributing a New Tool

Thank you for contributing to Open Web Tools! This guide walks you through adding a new tool to the project.

---

## Quick Overview

Each tool lives in its own directory under `src/tools/<tool-id>/` and consists of exactly **two files**:

```
src/tools/
└── my-tool/
    ├── index.js        ← metadata & registration
    └── MyTool.vue      ← the Vue component
```

---

## Step 1 — Create the tool directory

```bash
mkdir src/tools/my-tool
```

Use a short, descriptive, **kebab-case** name for the directory. This becomes the tool's URL segment (e.g. `/my-tool`).

---

## Step 2 — Write `index.js` (metadata)

```js
// src/tools/my-tool/index.js
import MyTool from './MyTool.vue'

export default {
  id: 'my-tool',          // Must match the directory name; used in the URL
  name: 'My Tool',        // Display name shown in the sidebar and home grid
  description: 'One clear sentence describing what this tool does.',
  icon: 'Wrench',         // Any Lucide icon name — see https://lucide.dev/icons
  category: 'Utility',    // See categories below
  component: MyTool,
}
```

### Available categories

| Category    | Use when the tool…                                            |
|-------------|---------------------------------------------------------------|
| `Generator` | Produces output from nothing or minimal input (UUID, password) |
| `Converter` | Transforms data between two formats (Base64, QR Code)        |
| `Formatter` | Reorganises or reformats text/data (Text Manager)            |
| `Utility`   | General-purpose tools that don't fit the above               |

---

## Step 3 — Write `MyTool.vue` (component)

Your component receives **no props** and manages all its own state.

```vue
<script setup>
import { ref } from 'vue'
import { Copy } from 'lucide-vue-next'

const input = ref('')
const output = ref('')
const copied = ref(false)

function process() {
  output.value = input.value.toUpperCase() // replace with your logic
}

async function copy() {
  await navigator.clipboard.writeText(output.value)
  copied.value = true
  setTimeout(() => (copied.value = false), 1500)
}
</script>

<template>
  <div class="max-w-2xl space-y-4">
    <textarea v-model="input" rows="6" class="..." />
    <button @click="process">Run</button>
    <pre>{{ output }}</pre>
  </div>
</template>
```

### UX conventions to follow

- Use `max-w-2xl` or `max-w-4xl` as the top-level width constraint.
- Use `space-y-5` for vertical rhythm between sections.
- Primary action button: `bg-indigo-600 hover:bg-indigo-700 text-white`.
- Show a transient "Copied!" label on clipboard actions, reset after 1.5 s.
- Validate at the component level; never throw uncaught errors to the console.
- No external HTTP requests — all processing must be client-side.

---

## Step 4 — Register the tool

Open `src/tools/registry.js` and add your import and entry:

```js
// 1. Import your tool
import myTool from './my-tool'

// 2. Add it to the tools array (controls display order)
export const tools = [qrcode, uuid, password, textManager, base64, myTool]
```

That's it. The sidebar, home grid, and routing all update automatically.

---

## Dependencies

If your tool requires a new npm package, add it as a **runtime dependency**:

```bash
npm install some-library
```

Keep dependencies minimal and prefer zero-dependency implementations for simple algorithms. Document why a library is needed in the PR description.

---

## Testing your tool

```bash
npm install
npm run dev
```

Open `http://localhost:5173` and navigate to your tool via the sidebar or home grid. Verify:

- [ ] Tool appears in the sidebar under the correct category
- [ ] Tool appears as a card on the home page
- [ ] Navigating to `/#/<tool-id>` loads the tool
- [ ] All operations work correctly
- [ ] No console errors
- [ ] Clipboard copy shows the "Copied!" feedback

---

## Tool metadata reference

| Field         | Type        | Required | Description |
|---------------|-------------|----------|-------------|
| `id`          | `string`    | ✅       | Unique kebab-case ID; used in the URL and as the registry key |
| `name`        | `string`    | ✅       | Display name (title-case, ≤ 30 chars) |
| `description` | `string`    | ✅       | One-line description (≤ 80 chars) |
| `icon`        | `string`    | ✅       | Lucide icon component name — browse at https://lucide.dev/icons |
| `category`    | `string`    | ✅       | One of: `Generator`, `Converter`, `Formatter`, `Utility` |
| `component`   | `Component` | ✅       | The imported Vue SFC |

---

## Submitting your contribution

1. Fork the repository.
2. Create a branch: `git checkout -b tool/my-tool`.
3. Follow the steps above.
4. Open a pull request with:
   - A short description of what the tool does.
   - Why it belongs in Open Web Tools (free, no-account, client-side).
   - A screenshot or screen recording of the tool in action.

We review PRs on a best-effort basis. Thank you!
