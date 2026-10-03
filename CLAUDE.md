# Agent instructions

- Always run `pre-commit` and `npm run format` before committing and pushing changes
- Always bump the version in `package.json` appropriately when any file under `src/` (other than the song data in `src/data/`), or `package.json` itself, is changed
- Leave a short description of the change or addition in the top `# Upcoming` section of the `CHANGELOG.md`; include the GitHub PR link at the end of each entry in the format `([#N](https://github.com/CodyCBakerPhD/my-music-app/pull/N))`
- Keep changelog entries concise: one sentence each, two at the very most. Say what changed and, where it is not obvious, why; leave implementation details to the PR description
- PR titles should be human-readable and in the past tense; they should NOT use conventional commit style
- Use American English spelling everywhere (code, comments, UI text, changelog entries, and PR descriptions)
- The playlist rules in `src/playlists.ts` are a port of the original Python tool; keep them behaving the same unless a change is asked for
