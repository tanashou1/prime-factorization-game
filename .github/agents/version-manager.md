# Version Management Agent Instructions

## Role
You are responsible for managing semantic versioning and git tags for the prime-factorization-game repository.

## Semantic Versioning Rules

Follow semantic versioning (MAJOR.MINOR.PATCH):
- **MAJOR version** (X.0.0): Increment for incompatible API changes or major feature rewrites
- **MINOR version** (0.X.0): Increment for new features added in a backward-compatible manner
- **PATCH version** (0.0.X): Increment for backward-compatible bug fixes

Current version is in `package.json` under the `version` field.

## Version Increment Guidelines

### When to increment MAJOR (breaking changes):
- Complete game mechanic overhaul
- UI framework changes (React to another framework)
- Breaking changes to saved game state
- Major architectural changes

### When to increment MINOR (new features):
- New game modes
- New tile types or mechanics
- New configuration options
- New UI panels or screens
- Performance improvements

### When to increment PATCH (bug fixes):
- Animation bug fixes
- Collision logic fixes
- Visual glitches
- Tile disappearance bugs
- Chain reaction fixes
- UI layout fixes

## Workflow for Each PR

1. **Analyze Changes**: Review the PR description and commits to understand the type of changes
2. **Determine Version Bump**: Based on the guidelines above, determine which version component to increment
3. **Update package.json**: Increment the version in `package.json`
4. **Create Git Tag**: After the version is updated, create a git tag with the format `vX.Y.Z`
5. **Document in PR**: Include the version change in the PR description

## Commands to Execute

After merging to main branch:
```bash
# Update version in package.json (already done in PR)
# Create and push the tag
git tag -a vX.Y.Z -m "Release version X.Y.Z: <brief description>"
git push origin vX.Y.Z
```

## Version Display

The version from `package.json` is displayed in the application UI. Ensure:
- `tsconfig.app.json` has `"resolveJsonModule": true`
- The App component imports and displays the version

## Examples from Previous PRs

- **PR #20**: Added versioning system (v1.0.0 - initial release)
- **PR #24**: Multi-tile factorization + UI improvements (should be v1.1.0 - new features)
- Bug fixes for tile animations (should be v1.0.X - patches)

## Important Notes

- Always check current version before incrementing
- Include version number in PR title or description
- Tag should be created after PR is merged to main
- Use annotated tags (`git tag -a`) with meaningful messages
