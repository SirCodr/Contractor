---
trigger: always_on
---

# Rules for TCDebt - Version 1.0

## Project Summary

**contrato-generador** is a Next.js web application designed to automate the generation of legally compliant contracts under Colombian law. The initial focus is on **residential lease contracts (Contratos de Arrendamiento de Vivienda Urbana)** governed by Ley 820 de 2003, with the goal of expanding to other contract types over time.

The application allows authenticated users (via Google OAuth through NextAuth.js) to fill in structured forms, validate inputs against Colombian legal requirements, and generate ready-to-sign PDF contracts. The core value proposition is abstracting complex legal rules (rent caps, mandatory clauses, IPC-based adjustments, termination notice periods) into a guided, user-friendly wizard that prevents legally invalid contracts from being issued.

**Key entities:**
- `contract`: The core domain object representing a generated or in-progress contract document.
- `party`: A landlord, tenant, co-debtor, or guarantor participating in a contract.
- `property`: The urban real estate unit being leased.
- `clause`: Individual contract sections, some mandatory by law and some optional.
- `template`: A reusable contract structure parameterized by contract type (individual, mancomunado, compartido, pensión).

**Tech stack highlights:** Next.js (App Router), NextAuth.js with Google provider, TanStack Query, Zustand, Zod, shadcn/ui, Tailwind CSS.

## Structure and Architecture
- Built with Next.js using the App Router; all routing files are placed in the 'app' folder.
- Key entities: credit-card, purchase.
- Code organization: If a code block (e.g., constants, functions) is used only by a single file or component, define it within that file's scope or in its folder. For example, a constant used only in a page component should be declared there. If shared across multiple files, place it in the 'constants' folder.
- JSX code starts in page.tsx files. As components grow in complexity, combine features, or increase in size/logic, extract them into separate components. Initially, create components in a '_components' folder within the route if used only by that page. If needed by multiple pages or components, move to the root 'components' folder.
- The 'components' folder has a 'ui' subfolder for simple, generic components like buttons, alerts, and forms. Outside 'ui', create files for more specific components, such as purchase-form.
- The 'constants' folder at the project root organizes constants by entity (e.g., credit-card constants related only to credit cards).
- This structure applies similarly to folders like 'stores' and 'types'.
- In the 'hooks' folder, create files for entity-specific React state and logic, such as use-mobile for converting event values into reactive ones.
- Data flow: Use TanStack Query for data fetching and Zustand for global state management.
- NEVER mix business logic in UI components.

## Code Standards and Style
- Naming: CamelCase for variables/functions (e.g., fetchUserData), PascalCase for component names (e.g., UserProfile). Kebab-case for file names with extensions like .ts, .tsx, .js, .jsx.
- Format: Always use Prettier (semi: false, singleQuote: true) and ESLint with airbnb-base.
- Tailwind classes: Order by mobile-first (e.g., sm:, md:), use cn() from clsx-merge for conditionals.
- Avoid: Global variables, magic numbers (use constants instead).
- Component example:
  ```tsx
  import { cn } from '@/lib/utils';

  function Button({ className, ...props }) {
    return <button className={cn('bg-blue-500 text-white px-4 py-2', className)} {...props} />;
  }
  ```

## Best Practices and Techniques
- Prioritize React Server Components for performance whenever possible.
- Use custom hooks (e.g., useAuth) for reusable logic.
- Techniques: Implement lazy loading with Suspense and error boundaries at root levels.
- PREFER Zod for schemas: Define types in /lib/schemas.ts.
- NEVER use useEffect for data fetching; opt for server actions or TanStack Query instead.

## Testing and Quality
- Minimum coverage: Aim for 80% unit tests with Vitest and 100% E2E with Playwright (if applicable).
- Always write tests for critical components (e.g., forms and purchase logic).
- Linting: Run ESLint before commits using Git hooks (e.g., Husky).
- Code reviews: Use GitHub PRs with checklists; no merges without approval.

## Security and Privacy
- Inputs: Sanitize with Zod to prevent XSS using React's built-in escapes.
- Secrets: NEVER hardcode; use .env files managed with Dotenv.
- Data storage: Ensure IndexedDB handles sensitive data securely (e.g., encrypt if needed for credit info).
- GDPR-like practices: Keep user data client-side and anonymous where possible.

## Deployment and CI/CD
- Platform: Vercel with GitHub Actions integration.
- Pipeline: Build with Next.js defaults, run tests in PRs, auto-deploy on main branch.
- Rollbacks: Tag releases (e.g., v1.0.1) for easy reversion.
- Monitoring: Integrate tools like Sentry for error tracking in production.

## Error Handling and Logging
- Use try-catch in async functions; throw custom errors (e.g., new AppError('msg')).
- Logging: Console in development, structured logging with Pino in production.
- User-facing: Display friendly toasts (e.g., with Sonner).
- NEVER expose stack traces in production.

## Performance Optimizations
- Images and assets: Use next/image with lazy loading and optimized sizes.
- Bundling: Analyze with tools like Webpack Bundle Analyzer if bundle size grows.
- Caching: Leverage Next.js revalidation for dynamic pages.
- Metrics: Target fast load times, such as LCP < 2.5s.

## Dependencies and Tools
- Core: next@latest (App Router), react@18+, tailwindcss@3+, shadcn/ui, react-hook-form, zod, tanstack/react-query, zustand.
- Updates: Run npm-check-updates monthly.
- Avoid: Deprecated packages; prefer official, well-maintained ones.
- VS Code Extensions: Enable ESLint, Prettier, GitLens, Tailwind CSS IntelliSense.

## Stack-Specific Rules
- React: Use memo for pure components to avoid unnecessary re-renders.
- Next.js: Prefer App Router over Pages Router.
- Tailwind: Define custom themes in tailwind.config.js; use @apply only when necessary.

## Other Global Rules
- Commits: Follow conventional commits (feat:, fix:, chore:).
- Collaboration: Document TODOs with @todo comments in code.
- Updates: Review changelogs of dependencies before upgrading.