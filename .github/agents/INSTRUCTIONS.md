# Copilot Agent Instructions for prime-factorization-game

You are a GitHub Copilot coding agent working on the prime-factorization-game repository. Follow these instructions for every pull request.

## Core Principles

1. **Semantic Versioning is Mandatory**: Every PR must update the version in `package.json`
2. **Minimal Changes**: Only modify what's necessary to fix the issue
3. **Quality First**: Always lint, build, and test before finalizing
4. **Clear Communication**: Document changes clearly in PR descriptions

---

## Step-by-Step Workflow

### Step 1: Understand the Issue
- Read the issue description carefully
- Identify affected files and components
- Review related code in `src/gameLogic.ts`, `src/Game.tsx`, or `src/types.ts`
- Check previous PRs for similar changes

### Step 2: Determine Version Impact

Analyze the changes to determine version increment:

**PATCH (0.0.X)** - Bug fixes only:
- Animation glitches
- Tile rendering issues
- Chain reaction bugs
- Collision detection fixes
- UI layout problems
- Performance optimizations

**MINOR (0.X.0)** - New features (backward compatible):
- New game mechanics
- New tile types
- New UI components
- New configuration options
- Additional game modes
- Feature enhancements

**MAJOR (X.0.0)** - Breaking changes:
- Complete game overhaul
- Save game format changes
- API changes
- Framework changes
- Major architectural rewrites

### Step 3: Update Version

```bash
# Check current version
cat package.json | grep '"version"'

# Update version manually in package.json
# Change the "version" field to the new version
```

**Format**: `"version": "MAJOR.MINOR.PATCH"`

Examples:
- Bug fix: `1.0.0` → `1.0.1`
- New feature: `1.0.1` → `1.1.0`
- Breaking change: `1.1.0` → `2.0.0`

### Step 4: Implement Changes

Follow these guidelines:

**Code Quality**:
- Match existing code style
- Use TypeScript types properly
- Avoid `any` types
- Keep functions focused and single-purpose

**Testing**:
```bash
# Lint code
npm run lint

# Build project
npm run build

# Run dev server for manual testing
npm run dev
```

**Visual Changes**:
- Test on desktop (400px board) and mobile (300px board)
- Take screenshots before and after
- Verify animations are smooth
- Check responsive behavior

### Step 5: Create Pull Request

**PR Title Format**: `<Type>: <Brief Description> (vX.Y.Z)`

Examples:
- `Fix: Resolve tile disappearance animation bug (v1.0.1)`
- `Feature: Add multi-tile factorization (v1.1.0)`
- `Breaking: Redesign game board architecture (v2.0.0)`

**PR Description Must Include**:
1. **Summary**: What changed and why
2. **Version**: New version number and reason for increment type
3. **Changes**: Detailed list of modifications
4. **Screenshots**: For any UI changes (before/after)
5. **Testing**: How you verified the changes work

**Template**:
```markdown
## Summary
[Brief description of changes]

## Version Update
- Old version: vX.Y.Z
- New version: vX.Y.Z
- Reason: [PATCH/MINOR/MAJOR because...]

## Changes
- Change 1
- Change 2
- Change 3

## Screenshots
[If UI changed]
Before: [image]
After: [image]

## Testing Performed
- [x] Linting passed
- [x] Build successful
- [x] Manual testing in dev mode
- [x] Verified on desktop
- [x] Verified on mobile (if applicable)
```

### Step 6: Post-Merge Actions

**After PR is merged to main**, the following should happen:

1. **Create Git Tag** (manual or automated):
```bash
git checkout main
git pull origin main
git tag -a vX.Y.Z -m "Release vX.Y.Z: <brief description>"
git push origin vX.Y.Z
```

2. **Verify Deployment**:
- GitHub Actions will automatically deploy to GitHub Pages
- Check https://tanashou1.github.io/prime-factorization-game/
- Verify version is displayed correctly in the UI

---

## Common Patterns

### Game Logic Changes (gameLogic.ts)
```typescript
// Use Map for efficient lookups
const tileMap = new Map<string, Tile>();

// Position keys
const key = `${x},${y}`;

// Check adjacency
const adjacent = [
  tileMap.get(`${x-1},${y}`),
  tileMap.get(`${x+1},${y}`),
  tileMap.get(`${x},${y-1}`),
  tileMap.get(`${x},${y+1}`)
].filter(t => t !== undefined);
```

### UI State Updates (Game.tsx)
```typescript
// Use functional updates for state
setTiles(prevTiles => 
  prevTiles.map(tile => 
    tile.id === id ? { ...tile, property: newValue } : tile
  )
);
```

### Type Definitions (types.ts)
```typescript
// Always define interfaces
export interface Tile {
  id: string;
  value: number;
  position: { x: number; y: number };
  // ... other properties
}
```

### Version Display (App.tsx)
```typescript
// Import package.json
import packageJson from '../package.json';

// Display in UI
<div className="version">v{packageJson.version}</div>
```

---

## Troubleshooting

### Build Errors
```bash
# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build
```

### Lint Errors
```bash
# Auto-fix where possible
npm run lint -- --fix

# Check specific files
npx eslint src/Game.tsx
```

### Type Errors
```bash
# Check TypeScript
npx tsc --noEmit
```

---

## Quality Checklist

Before finalizing any PR:

- [ ] Version updated in `package.json`
- [ ] All ESLint errors resolved
- [ ] Build completes successfully
- [ ] No TypeScript errors
- [ ] Manual testing completed
- [ ] Screenshots included (for UI changes)
- [ ] PR description is complete
- [ ] Changes are minimal and focused
- [ ] No existing functionality broken
- [ ] Code follows existing patterns

---

## Version History Reference

Check existing tags to see version progression:
```bash
git tag -l
git show v1.0.0
```

Review previous PRs for versioning examples:
- PR #20: Initial versioning (v1.0.0)
- PR #24: Feature additions (should be v1.1.0+)

---

## Additional Resources

- **Semantic Versioning**: https://semver.org/
- **Game README**: `/README.md` for game rules
- **Deployment Workflow**: `/.github/workflows/deploy.yml`
- **TypeScript Config**: `/tsconfig.app.json`, `/tsconfig.json`

---

## Remember

🎯 **Every PR must update the version**
🔍 **Understand the change type before coding**
✅ **Test thoroughly before submitting**
📝 **Document clearly in PR**
🏷️ **Tag after merging**

Follow these instructions consistently for efficient, high-quality development! 🚀
