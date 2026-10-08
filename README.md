# CLAUDE.md, skills and hooks: demo

The demo from the video: one small React app with all three places a rule can live in Claude Code.

- `CLAUDE.md`: the house rules. Claude Code puts them into every request, so they always apply, and the model can still miss one.
- `.claude/skills/add-user-field/SKILL.md`: a skill. Only its name and description are in the request until the model picks it; then the whole checklist comes in.
- `.claude/settings.json` + `hooks/protect-files.mjs`: a PreToolUse hook. Claude Code runs it before every Edit, Write or Bash call, and exit code 2 blocks any call that touches `.env`. The model never sees it.
- `relay/relay.mjs`: a small relay between Claude Code and the API that logs every request to `relay/requests.jsonl`, so you can see where each one lives.

```sh
npm install
cp .env.example .env
npm test

# Watch the wire
node relay/relay.mjs
ANTHROPIC_BASE_URL=http://localhost:8787 claude     # in a second terminal
```

Docs: [memory / CLAUDE.md](https://code.claude.com/docs/en/memory) · [skills](https://code.claude.com/docs/en/skills) · [hooks](https://code.claude.com/docs/en/hooks)
