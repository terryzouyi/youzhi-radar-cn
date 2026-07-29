# Project Context

For cross-project memory, read `/Users/zouyi/Documents/知识库/50 Codex Memory/00 Start Here.md` first, then read `/Users/zouyi/Documents/知识库/50 Codex Memory/Projects/找工作.md`.

## Project Notes

- The product UI is Chinese by default.
- The current release mixes live public vacancy data with an explicitly labeled demo fallback. Tencent and NetEase are official sources; Nowcoder and Liepin are third-party public listings.
- Preserve clear source attribution and the distinction between official employer portals and third-party recruitment platforms.
- Do not present simulated scanning or matching as live external data.
- After every completed project change, run the relevant checks, commit the intended files, push `main` to the configured GitHub `origin`, and keep GitHub Pages synchronized. For website changes, also publish the matching validated commit to the existing OpenAI Sites project unless the user explicitly requests local-only work.
- GitHub Pages is a public static mirror and must not pretend that demo jobs are live. The private OpenAI Sites deployment remains the dynamic version with real-time `/api/jobs` and `/api/companies`.
