# OPM Afterhours

OPM Afterhours is a school project for discovering Filipino music through a dark,
cinematic listening room. It uses HTML5, CSS3, and vanilla JavaScript ES modules.
Run it with VS Code Live Server. No packages, build tools, frameworks, backend,
accounts, or database are required.

## Current milestone: Step 6A

Steps 1-5.5 remain working. Step 6A adds the artist/song data architecture:
10 artists, 30 track slots, and exactly three slots per artist. Only Multo is
initialized for playback. There is no artist or track switching, catalog search,
filtering, favorites, or new playback feature. Stop here until Step 6B is approved.
The existing mobile search button only reveals the disabled demo search field.

The MP3 alone controls play/pause, seeking, duration, progress, volume, vinyl
rotation, and synchronized lyrics. The muted, zero-volume, looping MP4 remains
independent: pausing or seeking music never pauses or seeks the video.
All 17 original Multo demo lyric lines and timestamps, and its three supplied
media paths, are preserved. These are demonstration lyrics, not the song's lyrics.

## Verified ranking and scope

Original publication: [SB19, BINI, Cup Of Joe, And More Named Billboard Philippines'
Top 10 Artists Of 2026 (So Far)](https://billboardphilippines.com/music/news/billboard-philippines-top-opm-artists-h1-2026/).
Publisher: Billboard Philippines. Author: Ralph Regis. Published July 24, 2026;
verified October 13, 2026. The date was checked in the original page's
`article:published_time` and `datePublished` metadata.

This is the publisher's **first-half / mid-year 2026 ranking**, not a final
full-year ranking and not our own official chart calculation. The article considers
chart data, streaming, sales, and cultural impact. It does not publish numerical
weights, a scoring formula, or precise data-tracking cutoffs. `periodStart` and
`periodEnd` in data.js describe the calendar first half (January-June), not a claim
about undisclosed chart collection dates.

The exact publisher order matches the proposed shortlist:

| Position | Artist |
| --- | --- |
| 1 | Cup of Joe |
| 2 | Arthur Nery |
| 3 | fitterkarma |
| 4 | Ben&Ben |
| 5 | Skusta Clee |
| 6 | SB19 |
| 7 | IV OF SPADES |
| 8 | December Avenue |
| 9 | BINI |
| 10 | Rob Deniel |

The website links the source and labels its period in the existing artist section.
The linked note's tooltip includes publication details and methodology. Artist
positions come from this verified publisher list. Featured songs are project
selections, NOT ranked top-three songs and NOT restricted to 2026 releases.

## Verified song selections and metadata sources

Biographies are short original factual descriptions. No award or achievement
claims are included. Genre tags are broad descriptions supported by the sources;
OPM describes Filipino music rather than one specific musical style.
`researchSources` in data.js stores the links; `sourceUrls` identifies the sources
for each artist and selected song. Links verify metadata, not media permission.

| Artist | Three featured slots | Research supporting metadata and titles |
| --- | --- | --- |
| Cup of Joe | Multo; Tingin (feat. Janine Teñoso); Misteryoso | [Multo release](https://billboardphilippines.com/music/news/cup-of-joe-summon-the-ghosts-of-their-past-on-new-single-multo-release-2024/), [song coverage](https://billboardphilippines.com/market/chart-beat/all-the-cup-of-joe-songs-on-the-philippines-hot-100-this-week/), [band profile](https://billboardphilippines.com/market/industry-news/cup-of-joe-and-janine-tenoso-enter-billboards-philippines-songs-chart-with-tingin/) |
| Arthur Nery | Pagsamo; Higa; Binhi | [Viva Artists Agency profile](https://www.vivaartistsagency.ph/artists/arthur-nery) |
| fitterkarma | Kalapastangan; Pag-Ibig ay Kanibalismo II; maryclaire | [Band and release coverage](https://billboardphilippines.com/music/news/fitterkarma-maryclaire-new-single-2026/) |
| Ben&Ben | Duyan; Lifetime (Reimagined); Autumn (Reimagined) | [Duyan release](https://billboardphilippines.com/music/news/ben-and-ben-duyan-new-single-release-2026/), [reimagined songs](https://billboardphilippines.com/market/chart-beat/benbens-autumn-reimagined-debuts-on-the-philippines-hot-100/) |
| Skusta Clee | Since Day One (feat. Flow G); Kalimutan Ka; selection pending | [Ranking article](https://billboardphilippines.com/music/news/billboard-philippines-top-opm-artists-h1-2026/), [Kalimutan Ka recording metadata](https://www.shazam.com/en-us/song/1797062667/kalimutan-ka) |
| SB19 | DAM; DUNGKA!; VISA | [Group and song coverage](https://billboardphilippines.com/music/news/sb19-bini-billboard-philippines-mid-year-top-10-2026/) |
| IV OF SPADES | Mundo; Aura; Kabisado | [Band and recording coverage](https://billboardphilippines.com/music/news/iv-of-spades-isang-pag-ibig-unreleased-track/) |
| December Avenue | Bulong; Saksi Ang Langit; Huling Sandali | [Recording coverage](https://billboardphilippines.com/music/news/december-avenue-to-celebrate-15th-anniversary-with-concert-this-february/) and the ranking article's band description |
| BINI | Blush; Unang Kilig; Step Back | [Group and Signals tracks](https://billboardphilippines.com/music/news/bini-make-their-mark-on-vevo-studios-with-blush/) |
| Rob Deniel | Ulap; RomCom; Miss Miss | [Artist interview and song coverage](https://billboardphilippines.com/media-channels/volumes/rob-deniel-on-the-stories-behind-his-biggest-hits-i-like-writing-songs-that-speak-for-my-generation/) |

There are **29 verified titles and one pending-selection placeholder**. Skusta
Clee's third selection awaits client choice and verification; no fabricated title
is shown. Of the verified titles, Multo is `ready-demo` and 28 are `pending-media`.
Verification of a title does not mean its recording is locally available.

## Files and connections

| File | Responsibility |
| --- | --- |
| index.html | Existing audio, video, lyrics, vinyl, controls, artist section, and three cards. Contains useful initial text before JavaScript runs. |
| css/style.css | Dark theme, layers, vinyl, typography, controls, cards, artwork, and source link. |
| css/responsive.css | Approved desktop/tablet/mobile layouts and reduced-motion rules. |
| js/data.js | Artists, tracks, sources, lookup helpers, initialTrackId, and demoSong adapter. |
| js/catalog-validation.js | Pure validation plus nonfatal development warnings. |
| js/catalog.js | Renders only the initial artist and existing three cards; no selection controls or playback listeners. |
| js/main.js | Validates, renders the initial catalog, then initializes existing controllers and subscriptions. |
| js/player.js | The authoritative MP3 controller and playback subscription API. Unchanged in Step 6A. |
| js/background-video.js | Independent muted autoplay, looping, reduced motion, tab visibility, and fallback. Unchanged in Step 6A. |
| js/lyrics.js | Timestamp-driven lines, independent scrolling, manual/follow mode. Unchanged in Step 6A. |
| js/header.js | Existing desktop auto-hide/pull tab and persistent mobile header behavior. |
| js/layout.js | Budgets desktop vinyl size using available height and surrounding content. |
| tests/catalog-tests.js | Browser-only validation tests; never imported by the production entry point. |

```text
assets/
  audio/multo.mp3
  videos/multo.mp4
  covers/multo.jpg
  artists/             (reserved for owner-supplied images)
```

No media was downloaded, fabricated, replaced, or extracted in Step 6A. Other
paths are predictable reservations, not files that claim to exist. No new asset
folder is required until its authorized content is provided.

## Catalog data structure

An artist references songs through `trackIds`; each song references its owning
artist through `artistId`. IDs are stable lowercase hyphenated strings. Titles
and names are display labels, so renaming a label does not require changing an ID.
The order of `trackIds` determines card order, not chart position.

### Artist schema

| Property | Type | Meaning |
| --- | --- | --- |
| id | string | Unique artist identifier. |
| name | string | Verified display name. |
| rank | positive integer or null | Position in the verified source; null for unranked additions. |
| biography | string or null | Short paraphrase; empty/null uses a neutral UI fallback. |
| imageSrc | string or null | Expected local artist image path; not loaded in this milestone. |
| genres | string array | Broad descriptive tags; empty is allowed. |
| trackIds | three distinct strings | IDs resolving to exactly three owned tracks. |
| sourceUrls | HTTPS string array | Research attribution for the artist description. |

### Track schema

| Property | Type | Meaning |
| --- | --- | --- |
| id | string | Unique track or pending-slot identifier. |
| artistId | string | An existing artist's ID. |
| title | string or null | Verified title; null only for pending selection. |
| status | string | ready-demo, pending-media, or pending-selection. |
| audioSrc | string or null | Local assets/audio/*.mp3 path, or unprovided media. |
| backgroundVideoSrc | string or null | Local assets/videos/*.mp4 path. |
| coverArt | string or null | Local assets/covers/ image path. |
| lyrics | array | Objects with time (seconds) and text; empty means unavailable. |
| releaseYear | optional integer | Only include when verified; Multo's year is 2024. |
| genres | optional string array | Track-specific tags; empty is allowed. |
| featuredArtists | optional string array | Verified featured credits; owning artist remains unchanged. |
| sourceUrls | HTTPS string array | At least one source for each selected song. |

`createTrack()` fills predictable paths and empty lyrics. Artist entries and
explicit track calls remain in data.js so beginners can see the relationships.
`getArtistById()` and `getTrackById()` return null for unknown IDs;
`getArtistTracks()` returns an empty list for an unknown artist.

`initialTrackId` remains `cup-of-joe-multo`. `demoSong` derives from that catalog
record and supplies the existing controllers' `artist` and `videoSrc` properties.
`videoSrc` aliases `backgroundVideoSrc`; there are no duplicated source paths.
The original `initializePlayer()`, `getPlaybackState()`, and
`subscribeToPlaybackState()` APIs are preserved.

## Adding an artist or track later

1. Verify the display name and write a short sourced biography. Add research links.
2. Add an artist object with a unique ID. Use rank null unless a matching ranking
   source actually supports its position; do not extend the verified top-ten list
   by inventing positions. This milestone retains exactly the current ten artists.
3. Add exactly three track entries with that artistId. For each selected recording,
   verify its title/version and featured credits. Add a research source URL.
4. Put the three track IDs in the artist's trackIds array, in display order.
5. Use pending-selection and title null for an unchosen slot. Use pending-media
   for a verified recording whose authorized files are not supplied yet.
6. Run the validation tests. Data additions do not activate navigation or switching.

Example reserved entry:

```javascript
createTrack('artist-id-verified-song', 'artist-id', 'Verified Song Title', [sourceUrl])
```

For a slot awaiting selection:

```javascript
createTrack('artist-id-slot-3', 'artist-id', null)
```

A pending slot displays as a numbered slot with a selection-pending label, never
as a released song. Once chosen, verify it, assign its final stable track ID, update
the matching artist reference, and add the real title and source. Changing status
alone does not make playback available; Step 6A loads only Multo.

## Adding authorized media and timestamped lyrics

Provide files only when the owner has permission to use them. Reserve paths as:

- Artist photo: assets/artists/<artist-id>.jpg
- Audio: assets/audio/<track-id>.mp3
- Decorative video: assets/videos/<track-id>.mp4
- Cover: assets/covers/<track-id>.jpg

Keep Multo's existing shorter filenames unchanged. Paths are relative to index.html
and case-sensitive on many hosts. Use compatible MP3 audio and H.264 MP4 video.
Supply an authorized jpg, jpeg, png, or webp image. Do not create dummy media files.
A null path denotes unprovided media. A pending-media path is a reservation and
is not requested by the catalog UI. Artist images are stored for future use.

Edit a track's lyrics array using authorized text and real timestamps in seconds:

```javascript
lyrics: [
  { time: 2, text: 'First authorized line' },
  { time: 6.5, text: 'Next authorized line' },
]
```

Timestamps must be finite numbers, nonnegative, and strictly increasing. Use an
empty array when lyrics are unavailable; never invent timings for a real recording.
The exception already preserved here is Multo's explicitly labeled presentation
demo. Its 17 lines run from 2 to 335 seconds, beyond this roughly four-minute MP3;
the last entries cannot be reached and are not silently retimed.

## Validation and safe rendering

`validateCatalog()` collects readable errors and returns valid, errors,
artistCount, and trackCount. It accepts optional arrays for testing and does not
throw on malformed arrays or records. It checks:

- Unique nonempty artist and track IDs; valid names and selected-song titles.
- Existing artist references, exactly three distinct track references per artist,
  matching ownership, and exactly one artist reference per track.
- Expected local media folders/extensions and string-or-null paths; no traversal.
- Explicit known statuses; unselected slots must have null titles and empty lyrics.
- Numeric, nonnegative, strictly increasing lyric times and nonempty line text.
- Basic biography, rank, genre, release-year, and research-link types.

`reportCatalogValidation()` logs warnings only for invalid data. It does not stop
the working player. Successful validation does not prove that a URL is factual,
that a file exists, or that media is licensed: research and supplied assets are
separate responsibilities. The test suite asserts the milestone's 10/30 capacity.

The renderer uses textContent and creates DOM elements rather than injecting HTML.
Missing biographies use a neutral note; absent genres display no tags. Missing
covers keep labeled placeholders. A failed fallback image leaves the dark backdrop.
Cards remain plain noninteractive list items with explicit pending-media labels.
Render the initial cards BEFORE initializePlayer(), because the player retains
the selected-song-duration node. The renderer is groundwork, not a switching API.

## Running and checking the project

Open index.html with VS Code Live Server. Music starts paused; muted decorative
video may autoplay. Press Play and use the existing MP3 controls. Lyrics and vinyl
observe MP3 playback. Pause/seek the MP3 and confirm the video continues on its
own clock. Toggle reduced motion to see stationary decoration with music available.
Scroll inside the lyrics to suspend following; Follow lyrics resumes it.

To run the dependency-free catalog tests in the browser developer console:

```javascript
const { runCatalogTests } = await import('./tests/catalog-tests.js');
console.table(runCatalogTests().results);
```

This test file does not run on ordinary visits and never modifies shipped data;
malformed cases use cloned arrays. Do not add production controls to run tests.

## Step 6A verification performed

- Shipped catalog: 10 unique artists, 30 unique track/slot entries, three references
  per artist, all ownership/reference checks resolved; zero validation errors.
- All 26 catalog tests passed, including duplicate IDs, missing/foreign references,
  orphan tracks, invalid statuses/paths, unsorted and invalid timestamps, dishonest
  placeholders, missing source links, and safe absent optional metadata.
- Original demo lyric text/times were compared against the earlier Git version:
  all 17 unchanged. Existing supplied media paths were also checked unchanged.
- Playwright/Chromium used actual supplied MP3 and MP4. MP3 play/pause and forward
  seek to 60 seconds/backward seek to 6 seconds passed. Vinyl ran during confirmed
  playing and paused with audio; seeks updated the corresponding demo lyric line.
  Pausing/seeking MP3 left the muted video advancing independently.
- Repeated audio, lyrics, and video initialization retained the same registered
  listeners: one listener per media/control event on the inspected ID'd elements.
- Separate simulated missing MP3, MP4, and cover responses showed safe errors or
  placeholders. Missing MP3 did not stop real video; missing MP4/cover did not stop
  actual audio playback. No unhandled JavaScript exceptions in these fault cases.
- A missing-biography/empty-genres renderer check displayed a neutral fallback.
- Reduced-motion emulation paused video and vinyl and showed fallback artwork.
- Eight viewport checks: 1920x1080, 1440x900, 1366x768, 1280x720, 1024x640,
  768x1024, 390x844, and 320x640. Three cards remained present with no horizontal
  overflow. Typical desktop sizes fit; the short 1024x640 case used about 12px of
  vertical scrolling. Mobile/tablet retain natural document scrolling.
- 1920x972 with 125% CSS scaling fit the artist section and cards inside the page.
- Normal browser console inspection reported zero errors and warnings. Fault
  contexts had no page exceptions; simulated HTTP 404s are expected network errors.

Tests used a local temporary static HTTP server. For the seek regression, a
Playwright route served the actual unchanged MP3 bytes with HTTP byte ranges,
because Python's simple server does not support reliable ranged media seeking.
This is a test harness only; no server code or dependency was added to the project.
Live Server remains the intended workflow. These checks do not claim tests on
physical phones, every browser, or a full assistive-technology audit.

## Known limitations and client decisions

- The publisher's list covers only the first half of 2026. A final annual list
  cannot be claimed; detailed ranking weights and tracking cutoffs are unavailable.
- Approve the featured-song selections; they are sourced project choices, not
  verified song popularity ranks. Select and verify Skusta Clee's third recording.
- Owners must supply authorized media for the other 28 selected songs, all artist
  images, and actual licensed lyrics/timings where appropriate. No copyrighted
  audio, video, photos, or lyric text was downloaded.
- Only Cup of Joe/Multo is displayed and initialized. Other artists live in data
  only. Artist/track switching, search, filtering, favorites, and additional
  playback features remain outside Step 6A.
- Multo's lines are original demo text with artificial timings; entries beyond
  the MP3 duration remain unreachable. Native timeupdate can lag a boundary slightly.
- Autoplay, codecs, buffering, media volume, and motion preferences vary by browser.
- File failure recovery still requires correcting a file/path and reloading.
- No Git commit was made. Step 6B requires explicit client approval.
