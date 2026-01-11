# shamrockstocks.github.io
landing page temp

## Developer setup: Git hooks

This repository includes a `.githooks` directory with a sample `pre-commit` hook used to regenerate image assets before committing.

To enable hooks for your local clone, run the appropriate installer below from the repository root:

- Windows / PowerShell:

```powershell
pwsh .\scripts\install-hooks.ps1
```

- POSIX (macOS / Linux / WSL):

```bash
sh ./scripts/install-hooks.sh
```

Or set the config manually:

```bash
git config core.hooksPath .githooks
git add .githooks/pre-commit
git update-index --chmod=+x .githooks/pre-commit
```

The installer scripts are idempotent and safe to re-run.
