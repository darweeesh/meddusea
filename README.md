# MEDUSA

Responsive React frontend with Tailwind CSS, GSAP + ScrollTrigger, Lucide icons, and original generated Medusa artwork.

## Run

Node 22+: `npm ci`, then `npm run dev`. Production: `npm run build`. Static output: `dist/`.

## Demo scope

Wallet providers are simulated. Token creation updates session-local React state and never signs or sends a transaction. Contract input validates Solana base58 syntax, then displays a clearly identified fictional sample report. No RPC, token intelligence API, or AI model is connected. All ecosystem tokens, scores, wallet distributions, activity times and verdicts are sample content. Replace these with real integrations before a public product launch. Artwork upload validates size and displays its name; it is not persisted.

## Structure

`src/main.jsx`: navigation, hero, journey, research terminal, launch form, features, ecosystem, vision, closing, wallet modal. `src/style.css`: design tokens, layouts, states and responsive rules. `public/medusa.png`: original AI-generated hero sculpture. `vite.config.js`: Vite + Tailwind integration.

## Design record

Direction: The dark room, seed 1591289461. Product fragments: True-black flat, seed 562041861. Palette and type retained from the brief's dark mythological direction. Concept: Medusa's gaze becomes the interface for token judgment. Live element: three interactive verdict states with matching sample evidence. User-requested neon, floating panels and cinematic ornament override the skill's stricter house rules where they conflict. No direction redraws.

Original raster artwork created with the built-in imagegen tool: black oxidized chrome Greek Medusa bust, detailed snake crown, acid-green eyes, dark museum lighting, near-black green background, no text. No external stock imagery or footage used.

## Validation

Production build passes. Taste skill source lint: zero failures and warnings. Browser verified wallet selection and token creation/feed update. Automated screenshot inspector failed to start Chrome (Crashpad launch failure), so no claim of full 1440/768/390 inspection or final visual score is made. Manual preview identified a tablet hero overlap, which was corrected. Reduced-motion fallback and keyboard-focus states are implemented.
