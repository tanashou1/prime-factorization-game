# Quick Version Decision Guide

Use this quick reference to decide which version component to increment.

## Decision Tree

```
Does the change break existing functionality or change the API?
├─ YES → MAJOR version (X.0.0)
└─ NO → Continue ↓

Does the change add new functionality?
├─ YES → MINOR version (0.X.0)
└─ NO → Continue ↓

Does the change fix a bug or improve existing code?
├─ YES → PATCH version (0.0.X)
└─ NO → Documentation only, no version change needed
```

## Quick Examples

### MAJOR (Breaking Changes) - X.0.0
- ❌ Game save format changes
- ❌ Complete UI redesign
- ❌ Changing from React to another framework
- ❌ Removing existing features
- ❌ API changes that break compatibility

### MINOR (New Features) - 0.X.0
- ✨ Multi-tile factorization feature
- ✨ New game mode
- ✨ New tile types (prime tiles, special tiles)
- ✨ New configuration panel
- ✨ Undo/redo functionality
- ✨ Sound effects system
- ✨ Leaderboard feature

### PATCH (Bug Fixes) - 0.0.X
- 🐛 Fix tile disappearance animation
- 🐛 Fix collision detection
- 🐛 Fix chain reaction counting
- 🐛 Fix merge highlighting
- 🐛 Fix board resizing during animations
- 🐛 Fix ghost tiles bug
- 🐛 Performance improvements
- 🐛 CSS layout fixes

## Special Cases

### UI Improvements
- **Major UI overhaul** → MINOR (0.X.0)
- **Button repositioning** → PATCH (0.0.X)
- **Color scheme change** → PATCH (0.0.X)
- **Responsive fixes** → PATCH (0.0.X)

### Performance
- **Algorithmic improvement** → MINOR (0.X.0) if significantly better
- **Small optimization** → PATCH (0.0.X)

### Refactoring
- **Code refactoring** (no behavior change) → PATCH (0.0.X)
- **Architectural change** (with behavior change) → MAJOR (X.0.0)

## When in Doubt

### Ask Yourself:
1. Will this break existing games or saved states? → **MAJOR**
2. Is this a new feature users can see/use? → **MINOR**
3. Is this fixing something that was broken? → **PATCH**

### Conservative Approach:
- If unsure between MINOR and PATCH → Choose **MINOR**
- If unsure between MAJOR and MINOR → Choose **MINOR** (unless truly breaking)
- Better to over-version than under-version

## Example PR Titles

### MAJOR
- `Breaking: Redesign game state architecture (v2.0.0)`
- `Breaking: Remove legacy tile types (v2.0.0)`

### MINOR
- `Feature: Add multi-tile factorization (v1.1.0)`
- `Feature: Implement sound effects system (v1.2.0)`
- `Enhancement: Add game statistics panel (v1.3.0)`

### PATCH
- `Fix: Resolve tile animation glitch (v1.0.1)`
- `Fix: Correct chain reaction scoring (v1.0.2)`
- `Fix: Improve mobile responsiveness (v1.0.3)`

## Current Version Status

Check current version:
```bash
cat package.json | grep version
```

List all version tags:
```bash
git tag -l
```

## Remember

🎯 **When implementing**: First decide version type, then code
📝 **When in PR**: Include version in title and description
🏷️ **After merge**: Create and push the git tag
✅ **Every PR**: Must update version number (except docs-only PRs)

---

**Last Updated**: Based on repository state as of v1.0.0
