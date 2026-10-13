# OPM Afterhours

OPM Afterhours is a school project celebrating Original Pilipino Music (OPM).
It uses a permanent dark theme, muted rose accents, editorial serif headings,
and a responsive listening interface built from HTML, CSS, and vanilla JavaScript.

## Current progress

**Steps 1–5.5 are complete. MP3 music and MP4 visuals operate independently.**
The MP3 is the only music source: it supplies controls, timestamps, duration,
volume, vinyl motion, and lyric synchronization. Music never autoplays or loops.
The MP4 is muted, zero-volume, looping decoration with its own controller.
Audio pausing, seeking, buffering, ending, or failing never controls the video.
Video state, time, and errors never control music. No timestamps or positions
are transferred between the media elements.

The previous YouTube integration was removed because embedding was blocked in
both automated and local testing. The revised player has no third-party API,
video IDs, iframe, global ready callback, or external media dependency.

Lyrics use original demo text and artificial test timestamps, not Multo lyrics
or official lyric timings. The vinyl uses the supplied local `multo.jpg` cover and
rotates only while MP3 playback is active. Artist biography, genres, and the
other two song cards remain demo placeholders. The selected song's
duration is read from the MP3, never hardcoded. Demo timings were preserved,
not retimed to the recording. Each next milestone requires approval.

## Technologies

- **HTML5:** Semantic structure, one primary `<audio>`, and one decorative `<video>`.
- **CSS3:** Theme, responsive layout, components, and playback-synchronized vinyl.
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
│   ├── background-video.js
│   └── lyrics.js
└── assets/
    ├── artists/
    ├── audio/
    │   └── multo.mp3
    ├── covers/
    │   └── multo.jpg
    └── videos/
        └── multo.mp4
