# Contributing to Global Data Screensaver

Thank you for considering contributing to this project! 🎉

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork**:
   ```bash
   git clone https://github.com/teamaffixmb-jake/global-info-map.git
   cd global-info-map
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Start development server**:
   ```bash
   npm run dev
   ```

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 2. Make Your Changes

- Follow the existing code style
- Use TypeScript for type safety
- Comment complex logic
- Test your changes thoroughly

### 3. Test

```bash
npm run build  # Ensure build works
npm run preview  # Test production build
```

### 4. Commit

Write clear, descriptive commit messages:

```bash
git commit -m "feat: add tornado data visualization"
git commit -m "fix: correct ISS orbit calculation"
git commit -m "docs: update README with new features"
```

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Code Style

- **TypeScript**: Use proper types, avoid `any`
- **React**: Use functional components and hooks
- **Naming**: camelCase for variables/functions, PascalCase for components
- **Comments**: Explain "why", not "what"

## Project Structure

```
src/
├── components/     # React components
│   ├── CesiumMap.tsx
│   ├── EventLog.tsx
│   └── Legend.tsx
├── models/         # TypeScript interfaces/types
│   └── DataPoint.ts
├── utils/          # Helper functions
│   ├── api.ts
│   ├── CesiumMarkerManager.ts
│   ├── converters.ts
│   └── severity.ts
└── App.tsx         # Main application
```

## Adding New Data Sources

1. **Add API fetch function** in `src/utils/api.ts`
2. **Add converter** in `src/utils/converters.ts`
3. **Add data type** in `src/models/DataPoint.ts`
4. **Update severity logic** in `src/utils/severity.ts`
5. **Integrate in** `src/App.tsx`

Example:
```typescript
// In api.ts
export async function fetchTornadoes(): Promise<TornadoData[]> {
  // Fetch from API
}

// In converters.ts
export function tornadoToDataPoint(tornado: TornadoData): DataPoint {
  // Convert to DataPoint
}
```

## Testing

Currently, testing is manual. Future improvements:
- Add Jest for unit tests
- Add React Testing Library for component tests
- Add E2E tests with Playwright

## Feature Requests

Have an idea? Open an issue with:
- Clear description
- Use case
- Expected behavior
- Mockups (if UI change)

## Bug Reports

Found a bug? Open an issue with:
- Description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Screenshots/console errors
- Browser and OS info

## Pull Request Guidelines

- **One feature per PR**: Keep changes focused
- **Update README**: Document new features
- **No breaking changes**: Without discussion first
- **Respect the architecture**: Follow existing patterns

## Questions?

- Open a GitHub Discussion
- File an issue with the "question" label

Thank you for contributing! 🙌

