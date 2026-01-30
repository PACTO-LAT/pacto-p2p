# Contributing to Pacto P2P

Thank you for your interest in contributing to Pacto P2P! This document provides guidelines and instructions for contributing to our project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)
- [Feature Requests](#feature-requests)

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Expected Behavior

- **Be respectful**: Treat everyone with respect and kindness
- **Be inclusive**: Welcome newcomers and help them get started
- **Be constructive**: Provide helpful feedback and suggestions
- **Be patient**: Understand that everyone has different levels of experience
- **Be collaborative**: Work together to build something great

### Unacceptable Behavior

- Harassment, discrimination, or offensive comments
- Personal attacks or trolling
- Publishing others' private information without permission
- Other conduct that could reasonably be considered inappropriate in a professional setting

### Enforcement

Project maintainers are responsible for clarifying and enforcing our standards of acceptable behavior. They may remove, edit, or reject comments, commits, code, wiki edits, issues, and other contributions that are not aligned with this Code of Conduct.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm 9+
- Git
- A code editor (VS Code recommended)
- Basic knowledge of TypeScript, React, and Next.js

### Initial Setup

1. **Fork the repository** on GitHub
2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/pacto-p2p.git
   cd pacto-p2p
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/pacto-p2p.git
   ```
4. **Install dependencies**:
   ```bash
   npm install
   ```
5. **Build all packages**:
   ```bash
   npm run build
   ```
6. **Start development server**:
   ```bash
   npm run dev
   ```

For more detailed setup instructions, see [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md).

## 🔄 Development Workflow

### Branch Naming

Use descriptive branch names that indicate the type of change:

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation changes
- `refactor/description` - Code refactoring
- `test/description` - Test additions or changes
- `chore/description` - Maintenance tasks

Examples:
- `feature/add-payment-method`
- `fix/escrow-status-display`
- `docs/update-api-documentation`

### Making Changes

1. **Create a new branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our [coding standards](#coding-standards)

3. **Test your changes**:
   ```bash
   npm run type-check
   npm run biome:check
   npm run build
   ```

4. **Commit your changes** using [Conventional Commits](#commit-messages):
   ```bash
   git add .
   git commit -m "feat: add new payment method selector"
   ```

5. **Keep your branch updated**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

6. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

## 📝 Coding Standards

### TypeScript

- **Use TypeScript strictly**: Avoid `any` types
- **Define types explicitly**: Import types from `@pacto-p2p/types` when available
- **Use proper type definitions**: Define types in `packages/types` for shared types
- **Follow existing patterns**: Maintain consistency with the codebase

### React & Next.js

- **Use functional components**: Prefer arrow functions with explicit type annotations
- **Follow Next.js patterns**: Use App Router conventions (see [docs/nextjs-patterns.mdc](./.cursor/rules/nextjs-patterns.mdc))
- **Component organization**: Split large components into smaller, reusable ones
- **Event handlers**: Name them with `handle` prefix (e.g., `handleClick`, `handleSubmit`)

### Code Style

- **Use Biome**: Follow Biome formatting and linting rules
- **Run formatter**: Always run `npm run biome:format` before committing
- **Naming conventions**:
  - `camelCase` for variables and functions
  - `PascalCase` for components and types
  - `UPPER_SNAKE_CASE` for constants

### File Organization

- **Keep related code together**: Group by feature or functionality
- **Use index.ts files**: For clean exports
- **Follow monorepo structure**: Place code in appropriate packages (see [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md))

### Example

```typescript
// ✅ Good
import { Button } from '@pacto-p2p/ui';
import type { Escrow } from '@pacto-p2p/types';

export const EscrowCard: React.FC<EscrowCardProps> = ({ escrow }) => {
  const handleClick = () => {
    // Handle click
  };

  return (
    <Card>
      <Button onClick={handleClick}>View Details</Button>
    </Card>
  );
};

// ❌ Bad
import { Button } from '@pacto-p2p/ui';

export function EscrowCard(props: any) {
  function click() {
    // Handle click
  }

  return (
    <Card>
      <Button onClick={click}>View Details</Button>
    </Card>
  );
}
```

## 🔀 Pull Request Process

### Before Submitting

1. **Ensure your code works**: Test thoroughly
2. **Run quality checks**:
   ```bash
   npm run type-check
   npm run biome:check
   npm run biome:format
   npm run build
   ```
3. **Update documentation**: If you've changed APIs or added features
4. **Write clear commit messages**: Follow [Conventional Commits](#commit-messages)

### Creating a Pull Request

1. **Push your branch** to your fork
2. **Create a PR** on GitHub with:
   - **Clear title**: Use conventional commit format (e.g., `feat: add payment method selector`)
   - **Description**: Explain what changes you made and why
   - **Related issues**: Link any related issues
   - **Screenshots**: If applicable, include screenshots or GIFs

3. **PR Template**: Fill out all sections of the PR template

### PR Review Process

1. **Automated checks**: All CI checks must pass
2. **Code review**: At least one maintainer must approve
3. **Address feedback**: Make requested changes and push updates
4. **Keep PR updated**: Rebase on `main` if conflicts arise

### After Approval

- Maintainers will merge your PR
- Your changes will be included in the next release
- Thank you for contributing! 🎉

## 🐛 Reporting Issues

### Bug Reports

When reporting bugs, please include:

1. **Clear description**: What happened vs. what you expected
2. **Steps to reproduce**: Detailed steps to reproduce the issue
3. **Environment**:
   - Node.js version
   - npm version
   - Operating system
   - Browser (if applicable)
4. **Screenshots**: If applicable
5. **Error messages**: Full error messages and stack traces
6. **Minimal reproduction**: If possible, provide a minimal code example

### Security Issues

**Do not** open public issues for security vulnerabilities. Instead, email security concerns to the maintainers privately.

## 💡 Feature Requests

When requesting features:

1. **Check existing issues**: Make sure the feature hasn't been requested
2. **Describe the problem**: What problem does this feature solve?
3. **Propose a solution**: How should this feature work?
4. **Consider alternatives**: Are there other ways to solve this?
5. **Provide examples**: Show how the feature would be used

## 📚 Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```
feat(escrow): add payment method selector component

Adds a new component for selecting payment methods in the escrow flow.
Includes validation and error handling.

Closes #123
```

```
fix(wallet): resolve connection timeout issue

Fixes an issue where wallet connections would timeout after 30 seconds.
Now properly handles connection retries.

Fixes #456
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests for specific package
npm test --workspace=@pacto-p2p/shared
```

### Writing Tests

- Write tests for new features
- Ensure existing tests pass
- Aim for good test coverage
- Test edge cases and error scenarios

## 📖 Documentation

### Updating Documentation

- Update relevant docs when making changes
- Add JSDoc comments for public APIs
- Update examples if APIs change
- Keep documentation clear and concise

### Documentation Files

- `README.md`: Project overview and quick start
- `docs/DEVELOPMENT.md`: Development guide
- `docs/DATABASE_SCHEMA.md`: Database schema documentation
- `.cursor/rules/`: Code patterns and conventions

## ❓ Questions?

- **Documentation**: Check [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md)
- **Issues**: Search existing issues or create a new one
- **Discussions**: Use GitHub Discussions for questions

## 🙏 Thank You!

Your contributions make Pacto P2P better for everyone. We appreciate your time and effort!

---

**Remember**: Be respectful, be patient, and have fun contributing! 🚀
