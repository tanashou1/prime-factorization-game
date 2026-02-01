# GitHub Copilot Custom Instructions for prime-factorization-game

## 🔴 CRITICAL: Version Management is MANDATORY

**Every PR MUST update the version number in `package.json` before completion.**

This is a non-negotiable requirement. Do not complete any PR without updating the version.

---

## Quick Version Decision Process

Before implementing any changes, determine the version increment:

### 1️⃣ Does the change break existing functionality or APIs?
- **YES** → **MAJOR** version increment (X.0.0)
  - Example: Game save format changes, removing features, framework changes
  - Current: `1.2.3` → New: `2.0.0`

### 2️⃣ Does the change add new functionality or features?
- **YES** → **MINOR** version increment (0.X.0)
  - Example: New game modes, new tile types, new UI panels
  - Current: `1.2.3` → New: `1.3.0`

### 3️⃣ Does the change fix bugs or improve existing code?
- **YES** → **PATCH** version increment (0.0.X)
  - Example: Animation fixes, collision detection bugs, layout issues
  - Current: `1.2.3` → New: `1.2.4`

### 4️⃣ Is this documentation-only?
- **YES** → **No version change** needed (ONLY exception)

---

## Mandatory Workflow for Every PR

### ✅ Before You Start Coding

1. **Check current version**:
   ```bash
   cat package.json | grep version
   ```

2. **Analyze the issue** to determine version type (MAJOR/MINOR/PATCH)

3. **Calculate new version** based on rules above

### ✅ During Implementation

1. **Implement minimal necessary changes**
2. **Update `package.json`** with the new version:
   ```json
   {
     "version": "X.Y.Z"
   }
   ```
3. **Follow existing code patterns** and quality standards

### ✅ Before Submitting PR

1. **Verify version was updated** in `package.json`
2. **Run quality checks**:
   ```bash
   npm run lint    # Must pass
   npm run build   # Must succeed
   npm run dev     # Manual testing
   ```

3. **PR Title Format** (include version):
   ```
   <Type>: <Description> (vX.Y.Z)
   ```
   Examples:
   - `Fix: Resolve tile animation bug (v1.0.1)`
   - `Feature: Add multi-tile selection (v1.1.0)`
   - `Breaking: Redesign game architecture (v2.0.0)`

4. **PR Description Must Include**:
   ```markdown
   ## Version Update
   - Old version: vX.Y.Z
   - New version: vX.Y.Z
   - Reason: [PATCH/MINOR/MAJOR because...]
   
   ## Changes
   - [List specific changes]
   
   ## Testing
   - [x] Linting passed
   - [x] Build successful
   - [x] Manual testing completed
   ```

---

## Common Examples

### PATCH (Bug Fixes) - 0.0.X
```
Current: v1.0.0 → New: v1.0.1
```
- 🐛 Fix tile disappearance during animation
- 🐛 Fix collision detection edge case
- 🐛 Fix chain reaction counting
- 🐛 CSS layout fixes
- 🐛 Performance optimizations
- 🐛 Mobile responsiveness fixes

### MINOR (New Features) - 0.X.0
```
Current: v1.0.1 → New: v1.1.0
```
- ✨ Multi-tile factorization
- ✨ Undo/redo functionality
- ✨ Sound effects system
- ✨ New game mode
- ✨ Statistics panel
- ✨ Leaderboard feature

### MAJOR (Breaking Changes) - X.0.0
```
Current: v1.1.0 → New: v2.0.0
```
- ❌ Complete UI framework change
- ❌ Game save format modification
- ❌ Removing existing features
- ❌ API breaking changes
- ❌ Major architectural rewrite

---

## Project-Specific Guidelines

### Technology Stack
- **Frontend**: React 19.2.0 + TypeScript
- **Build Tool**: Vite 7.2.4
- **Deployment**: GitHub Pages (automated via `.github/workflows/deploy.yml`)

### Key Files
- `src/Game.tsx` - Main game component
- `src/gameLogic.ts` - Core game logic
- `src/types.ts` - TypeScript type definitions
- `package.json` - **VERSION IS HERE** (line 4)

### Code Quality Standards
```bash
# Always run before finalizing PR
npm run lint    # ESLint must pass
npm run build   # TypeScript compilation must succeed
```

### Testing Approach
Since this is a game, manual testing is required:
1. Run `npm run dev`
2. Test the specific feature/fix
3. Verify no regression in existing functionality
4. Take screenshots for UI changes

---

## Version History Awareness

**Before updating version, check existing tags**:
```bash
git tag -l
```

This helps you understand:
- Current version progression
- Previous version increment patterns
- Consistency with project history

---

## Post-PR Workflow (After Merge)

**Important**: After your PR is merged, a git tag should be created:

```bash
git checkout main
git pull origin main
git tag -a vX.Y.Z -m "Release vX.Y.Z: Brief description"
git push origin vX.Y.Z
```

*(This may be automated in the future)*

---

## 🚫 Common Mistakes to Avoid

1. ❌ **Forgetting to update version** → Every PR must update version (except docs-only)
2. ❌ **Wrong version increment** → Review decision tree carefully
3. ❌ **Not including version in PR title** → Format: `Type: Description (vX.Y.Z)`
4. ❌ **Skipping lint/build** → Always verify quality before submitting
5. ❌ **Adding features in PATCH** → Features = MINOR, only bugs = PATCH
6. ❌ **Breaking changes in MINOR** → Breaking = MAJOR always

---

## When in Doubt

### Conservative Versioning Approach:
- Unsure between MINOR and PATCH? → Choose **MINOR**
- Unsure between MAJOR and MINOR? → Choose **MINOR** (unless truly breaking)
- Better to over-version than under-version

### Need Help?
Refer to detailed documentation:
- `.github/agents/INSTRUCTIONS.md` - Comprehensive guide (283 lines)
- `.github/agents/QUICK-REFERENCE.md` - Quick decision tree (114 lines)
- `.github/agents/version-manager.md` - Detailed versioning rules (73 lines)

---

## Final Checklist Before Completing PR

- [ ] **Version updated** in `package.json` (line 4)
- [ ] **Version in PR title**: `Type: Description (vX.Y.Z)`
- [ ] **Version in PR description** with reason
- [ ] **Linting passed**: `npm run lint`
- [ ] **Build successful**: `npm run build`
- [ ] **Manual testing completed**: `npm run dev`
- [ ] **Changes are minimal** and focused
- [ ] **No existing functionality broken**
- [ ] **Screenshots included** (if UI changed)

---

## Remember

**🎯 VERSION UPDATE IS NOT OPTIONAL - IT IS MANDATORY FOR EVERY PR**

Every pull request (except documentation-only PRs) **MUST** increment the version number in `package.json` according to semantic versioning rules.

This ensures:
- ✅ Clear version history
- ✅ Proper git tagging
- ✅ Accurate version display in UI
- ✅ Consistent deployment tracking
- ✅ Professional project management

---

*For detailed workflows and examples, see `.github/agents/INSTRUCTIONS.md`*
