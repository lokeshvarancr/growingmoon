# Growing Moon — Frontend Visual Transformation

## Original problem
Redesign visual presentation & frontend interactions of existing Next.js "Growing Moon" app (founder journey social platform). Preserve 100% content, functionality, routes, Supabase/API contracts, env & config. No backend changes.

## Architecture (unchanged)
Next.js 16 App Router (root /app, webpack), Tailwind 3, motion, lucide-react, Supabase client + external FastAPI (NEXT_PUBLIC_API_URL; not in repo, not running in preview).
Preview runner: /app/frontend/package.json shim (supervisor runs `next build && next start` on :3000 since dev-mode hydration does not work through the preview ingress) — **any CSS/TSX edit requires `sudo supervisorctl restart frontend` to rebuild before it shows in preview (no hot reload).**

## Implemented (Jun 2026) — Phase 1
- Design system: "Moonrise Paper" palette (ember accent), Newsreader serif + Schibsted Grotesk, paper grain, rgb-var Tailwind tokens.
- Shell, landing, feed/post cards, profile, passport, 404, toasts restyled. (superseded by teal palette below)

## Implemented (Aug 2026) — Phase 1.5: Professional Teal Recolour
- Replaced the ember/orange "Moonrise Paper" palette with a professional desaturated teal system across light AND dark mode: White/light bg ~65%, Deep Teal `#0B4F4A` (primary accent/nav-highlights/buttons) ~20%, Growth Teal `#14B8A6` (gradient end, secondary/badges) ~10%, Sage Teal `#B9D6CF` (borders/dividers) ~5%.
- `--gm-accent-rgb`/`--gm-accent-deep-rgb`/`--gm-accent-soft-rgb`/`--gm-accent-line-rgb` + new `--gm-teal-growth-rgb` in `app/globals.css` (light + `html.dark` blocks); `tailwind.config.ts` `ember` colour scale (backs indigo/purple/violet remap) changed to teal scale.
- Primary CTA gradient: global CSS rule `.bg-gm-accent.text-white` renders `linear-gradient(90deg, accent → teal-growth)`, darker gradient on hover; dark mode forces readable dark text (`#04211E`) on the bright gradient.
- Converted all `bg-gm-ink`/black-ink primary CTAs and active nav/tab/chip pills to `bg-gm-accent text-white` (TopBar nav pill, Passport tabs, mobile nav ring, home composer submit + category chips + quick-type pills + arrows, post-card Follow/Passport, Explore chip/icon button, landing Get Started, EmptyState/not-found CTA) — all now gradient + dark-mode safe.
- Removed all peach/lavender literal hex leftovers (moon logo gradient, glowing orb, dune SVG, hover tints) → teal equivalents; `.gm-moon` CSS now teal-silver radial gradient.
- Fixed dark-mode warm neutrals: body bg/text, `.bg-gray-50/100` + their `/50,/60,/70,/80,/90` opacity variants, text-gray and border overrides all teal-tinted now (was cream/brown).
- Bug fixes (from iteration_2 report): profile owner-vs-viewer copy (About/Interests/Journeys sections + header now conditional on `isOwner`), mobile Goals title input height (`flex-1`→`sm:flex-1`), QR modal closes on Escape key, Goals/About tab width now `max-w-3xl` (alignment with hero).
- Verified via testing_agent across 4 iterations (iteration_1–4.json), ~96%+ pass; all P0/MEDIUM bugs fixed.

## Backlog
- P2 (optional/cosmetic, flagged in iteration_4.json, not blocking): login/register/auth-callback/messages primary buttons still `bg-gm-ink` (could switch to teal gradient for full consistency); Explore page active category chip still flat ink; floating "Suggest Feature" FAB still flat ink; TopBar logo crescent mask stays light in dark mode (loses moon shape slightly).
- P1: Shared-element transitions card→detail; richer journey milestone visuals; per-page micro-interaction polish (messages, search, explore masonry with live data).
- P2: `app/profile/[username]/page.tsx` is 2000+ lines, should be split into smaller components (code-review note, not a bug).