```

The supplied MP3, MP4, and cover were preserved. The MP3 already existed in the
workspace. No audio was downloaded, generated, or extracted for this revision.
The existing `.git/` folder contains version-control metadata. The ignored
`.playwright-mcp/` folder contains verification artifacts, not website assets.
The artist folder remains empty. The developer supplied `assets/covers/multo.jpg`;
no cover artwork was downloaded or generated.

## Files and connections

| File or folder | Purpose |
| --- | --- |
| `index.html` | Defines hidden primary audio, decorative video/fallback, lyrics, vinyl, accessible music controls, and existing page sections. |
| `css/style.css` | Contains theme tokens, global styles, typography, desktop layout, components, CSS vinyl grooves, and native video sizing. |
| `css/responsive.css` | Contains laptop, tablet, and mobile adjustments, viewport-height sizing, and reduced-motion handling. Loads after `style.css`. |
| `js/main.js` | Independently initializes audio and background visuals, plus vinyl and lyrics subscriptions. |
| `js/data.js` | Exports independent audio/video paths, cover, identity, and unchanged demo lyric timings. |
| `js/player.js` | Controls only the MP3 and publishes audio time/state for controls, vinyl, and lyrics. |
| `js/background-video.js` | Controls silent visual autoplay, looping, fallback, visibility, and reduced motion independently of music. |
| `js/lyrics.js` | Renders timestamped lines, subscribes to playback time, highlights the current line, manages panel-only following, and handles missing lyrics. |
| `assets/videos/` | Holds manually supplied, authorized local video files. |
| `assets/audio/` | Holds manually supplied, authorized MP3 music files. |
| `assets/artists/` and `assets/covers/` | Reserved for future artist images and cover artwork. |

`main.js` imports `demoSong` from `data.js` and `initializePlayer` from
`player.js`. These files use native ES modules. Playback variables stay private
inside the controller; there are no application globals or inline event handlers.
`main.js` also imports `initializeLyrics` and `loadLyricsForTrack` from `lyrics.js`.
It initializes `background-video.js` separately; that module never imports the
player or subscribes to music state.

## Layout

The listening section uses a full-width, full-height decorative video background
with `object-fit: cover`. On desktop and tablet, the video is centered within
the left area; the solid charcoal backdrop behind the vinyl fades toward the
lyrics. On mobile, the video fills only the lyrics section with centered cover cropping. An isolated stacking context places the noninteractive
video and static cover fallback behind a charcoal overlay and foreground content.
Adjust `--listening-overlay-opacity` in `css/style.css` (default `0.74`) to tune
readability. The video has no controls or tab stop and is hidden from assistive
technology. Autoplay failures and reduced motion show static cover artwork.

- **Above 1000px:** Lyrics sit on the left, with a large vinyl and MP3 controls
  on the right. Volume sits beside the transport buttons.
- **Up to 1200px:** Spacing condenses for laptops.
- **Up to 1000px:** Lyrics and vinyl retain two foreground columns over the
  same background, with smaller spacing and vinyl sizing.
- **Up to 600px:** Lyrics and vinyl stack vertically over the continuous video.
  The video spans the viewport width behind the lyrics using centered
  `object-fit: cover`. Its lower edge fades into the solid dark vinyl backdrop.
  Lyrics scroll independently within a compact viewport. Transport controls
  are at least 44px across, and sliders have a 44px-high touch area.

The page can scroll on tablets, phones, unusually short windows, or when text
is enlarged. No content is hidden to force the interface into one screen.

On desktop with a mouse, the header floats above the page and hides after
2 seconds of inactivity. A small pull tab marks the hidden navigation at the top
edge; hovering, clicking, or focusing it reveals the header. Hovering or keyboard
focus keeps it visible. Mobile and touch layouts keep a persistent sticky header. A compact mobile search
button reveals the existing search field; catalog search remains unavailable in this demo.
Reduced motion disables its transition. The footer has been removed.
Desktop vinyl size adapts to screen height so typical laptop layouts fit one screen;
mobile and enlarged text can still scroll naturally.

## Add local media

1. Place an authorized MP3 at `assets/audio/multo.mp3` for actual music.
2. Place an authorized MP4 at `assets/videos/multo.mp4` for silent visuals.
3. Confirm the configuration in `js/data.js`:

```javascript
export const demoSong = Object.freeze({
  id: 'cup-of-joe-multo',
  title: 'Multo',
  artist: 'Cup of Joe',
  audioSrc: 'assets/audio/multo.mp3',
  videoSrc: 'assets/videos/multo.mp4',
  coverArt: 'assets/covers/multo.jpg',
});
```

Paths are relative to `index.html`. Use matching capitalization for static hosts.
Supply the media at those paths or update `audioSrc`/`videoSrc` and reload.
Keep the existing original `lyrics` array when editing this configuration.
Dynamic song switching is not implemented. A missing MP3 disables music with a
path-specific message; a missing MP4 displays artwork without affecting music.

Use a browser-compatible MP3 for music. For visuals, use **MP4 with H.264/AVC video**, with
metadata at the beginning of the file for quicker loading. An `.mp4` extension
alone does not guarantee compatible codecs. See the
[MDN web video codec guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Video_codecs).
The video soundtrack stays muted regardless of its encoding. No downloading,
conversion, or audio-extraction tools are part of this project.

### Artwork and visual fallback

The vinyl cover is configured by `demoSong.coverArt` in `js/data.js`. `main.js`
reveals it only after the image loads successfully, keeping an accessible labeled
placeholder if loading fails. The circular center label clips the square image
and rotates together with its parent record. Song-card artwork remains a
placeholder; updating cards or switching songs is outside this milestone.

The decorative fallback image in `index.html` uses the supplied `multo.jpg`.
It appears instead of the video when motion is disabled or visuals are unavailable.
No new poster asset or posterSrc setting is required.

## How the playback controller works

### Initialization

The primary source is one `<audio id="music-audio" preload="metadata" hidden>`.
Its source comes from `demoSong.audioSrc`. There is no automatic music playback,
looping, native audio UI, or fabricated duration; existing custom controls operate it.

`initializePlayer(song)` reuses one initialization promise. It binds each listener
once, sets the initial volume, and checks the file with an HTTP HEAD request.
HEAD checks availability without downloading a second copy. A 404 produces an
explicit instruction to add the configured MP3. Servers that do not support HEAD
can still let the audio attempt loading.

The controller assigns `audio.src` and calls `audio.load()`. Custom controls
stay disabled until `loadedmetadata`. File checks and metadata loading have
15-second timeouts so initialization cannot leave the page loading indefinitely.

### Events and controls

- **Play/pause:** The custom button calls `audio.play()` or `audio.pause()`.
  The `play`, `playing`, and `pause` events update status and the icon. The
  promise returned by `play()` is caught so a browser refusal produces a message,
  not an unhandled rejection. Recoverable refusals allow another attempt.
- **Progress:** `timeupdate` reads `audio.currentTime`; `loadedmetadata` and
  `durationchange` read `audio.duration`. The controller formats the time and
  sets the progress range maximum to the actual duration. There is no polling
  interval or independently advancing clock.
- **Seeking:** Dragging previews a position without event updates overwriting
  the slider. On release, the controller sets only `audio.currentTime`. `seeking`
  and `seeked` report the actual result. Unknown or infinite duration becomes
  zero in state, displays `--:--`, and disables seeking safely.
- **Volume:** The custom slider uses 0–100; `audio.volume` uses 0–1. The controller
  converts between them. `volumechange` also reflects native changes and mute.
  Selecting a positive volume unmutes the media.
- **Buffering:** `waiting` and `stalled` report unavailable MP3 data while
  playing. A warning appears after 20 seconds; `playing` clears the warning.
- **Ended:** `ended` updates the state and offers Play to replay. The file does
  not loop automatically.
- **Errors:** `error` distinguishes interrupted loading, network failure,
  decoding/corruption, and unsupported formats. Fatal failures pause audio and
  disable music controls. Messages use music status, never background-video status.

Previous, next, favorites, search, and navigation remain unavailable. Background
video events never enter the music controller or change its error state.

### Interface for future milestones

`getPlaybackState()` accepts no arguments and returns a copy containing:

| Property | Meaning |
| --- | --- |
| `trackId` | Current configured song ID. |
| `status` | `unstarted`, `loading`, `starting`, `playing`, `paused`, `buffering`, `seeking`, `ended`, or `error`. |
| `ready` | Whether custom controls can be used. |
| `currentTime` | Actual MP3 time in seconds. |
| `duration` | Actual finite MP3 duration in seconds, or 0 while unknown. |
| `volume` | Volume percentage, 0–100. |
| `muted` | Whether native media mute is active. |
| `seeking` | Whether the media is currently seeking. |
| `buffering` | Whether playback is waiting for video data. |
| `isActivelyPlaying` | Confirmed advancing playback with no pause, seek, buffering, ended state, or error; used for vinyl motion. |
| `selectedSong` | A copy of the selected track configuration. |
| `error` | An explanatory error string, or `null`. |

`subscribeToPlaybackState(callback)` immediately delivers a snapshot and then
delivers copies after media updates. It returns an unsubscribe function. The
vinyl uses one subscription in `main.js`; it does not add media listeners or
control playback. `lyrics.js` uses another subscription to the same controller
and compares its timestamps with `currentTime`. No second player or media
listeners are created for lyrics. Every value comes from audio, never video.

## Independent background video (Step 5.5)

`background-video.js` reads only the video path and visual DOM elements. It never
imports `player.js`, observes MP3 state, or copies timestamps. A different video
edit or intro is acceptable: its picture is atmospheric, not a synchronized performance.

The video is always muted and zero-volume, with `loop`, `playsinline`, and
`preload="metadata"`. A volumechange listener re-enforces silence. After metadata
loads, the controller attempts muted autoplay. Successful playing reveals the
picture; browser refusal, buffering, missing/unsupported video, or other errors
show static cover artwork with a visual-only message. MP3 controls stay usable.

Hidden documents and reduced-motion preferences pause visuals and show artwork.
Visible pages without reduced motion may resume silent playback if allowed.
Reduced motion at startup avoids even requesting the MP4 until motion is allowed.
Page hide/show handles returning to the document. Initialization, source loading,
and pending play attempts are guarded against duplicates. Correcting a failed
video requires reloading; blocked autoplay can be retried on a later visibility
or preference change. These actions never play, pause, or seek the MP3.

## Timestamp-synchronized lyrics (Step 5)

### Data and authorized content

Each song can have a `lyrics` array in `js/data.js`. Every entry contains a
numeric start time in seconds and the text shown for that line:

```javascript
lyrics: [
  { time: 2, text: 'Sa tahimik na daan' },
  { time: 6, text: 'May himig ang mga ilaw' },
  { time: 10, text: 'Dito muna tayo, sa pagitan ng gabi' },
]
```

The current track has 17 original demonstration lines at sample timestamps from
2 to 335 seconds. These do not correspond to the song's actual words. The panel
explicitly says **Original demo text · not Multo lyrics** and **Demo timings**.
No song lyrics were searched for, scraped, or copied.

To add authorized lyrics later, supply text that is authorized for use and
measure each line's start time against the exact local MP3 recording. Use
nonnegative seconds and readable strings. The renderer sorts a copy of the
array and ignores malformed entries; it does not modify the data file. An
empty or absent array produces **Lyrics unavailable**.

### Synchronization and lifecycle

`initializeLyrics()` binds panel controls and one playback subscription once.
`loadLyricsForTrack(trackId, lines)` clears previous nodes, resets the active
index and following mode, and loads a track's array. It can support future song
switching, but it does not select a song or control either media element.
Lyrics for a different track ID are hidden until matching data is loaded.

The active line is the latest entry whose `time` is less than or equal to the
controller's `currentTime`. Before the first timestamp, no line is active.
A simple backward scan finds the correct line after both forward and backward
seeking. Returning to zero clears the highlight because this demo starts at two
seconds. Pausing preserves the line; ending retains the final reached line.

Buffering keeps the current highlight steady. An explicit seek is allowed to
update it even while buffering. An error preserves the current line rather
than pretending the clock advances. Updates come from the existing native-media
subscription: there are no new polling timers or animation loops.

Only a changed active index updates the old/new line's class and `aria-current`.
Unchanged indexes do not scroll or rebuild the list. The lyrics region has no
live announcement for every line; it remains keyboard-accessible for reading.

### Automatic scrolling and manual following

The panel has a fixed responsive height, so changing line size does not move the
video or vinyl. Internal padding lets the first and last lines reach its center.
`panel.scrollTo()` uses panel coordinates, never `scrollIntoView()` on a lyric,
so automatic following does not scroll the webpage.

When a line changes, it is centered with smooth scrolling. A delegated
`transitionend` event makes a final centering adjustment after its font size
settles. A single ResizeObserver recenters after panel resizing. Reduced-motion
preferences disable lyric transitions and use immediate scrolling; changing the
preference also stops smooth movement without affecting music playback.

Wheel scrolling, touch scrolling, scroll keys, and scrollbar presses suspend
following and stop pending smooth scrolling. **Follow lyrics** is a keyboard-
accessible toggle with `aria-pressed`; the adjacent status distinguishes
**Following** and **Manual scrolling**. Press it to resume following the current
line. Manual mode lasts until the user resumes or a new array is loaded; no
timer fights the user's scroll position. Browser scroll anchoring is disabled
inside this panel to prevent font changes from moving manual scroll positions.

The height token is `--lyrics-panel-height` in `style.css`; the mobile override
is in `responsive.css`. Existing active/inactive typography remains 30–36px and
18px on desktop, with natural wrapping, no highlight background, and no glow.

## Playback-synchronized vinyl (Step 4)

The controller's existing audio listeners update `isActivelyPlaying`. A `play`
event alone does not start rotation: `playing` confirms playback, while advancing
`timeupdate` values can confirm resumed playback after seeking. A seek jump alone
is not treated as progression.

| Playback condition | Vinyl behavior |
| --- | --- |
| Loading, unavailable, or starting | Stationary. |
| Confirmed playing | Rotates clockwise at a constant speed. |
| Paused | Freezes at its current angle. |
| Waiting/buffering or stalled | Freezes until playback resumes. |
| Seeking | Freezes; resumes after playing or confirmed progression. |
| Ended or error | Stops. |
| Reduced-motion preference | Stays stationary while MP3 music still works. |

The subscriber toggles `.is-playing` and `.is-paused`. CSS changes only
`animation-play-state` between `running` and `paused`; the same animation remains
attached, preserving the current angle when paused and resumed. A linear
`vinyl-rotation` keyframe makes one turn every ten seconds. There is no JavaScript
rotation loop or second playback controller.

The `.vinyl-stage` wrapper clips the rotating square's transparent corners to
the visible circle. This prevents transformed bounds from causing mobile
horizontal scrolling. The cover and grooves stay centered, with no tonearm,
glow, or added decorations.

The reduced-motion media query in `css/responsive.css` pauses the animation,
including when `.is-playing` is set. It never changes music state. It also keeps
the current rotation angle when the motion preference changes.

### Change size or speed

- Change `--vinyl-rotation-duration` in `css/style.css` to adjust speed; the
  current value is `10s`. Keep a constant linear animation.
- Change `--vinyl-max-size` in `css/style.css` to adjust the maximum diameter;
  the current value is `380px`.
- The desktop `.vinyl-stage` rule in `css/responsive.css` also caps diameter by
  column width and viewport height with `clamp()`. It reaches 350px at the tested
  1440×900 viewport and 380px at 1920×1080. Short laptops use a smaller diameter
  to balance the two foreground columns on shorter screens.
- Tablet and mobile size limits remain in `responsive.css`.

## Run and manually test with VS Code Live Server

1. Open `D:\opm-afterhours` in Visual Studio Code.
2. Install Live Server by Ritwick Dey if needed.
3. Right-click `index.html` and choose **Open with Live Server**.
4. Wait for music readiness and MP3 duration. Music stays paused; silent video
   may already be playing. Reduced motion displays artwork instead.
5. Press Play, hear the MP3, and watch its progress, vinyl, and demo lyric updates.
   Pause music and confirm that the video continues independently.
6. Seek music to 60 seconds, then ten. Check the clock and lyrics; the visual
   must not jump to either music position.
7. Adjust volume, including zero volume. Only the MP3 should be audible.
8. Test seeking and volume with keyboard arrow keys. Video has no controls.
9. Resize to desktop and mobile widths and check visibility and wrapping.
10. Temporarily change `audioSrc` or `videoSrc` to a missing path and reload.
    Check independent error handling, then restore the configuration. Keep files intact.
11. Play and pause to inspect vinyl motion. It should freeze at the same angle,
    and seeking should pause rotation until active playback resumes.
12. Enable reduced motion in the operating system or browser's developer tools:
    video and vinyl should become stationary while music remains usable.
13. Watch the demo lyrics change at two and six seconds. Seek to ten, sixty,
    and 225 seconds and check the corresponding highlighted line. Seek to zero
    and confirm that no line is active.
14. Scroll inside the lyrics panel to enter manual mode. Press **Follow lyrics**
    to resume centering. With reduced motion enabled, scrolling should be immediate.

Use HTTP through Live Server rather than opening a `file://` URL: ES modules
and the file availability check require a local server. Live Server is a
development tool, not a dependency shipped with the website.

