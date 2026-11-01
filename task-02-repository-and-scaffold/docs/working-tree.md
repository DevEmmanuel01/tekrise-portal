# Task 2 Step 8: The Four Zones of Git (Working Tree Architecture)

## 1. Working Directory
The physical files and folders on your Mac's disk. Edits here exist only locally and are untracked or modified until staged.

## 2. Staging Area (The Index — `.git/index`)
A binary draft manifest (`.git/index`) holding snapshots of files you select using `git add` for your next commit.

## 3. Local Repository (`HEAD` — `.git/objects`)
The permanent, cryptographically hashed commit history stored locally on your machine. Created using `git commit`.

## 4. Remote Repository (`origin` — GitHub)
The hosted copy of the repository on GitHub. Updated from your machine using `git push`.
