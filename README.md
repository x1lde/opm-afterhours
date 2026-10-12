# OPM Afterhours

OPM Afterhours is a school project celebrating Original Pilipino Music (OPM).
The planned website will help visitors discover Filipino artists and listen to
their featured songs in a cinematic, permanently dark interface.

## Current progress

**Step 1: Project initialization is complete.** The homepage currently displays
only the heading “OPM Afterhours” and the subtitle “a home for filipino music”.
It includes a responsive layout, reusable theme variables, and empty JavaScript
modules reserved for future development.

The music player, catalog, lyrics, vinyl, search, filters, and favorites are
**not implemented yet**. Each milestone requires approval before moving on.

## Technologies

- **HTML5:** Page content and semantic structure.
- **CSS3:** Theme, typography, layout, and future animations.
- **Vanilla JavaScript (ES6+):** Future interactions, using native ES modules.

The project needs no frameworks, build tools, Node.js, npm, third-party packages,
backend, or database. It can be served and deployed as static files.

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
    └── covers/
```

The existing `.git/` folder holds version-control metadata. An empty
`.playwright-mcp/` folder was left by browser verification; it is not part of
the website. Both asset folders are currently empty.

## How the files connect

| File or folder | Purpose and connections |
| --- | --- |
| `index.html` | Defines page metadata and the homepage introduction. Loads both stylesheets and `js/main.js`. |
| `css/style.css` | Defines theme variables, global styles, centered layout, and typography. |
| `css/responsive.css` | Loads after `style.css` and adjusts spacing on screens up to 480px wide. |
| `js/main.js` | JavaScript entry point loaded with `type="module"`. Currently contains documentation only. |
| `js/data.js` | Placeholder for artist details, songs, artwork paths, video IDs, and lyric timestamps. |
| `js/player.js` | Placeholder for the YouTube player controller and playback information. |
| `js/lyrics.js` | Placeholder for selecting and displaying the current lyric line. |
| `assets/artists/` | Reserved for artist images. |
| `assets/covers/` | Reserved for album or song artwork. |

There are currently no JavaScript imports. Later milestones will connect the
modules with explicit imports and exports. Loading a file as a module lets it
share selected values with other modules without relying on global variables.

## Run with VS Code Live Server

1. Open the `opm-afterhours` folder in Visual Studio Code.
2. Install the **Live Server** extension by Ritwick Dey if it is not installed.
3. Right-click `index.html` in the Explorer and select **Open with Live Server**.
4. View the page at the local HTTP address opened in your browser.
5. Save changes to refresh the preview. Select the port indicator in VS Code's
   status bar when you want to stop Live Server.

Use a local HTTP server rather than opening `index.html` directly with a
`file://` address, because future ES module imports need to work over HTTP.
Live Server is a development convenience; it is not included in the deployed
website. A static host can serve this same folder with `index.html` at its root.

## Planned main features

- Ten OPM artists, with three featured songs each (30 songs total).
- Visible official YouTube music video embeds and functional playback controls.
- A spinning vinyl record with the current song's artwork in its center.
- Synchronized lyrics with a larger, brighter current line.
- Artist information and featured song collections.
- Search and genre filtering.
- Favorites saved in the browser with `localStorage`.
- Responsive layouts for desktop and mobile.

The project will have no accounts, login, registration, subscriptions, payments,
backend, or database.

## Planned playback, lyrics, and vinyl behavior

These explanations describe the intended approach, not existing functionality.
They will be updated to match the implementation as features are added.

### YouTube player

`main.js` will pass the selected song's YouTube video ID to the controller in
`player.js`. The controller will initialize the YouTube IFrame Player API and
use its methods and events to control playback and track the player's state.
The video and its built-in controls will remain visible and accessible.

### Synchronized lyrics

Each lyric line will have a start time measured in seconds. `lyrics.js` will
compare those timestamps with the player's current playback time and select
the latest line whose start time has been reached. It will highlight that line
and update after seeking or changing songs so the lyrics follow actual playback.

### Spinning vinyl

A CSS rotation animation will represent the spinning record. JavaScript will
start or resume that animation when the YouTube player reports that it is
playing, and pause it when playback stops, pauses, or buffers. The center
artwork will change with the selected song. There will be no tonearm.

## Limitations and external dependencies

- The current page uses system fonts and local stylesheets. It makes no external
  font, image, or API requests.
- The YouTube IFrame Player API will be an external dependency once implemented.
  Video playback will require an internet connection and embeddable videos.
- Browser autoplay restrictions may require a user action to begin playback.
- Video availability, regional restrictions, and embedding permissions can
  affect individual songs; the site cannot control those restrictions.
- Lyric timing will depend on the accuracy of the prepared timestamps.
- Future favorites will be stored only in the current browser and website
  origin. They will not sync across devices and can disappear if browser data
  is cleared or storage is unavailable.
- Artist images and cover artwork still need to be supplied in later milestones.

## Verification so far

During Step 1, all seven HTML, CSS, and JavaScript files returned HTTP 200 from
a temporary local static server. Browser checks confirmed that all four
JavaScript files load as ES modules without errors, and that the homepage has
no horizontal overflow at the tested desktop and 320px mobile widths.
Heading and subtitle contrast measured approximately 16.48:1 and 9.38:1.

Live Server itself was not tested. These checks cover the initial scaffold,
not the planned features. The temporary verification server has been stopped.

## Code documentation conventions

Every HTML, CSS, and JavaScript file starts with a comment explaining its
purpose, responsibilities, and connections. In HTML, the document declaration
stays first, followed by the file comment.

Major HTML sections and CSS sections receive clear labels as they are added.
Important JavaScript functions will explain their behavior, parameters, and
return values with short JSDoc comments. Comments should clarify decisions and
non-obvious logic rather than repeat every line of code.

Use descriptive names, small functions, consistent formatting, and simple
approaches that students can explain. Keep this README updated whenever a
milestone changes the site's behavior, file connections, or limitations.