## Earlier milestone verification

The following Step 3–5 results describe the earlier video-driven architecture.
Current MP3/independent-video results are recorded under Step 5.5 below.

### Step 3 verification (native-video revision)

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

### Step 4 verification

Actual local-video tests through Live Server passed rotation during playing,
exact angle retention during pause, timeline continuity on resume, stationary
paused seeking, freeze/resume during active seeking, and stopping at the real
ended event. Reduced-motion emulation froze the record while actual media time
continued to advance; restoring motion kept the animation timeline.

Injected `waiting`, `playing`, and `error` events tested buffering freeze,
recovery, and error stops. A naturally occurring network-buffering interruption
was not reproduced. Fault-injected missing and invalid videos stayed stationary;
a missing cover showed the labeled placeholder without a broken image.

Repeated initialization retained one listener per media event. Subscription
tests verified immediate delivery, updates, and unsubscribe behavior. Responsive
checks at 1920×1080, 1440×900, 1366×768, 1280×720, 1024×768, 768×1024, 390×844,
and 320×640 included a 45-degree rotation to expose possible overflow. Every
tested record remained circular, centered within its column, clear of controls,
and free from horizontal scrolling. The tested desktop layouts still fit one
screen. Physical-device motion preferences and other browsers remain untested.
The final normal-playback browser run reported no JavaScript console errors.

