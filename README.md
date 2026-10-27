# LDB Lab — Command Terminal v2.0

Full-window Windows Command Prompt–inspired interface. The ASCII `LDB LAB` banner appears on startup. Local AI uses WebLLM and WebGPU in supported browsers.

## Publish

Upload `index.html` to the `terminal/` folder of your GitHub Pages `lab` repository, then visit `https://ldiazbusquets.github.io/lab/terminal/` (assuming Pages serves the repository root). Alternatively publish as the root of a separate GitHub Pages repository.

## Commands

`/help`, `/models`, `/model qwen`, `/load`, `/status`, `/system your instructions`, `/reset`, `/clear`, `/stop`, `/export`, `/about`

Use Enter to submit, up/down arrows for command history, Ctrl+L to clear. Right click for a small optional command menu. All ordinary text is sent to the selected loaded model.

## Requirements and limitations

HTTPS, WebGPU-capable graphics hardware and a supported browser. First-time model downloads can be large and require network access. No API credentials are needed for local inference. This is not an operating-system shell: it does not execute arbitrary commands or access your computer's files. Inference requires external WebLLM CDN and model download hosts. Conversations are held only in the current tab until exported.

## Theme

The retained original terminal palette is in `:root` at the top of `index.html`. Exact live LDB Lab source CSS was not accessible during this revision, so change the variables there if your deployed site's current palette differs. Layout is full viewport, no card border, no toolbar or dashboard widgets.
