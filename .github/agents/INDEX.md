# Agent Files Documentation

## Overview

This directory contains configuration files and instructions for GitHub Copilot agents to facilitate continuous development with consistent semantic versioning and automated git tagging.

## Files Structure

```
.github/agents/
├── INSTRUCTIONS.md          # Main agent instructions (comprehensive guide)
├── QUICK-REFERENCE.md       # Quick decision tree for version selection
├── README.md               # Overview and usage guide (Japanese)
├── version-manager.md      # Detailed versioning rules and workflow
├── development-guide.md    # Development workflow and best practices
├── version-helper.sh       # Bash script for version management
└── INDEX.md               # This file - complete documentation
```

## Purpose

These agent files ensure:

1. **Consistent Versioning**: Every PR follows semantic versioning rules
2. **Automated Tagging**: Git tags are created with proper format and messages
3. **Development Standards**: Code quality and patterns are maintained
4. **Efficient Workflow**: Agents can work autonomously with clear guidelines

## How It Works

### For Copilot Agents

When a GitHub Copilot agent is assigned an issue, it should:

1. **Read INSTRUCTIONS.md** - Get the complete workflow and checklist
2. **Consult QUICK-REFERENCE.md** - Determine the version increment type
3. **Follow version-manager.md** - Apply semantic versioning rules
4. **Apply development-guide.md** - Follow coding standards and patterns
5. **Update package.json** - Increment the version appropriately
6. **Create PR** - Include version info in title and description
7. **Post-merge** - Create git tag with the new version

### For Human Developers

1. **Reference the guides** when deciding how to version changes
2. **Use version-helper.sh** to automate version updates:
   ```bash
   # For bug fixes
   .github/agents/version-helper.sh patch "Fix tile animation"
   
   # For new features
   .github/agents/version-helper.sh minor "Add multiplayer mode"
   
   # For breaking changes
   .github/agents/version-helper.sh major "Redesign API"
   ```
3. **Follow the PR template** from INSTRUCTIONS.md
4. **Create tags** after merging to main

## Semantic Versioning Rules

### Version Format: MAJOR.MINOR.PATCH

- **MAJOR** (X.0.0): Breaking changes, incompatible API changes
- **MINOR** (0.X.0): New features, backward compatible additions
- **PATCH** (0.0.X): Bug fixes, backward compatible fixes

### Examples from This Project

| Change Type | Example | Version Change |
|-------------|---------|----------------|
| MAJOR | Complete game redesign | 1.0.0 → 2.0.0 |
| MINOR | Add multi-tile factorization | 1.0.0 → 1.1.0 |
| MINOR | Add sound effects system | 1.1.0 → 1.2.0 |
| PATCH | Fix tile animation bug | 1.0.0 → 1.0.1 |
| PATCH | Fix collision detection | 1.0.1 → 1.0.2 |

## Git Tagging Workflow

### Tag Format

```
vMAJOR.MINOR.PATCH
```

Examples: `v1.0.0`, `v1.1.0`, `v2.0.0`

### Creating Tags

**After a PR is merged to main:**

```bash
# Checkout main and pull latest
git checkout main
git pull origin main

# Create annotated tag
git tag -a v1.0.1 -m "Release v1.0.1: Fix tile animation bugs"

# Push tag to remote
git push origin v1.0.1
```

**Using the helper script:**

```bash
# This will update package.json and create the tag
.github/agents/version-helper.sh patch "Fix tile animation bugs"

# Then push changes and tag
git push origin main
git push origin v1.0.1
```

## PR Workflow

### 1. Pre-Development

- [ ] Read issue description
- [ ] Review relevant code files
- [ ] Determine version impact (use QUICK-REFERENCE.md)
- [ ] Check current version: `cat package.json | grep version`

### 2. Development

- [ ] Implement minimal necessary changes
- [ ] Update package.json version field
- [ ] Follow existing code patterns
- [ ] Keep changes focused

### 3. Testing

- [ ] Run linter: `npm run lint`
- [ ] Build project: `npm run build`
- [ ] Manual testing: `npm run dev`
- [ ] Take screenshots (if UI changed)

### 4. PR Creation

**Title Format:**
```
<Type>: <Description> (vX.Y.Z)
```

**Description Template:**
```markdown
## Summary
[What changed and why]

## Version Update
- Old version: vX.Y.Z
- New version: vX.Y.Z
- Reason: [PATCH/MINOR/MAJOR because...]

## Changes
- [List of changes]

## Screenshots
[For UI changes]

## Testing
- [x] Linting passed
- [x] Build successful
- [x] Manual testing completed
```

### 5. Post-Merge

- [ ] Create git tag (see Git Tagging Workflow above)
- [ ] Push tag to remote
- [ ] Verify deployment on GitHub Pages
- [ ] Close related issues

## Integration with CI/CD

The repository uses GitHub Actions for deployment:

- **Workflow**: `.github/workflows/deploy.yml`
- **Trigger**: Push to `main` branch
- **Output**: Deploys to GitHub Pages
- **Version Display**: Automatically shows in UI from package.json

## Version History

To view version history:

```bash
# List all tags
git tag -l

# Show specific tag details
git show v1.0.0

# View commits since last tag
git log $(git describe --tags --abbrev=0)..HEAD --oneline
```

## Best Practices

### DO ✅

- Always update version in every PR (except docs-only)
- Include version in PR title
- Create annotated tags with meaningful messages
- Test thoroughly before committing
- Follow semantic versioning strictly
- Document version changes in PR description

### DON'T ❌

- Skip version updates
- Use lightweight tags (use annotated tags)
- Increment version arbitrarily
- Make breaking changes in PATCH versions
- Add features in PATCH versions
- Forget to push tags to remote

## Troubleshooting

### Script Permission Issues

```bash
chmod +x .github/agents/version-helper.sh
```

### Tag Already Exists

```bash
# Delete local tag
git tag -d v1.0.1

# Delete remote tag
git push origin :refs/tags/v1.0.1

# Recreate tag
git tag -a v1.0.1 -m "Release v1.0.1: Description"
git push origin v1.0.1
```

### Wrong Version Committed

```bash
# Fix in new commit
# Update package.json with correct version
git add package.json
git commit -m "Fix version number"
git push
```

## Future Enhancements

Consider adding:

1. **Automated version bumping** in GitHub Actions
2. **Changelog generation** from commit messages
3. **Release notes** automation
4. **Version validation** in PR checks
5. **Breaking change detection** in CI

## Maintenance

Update these files when:

- Development workflow changes
- New tools are added
- Versioning rules need adjustment
- Build process changes
- New patterns emerge

## Resources

- [Semantic Versioning Specification](https://semver.org/)
- [Git Tagging Documentation](https://git-scm.com/book/en/v2/Git-Basics-Tagging)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [React Best Practices](https://react.dev/)

## Questions?

For questions or suggestions about these agent files:

1. Open an issue in the repository
2. Reference specific instruction files
3. Suggest improvements via PR

---

**Created**: 2026-01-31  
**Last Updated**: 2026-01-31  
**Version**: 1.0.0 (of agent files themselves)
