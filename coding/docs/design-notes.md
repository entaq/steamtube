# Design and verification

Purpose: a child can invent a small programming language, see and edit its actual JavaScript functions, and share that language with other kids through solvable monkey-to-banana puzzles.

## Design reference

`design-concept.png` is the generated desktop concept. Its white/lavender shell, stacked editor and mapping panels, wide jungle, level ribbon, and compact mission panel guide the implementation. The user’s sketch supplies the information architecture. User steering makes the JavaScript mappings a genuine editor, with real command definitions, music, and cloning.

Tokens: background `#f7f7fc`, white panels, plum text `#292044`, violet accent `#7951dc`, pale lavender `#eee8fd`, yellow level tile and banana accents. Plus Jakarta Sans for interface text; system monospace for code. Thin borders, 8px controls, 16px panels, restrained shadows. UI icons use Lucide outline icons. Headers, controls, labels, and game state are native HTML/Canvas; the art assets contain no UI text.

Art was generated using the built-in image-generation tool, then copied into the project. No runtime image or font services are needed.

## Asset prompts

- **Concept, `design-concept.png`:** Complete landscape desktop MonkeyScript coding playground for a 10-year-old, lavender and white app chrome, readable source editor above editable command mappings on left, lush top-down jungle monkey-to-banana obstacle game on right, level ribbon and essential navigation. Friendly rounded typography, airy working product, no marketing sections.
- **Background, `../public/assets/jungle.png`:** Cozy detailed 16-bit overhead tropical jungle. Sage-green uninterrupted grassy clearing in the central 70%, lush layered tropical foliage only along the edges and corners. No characters, paths, rocks, UI, or text. Flat top-down view, no horizon.
- **Atlas, `../public/assets/sprites.png`:** Transparent 2×2 sprite atlas: top-left friendly brown monkey, top-right golden banana bunch, bottom-left mossy gray boulder, bottom-right edge-to-edge square stone paving tile. Matching cozy detailed pixel-art style, quadrant-aligned, no labels or borders.

## Comparison ledger

The browser implementation preserves the reference’s panel hierarchy, brand/nav placement, level ribbon, violet Run button, colored command tokens, jungle asset treatment, rounded canvas, mission strip, and lavender inventor banner.

Intentional differences:

- Actual puzzle geometry and sprites replace the illustrative baked scene, so movement, rocks, banana collection, and cloning are real.
- Starter code uses `move 6` in the final walk to match the actual eleven-stone route.
- JavaScript and command creation reveal additional working views required by the user’s extension request.
- Responsive layouts move the game between the code editor and language editor on narrow screens so both play and editing remain accessible.
- An avatar menu supplies project export/import for sharing the custom language.

Verification results are recorded in `../progress.md`.

## Final visual inspection

Used the Codex in-app browser for interactions and screenshots; no browser fallback was necessary. Inspected the concept and final desktop screenshot directly with view_image at the 1536×1024 reference dimensions, plus a 390px mobile full-page capture. The desktop screen was tightened after comparison so the editor, mappings, full game, mission, banner, and footer fit together.

Inspected comparison points:

1. **Layout:** header/nav, intro, level ribbon, stacked left panels and wider right jungle retain the reference hierarchy. Spacing tightened to keep the complete primary surface visible.
2. **Typography:** rounded Jakarta Sans throughout interface chrome, consistent weights and monospaced code. Function editor and API reference checked independently for legibility.
3. **Palette:** white surfaces, lavender page and banner, violet controls, yellow level/banana accents, green live/save states. No tint is applied over generated jungle art.
4. **Controls and icons:** outline icon family, Run/Step/reset/speed alignment, command-map arrows, active tabs, game sound/fullscreen buttons, hint button and level arrows checked visually.
5. **Art and state:** actual monkey, banana, rock and stone atlas objects align to game geometry. Win, clone, speech and jump behavior verified against the visible board.
6. **Responsive behavior:** mobile stacks source → game → editable language panel, with no horizontal overflow. Both navigation and code controls remain accessible.

Above-the-fold copy matches the selected direction. Intentional copy changes are the actual route’s `move 6`, extra music/clone guidance in the command panel, and live selected-level/progress text. Brand includes a final violet dot. The deliberate art/layout differences described above support the real game and editable language workflow. No known fixable layout mismatch remains; the design’s structure and visual system were faithfully checked against the working implementation.
