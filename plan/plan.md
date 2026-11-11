# Growing Moon — Frontend Visual Transformation

A full visual and interaction redesign of the existing Growing Moon site, built on a bright, minimal editorial look.
All content, features, routes, Supabase connectivity and data stay exactly as they are. Only the look and feel changes.

## Who it's for
Current and new Growing Moon members who share personal journeys, post updates, discover people and follow each other's progress. The site should be easy to use for anyone, including a 13-year-old, with no explanation needed.

## Core features and experience
Every existing page is redesigned with equal care: landing, login/register, onboarding, home feed, explore, discover, search, journey passport (own and others'), profile (own and others'), update detail, new update, activity, notifications, messages, settings and not-found. Every modal and drawer is redesigned too: post composer, journey update composer, create journey, discussion drawer, connections, report, feature suggestion, activity history.

- **One design language, three distinct compositions**
  - **People** (profiles, discover, connections): portrait-led layouts that put the person first: name, identity and journeys arranged like a personal page, not a social grid.
  - **Journeys** (passport, create journey, milestones): shown as a path of progress, with milestones laid out on a timeline or moon-phase track so growth is visible at a glance.
  - **Posts** (feed cards, update detail, discussion): text-first reading layouts with careful image handling (single and multiple images), clear author line, and engagement controls that stay visible but quiet.
- **Cards rebuilt, nothing dropped**: each card keeps every existing element (text, images, metadata, user info, buttons, menus, counts) in a new arrangement.
- **Navigation**: a new floating navigation for desktop and a thumb-friendly bottom bar on mobile, with the same destinations as today.
- **Motion**: spring-based transitions between pages, smooth drawers and modals, gentle hover and tap feedback, expandable content. Reduced-motion settings are respected.
- **Loading, empty and error states**: skeletons that match the size of the real content, smooth fade-in when data arrives, restyled empty states and error messages using the existing wording.

## User flow
1. Visitor lands on the restyled home page → signs up or logs in → completes onboarding (same steps, new look).
2. Member arrives at the home feed → reads post cards → opens a discussion in a slide-in drawer → reacts or comments.
3. Member starts a post or journey update from the composer → publishes as before.
4. Member explores, discovers or searches people and journeys → opens a profile or passport.
5. Member checks notifications, activity, messages and settings from the floating navigation.

## UI/UX feel
- Bright, warm off-white background with lots of space; ink-dark type and one or two strong accent colours (new palette, logo styling may be refreshed).
- Distinctive serif display type for headings paired with a clean, readable text face; no generic system fonts.
- Minimal and calm: few borders, soft depth, clear hierarchy, large touch targets.
- Deliberately not like existing social media: no endless uniform card grids, no cluttered sidebars; each section is composed around its content.
- Fully responsive across desktop, tablet and mobile.

## Safeguards
- **Product preservation**: this is a visual transformation, not a product redesign. Unchanged: all text, wording and labels; content order where it carries meaning; images and their associations; buttons, their labels and actions; features and business logic; routes, navigation destinations and workflows; data structures and API contracts. Free to change: visual hierarchy, spacing, typography, positioning, sizing, composition and presentation.
- **Backend and configuration are read-only**: no changes to Supabase configuration, environment files, keys or credentials, database schemas, backend services, API endpoints, authentication logic or existing data-fetching functions. Nothing is regenerated or replaced.
- **Card-by-card inspection**: before any card is redesigned, its full structure is inventoried. That covers every text element, image, button, icon, metadata field, count, menu and interactive control. Cards are never treated as image-only. Each new card layout keeps every original element and interaction.
- **Controlled implementation**: no sweeping app-wide rewrite. Pages and shared components are redesigned in sequence. Before a shared component changes, every place it is used is checked. A written record of original elements and behaviours is kept and used for the final comparison.

## Acceptance criteria
The redesign is complete only when:
- Every original page and feature is still available.
- Every original content element is preserved.
- Every original interaction still works.
- All backend integrations are unchanged.
- The app works on desktop, tablet and mobile.
- The new visual design is consistent and polished.
- No functionality has been given up for visual simplicity.

## Implementation phases
- **Phase 1 (MVP, built now)**: new design system (colours, type, spacing, motion), new navigation and app shell, redesign of every page, card, modal, drawer, and loading/empty/error state. Work proceeds one page or shared component at a time, with each validated before the next. A final side-by-side comparison against the original confirms that every element and action still works on desktop, tablet and mobile.
- **Phase 2**: polish pass with shared-element transitions (for example, a card expanding into its detail page), richer journey milestone visuals, and micro-interaction refinement based on feedback.
- **Phase 3**: optional extras such as a dark theme variant and personal theme accents. These are visual only and need no backend changes.

## Assumptions
- Mood is bright and editorial overall, but People, Journeys and Posts each get their own composition rather than one magazine template.
- Logo, colours and fonts may all change. A new palette and type pairing will be chosen.
- No text, labels, order of content, routes, features or backend/Supabase files are changed. Environment variables and keys are not touched.
- The existing motion library and icon set already in the project are reused, and no new packages are added unless a font needs loading.
- No dark mode in phase 1.
- All pages get equal attention. No page is given a lighter restyle.
