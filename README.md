# OPM Afterhours

OPM Afterhours is a school project celebrating Original Pilipino Music (OPM).
It uses a permanent dark theme, muted rose accents, editorial serif headings,
and a responsive listening interface built from HTML, CSS, and vanilla JavaScript.

## Current progress

**Steps 1 and 2 are complete. Step 3 now uses native HTML5 video playback.**
The configured track is Multo by Cup of Joe, played from a local MP4. The custom
play/pause button, progress slider, timestamps, and volume work with the same
video as the native browser controls. There is no autoplay or default looping.

The previous YouTube integration was removed because embedding was blocked in
both automated and local testing. The revised player has no third-party API,
video IDs, iframe, global ready callback, or external media dependency.

Lyrics and vinyl remain static. Artist biography, genres, cover artwork, and the
other two song cards are clearly labeled demo placeholders. The selected song's
duration is read from the MP4, never hardcoded. Each next milestone requires approval.

## Technologies

- **HTML5:** Semantic page structure and one native `<video>` element.
- **CSS3:** Theme, responsive layout, components, and the stationary CSS vinyl.
- **Vanilla JavaScript (ES6+):** Native ES modules and browser media events.

No frameworks, packages, build tools, Node.js, npm, backend, or database are
required. The website runs through VS Code Live Server and can be deployed as
static files with its media assets.

## Project structure

```text
opm-afterhours/
├── index.html
├── README.md
├── css/
│   ├── style.css
│   └── responsive.css
├── js/
│   ├── main.js
│   ├── data.js
│   ├── player.js
│   └── lyrics.js
└── assets/
    ├── artists/
    ├── covers/
    └── videos/
        ├── multo.mp4
        └── Multo - Cup of Joe (Official Music Video).mp4
```

The supplied original MP4 was preserved. A copy named `multo.mp4` provides the
requested configuration path; only that copy is loaded by the website.
The existing `.git/` folder contains version-control metadata. The ignored
`.playwright-mcp/` folder contains verification artifacts, not website assets.
The artist and cover folders are currently empty.

## Files and connections

| File or folder | Purpose |
| --- | --- |
| `index.html` | Defines the header, visible native video, demo lyrics, vinyl, accessible controls, artist section, song cards, and footer. Loads both CSS files and `main.js`. |
| `css/style.css` | Contains theme tokens, global styles, typography, desktop layout, components, CSS vinyl grooves, and native video sizing. |
| `css/responsive.css` | Contains laptop, tablet, and mobile adjustments, viewport-height sizing, and reduced-motion handling. Loads after `style.css`. |
| `js/main.js` | Imports the demo song and initializes the controller once after the HTML is parsed. |
| `js/data.js` | Exports the demo track ID, title, artist, and local video path. |
| `js/player.js` | Loads the local video, connects custom controls, handles media events and errors, and exports a playback-state snapshot. |
| `js/lyrics.js` | Documented placeholder for future timestamp-based lyrics synchronization. Not imported yet. |
| `assets/videos/` | Holds manually supplied, authorized local video files. |
| `assets/artists/` and `assets/covers/` | Reserved for future artist images and cover artwork. |

`main.js` imports `demoSong` from `data.js` and `initializePlayer` from
`player.js`. These files use native ES modules. Playback variables stay private
inside the controller; there are no application globals or inline event handlers.

## Layout

The approved arrangement is preserved: video on the left, lyrics in the center,
vinyl and controls on the right, and artist information and songs below.
The native video remains visible and unobstructed inside a responsive 16:9 frame.
It uses `object-fit: contain` so the complete picture is visible. Native controls
provide a fallback and the browser's fullscreen action.

- **Above 1000px:** Three listening columns. Video and vinyl respond to viewport
  height so the complete interface fits typical laptop screens. Volume sits
  beside the custom transport buttons; artist information sits beside the cards.
- **Up to 1200px:** Spacing condenses for laptops.
- **Up to 1000px:** Video spans the first row; lyrics and vinyl share the next
  row. Navigation moves to its own row, and artist details sit above the cards.
- **Up to 600px:** Regions stack vertically, lyrics use a focusable scrolling
  area, and song cards form a list. The vinyl stays circular. Transport controls
  are at least 44px across, and sliders have a 44px-high touch area.