### Step 5 verification

Actual MP4 playback changed the highlighted line at the first two demo timestamps.
Paused seeks verified all 17 exact sample boundaries, forward/backward changes,
zero reset, and the last line. Pause retention and the real ended event passed.
First/last lines were centered, and unchanged timestamp updates produced no lyric
DOM mutations. All checks used the existing controller through Live Server.

Wheel and keyboard scrolling suspended following, the follow button restored it,
and manual positions were preserved while highlights changed. Reduced-motion
emulation removed font transitions and centered immediately. Missing-array and
reload tests verified fallback, clearing, and restoration. Injected buffering
events preserved the line and recovery selected the current time; a naturally
occurring network-buffering interruption was not reproduced.

CDP listener inspection confirmed one listener per media/panel/control event
after repeated initialization. Source inspection confirmed no added lyric timers
or animation loops. Accessibility references resolved, the active line used
`aria-current`, and no lyrics live region was present.

Eight viewport checks (1920×1080 through 320×640) found no horizontal overflow,
30–36px active type on desktop, and centered lines. Document scroll position and
video/vinyl positions remained unchanged during automatic following. Desktop
and mobile screenshots were reviewed. No JavaScript console errors were reported.
Physical touch devices, all browsers, and a full screen-reader audit remain untested.

### Step 5.5 verification

