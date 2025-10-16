# Block Swap — Technical & Coding Guideline

## 1. Requirements
- Runs in a browser; both on desktop and mobile; both in landscape and portrait
- Should be written in HTML5 & JavaScript (ECMAScript 6) and ESM; no TypeScript, no WebAssembly
- The entry point is a single index.html file which references one CSS for basic styling and one initial JavaScript module file (which can then import other JS modules)
- The HTML document should contain only a single canvas element which covers the entire screen; no other elements are allowed
- Should use WebGL for rendering onto the canvas; can use three.js library if needed, but not mandatory
- Should use the contents of "BlockSwap_BaseStyle.css" for styling; these are tried-and-tested settings for covering the entire screen and preventing certain gestures on mobile
- Screen layout should adapt to window resize and orientation change; the available browser area should be filled with content nicely
- Layout of the playfield and the reference image: portrait mode => above each other; landscape => next to each other
- Should have a small padding: 5% of the shorter side on all four sides
- Controls: desktop => left mouse click; mobile => tap; no dragging/swiping, just single click/tap
- Swapping mechanic: first click/tap => highlights (selects) the tile; second click/tap on the same tile => deselects the tile (removes highlight); second click/tap on a different tile => swap positions
- Should use nice animations and some visual effects even in the first MVP version; use proper easing/tweening for smooth animations

## 2. Meta tags to add in HEAD tag
<meta charset="utf-8"/>
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate"/>
<meta http-equiv="Pragma" content="no-cache"/>
<meta http-equiv="Expires" content="0"/>
<meta name="viewport" content="width=device-width, height=device-height, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"/>
<meta name="mobile-web-app-capable" content="yes"/>
<meta name="apple-mobile-web-app-capable" content="yes"/>
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/>