The page can scroll on tablets, phones, unusually short windows, or when text
is enlarged. No content is hidden to force the interface into one screen.

## Add a local video

1. Place an authorized MP4 in `assets/videos/`.
2. For the current demo, use the exact filename `multo.mp4`.
3. Confirm the configuration in `js/data.js`:

```javascript
export const demoSong = Object.freeze({
  id: 'cup-of-joe-multo',
  title: 'Multo',
  artist: 'Cup of Joe',
  videoSrc: 'assets/videos/multo.mp4',
});
```

Paths are relative to `index.html`. Use matching capitalization for static hosts.
To replace this demonstration video, supply the file at that path or update
`videoSrc` and reload. Dynamic song switching is not implemented yet.

Recommended format: **MP4 with H.264/AVC video and AAC audio**, preferably with
metadata at the beginning of the file for quicker loading. An `.mp4` extension
alone does not guarantee compatible codecs. See the
[MDN web video codec guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Video_codecs).
No video downloading or conversion tools are part of this project.

### Optional poster and artwork

There is currently no poster or cover image configured, so no missing image is
requested. The video can display its first decoded frame while paused, and the
vinyl and song cards retain their labeled artwork placeholders.

If a suitable image exists locally, add a `posterSrc` property to the song,
such as `posterSrc: 'assets/covers/multo.webp'`. Add that image file first.
The controller checks availability before setting `video.poster`. This changes
only the video poster; vinyl artwork synchronization is a later milestone.

## How the playback controller works

### Initialization

The HTML contains one `<video id="music-video">` with `controls`,
`preload="metadata"`, and `playsinline`. Its source comes from `data.js`.
No `autoplay`, `loop`, or fabricated media duration is present.

`initializePlayer(song)` reuses one initialization promise. It binds each listener
once, sets the initial volume, and checks the file with an HTTP HEAD request.
HEAD checks availability without downloading a second copy. A 404 produces an
explicit instruction to add the configured MP4. Servers that do not support HEAD
can still let the native video attempt loading.

The controller assigns `video.src` and calls `video.load()`. Custom controls
stay disabled until `loadedmetadata`. File checks and metadata loading have
15-second timeouts so initialization cannot leave the page loading indefinitely.

### Events and controls

- **Play/pause:** The custom button calls `video.play()` or `video.pause()`.
  The `play`, `playing`, and `pause` events update status and the icon. The
  promise returned by `play()` is caught so a browser refusal produces a message,
  not an unhandled rejection. Recoverable refusals allow another attempt.
- **Progress:** `timeupdate` reads `video.currentTime`; `loadedmetadata` and
  `durationchange` read `video.duration`. The controller formats the time and
  sets the progress range maximum to the actual duration. There is no polling
  interval or independently advancing clock.
- **Seeking:** Dragging previews a position without event updates overwriting
  the slider. On release, the controller sets `video.currentTime`. `seeking`
  and `seeked` report the actual result. Unknown or infinite duration becomes
  zero in state, displays `--:--`, and disables seeking safely.
- **Volume:** The custom slider uses 0–100; `video.volume` uses 0–1. The controller
  converts between them. `volumechange` also reflects native changes and mute.
  Selecting a positive volume unmutes the media.
- **Buffering:** `waiting` and `stalled` report unavailable video data while
  playing. A warning appears after 20 seconds; `playing` clears the warning.
- **Ended:** `ended` updates the state and offers Play to replay. The file does
  not loop automatically.
- **Errors:** `error` distinguishes interrupted loading, network failure,
  decoding/corruption, and unsupported formats. Fatal failures disable custom
  controls. Messages stay below the video so the player is never covered.

Previous, next, favorites, search, and navigation remain unavailable. The native
controls and custom controls operate on the same HTMLVideoElement.

### Interface for future milestones

`getPlaybackState()` accepts no arguments and returns a copy containing:

| Property | Meaning |
| --- | --- |
| `trackId` | Current configured song ID. |
| `status` | `unstarted`, `loading`, `starting`, `playing`, `paused`, `buffering`, `seeking`, `ended`, or `error`. |
| `ready` | Whether custom controls can be used. |
| `currentTime` | Actual media time in seconds. |
| `duration` | Actual finite duration in seconds, or 0 while unknown. |
| `volume` | Volume percentage, 0–100. |
| `muted` | Whether native media mute is active. |
| `seeking` | Whether the media is currently seeking. |
| `buffering` | Whether playback is waiting for video data. |
| `selectedSong` | A copy of the selected track configuration. |
| `error` | An explanatory error string, or `null`. |

