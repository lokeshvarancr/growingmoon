# Growing Moon — Frontend Visual Transformation

## Original problem
Redesign visual presentation & frontend interactions of existing Next.js "Growing Moon" app (founder journey social platform). Preserve 100% content, functionality, routes, Supabase/API contracts, env & config. No backend changes.

## Architecture (unchanged)
Next.js 16 App Router (root /app, webpack), Tailwind 3, motion, lucide-react, Supabase client + external FastAPI (NEXT_PUBLIC_API_URL; not in repo, not running in preview).
Preview runner: /app/frontend/package.json shim (supervisor runs `next build && next start` on :3000 since dev-mode hydration does not work through the preview ingress).

## Implemented (Jun 2026) — Phase 1
- Design system: "Moonrise Paper" palette (warm paper #F5F0E7, ink #16161A, ember accent #E2552C, moss), Newsreader serif display + Schibsted Grotesk text, paper grain, rgb-var Tailwind tokens (gm-accent/ink/paper/surface...), warm gray scale, ember remap of indigo/purple/violet, shadow tokens, dark-mode vars.
- Shell: floating glass top dock w/ animated active pill + labels, animated account menu; floating mobile bottom bar; new BrandMark (crescent logo); FAB; spring MotionConfig (reducedMotion=user); page fade template.
- Landing rewritten (same text) w/ animated moon hero, passport moon-phase timeline, editorial paradigm section; AuthFrame split-screen login/register; onboarding moon-phase stepper.
- Feed/post cards: editorial serif headlines, larger reading text, pill actions, dashed discussion pill, restyled sheet/lightbox (+Esc to close), dimension-matched feed skeletons.
- Profile portrait-led header; Passport ink hero, segmented tabs, moon-phase timeline markers; modals/drawers unified (shadow-modal, blur backdrop, slide-up); 404 redesigned; toasts animated.
- Fixed pre-existing no-op classes (animate-in, shadow-xs/2xs, p-4.5, z-60, backdrop-blur-xs).

## Backlog
- P1: Shared-element transitions card→detail; richer journey milestone visuals; per-page micro-interaction polish (messages, search, explore masonry with live data).
- P2: Dark theme refinement; personal theme accents.
