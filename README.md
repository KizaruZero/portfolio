# Ardya Pusaka — Portfolio

Personal portfolio site. Static, no build step — just open `index.html` or host it anywhere.

## Structure

```
├── index.html        # markup
├── css/style.css     # all styles (light + dark theme)
├── js/main.js        # interactions, GSAP animations, 3D hero
└── README.md
```

## Run locally

```bash
# any static server, e.g:
npx serve .
# or
python3 -m http.server 8000
```

## Deploy

Drop the folder on GitHub Pages, Vercel, Netlify, or any static host. No build required.

## Stack

- Plain HTML / CSS / JS
- GSAP + ScrollTrigger (CDN) for animations
- Google Fonts: Archivo + IBM Plex Mono
