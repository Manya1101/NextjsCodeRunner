# Next.js Code Runner

This project is a minimal Next.js app that provides:
- A code editor (simple textarea).
- Run button that executes JavaScript code and shows console output/errors.
- Auto-Fix button that applies basic line-by-line rules:
- Add missing semicolons (for simple statements).
- Fix indentation based on `{}` braces (2 spaces).
- Collapse multiple spaces.
- Attempt to balance brackets/parentheses by appending closing tokens.
- Help panel (top-right) that accepts a help query and responds via keyword matching.

## Files
- `pages/index.js` - main UI and logic
- `components/Editor.js` - editor component (textarea)
- `styles/globals.css` - basic styling

## Help keywords
- `semicolons` - explains semicolon fixes
- `indentation` - explains indentation fixing
- `brackets` - explains bracket/parenthesis fixes
- `run` - explains how code execution works
- `fix` - explains auto-fix behavior

If a keyword isn't matched, the help panel gives general tips.

## How to run locally
1. Install dependencies:
   ```bash
   npm install
   ```
2. Run dev server:
   ```bash
   npm run dev
   ```
3. Open http://localhost:3000

## Auto-fix rules 
- Adds semicolons to lines that look like JS statements and are missing `;`
- Indents lines by tracking `{` and `}` (2 spaces per level)
- Replaces multiple spaces with a single space (except inside strings - simple heuristic)
- Tries to close unmatched `()`, `{}`, `[]` by appending closing characters.

## Help keywords & tips
- `semicolons` -> "Auto-fix adds semicolons to statement-like lines."
- `indentation` -> "Auto-fix indents using brace-counting (2 spaces)."
- `brackets` -> "Auto-fix balances common brackets and parentheses."
- `run` -> "Run executes code in a safe sandbox using Function(...) and captures console output."
- `fix` -> "Auto-fix is heuristic, may not be perfect. Review changes before running."

## Notes about deliverables
- To upload to GitHub: create a repo and push this folder.
- To create a screen recording: use your OS screen recorder (e.g., OBS, QuickTime, or built-in recorders on Windows/Mac) and demonstrate the editor, run, auto-fix, and help panel.

