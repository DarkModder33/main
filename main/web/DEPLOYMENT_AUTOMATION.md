# Automated Domain Deployment Scripts

## Purpose
These scripts automate the process of building and deploying your SPA to Vercel for each domain (tradehaxai.me, tradehaxai.tech, tradehaxai.net), ensuring the correct environment variables are used and the deployment is production-ready.

## Usage

### Windows (PowerShell)
1. Open PowerShell in the `web` directory.
2. Run:
   ```powershell
   ./deploy-domain.ps1 -Domain tradehaxai.me
   ./deploy-domain.ps1 -Domain tradehaxai.tech
   ./deploy-domain.ps1 -Domain tradehaxai.net
   ```

### Linux/macOS (Bash)
1. Open a terminal in the `web` directory.
2. Run:
   ```bash
   chmod +x deploy-domain.sh
   ./deploy-domain.sh tradehaxai.me
   ./deploy-domain.sh tradehaxai.tech
   ./deploy-domain.sh tradehaxai.net
   ```

## What the Scripts Do
- Copy the correct `.env.local.[domain]` to `.env.local`.
- Build the app with `npm run build`.
- Deploy to Vercel with `npx vercel --prod`.
- Remind you to assign the domain in the Vercel dashboard if not automatic.

## Best Practices
- Always verify the deployment in the Vercel dashboard and assign the domain to the latest deployment if needed.
- Check the live site for runtime errors after each deploy.
- Keep your `.env.local.*` files up to date for each domain.

---

This automation ensures a professional, production-ready deployment pipeline for your alpha application.

