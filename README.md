# LDB Lab — Command Terminal v2.1

Full-window terminal in the LDB Lab style. The ASCII `LDB LAB` banner appears on startup. Local AI uses WebLLM and WebGPU in supported browsers.

## Publish

Upload `index.html` to the `terminal/` folder of your GitHub Pages `lab` repository, then visit `https://ldiazbusquets.github.io/lab/terminal/` (assuming Pages serves the repository root). Alternatively publish as the root of a separate GitHub Pages repository.

## Commands

`/help`, `/quote F GM`, `/key finnhub YOUR_KEY`, `/steps on|off`, `/models`, `/model qwen` (or a number), `/load`, `/status`, `/think on|off`, `/tokens 2048`, `/temp 0.7`, `/system your instructions`, `/upload`, `/files`, `/cat name`, `/unattach`, `/reset`, `/clear`, `/stop`, `/export`, `/cache`, `/purge name`, `/about`

Use Enter to submit, up/down arrows for command history, Tab to complete a command, Ctrl+C to stop a reply, Ctrl+L to clear. Right click for a small menu. All ordinary text is sent to the loaded model. Settings (model, thinking, limits, system instruction) are remembered in this browser.

## Files

`/upload`, drag and drop, or paste attaches files to the conversation: text, Markdown, CSV, JSON, code and PDF (text layer only, read with pdf.js). Files are read in the browser and never uploaded anywhere, and they stay attached until `/unattach`, `/reset` or `/clear`. A file that fits the model's context window (4,096 tokens for most of these models) is sent whole. A longer one is split into short passages, and for each question the passages that best match its words (BM25 keyword ranking) are sent, in page order and labelled with their page numbers; the terminal lists which pages were used. Images are refused: these small models cannot see.

## Live quotes

The models have no internet access, so `/quote TICKER` (up to 8 at once) fetches a live quote in the page and hands it to the model for the rest of the conversation. It needs a free key from [Finnhub](https://finnhub.io/register) (`/key finnhub YOUR_KEY`) or Alpha Vantage (`/key alphavantage YOUR_KEY`). The key is saved only in your browser (localStorage), is masked on screen, is never in this repository and is only sent to that provider. `/key clear` removes it.

## Maths and formatting

Answers render Markdown (bold, lists, headings, code blocks) and maths (`$…$`, `$$…$$`, `\(…\)`, `\[…\]`, via KaTeX loaded on first use); prices such as "$0.05 or $0.10" stay as text. When a question looks like maths or a puzzle and thinking is off, the terminal asks the model to work it out step by step, end with an "Answer:" line, and say if a needed number is missing (`/steps off` to stop).

## Thinking (Qwen 3)

Qwen 3 models reason inside `<think>` before answering. On a 0.6B or 1.7B model that reasoning often uses up the whole reply limit, so no answer appears. Thinking is therefore **off by default** (WebLLM's `enable_thinking: false`). With `/think on`, the reasoning is shown collapsed above the answer and the reply limit is raised to at least 2,048 tokens. If a reply still runs out, the terminal says so instead of stopping silently.

## Requirements and limitations

HTTPS, WebGPU-capable graphics hardware and a supported browser. First-time model downloads can be large and require network access. No API credentials are needed for local inference. This is not an operating-system shell: it does not execute arbitrary commands or access your computer's files. Inference requires external WebLLM CDN and model download hosts. Conversations are held only in the current tab until exported.

## Theme

Silver-blue on black, the LDB Lab dark theme: background `#050607`, silver text `#c4ceda` (highlights `#e2e9f1`), muted `#899bad`, blue accent `#7ca9d4`, errors `#d58c91`; Geist Mono and Manrope. The start screen keeps the ASCII banner (in the blue accent). While a model works, a small fast-spinning sphere of silver-blue points sits next to a shimmering verb (Thinking, Writing, …), the elapsed time and the token count; the answer streams with a blinking cursor. Motion is turned off for visitors who ask for reduced motion.
