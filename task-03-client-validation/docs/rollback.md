# Task 3 Step 9: Deterministic Git Rollback Without Hallucination (`rollback.md`)

Accompanies evidence file: `evidence/17-commit-list-and-rollback.txt`.

## 1. The Regretted Change and the Rollback Execution
During Step 9, we appended a regretted experimental change to `src/lib/validation.ts` and committed it (`chore(task-03): experimental loosened validation tweak (regretted change)`). Rather than prompting an AI coding agent in natural language to *"undo the last validation change"*, we inspected our repository history directly using:

```bash
git log --oneline -n 6
git revert --no-edit 8768152