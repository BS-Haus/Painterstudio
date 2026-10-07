# Painter.Studio

Redesigned website for [Painter.Studio](https://painterstudio.co.uk) — a London cinematic content studio led by cinematographer Charlie Painter.

Static site (HTML/CSS/JS, no build step), deployed on Vercel.

## Structure

- `public/index.html` — the single-page site
- `public/styles.css` — styles (black, refined Helvetica Neue / Inter Tight type)
- `public/main.js` — intro loader, reel project indicator, tile loops, video lightbox
- `public/media/` — project loops (MP4) and stills; `reel.mp4` is the hero showreel cut from every project
- `public/logos/` — client logos

## Updating work

Each project is an `<article class="tile">` in `index.html`. Set `data-provider` (`vimeo` / `youtube` / `file`) and `data-id` to the video, and the tile opens it in the lightbox.

To swap the hero for a proper showreel, export a muted 16:9 MP4 (~1600px wide, under ~6MB) and replace `public/media/reel.mp4` (+ `reel-poster.jpg`), then update the `PROJECTS` list and lengths in `main.js`.

## Local preview

```bash
npx serve public
```
- `public/thumbs/` — small frames used by the intro loader
