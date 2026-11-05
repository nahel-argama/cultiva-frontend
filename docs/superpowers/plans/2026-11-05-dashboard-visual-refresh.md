# Dashboard Visual Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the landing page's visual identity across the full dashboard without changing its content or behavior.

**Architecture:** Keep the existing Vue component structure and Tailwind utility approach. Update presentation in dashboard shell, shared navigation, routed views, and nested dashboard UI; leave state, scripts, data, labels, and actions intact.

**Tech Stack:** Vue 3 SFCs, Tailwind CSS 4, existing DM Sans and Fraunces font faces.

**Spec:** `frontend/docs/superpowers/specs/2026-11-05-dashboard-visual-refresh-design.md`

## Global Constraints

- Use forest green `#287A4E`, bright green accent `#2CA961`, warm cream `#F7F5EF`, and sage border `#DFE3D9`.
- Use Fraunces for display headings and DM Sans for body and controls.
- Keep existing text, numbers, states, actions, routes, permissions, and accessibility attributes unchanged.
- Add no dependency; make presentation-only changes.

## Review Focus

- Unverified account retains the same disabled navigation and verification notice; inspect class-only changes in `DashboardSidebar.vue`.
- Mobile sidebar, topbar, cart and account menu remain usable; inspect `DashboardShell.vue` and `DashboardTopbar.vue` at small widths.
- Empty, loading, and error states remain visible and legible; inspect each view and its nested components.
- Forms, dialogs, and image upload retain current controls and actions; inspect stock, wishlist, and product-image components.
- Chart and history data retain contrast and scanability; inspect analytics and history components.

---

### Task 1: Add the dashboard theme at its shared root

**Files:**
- Modify: `frontend/src/components/dashboard/DashboardShell.vue`
- Modify: `frontend/src/style.css`

**Interfaces:**
- Consumes and produces the same props, slots, emits, and events.

- [x] Add a dashboard-scoped color, type, radius, and shadow theme; apply landing surfaces to the shell.
- [x] Re-read template/script diff and confirm only class/style changes; retain responsive behavior and accessibility semantics.
- [x] Run `npm run build` from `frontend`; expected: Vite build succeeds.

### Task 2: Refresh inventory, offers, and wishlist views

**Files:**
- Review: `frontend/src/components/dashboard/views/StockView.vue` and `views/stock/*`
- Review: `frontend/src/components/dashboard/views/ExploreOffersView.vue` and `views/offers/*`
- Review: `frontend/src/components/dashboard/views/WishlistView.vue` and `views/wishlist/*`

**Interfaces:**
- Consumes and produces the same props, events, and data bindings as Task 1.

- [x] Confirm existing semantic Tailwind color, radius, and shadow classes inherit the scoped theme; retain status colors and all content/bindings.
- [x] Re-read source; confirm unchanged labels, values, actions, and state logic.
- [x] Run `npm run build` from `frontend`; expected: Vite build succeeds.

### Task 3: Refresh history, profile, analytics, and remaining views

**Files:**
- Review: `frontend/src/components/dashboard/views/PurchaseHistoryView.vue`, `SalesHistoryView.vue`, `WishlistAnalyticsView.vue`, and `views/history/*`
- Review: `frontend/src/components/dashboard/views/ProfileView.vue` and `views/profile/*`
- Review: `frontend/src/components/dashboard/views/DashboardPlaceholderView.vue`, `ProductImagesPlaceholderView.vue`, and `views/product-images/*`
- Review: `frontend/src/components/dashboard/cart/CartDrawer.vue`
- Modify: `frontend/src/components/dashboard/views/profile/ProfileBanner.vue`
- Modify: `frontend/src/components/dashboard/views/history/HistoryAccordionItem.vue`

**Interfaces:**
- Consumes and produces the same props, events, and data bindings as prior tasks.

- [x] Update the two dashboard surfaces that used hard-coded colors; confirm all other reviewed UI inherits the theme.
- [x] Re-read template/script diff; confirm all content, data, states, actions, and accessibility semantics remain unchanged.
- [x] Run `npm run build` from `frontend`; expected: Vite build succeeds.

### Task 4: Review full visual change

**Files:** all dashboard component files above.

- [x] Review the complete diff for styling-only changes; check `DashboardView.vue` and `data/dashboard.js` remain behaviorally and textually unchanged.
- [x] Run `npm run build` from `frontend`; expected: Vite build succeeds.
- [x] Inspect desktop and mobile retailer views; confirm legibility, responsive controls, and unchanged error state.

## Implementation ruling

- Ruling: Apply the landing design through a dashboard-scoped theme that remaps the existing Tailwind colors, radii, and arbitrary shadows. This reaches all dashboard views using their existing utilities with four focused SFC/CSS edits instead of editing every leaf component. Cost if wrong: a dashboard style that hard-codes its own color outside the reviewed exceptions could remain visually inconsistent.
