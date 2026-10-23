# SteamTube

The original games are standalone HTML pages. MonkeyScript is a React/Vite app in `coding/`, published at `/coding/`.

## Build the static site

From this repository root:

```sh
npm run build
```

This installs MonkeyScript's locked dependencies, builds it with the `/coding/` base path, and creates a root `dist/` folder containing every original game page plus the compiled playground in `dist/coding/`. Publish the **contents of this root dist folder**, not the source repository or `coding/index.html`.

To check without a development server:

```sh
python3 -m http.server 8080 --directory dist
```

Open `http://localhost:8080/` for SteamTube or `http://localhost:8080/coding/` for MonkeyScript.

## Vercel

Keep the project Root Directory at this repository root. `vercel.json` selects the static build command (`npm run build`) and output directory (`dist`). The existing games retain their URLs, including `croc.html`, `brick.html`, and `sky.html`. Commit and push the source/configuration changes to trigger the next deployment; generated build output is ignored by Git.

Run MonkeyScript's checks with `npm test`. See `coding/README.md` for the language and app source guide.