Actual tests through Live Server used the existing supplied MP3 and MP4:

- MP3 metadata reported approximately 240.16 seconds (4:00); MP4 duration was
  approximately 345.21 seconds (5:45). Neither is hardcoded.
- Music did not autoplay. MP3 play/pause, progress, forward/backward seeking,
  volume/mute, and keyboard seeking/volume worked. Audio events drove vinyl
  and demo lyrics; ending audio stopped vinyl and retained the last reached line.
- The background video played muted at zero volume without native controls.
  A real loop occurred while music remained paused. Pausing and seeking music
  did not pause or seek visuals, and video volume changes were re-muted.
- Reduced-motion emulation stopped visual motion while MP3 time advanced.
  When enabled at startup, no MP4 requests were made. Turning it off resumed
  visual autoplay when allowed.
- Injected video errors left actual MP3 playback intact. Missing-video and
  invalid-video responses and blocked-autoplay simulation showed artwork while
  real audio still played. A missing MP3 left real video advancing independently.
- Injected MP3 buffering froze vinyl and retained lyrics while video advanced.
  Injected audio failure paused music without stopping visuals. Emulated document
  visibility paused/resumed visuals while audio remained playing.
- Repeated initialization left one listener per media/control event, one audio,
  and one video. There are no lyric polling timers or cross-media time transfers.
