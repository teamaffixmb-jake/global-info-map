# Publishing to npm

This guide will help you publish the Global Data Screensaver to npm.

## Prerequisites

1. **npm account**: Create one at [npmjs.com](https://www.npmjs.com/signup)
2. **npm CLI login**: Run `npm login` and enter your credentials
3. **GitHub repository**: Create a repository for the project (optional but recommended)

## Pre-Publishing Checklist

### 1. Update Package Metadata

Edit `package.json` and update these fields:

```json
{
  "name": "global-data-screensaver", // Must be unique on npm
  "version": "5.1.0",
  "author": "Jake Harrison <teamaffixmb.jake@gmail.com>",
  "repository": {
    "type": "git",
    "url": "https://github.com/teamaffixmb-jake/global-info-map.git"
  },
  "homepage": "https://github.com/teamaffixmb-jake/global-info-map#readme"
}
```

### 2. Update License

Edit `LICENSE` file and replace `[Your Name]` with your actual name.

### 3. Update README

In `README.md`, replace:
- `https://github.com/yourusername/global-data-screensaver` with your actual repository URL
- Installation instructions if needed

### 4. Check Package Name Availability

```bash
npm search global-data-screensaver
```

If the name is taken, choose a different one (e.g., `@yourusername/global-data-screensaver`).

### 5. Test the Build

```bash
npm run build
npm run preview
```

Make sure everything works correctly.

### 6. Version Management

Follow [Semantic Versioning](https://semver.org/):
- **MAJOR** version (X.0.0): Breaking changes
- **MINOR** version (5.X.0): New features, backwards-compatible
- **PATCH** version (5.1.X): Bug fixes

Update version before publishing:

```bash
npm version patch  # 5.1.0 -> 5.1.1
npm version minor  # 5.1.0 -> 5.2.0
npm version major  # 5.1.0 -> 6.0.0
```

## Publishing Steps

### First-Time Publishing

1. **Login to npm**:
   ```bash
   npm login
   ```

2. **Verify package contents**:
   ```bash
   npm pack --dry-run
   ```
   
   This shows what will be included in the package.

3. **Publish to npm**:
   ```bash
   npm publish
   ```

   For scoped packages (e.g., `@yourusername/package`):
   ```bash
   npm publish --access public
   ```

### Publishing Updates

1. Make your changes
2. Update version:
   ```bash
   npm version patch  # or minor/major
   ```
3. Publish:
   ```bash
   npm publish
   ```

## Post-Publishing

### 1. Verify on npm

Visit: `https://www.npmjs.com/package/global-data-screensaver`

### 2. Test Installation

In a new directory:
```bash
npx global-data-screensaver
# or
npm install -g global-data-screensaver
global-data-screensaver
```

### 3. Add npm Badge to README

Add this to your README.md:

```markdown
[![npm version](https://badge.fury.io/js/global-data-screensaver.svg)](https://www.npmjs.com/package/global-data-screensaver)
[![npm downloads](https://img.shields.io/npm/dm/global-data-screensaver.svg)](https://www.npmjs.com/package/global-data-screensaver)
```

## Important Notes

### What Gets Published

The `.npmignore` file controls what's excluded. By default:
- ✅ Included: `dist/`, `src/`, `package.json`, `README.md`, `LICENSE`
- ❌ Excluded: `node_modules/`, `.git/`, development files

### Package Size

Check package size before publishing:
```bash
npm pack
ls -lh *.tgz
```

Try to keep it under 10MB. If too large, add more exclusions to `.npmignore`.

### Unpublishing (Caution!)

You can unpublish within 72 hours:
```bash
npm unpublish global-data-screensaver@5.1.0
```

**Warning**: Unpublishing is discouraged and may be blocked if the package has downloads.

## Alternative: Using npx

Instead of global installation, users can run your package directly:

```bash
npx global-data-screensaver
```

This downloads and runs the package without installing it globally.

## GitHub Integration

### 1. Create GitHub Repository

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/teamaffixmb-jake/global-info-map.git
git push -u origin main
```

### 2. Add GitHub Actions (Optional)

Create `.github/workflows/publish.yml` for automated publishing on version tags.

## Troubleshooting

### "You do not have permission to publish"

- The package name might be taken
- Try a scoped package: `@yourusername/global-data-screensaver`

### "Package name too similar to existing package"

- Choose a more unique name
- Use your username as a scope

### Build errors

- Run `npm run build` locally first
- Check for TypeScript errors
- Verify all dependencies are in `package.json`

## Support

For issues, please file them on GitHub:
`https://github.com/yourusername/global-data-screensaver/issues`

---

**Ready to publish?** Follow the checklist above and run `npm publish`! 🚀