Later vinyl synchronization can read actual playing/buffering state. Later
lyrics synchronization can compare line timestamps with `currentTime`, including
after seeking. Those features do not run yet. The track ID and configuration
prepare for future catalog work without adding a playlist in this milestone.

## Run and manually test with VS Code Live Server

1. Open `D:\opm-afterhours` in Visual Studio Code.
2. Install Live Server by Ritwick Dey if needed.
3. Right-click `index.html` and choose **Open with Live Server**.
4. Wait for the ready message and metadata-derived duration. Confirm no autoplay.
5. Press Play, watch the video and progress advance, then press Pause.
6. Seek using the custom slider and compare the displayed clock with the video.
7. Adjust volume. Try native play/pause, seeking, and mute and confirm that the
   custom controls reflect the changes.
8. Use the native video's fullscreen button and exit fullscreen afterward.
9. Resize to desktop and mobile widths and check visibility and wrapping.
10. To test a missing file without deleting the supplied MP4, temporarily change
    `videoSrc` to a nonexistent path, reload, and restore the configuration.

Use HTTP through Live Server rather than opening a `file://` URL: ES modules
and the file availability check require a local server. Live Server is a
development tool, not a dependency shipped with the website.

## Verification of this revision

Actual tests used the existing supplied MP4 through the running Live Server at
`http://127.0.0.1:5500/index.html`:

- Metadata loaded: 1280×720 picture, approximately 345.21 seconds (displayed 5:45).
  These values are observations, not hardcoded song data.
- Play advanced actual media time; pause stopped it and updated the button.
- Custom and native seeking updated video time and displayed progress.
- Custom volume, native volume, native mute, and unmuting stayed synchronized.
- Fullscreen entry and exit succeeded, and the real ended event updated state.
- Repeated initialization still left one video and one listener per media event.
- Native playback produced no JavaScript console errors. Vinyl and lyrics stayed static.

Fault-injection tests separately verified a simulated HTTP 404, invalid MP4
content, metadata timeout, a rejected `play()` promise, and infinite duration.
Each produced the expected message/control state with no unhandled JavaScript
exceptions. Missing-file HTTP requests may produce an expected browser network
404 log; that is different from an application exception.

Layout checks at 1280×720, 1366×768, 1440×900, 1920×1080, 768×1024, 390×844,
and 320×640 preserved 16:9 frames and circular vinyl with no horizontal overflow.
The tested desktop sizes still fit on one screen. Source checks found no obsolete
iframe API, callbacks, player instances, video IDs, or fallback links in HTML,
CSS, or JavaScript.

An initial seek test on Python's basic temporary server did not succeed because
that server did not return byte ranges. Live Server returned HTTP 206 and passed
the actual seek tests. A deployed static host should support byte-range requests
for reliable seeking. No server implementation was added to the project.

Physical mobile devices, all browsers, a full screen-reader audit, and caption
support were not tested. Current supplied assets include no caption file.

## Known limitations and unfinished features

- Only Multo is configured. The other 29 tracks and dynamic switching remain future work.
- Artwork and artist information are still placeholders; no poster is configured.
- Vinyl rotation and lyrics synchronization remain unimplemented.
- Search, genre filtering, favorites/localStorage, and artist navigation remain unimplemented.
- The current five lyric lines are original demo text, not Multo lyrics.
- Codec, volume, fullscreen, and buffering behavior can vary by browser and device.
- Large local videos increase storage and bandwidth needs on a static host.
- File errors require correcting the source/file and reloading. No retry or song-switching UI is added.
- There are no accounts, login, subscriptions, payments, backend, or database.

## Documentation conventions

Every HTML, CSS, and JavaScript file begins with its purpose, responsibilities,
and file connections. The HTML5 doctype stays before the HTML file comment.
Major HTML and CSS sections receive clear labels. Important JavaScript functions
use concise JSDoc explaining behavior, parameters, and return values.

Use descriptive names, small functions, and straightforward logic. Comments
explain non-obvious decisions rather than every line. Keep this README updated
as each approved milestone changes behavior, assets, or file connections.
