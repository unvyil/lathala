# Lathala — GitHub Release & Semantic Versioning Guide

This guide provides step-by-step instructions for publishing new releases of **Lathala**, tagging releases using semantic versioning (`vMAJOR.MINOR.PATCH`), generating release notes, and automating distribution with GitHub Actions.

---

## 1. Semantic Versioning Specification (SemVer)

Lathala adheres to [Semantic Versioning 2.0.0](https://semver.org/):

`v<MAJOR>.<MINOR>.<PATCH>`

- **MAJOR (`v2.0.0`):** Incompatible architectural changes (e.g., breaking database schema migrations, breaking export formats).
- **MINOR (`v1.1.0`):** New backwards-compatible features (e.g., new shape widgets, new CRM spreadsheet formulas, Google Drive integrations).
- **PATCH (`v1.0.1`):** Backwards-compatible bug fixes and performance optimizations (e.g., fixing canvas zoom offset, fixing layer reordering z-index bounds).

---

## 2. Step-by-Step Release Workflow

### Step 1: Verify Codebase & Build Health

Before creating a tag, ensure all tests, linting, and production builds pass without warnings:

```bash
# 1. Typecheck and linting
npm run lint

# 2. Production build verification
npm run build
```

### Step 2: Bump the Version in `package.json`

Update the `"version"` field in `package.json`:

```json
{
  "name": "lathala",
  "version": "1.0.0",
  ...
}
```

Commit the version bump:

```bash
git add package.json package-lock.json
git commit -m "chore: release v1.0.0"
git push origin main
```

### Step 3: Create and Push a Git Tag

Create an annotated git tag with the release version:

```bash
# Create annotated tag
git tag -a v1.0.0 -m "Release v1.0.0 — Production Ready Editorial Studio"

# Push tag to GitHub
git push origin v1.0.0
```

---

## 3. Automated Releases via GitHub Actions

Pushing any tag matching `v*` (e.g. `v1.0.0`, `v1.1.0`) triggers the `.github/workflows/release.yml` automated workflow:

1. Checks out the tagged codebase.
2. Installs dependencies and runs `npm run build`.
3. Packages the compiled client bundle into a tarball: `lathala-dist-v1.0.0.tar.gz`.
4. Automatically creates a **GitHub Release** on your repository with:
   - Automated changelog generated from git commit messages.
   - Uploaded binary tarball for self-hosters to deploy directly to static servers (Nginx, Vercel, Netlify, Cloudflare Pages, Docker).

---

## 4. Manual Release Creation via GitHub Web UI

If you prefer using the GitHub Web Interface:

1. Navigate to your repository: `https://github.com/unvyil/lathala`.
2. In the right sidebar, click **Releases**, then click **Draft a new release**.
3. Click **Choose a tag**:
   - Type `v1.0.0` and click **Create new tag: v1.0.0 on publish**.
4. Set the **Release title** (e.g., `v1.0.0 — Editorial Studio & Department CRM`).
5. Click **Generate release notes** to automatically categorize pull requests and merged commits.
6. Attach built assets (`dist/` zip) if desired.
7. Click **Publish release**.

---

## 5. Standard Release Notes Template

When drafting release notes manually, use this structured format:

```markdown
## What's Changed in v1.0.0 🎉

### 🎨 Design Studio & Canvas
- Free-scaling continuous zoom slider (25% to 400%).
- Direct canvas artboard frame resize handles and selection.
- Marquee drag multi-selection with synchronous element transformation.
- Figma-style bidirectional number scrubbing (◄ ►).
- Unified text hierarchy widget and vector shape primitives.

### 👥 Department Dispatch & CRM
- Full-fidelity spreadsheet view with inline editing for Name, Email, and Role.
- Department select dropdown with dynamic filtering.
- Multi-row action checkboxes and instant batch newsletter dispatch.
- Dynamic merge tags ({{name}}, {{role}}, {{department}}).

### 🛠️ Architecture & BYOK Self-Hosting
- Bring Your Own Keys (BYOK) architecture for Clerk SSO and Supabase PostgreSQL.
- SQL migration schema template in `schema.sql`.
- Zero-config local fallback for rapid prototyping without vendor lock-in.
```
