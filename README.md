# LDB Lab — Command Terminal v2.1

Full-window terminal in the LDB Lab style, opening with the Lab's neofetch and sphere. Local AI uses WebLLM and WebGPU in supported browsers.

## Publish

Upload `index.html` to the `terminal/` folder of your GitHub Pages `lab` repository, then visit `https://ldiazbusquets.github.io/lab/terminal/` (assuming Pages serves the repository root). Alternatively publish as the root of a separate GitHub Pages repository.

## Commands

`/help`, `/models`, `/model qwen` (or a number), `/load`, `/status`, `/think on|off`, `/tokens 2048`, `/temp 0.7`, `/system your instructions`, `/upload`, `/files`, `/cat name`, `/unattach`, `/reset`, `/clear`, `/stop`, `/export`, `/cache`, `/purge name`, `/about`

Use Enter to submit, up/down arrows for command history, Tab to complete a command, Ctrl+C to stop a reply, Ctrl+L to clear. Right click for a small menu. All ordinary text is sent to the loaded model. Settings (model, thinking, limits, system instruction) are remembered in this browser.

## Files

`/upload`, drag and drop, or paste attaches files to the next prompt: text, Markdown, CSV, JSON, code and PDF (text layer only, read with pdf.js). Files are read in the browser and never uploaded anywhere. Long files are cut to fit the model's context window (4,096 tokens for most of these models, roughly 14,000 characters shared with the conversation), and the terminal says when that happens. Images are refused: these small models cannot see.

## Thinking (Qwen 3)

Qwen 3 models reason inside `<think>` before answering. On a 0.6B or 1.7B model that reasoning often uses up the whole reply limit, so no answer appears. Thinking is therefore **off by default** (WebLLM's `enable_thinking: false`). With `/think on`, the reasoning is shown collapsed above the answer and the reply limit is raised to at least 2,048 tokens. If a reply still runs out, the terminal says so instead of stopping silently.

## Requirements and limitations

HTTPS, WebGPU-capable graphics hardware and a supported browser. First-time model downloads can be large and require network access. No API credentials are needed for local inference. This is not an operating-system shell: it does not execute arbitrary commands or access your computer's files. Inference requires external WebLLM CDN and model download hosts. Conversations are held only in the current tab until exported.

## Theme

Matches the LDB Lab site's dark theme: background `#0B0C0D` / terminal `#0F1112`, text `#BFC7CC`, headings `#F2F4F5`, muted `#8A949B`, mint accent `#8FC3BA`, Geist Mono and Manrope. The start screen is the Lab's neofetch: the rotating sphere of points. While a model works, a small fast-spinning version of that sphere sits next to a shimmering verb (Thinking, Writing, …), the elapsed time and the token count; the answer streams with a blinking cursor. Motion is turned off for visitors who ask for reduced motion.
