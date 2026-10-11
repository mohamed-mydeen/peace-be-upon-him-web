# Peace Be Upon Him – Website

A single-page landing website for the **Peace Be Upon Him** Android app.
Plain HTML, CSS and vanilla JavaScript. No framework, no build step, no backend.

The Android app lives in a separate repository and is **not** touched by this project:
<https://github.com/uwais12345/PeaceBeUponHim_APK>

## Project structure

```text
PeaceBeUponHim-Website/
├── index.html
├── style.css
├── script.js
├── assets/
│   ├── logo.png / logo.webp / logo-320.webp   app logo (transparent circle)
│   ├── favicon-64.png, apple-touch-icon.png
│   ├── og-image.png                           social sharing image (1200×630)
│   └── screenshots/                           put real app screenshots here
└── README.md
```

## 1. Run locally

Double-click `index.html`. That is all.
(The page loads two Google Fonts, Amiri and Figtree. Offline, it falls back to system fonts.)

## 2. Replace the logo and screenshots

**Logo:** overwrite the files in `assets/` using the same names and sizes
(`logo.webp` 640×640, `logo-320.webp` 320×320, `favicon-64.png`, `apple-touch-icon.png` 180×180, `og-image.png` 1200×630).

**Screenshots:** the App Preview section uses three real screenshots in `assets/screenshots/`
(`quran.webp`, `hadith.webp`, `dua.webp`, each 722×1600). To change or add one:

1. Save a portrait screenshot in `assets/screenshots/` (WebP or optimised PNG/JPG).
2. In the `#preview` section of `index.html`, copy an existing `<li class="phone">` block and change
   the `src`, `alt`, `width`, `height` and caption. Use the image's real pixel size so the layout does not shift.

## 3. Update the APK download link

The download button uses GitHub's "latest release" URL:

```
https://github.com/uwais12345/PeaceBeUponHim_APK/releases/latest/download/Peacebeuponhim.apk
```

- It keeps working for future releases **as long as each release uploads an asset named exactly `Peacebeuponhim.apk`**.
- To change it, search `index.html` for `Peacebeuponhim.apk` (two buttons: hero and Download section).
- When you publish a new version, update the visible version text (`1.0.1`, in the hero note and Download section)
  and the release-page link `…/releases/tag/v1.0.1`.
- Do not copy the APK into this repository.

## 4. Things to confirm before publishing

- **Privacy section:** the wording follows the privacy statement in the app's About page. Re-check it against the app.
- **Contact:** YouTube is `@peace_be_upon_him`; Instagram is the handle shown in the app's footer. No support email was found,
  so the Email card is a placeholder. In `index.html`, search for `EMAIL PLACEHOLDER` and replace it with a `mailto:` link.
- **Canonical URL and absolute OG image URL:** once the final domain is known, add
  `<link rel="canonical" href="https://your-domain/">` and change the `og:image` / `twitter:image` values to absolute URLs.
  Social platforms generally need absolute image URLs to show the preview.

## 5. Create the separate GitHub repository

This folder already has its own local Git history. To publish it, when you are ready:

```bash
cd PeaceBeUponHim-Website
# create an empty repository named PeaceBeUponHim-Website on github.com, then:
git remote add origin https://github.com/<your-username>/PeaceBeUponHim-Website.git
git branch -M main
git push -u origin main
```

## 6. Deploy

**GitHub Pages:** repository → Settings → Pages → Source: *Deploy from a branch* → Branch `main`, folder `/ (root)` → Save.
The site appears at `https://<your-username>.github.io/PeaceBeUponHim-Website/`.

**Vercel:** import the repository, set *Framework Preset* to **Other**, leave the build command and output directory empty, and deploy.

Both options serve the files exactly as they are, with no build step.
