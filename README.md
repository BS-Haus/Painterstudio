# Painter.Studio

Redesigned website for [Painter.Studio](https://painterstudio.co.uk) — a London cinematic content studio led by cinematographer Charlie Painter.

Static site (HTML/CSS/JS, no build step), deployed on Vercel.

## Structure

- `public/index.html` — the single-page site
- `public/styles.css` — styles (black, Anton display type, Instrument Serif accents)
- `public/main.js` — hero montage captions, scroll reveals, work filters, video lightbox
- `public/media/` — project loops (MP4) and stills; `montage.mp4` is the hero showreel
- `public/logos/` — client logos

## Updating work

Each project is an `<article class="tile">` in `index.html`. Set `data-provider` (`vimeo` / `youtube` / `file`) and `data-id` to the video, and the tile opens it in the lightbox.

To swap the hero for a proper showreel, export a muted 16:9 MP4 (~1600px wide, under ~6MB) and replace `public/media/montage.mp4` (+ `montage-poster.jpg`), then update the `chapters` timings in `main.js`.

## Local preview

```bash
npx serve public
```
