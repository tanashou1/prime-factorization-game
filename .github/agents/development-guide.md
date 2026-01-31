# Development Agent Instructions

## Repository Overview

This is a prime factorization game built with React, TypeScript, and Vite. Players manipulate numbered tiles on a grid where tiles can merge through factorization rules.

## Tech Stack

- **Frontend**: React 19.2.0 with TypeScript
- **Build Tool**: Vite 7.2.4
- **Styling**: CSS with Game.css and App.css
- **Deployment**: GitHub Pages (deployed from `dist/` folder)
- **Linting**: ESLint 9.39.1

## Project Structure

```
/src
  ├── App.tsx           # Main app component with version display
  ├── Game.tsx          # Game board and UI logic
  ├── gameLogic.ts      # Core game mechanics (merging, chains, factorization)
  ├── types.ts          # TypeScript type definitions
  └── assets/           # Static assets

/public                 # Public static files
/.github/workflows      # GitHub Actions for deployment
```

## Development Workflow

### Before Making Changes

1. **Understand the codebase**: Review relevant files, especially:
   - `gameLogic.ts` for game mechanics
   - `Game.tsx` for UI and state management
   - `types.ts` for data structures

2. **Run linter**: `npm run lint`
3. **Test build**: `npm run build`

### Making Changes

1. **Keep changes minimal**: Only modify what's necessary for the issue
2. **Preserve existing functionality**: Don't remove working code
3. **Follow patterns**: Match existing code style and patterns
4. **Update related files**: If adding features, update types and logic accordingly

### Testing Changes

1. **Build**: `npm run build`
2. **Lint**: `npm run lint`
3. **Manual testing**: Use `npm run dev` and test in browser
4. **Visual verification**: Take screenshots of UI changes

### Version Management

**Always update the version in package.json according to semantic versioning:**

- Check `.github/agents/version-manager.md` for version increment rules
- Update `package.json` version field
- Include version change in PR description
- Version will be displayed in the app UI automatically

## Common Patterns

### Game Mechanics (gameLogic.ts)

- Use `Map<string, Tile>` for efficient tile lookup by position
- Chain reactions use recursive processing
- Animations are managed through tile state flags

### UI Updates (Game.tsx)

- State management uses React hooks
- Tile rendering includes animation classes
- Use CSS transitions for smooth effects

### Type Safety (types.ts)

- All game entities have defined interfaces
- Use TypeScript strict mode
- Avoid `any` types

## Issue Resolution Guidelines

### Bug Fixes
- Identify root cause before fixing
- Add console logs for debugging if needed
- Test edge cases
- Version: PATCH increment (0.0.X)

### New Features
- Design feature before implementing
- Consider performance impact
- Update UI and controls as needed
- Version: MINOR increment (0.X.0)

### UI/UX Improvements
- Maintain responsive design
- Test on different screen sizes (mobile/desktop)
- Keep color scheme consistent
- Version: depends on scope (MINOR for new UI, PATCH for fixes)

## Quality Standards

- **No ESLint errors**: All code must pass linting
- **Build success**: Must build without errors
- **Type safety**: No TypeScript errors
- **Responsive**: Work on mobile and desktop
- **Performance**: Maintain smooth animations

## PR Best Practices

1. **Clear description**: Explain what changed and why
2. **Screenshots**: Include before/after images for UI changes
3. **Version update**: Always update package.json version
4. **Small commits**: Make focused, logical commits
5. **Test results**: Document testing performed

## Deployment

- Deployment is automatic via GitHub Actions on push to `main`
- Build output goes to `dist/` folder
- Deployed to GitHub Pages at: https://tanashou1.github.io/prime-factorization-game/

## Reference

- Game rules: See README.md
- Previous changes: Review closed PRs for patterns
- Version history: Check git tags
