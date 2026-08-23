# Emoji Lab Design

## Summary

Emoji Lab is a kid-friendly discovery game for ages 8–10. Players combine two emoji discoveries to create a new one, grow a persistent collection, chase rare results, and occasionally unlock a custom AI-generated legendary sticker.

The game will be added to the existing SteamTube static game collection and will deploy through the repository's existing Vercel Git-push workflow. Static files remain at the repository root. AI calls run only in Vercel Functions so the OpenAI API key is never exposed to the browser.

## Player Experience

The primary screen is a playful invention lab with three clear regions:

1. A collection shelf containing every unlocked discovery.
2. A central merge machine with two large drop zones and a combine control.
3. A discovery area that reveals the new emoji, name, rarity, and a short funny description.

The starter collection contains eight broad ingredients: Fire, Water, Plant, Rock, Wind, Lightning, Moon, and Heart. Players can tap an item and then a merge slot, or drag it directly. Two filled slots activate the merge machine. A short animation builds anticipation, followed by a reveal celebration.

Every successful first discovery joins the collection immediately. Repeating a known combination shows the existing result without another API call. Collection progress, known recipes, settings, and recent discoveries persist in `localStorage`. Generated sticker image blobs persist separately in IndexedDB so large images do not exceed `localStorage` limits.

The game includes:

- Search and simple category filtering for larger collections.
- Discovery count, current streak, and rarity labels.
- Contextual hints that suggest a starter pair without revealing the answer.
- Sound and motion toggles, including automatic reduced-motion support.
- A reset control behind a confirmation step.
- Responsive touch and pointer interactions.

There is no free-text prompt, chat, account, advertising, social sharing, or player-to-player communication.

## Rarity and Legendary Stickers

Text combinations are fast and inexpensive. Each new combination returns one of four rarities: common, uncommon, rare, or legendary. Rarity is influenced by the semantic surprise of the result, but the server validates and normalizes the value.

Legendary discoveries unlock a custom illustrated sticker. Sticker creation is a separate server request so ordinary combinations stay responsive and costs remain controlled. The client requests the sticker automatically once for a newly discovered legendary result and stores the returned image reference with that discovery.

If sticker creation fails or times out, the legendary result still appears with its emoji composition and can retry from the discovery detail view. The game never blocks collection progress on image generation.

## Visual Direction

The visual concept is a bright magical workshop rather than a dark industrial interface. The background uses a clean sky-blue and lavender field with a large candy-colored merge machine as the focal point. The collection shelf uses open, lightweight rows or tiles around the central machine without stacking the whole page inside nested cards.

Typography is rounded, bold, and highly legible. Controls use large touch targets, strong contrast, and short labels. The palette centers on violet, electric blue, coral, sunshine yellow, and mint. Discovery reveals use confetti, spring motion, and a soft glow whose color matches rarity. Decorative detail stays subordinate to the items and merge controls.

Emoji glyphs remain code-native and readable across device sizes. The generated legendary art uses a consistent glossy sticker style with a clean cutout and transparent background where supported.

## Architecture

### Static client

`emoji-lab.html` contains the game shell and loads focused CSS and JavaScript modules from an `emoji-lab/` directory. The implementation is framework-free to match the existing repository and keep Vercel deployment simple.

Client modules own:

- Starter data and deterministic pair-key creation.
- Collection and recipe persistence.
- Merge-slot interactions and drag/tap accessibility.
- API calls and loading, retry, and fallback states.
- Reveal animation, sound, hints, filters, and settings.

`index.html` receives one new game entry linking to `emoji-lab.html`.

### Vercel Functions

`api/combine.js` accepts two server-trusted discovery objects and returns structured JSON:

- `id`
- `name`
- `emoji`
- `description`
- `category`
- `rarity`
- `hint`

`api/legendary.js` accepts a validated legendary discovery and returns the generated sticker image as encoded image data. The client converts the response to a blob for display and IndexedDB storage instead of depending on an expiring remote URL.

Both endpoints use `process.env.OPENAI_API_KEY`. Vercel supplies this value through project environment settings. No secret is checked into Git or sent to the client.

The functions validate request size, field lengths, accepted characters, and parent item shape. They reject arbitrary prompt fields. They also normalize model output into a narrow schema and substitute a safe fallback if validation fails.

### Vercel configuration

The repository will include only the minimum Vercel configuration required for static files and Functions to coexist. The project will build directly from Git without a generated-site build step. The deployment requirement is:

1. Add `OPENAI_API_KEY` to the Vercel project environment settings.
2. Push the repository.
3. Vercel serves the static game and deploys the API functions together.

Local development uses `vercel dev` when available. The client also runs without the API and falls back gracefully for visual and basic interaction testing.

## AI Behavior and Safety

Combination generation receives only the two selected discovery names, emoji representations, and categories. The system instruction requires imaginative but age-appropriate output suitable for children ages 8–10. Results must avoid violence, weapons, drugs, sexuality, profanity, politics, personal data, brands, and frightening descriptions.

The API requests structured output. Server-side validation rejects malformed or unsuitable responses. Because the player cannot enter text, prompt injection and user-generated unsafe content are removed from the core interaction. A small local recipe set ensures the starter journey is fun even when the network or model is unavailable.

Generated sticker prompts are constructed entirely on the server from validated fields. They request a cheerful single-subject emoji sticker with no text, logos, photorealistic people, or background scene.

## Cost and Reliability Controls

- The client never calls the API for a recipe already saved on the device.
- Only a first-time legendary discovery requests an image.
- Requests use short prompts and compact structured responses.
- The UI prevents repeated clicks while a merge is in flight.
- Functions enforce method, payload, and timeout boundaries.
- Errors return a stable JSON shape without leaking provider details or secrets.
- A curated fallback recipe map covers starter combinations, with a deterministic safe fallback for unexpected outages.

V1 does not add a shared database. Recipe persistence is per browser. This avoids introducing storage credentials or deployment complexity. A shared global discovery cache can be added later if API volume warrants it.

## Error States

- Offline or combination timeout: reveal a local fallback result and explain that the lab used its backup generator.
- Invalid model response: replace it with a validated fallback result.
- Legendary image timeout: keep the discovery, show its emoji, and offer a retry.
- Corrupt local data: preserve settings when possible, reset only invalid collection data, and restore starters.
- Unsupported drag behavior: all functionality remains available through tap controls and keyboard activation.

Error copy remains short, reassuring, and actionable.

## Testing and Acceptance

Automated and browser checks cover:

- Selecting and clearing both merge slots by tap and drag.
- A successful new discovery joining the collection.
- Repeated pairs resolving from the local recipe cache.
- Pair order producing the same recipe key.
- Collection and settings surviving refresh.
- API error and offline fallback behavior.
- Legendary discovery success, image failure, and retry.
- Prevention of duplicate submissions.
- Search, filter, hint, sound, reset confirmation, and reduced-motion behavior.
- Keyboard navigation, focus visibility, accessible labels, and touch target sizes.
- Desktop and mobile layouts without clipping or horizontal overflow.
- Home-page navigation into and out of the game.

The final visual implementation will be compared against the approved concept at its native desktop size and at a phone viewport. The core merge path must work against Vercel-style local Functions before completion.

## Out of Scope for V1

- Accounts or cloud synchronization.
- Shared global discovery database.
- Leaderboards, chat, comments, or multiplayer.
- User-authored prompts or names.
- Payments or virtual currency.
- Native mobile apps.