- Eight viewport checks (1920×1080 through 320×640) retained 16:9 frames,
  desktop single-screen fit, and no horizontal overflow. Normal playback had
  no JavaScript console errors; fault-injection contexts had no unhandled exceptions.

Natural network-buffering interruptions, physical device preferences, all browsers,
and a full screen-reader audit remain untested. Expected missing-file HTTP 404
logs during fault tests are network failures, not application exceptions.

## Known limitations and unfinished features

- Only Multo is configured. The other 29 tracks and dynamic switching remain future work.
- Artist information and song-card artwork remain placeholders; the supplied cover serves as the video poster.
- Search, genre filtering, favorites/localStorage, and artist navigation remain unimplemented.
- The 17 timed lines are original demo text with sample timestamps, not Multo lyrics.
- The original demo timings are not accurate to this MP3. Its roughly four-minute
  duration means entries after 240 seconds are not reached; they were not retimed.
- MP3 and MP4 deliberately run on separate clocks. A video shot need not match
  the currently heard passage, and the picture can loop after music ends.
- Muted visual autoplay and media volume behavior vary by browser and device.
- Native `timeupdate` frequency can cause a small delay near a timestamp boundary;
  synchronization follows media events, not a separate high-frequency timer.
- Codec and buffering behavior can vary by browser and device.
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
