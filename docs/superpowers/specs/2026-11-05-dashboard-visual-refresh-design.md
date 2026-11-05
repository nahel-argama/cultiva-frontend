# Dashboard Visual Refresh

## Intent

Bring the complete Cultiva dashboard in line with the recently refreshed landing page. Make the dashboard feel like the same product while keeping it clear and efficient for producers, retailers, and delivery users.

## Goals

- Carry the landing page palette, typography, spacing, borders, and restrained motion through every dashboard screen and shared component.
- Keep the existing content, labels, data, routes, role-based navigation, actions, and states unchanged.
- Preserve responsive behavior, keyboard access, and reduced-motion support.

## Non-goals

- No new dashboard features, copy, data, or navigation.
- No changes to API calls, business logic, permissions, or state transitions.
- No new dependencies or external design system.

## Approaches

- **Shared shell only:** refresh sidebar, topbar, and page background. Smallest diff, but individual screens would retain the old visual language.
- **Full dashboard pass (selected):** update shared components and all dashboard view components to use the landing identity consistently. Larger styling-only diff; matches the request to apply the refactor everywhere.
- **Add a dashboard theme layer:** centralize dashboard styles in a new theme abstraction. More structure than needed for this one visual pass and risks competing with existing Tailwind classes.

## Design direction

Use the landing page's forest green (`#287A4E`), bright green accent (`#2CA961`), warm cream (`#F7F5EF`), and sage border (`#DFE3D9`). Use the existing Fraunces face for display headings and DM Sans for body and controls. Keep data views easy to scan with restrained borders, quieter surfaces, and consistent spacing. Preserve existing information hierarchy and interaction affordances; do not add decorative content.

## Scope and constraints

Update `DashboardShell`, `DashboardSidebar`, and `DashboardTopbar`, plus every routed dashboard view and its nested UI components (stock, offers, wishlist, history, profile, analytics, cart, and shared dashboard UI where visually used). Leave `DashboardView` behavior and `data/dashboard.js` copy/data untouched unless a class-only change is necessary.

Retain all current text, numbers, empty/loading/error states, buttons, icons, form fields, dialogs, navigation items, disabled/verified states, and accessibility attributes. Styling may change; template content and script behavior must not.

## Success checks

- All dashboard roles and views use a cohesive landing-page visual language.
- A content and interaction comparison finds no changed copy, data, routes, permissions, or actions.
- Frontend production build succeeds.
- Review the resulting diff for styling-only changes and inspect representative desktop and mobile layouts.

## Implementation calls

- Use the already bundled fonts and existing color values; add no package.
- Keep changes within dashboard components and dashboard-specific styles.
- Avoid new animation; retain current motion unless it conflicts with reduced-motion or usability.
