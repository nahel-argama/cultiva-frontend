# Animações de entrada na landing — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reveal individual landing page content as it enters the viewport, with restrained motion and reduced-motion support.

**Architecture:** Mark revealable content in the landing sections. A page-scoped `IntersectionObserver` applies a visible class on first entry and disconnects when the landing unmounts. CSS handles opacity, short vertical movement, and reduced motion.

**Tech Stack:** Vue 3, native IntersectionObserver, CSS.

**Spec:** `docs/superpowers/specs/2026-11-05-landing-scroll-reveals-design.md`

## Global Constraints

- Never animate a whole section container.
- Reveal each marked item once, when it enters the viewport.
- Reduced motion and missing IntersectionObserver must leave content visible.
- Do not alter Lenis behavior, content, or layout.

## Review Focus

- Reduced motion: items remain visible without entrance animation.
- Unsupported IntersectionObserver: items remain visible.
- Landing unmount: observer disconnects.
- Above-the-fold content: observer reveals it on initial observation.
- Dense card groups: stagger remains subtle and does not delay visibility excessively.

### Task 1: Landing viewport reveals

**Files:**
- Modify: `src/views/Landing/LandingPage.vue`
- Modify: `src/components/landingPage/Hero.vue`
- Modify: `src/components/landingPage/ProblemSection.vue`
- Modify: `src/components/landingPage/SolutionSection.vue`
- Modify: `src/components/landingPage/FeaturesSection.vue`
- Modify: `src/components/landingPage/TargetAudienceSection.vue`
- Modify: `src/components/landingPage/Footer.vue`
- Modify: `src/style.css`

**Interfaces:**
- Landing page owns and disconnects its observer.
- Marked elements receive a visible class once intersecting.

- [x] Mark individual headings, content blocks, and cards for reveal; do not mark section containers.
- [x] Observe marked elements when the landing mounts; reveal on intersection and disconnect on unmount. Skip observation for reduced motion or unsupported browsers.
- [x] Add a brief opacity/vertical-motion transition and restrained sibling stagger; disable the reveal transition under `prefers-reduced-motion`.
- [x] Run `npm run build` and `git diff --check` from `frontend/`.
