# OPM Afterhours

OPM Afterhours is a school project for discovering Filipino music through a dark,
cinematic listening room. It uses HTML5, CSS3, and vanilla JavaScript ES modules.
Run it with VS Code Live Server. No packages, build tools, frameworks, backend,
accounts, or database are required.

Typography uses locally available Palatino/Georgia serif headings and Segoe UI/
system sans-serif body text and controls. Metadata and small notes use larger,
readable sizing. No external font requests or font dependencies are required.

## Current milestone: Step 9

Steps 1-8 remain working. Step 9 adds artist/song Favorites, an accessible saved
items dialog, ID-only localStorage persistence, and native cross-tab synchronization.
Search, single-genre filtering, gallery arrows/mobile swipes, track switching,
cinematic video, lyrics, vinyl, and the approved typography are preserved.
The catalog still contains 10 artists, 30 slots, 29 verified titles, and one
pending selection. Only Multo has supplied playable media.
Playlists, next/previous track controls, shuffle, repeat, accounts, cloud sync,
and external music services remain out of scope. Stop after Step 9; Step 10
requires explicit client approval. No Git commits were made.

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
| js/catalog.js | Renders the artist gallery, browsed artist information, and three cards; updates active/availability states in place. |
| js/main.js | Owns artist/track state, selection and shared availability checks; supplies search callbacks and guards gallery gestures. |
| js/search.js | Owns search state, matching/filtering and safe results; shares modal exclusivity/focus with Favorites. |
| js/favorites.js | One authoritative ID-only favorites store, validation, safe persistence, subscriptions and native storage events. |
| js/favorite-controls.js | Creates separate heart buttons and updates their labels/pressed/filled state in place. |
| js/favorites-view.js | Catalog-ordered saved items, removal, availability, selection callbacks and focus restoration. |
| js/overlays.js | Shared Search/Favorites exclusivity, Tab/Escape handling and background-navigation guard. |
| tests/favorites-tests.js | Controlled storage-fixture unit tests; never edits real browser storage. |
| tests/playwright-favorites.js | Real-browser hearts, reload, native cross-tab events, focus, touch and responsive checks. |
| tests/playwright-favorites-storage.js | Controlled browser read/quota/version failures with actual Multo audio still operating. |
| js/player.js | One MP3 controller with preflight checks, cancellable track loads, preserved volume/mute, and the existing subscription API. |
| js/background-video.js | Independently switches muted decorative sources and cancels stale loads; preserves reduced motion, visibility, and fallback. |
| js/lyrics.js | Timestamp-driven lines, track resets, independent scrolling, and manual/follow mode. |
| js/header.js | Existing desktop auto-hide/pull tab and persistent mobile header behavior. |
| js/layout.js | Budgets desktop vinyl size using available height and surrounding content. |
| js/artwork.js | Versioned image loading that hides old/broken artwork and retains placeholders. |
| tests/catalog-tests.js | Browser-only schema tests; not loaded by production. |
| tests/search-tests.js | Pure matching, Unicode, genre and ordering tests. |
| tests/search-integration-tests.js | UI/reset/selection checks using actual Multo. |
| tests/playwright-search.js | Native keyboard/touch, focus containment, responsive screenshots and real-media search regression checks. |
| tests/switching-tests.js | Real-Multo browser integration tests for browsing and safe selection. |
| tests/playwright-transitions.js | Playwright-only controlled mock transitions using supplied Multo bytes, never real recordings of other songs. |

```text
assets/
  audio/multo.mp3
  videos/multo.mp4
  covers/multo.jpg
  artists/             (reserved for owner-supplied images)
```

No media was downloaded, fabricated, replaced, or extracted in Steps 6A-9. Other
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
| imageAvailable | optional boolean | Set true only after an authorized artist photo is supplied. |
| sourceUrls | HTTPS string array | Research attribution for the artist description. |

### Track schema

| Property | Type | Meaning |
| --- | --- | --- |
| id | string | Unique track or pending-slot identifier. |
| artistId | string | An existing artist's ID. |
| title | string or null | Verified title; null only for pending selection. |
| status | string | ready, ready-demo, pending-media, or pending-selection. |
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
6. Run the validation tests. Mark authorized audio ready and reload to make it a checked playback candidate.

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
alone does not prove playback availability; Step 6B checks the MP3 source before switching.

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
is not requested by the catalog UI. Set imageAvailable: true after supplying the authorized artist image; reservations
otherwise display Photo pending without making unnecessary missing-file requests.

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
Cards contain native buttons. Missing audio or pending selections are disabled and
clearly labeled. Available choices are enabled with visible focus states and an
aria-pressed active indicator. The player looks up the active card duration node
afresh, because browsing replaces the card list. Artist rendering never changes media; main.js coordinates track selection.

## Artist browsing and track switching (Step 6B)

Use the left and right page-edge artist arrows to browse the ten artists in the
verified first-half 2026 order. Previous/next arrows wrap at either end. The artist name appears in the
information section below; there is no duplicate top label or counter. Native buttons support mouse, touch, Enter,
and Space; Left/Right arrow keys also move through artists when the gallery has focus. The artist name, biography, photo or placeholder, genres, source
attribution, and three featured cards update without navigation or refresh.

Two independent IDs live in main.js:

- selectedArtistId identifies the artist currently being browsed.
- activeTrackId identifies the song committed to the MP3 controller.

On mobile (600px and narrower), the page-edge buttons are hidden and the side
spacing returns to the normal mobile gutter. Swipe left on a non-control area to
browse the next artist; swipe right for the previous artist. A small hint appears
with the artist information. Vertical gestures still scroll the page/lyrics;
sliders, buttons, links, pinch gestures, and browser-edge gestures are excluded.
The focusable artist section also supports Left/Right keys for keyboard users.
Touch navigation requires at least 60px of clearly horizontal movement and never
changes the active song. Playwright touch-input checks passed left/right browsing,
vertical-scroll protection, hidden mobile buttons, and continued actual MP3 playback.

Browsing Arthur Nery while listening to Multo changes only catalog information.
The listening title, vinyl, lyrics, and video stay with Multo. Selecting a
playable track makes its owner the selected artist and updates the listening
experience. Selecting the active track does not restart it or toggle playback.

Availability has separate meanings:

- pending-selection: no chosen title; a disabled Selection pending card.
- pending-media: a verified title with reserved paths; disabled Audio unavailable.
- ready / ready-demo: the owner has supplied audio. A HEAD check runs when its
  artist is rendered; Checking audio changes to available or unavailable.
- A new selection checks again before replacing the existing audio. Missing HTTP
  files, inaccessible sources, and timed-out checks leave the current song intact.
- HTTP 405/501 permits a native load attempt on servers that cannot handle HEAD.
  HEAD success proves availability, not a valid codec. A decoding/playback failure
  after commit leaves the selected player stopped with a nonintrusive error.

Do not mark reserved paths ready to make them look playable. To add a real song,
supply its authorized MP3, set status to ready, verify audioSrc, and reload. The
catalog page will check it. The same source can still fail later if it is removed.
The availability display is cached during the session; a reload refreshes it after
owners add or repair files.

Optional video, cover, and lyrics are independent of playable audio. Provide an
authorized MP4 in backgroundVideoSrc, artwork in coverArt, and timestamped lyrics
in lyrics. Use null video/cover paths and an empty lyric array when unprovided.
A ready track requires audio, not an MP4, artwork, or lyrics. An artist photo needs
imageSrc plus imageAvailable: true. Missing images retain labeled placeholders.
No audio, video, photo, or copyrighted lyric text is fetched from research sites.

loadTrack(song, { autoplay }) is the player's single loading interface. Startup
calls it without autoplay. A different playable card requests playback after the
user action. The controller checks the source, pauses old audio, clears its source,
resets time/duration/seeking/buffering, publishes the new track, and loads the new
source on the same element. Volume and mute properties are preserved. Native
playing confirms success and starts vinyl rotation; loading does not spin it.
A blocked play promise leaves the player paused with a Press Play message.

Separate request and media versions prevent old preflight checks, loading timers,
and play promises from overwriting a later selection. Aborted selections settle
without changing playback. Source/readiness checks reject obsolete native events.
One set of audio/control listeners survives every load. The player reads card
nodes dynamically, so browsing cannot leave a stale duration node reference.

On a committed track change, main.js updates song text and vinyl artwork, clears
and reloads the lyric array, resets follow mode, and changes the decorative video.
Previous lyrics and frames are hidden immediately. Artwork uses versioned image
probes so old downloads cannot reveal the wrong cover. The video has its own load
version, request cancellation, poster/dark fallback, muted looping autoplay,
reduced-motion handling, and hidden-tab pause/resume. It never observes MP3 time,
seek position, volume, or paused state. Music continues if video fails.

No scrollIntoView is used on selection. Same-artist cards are updated in place
through loading so the selected button retains focus. Cards are replaced only
when browsing another artist. Catalog feedback uses an inline polite status;
unavailable choices never open alerts or modal dialogs.

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

## Step 6A verification performed (historical)

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

## Step 6B tests performed

Current automated results:

- 28/28 catalog tests passed, including the two new rules: ready audio can omit
  video/artwork, and the optional artist-photo flag must be boolean.
- 42/42 shipped-catalog integration checks passed with actual supplied Multo
  after the gallery revision (including order and wrapping checks).
  All ten artists rendered their metadata and three slots without interrupting
  playing audio. Pending/unavailable choices were safe; active re-selection did
  not restart; active artist coherence, one audio/video, and no reload passed.
- 20/20 controlled Playwright mock transition checks passed. Test-only second-song
  URLs served the actual Multo bytes, not recordings of Tingin, Misteryoso, or
  Pagsamo. Catalog modifications existed only in the isolated test browser context.
  No mock files or new production media were added.

The controlled tests covered source/time/duration reset, preserved 31% volume and
mute, cleared/missing lyrics, missing/restored artwork and video, confirmed vinyl
rotation, seeking after switching, video independence after audio pause, cross-artist
selection, retained card focus, rapid overlapping preflight requests, active-track
re-selection canceling a pending request, HTTP-unavailable ready candidates,
autoplay refusal and manual retry, unchanged listener counts, one audio element,
no reload, and no unhandled exceptions.

Additional real-Multo regression checks passed MP3 playback and seek to 60 seconds,
the expected demo lyric, vinyl activity, video mute, reduced-motion video/vinyl
pause and resume, desktop header reveal/hide, and persistent mobile navigation.
The earlier selector keyboard check selected Arthur Nery; the gallery revision
was separately checked with Left/Right navigation, both wrap directions, all ten
artists in order, and preserved MP3 playback. Available
card buttons expose aria-pressed and a visible solid focus outline. The gallery arrows
have 44px touch targets. Separate missing-MP3, missing-MP4, and missing-cover contexts
showed safe errors/fallbacks and no unhandled JavaScript exceptions. Missing MP3
left actual video playing; missing video left audio controls ready.

Eight viewport checks passed without horizontal overflow: 1920x1080, 1440x900,
1366x768, 1280x720, 1024x640, 768x1024, 390x844, and 320x640. Typical desktop sizes
fit the page; the short 1024x640 case needs about 78px of vertical scrolling to
retain usable controls and catalog content. Tablet/mobile use natural vertical
scrolling. Normal browser console inspection reported zero errors and warnings.
Expected simulated missing-file HTTP errors in fault contexts are network failures,
not unhandled application exceptions. No full screen-reader or physical-phone
audit, all-browser audit, or actual second-song recording test was performed.

To run the actual shipped-catalog integration suite on a fresh Live Server page:

```javascript
const { runSwitchingTests } = await import('./tests/switching-tests.js');
console.table((await runSwitchingTests()).results);
```

It briefly plays supplied Multo, browses artists, and leaves audio paused.
`tests/playwright-transitions.js` is a function for the Playwright tool's code-file
runner, not a production import or npm script. It creates an isolated browser
context, supplies controlled HTTP responses, and closes the context afterwards.
It assumes the test server runs at http://127.0.0.1:5500. Both test files are
excluded from production initialization. No testing library is shipped.

As in Step 6A, real seeking was checked with a browser route supplying original
MP3 bytes with byte-range headers because the temporary Python HTTP server does
not supply reliable ranges. Live Server remains the intended local workflow.
Only Multo's audio, video, artwork, and original demo text are real supplied media;
all other multi-track availability/transition scenarios are explicitly mocked.

## Search architecture and filtering (Step 8)

Open search using the desktop header search control or the compact mobile search
icon. It opens one native dialog above the listening room with a search input,
single genre select, clear/reset actions, counts, and separate Artist/Track lists.
Unfiltered discovery shows all ten artists and thirty slots. Results scroll within
the dialog; the close button and filters remain above the scrolling content.
Desktop results use two columns; mobile results use one. There is no external API,
indexing library, debounce, routing, page reload, or new audio element.

search.js imports the existing catalog references rather than copying records.
Its only state is isOpen, query, and selectedGenre. main.js still owns
selectedArtistId and activeTrackId. Query/filter state is preserved when search
closes and reopens during the same page session; no localStorage is used.

normalizeQuery() uses canonical Unicode NFC normalization, lowercase conversion,
trimming, and repeated-whitespace collapse. Matching is case-insensitive partial
text matching, not fuzzy search, transliteration, or accent removal. An accented
character in its composed/decomposed forms matches safely; accentless spellings
are not automatically treated as the accented spelling.

Artist text matches display names and their own stored genre tags. Track text
matches titles, the owning artist name, and effective genre tags. Pending slots
match their owning artist/genres and display Selection pending, not an invented
title or a raw ID. Artist results are deduplicated and stay in verified first-half
2026 order; tracks stay in catalog order. No relevance score or song rank is added.

Genre choices are derived and deduplicated from actual artist/track tags. All genres
means no genre restriction; otherwise exactly one selected tag is matched.
Artists match their own tags. Tracks use their own nonempty tags; if those are
absent/empty, they use their associated artist's tags as explicitly required for
this milestone. No new tags are inferred or added to catalog data. Text and genre
use AND logic: a result must satisfy both. For example, query rob plus genre Pop
finds Rob Deniel and his three slots; query rob plus Rock finds no results.

Clear text removes only the query. Reset genre selects All genres while retaining
the query. Reset all clears both. Changes immediately update only search results,
not the gallery or media. Each section has its own empty message, and no overall
matches shows a short retry message with reset controls still available.

### Result selection and playback

Artist results call main.js's existing selectArtist(), close search, and focus the
artist information section. They never replace the active track, clear lyrics,
pause the video, or change vinyl playback state. Available track results call the
existing selectTrack() flow and close after a successful load, focusing Play/Pause.
Selecting an already active track follows Step 6B behavior: no restart or toggle.
A failed selection leaves the dialog open with nonintrusive feedback.

Search shares main.js's availability cache and in-flight checks. It does not create
a competing availability map or playback controller. Pending-media and unselected
slots are visible but disabled; owner-supplied ready/ready-demo candidates are
checked and become selectable only when available. The existing player rechecks
before committing a different source. A missing-file failure leaves current music
intact; failed search rows become disabled when availability becomes false.
Blocked autoplay or decode failure uses the existing player's paused/error state.
No unavailable track is loaded merely because someone searches for its title.

Result text uses textContent. Artist photos are requested only when imageAvailable
is true; covers are requested only for supplied-media candidates. All other rows
use consistent placeholders. Availability labels are associated with result buttons
through aria-describedby. Search rendering never recreates media elements or
registers additional player listeners.

### Keyboard, touch, and modal access

The dialog has a visible title, scoped ranking description, labeled semantic search
input, labeled genre select, and an obvious Close button. Opening focuses the input.
Tab/Shift+Tab wrap through enabled dialog controls; native showModal() makes the
background inert. Escape always closes, including when the input is nonempty, and
preserves the filters. Closing normally restores the invoking header/mobile button.
Artist/track selections instead focus the relevant gallery/player location without
forcing a document scroll. Inline polite status announces counts/loading/failures.

While search is open, the coordinator guards page-edge arrows, mobile swipes, and
background Left/Right navigation. Typing and genre-control keys cannot move the
gallery. Normal navigation resumes on close. The desktop header cannot hide its
search trigger during the modal session. No alerts or extra motion were introduced;
existing reduced-motion behavior remains active for video/vinyl/lyrics.

Mobile results use normal internal touch scrolling with contained overscroll.
The search input uses 16px type and controls have at least 44px touch targets.
visualViewport resize updates the dialog height budget for smaller visible space,
including software-keyboard situations; a short-height viewport was tested, but
physical iOS/Android keyboard behavior still needs device testing.

### Search testing and current results

From a fresh Live Server page, run pure tests in the browser console:

```javascript
const { runSearchTests } = await import('./tests/search-tests.js');
console.table(runSearchTests().results);
```

For integration with actual supplied Multo (briefly plays audio, then leaves it paused):

```javascript
const { runSearchIntegrationTests } = await import('./tests/search-integration-tests.js');
console.table((await runSearchIntegrationTests()).results);
```

Playwright code-file runners use tests/playwright-search.js and the existing
extended tests/playwright-transitions.js. They are test-tool scripts, not production
imports or npm dependencies. They assume the local server is at 127.0.0.1:5500.
The search runner uses actual supplied Multo with byte-range responses for seeking;
the transition runner explicitly maps other test URLs to those same bytes.
It does NOT test real recordings of the other catalog songs. Nothing is downloaded
or written into assets, and isolated browser contexts close after testing.

Performed Step 8 checks:

- 32/32 pure search/filter tests passed: discovery capacity, names/titles, case,
  partial and whitespace matching, canonical Unicode, genre derivation, explicit
  track genre precedence/fallback, AND logic, ordering, duplicates, pending slots,
  empty metadata, and empty/no-match catalogs.
- 22/22 real-Multo search integration checks passed: opening, filter resets,
  section/overall empty states, unavailable/pending choices, gallery guards,
  filter persistence, artist selection without interruption, active-track result
  selection, meaningful/restored focus, no reload, and no horizontal overflow.
- 25/25 Playwright keyboard/touch/responsive checks passed: both Tab directions,
  Escape with nonempty input, focus restoration on desktop/mobile, background
  arrows blocked during search and restored afterward, real mobile swipe protection
  and resumption, live query/genre updates, header visibility, result scrolling,
  real MP3 seeking/lyrics/vinyl, independent video, reduced motion, unchanged listener
  counts, no reload, and no normal console errors/unhandled exceptions.
- 22/22 controlled transition checks passed, including two new search-result
  switching/volume/mute checks. These multi-track tests are explicitly mocked;
  only the bytes of the already supplied Multo recording were used.
- Catalog validation remained valid: 28/28 schema tests passed. Existing gallery
  browsing/switching regression suite passed 42/42 checks with actual Multo.
- Search was checked at 320, 390, 768, 1440, and 1920px. Every dialog, search field,
  and close control fit; results scrolled independently; no horizontal overflow.
  A 390x360 short viewport also kept the close control and field usable.
- Reviewed desktop/mobile previews saved in .playwright-mcp/search-step8-1440.png
  and .playwright-mcp/search-step8-390.png. This ignored folder contains test artifacts.

Physical phones, all browsers, a full screen-reader audit, and a real second-song
recording were not tested. Search requires a modern browser with HTML dialog
support. Native volume/autoplay restrictions can still differ across browsers.

## Favorites architecture (Step 9)

Save artists using the heart beside the browsed artist's name. Save songs using
their card hearts or the heart beside the active listening title. Filled hearts
mean saved; outlined hearts mean unsaved. Labels change between Add/Remove and
aria-pressed announces the state, so color is not the only indication.

The artist heart follows selectedArtistId, while the listening heart follows
activeTrackId. Browsing Arthur Nery while Multo plays keeps these separate. Card
hearts work for verified songs even when audio is unavailable. Pending-selection
slots are disabled and cannot be favorited or stored. Card playback and heart
buttons are siblings in a noninteractive container: no buttons are nested, and
heart clicks never trigger playback.

### Storage key, schema, and one source of truth

Favorites use exactly one application key:

```text
opm-afterhours:favorites:v1
```

Its value is serialized JSON containing only catalog IDs:

```json
{
  "version": 1,
  "artistIds": ["cup-of-joe", "bini"],
  "trackIds": ["cup-of-joe-multo"]
}
```

Only IDs are stored because the existing catalog remains authoritative for names,
genres, ranks, biographies, artwork paths, and availability. Metadata is not
copied into a second catalog and can change without stale saved descriptions.
No media, lyrics, biography, playback state, identity, or search history is stored.

favorites.js owns one production in-memory state and supplies loadFavorites(),
isArtistFavorite(), isTrackFavorite(), toggleArtistFavorite(), toggleTrackFavorite(),
getFavoriteArtists(), getFavoriteTracks(), and subscribeToFavorites(). Retrieval
uses current catalog order, not favorite insertion order or invented popularity.
Subscribers receive copied ID arrays. Returned metadata is looked up from data.js.
The small createFavoritesStore() factory exists for controlled tests; the website
uses only the single store instance exported by favorites.js.

A toggle persists the complete ID-only snapshot once, then notifies views. main.js
has one delegated heart-click listener and one controls subscription. Hearts update
in place, so favorite changes do not rebuild audio or playback controls. The saved
items dialog has its own guarded rendering subscription and delegated selection
handler; it never creates a player, loads audio directly, or registers media listeners.

### Validation and recovery

Loading checks JSON root shape, schema version, array types, string IDs, duplicates,
and existing catalog entries. It removes unknown IDs and pending/unselected slots
while preserving valid entries. Missing arrays become empty. Malformed JSON or
unexpected roots recover safely to an empty v1 state. A missing version on an
otherwise recognizable ID-only record is repaired to v1; an explicit version other
than 1 is protected as unfamiliar and is not silently migrated or overwritten.

Supported corrupted data is repaired into canonical ID-only JSON when writing is
available. A missing key starts empty without an unnecessary write. Previously
saved IDs removed from the current catalog disappear after validation; raw IDs
are never shown as names. Validation of an incoming cross-tab value never echoes
repair writes back into storage.

Before every write, the store rechecks the current saved schema version. This
protects unfamiliar data introduced by another tab even before its storage event
is received. While that data remains, hearts work in memory and a subtle message
explains that existing storage is preserved. Remove the incompatible key explicitly
if you want a fresh v1 store; the application does not erase future-schema data.

Storage getters, reads, writes, and quota failures are caught. Favorites remain
usable for the current visit, with a small notice that they may not survive refresh.
The notice is a stable inline status, not a modal alert or repeated toast. The
store reports saved persistence only after setItem succeeds. Later changes retry
safely when storage becomes available and remove the session-only notice on success.
Music playback is never blocked by storage failures.

### Favorites view, selection, and clearing

The existing Favorites navigation item now opens a restrained dialog with Favorite
artists and Favorite tracks sections. It uses current metadata, placeholders,
verified first-half 2026 artist ranks, availability labels, and removal hearts.
Rows follow catalog order and have no duplicates. Empty overall/section messages
explain how to add favorites without illustrations or recommendation features.

An artist row calls the existing gallery coordinator and closes the dialog,
focusing the artist section without interrupting music. Available song rows use
the existing track-selection flow and close after success, focusing Play/Pause.
Selecting the active track preserves the existing no-restart behavior. Unavailable
tracks remain saved and visible but their playback buttons are disabled. Removal
hearts remain usable regardless of audio availability and update every matching
heart plus the list immediately. Removal preserves focus on a remaining row or Close.

To remove saved items, toggle their filled hearts in the gallery/player or use
those in Favorites. To clear all persisted Favorites manually, remove only this
key in browser developer tools and refresh the current tab:

```javascript
localStorage.removeItem('opm-afterhours:favorites:v1');
```

Do not use localStorage.clear(), because unrelated website data should remain.
Favorites are per browser/profile and per origin: a different Live Server port,
private window, or browser may have separate or temporary storage.

### Cross-tab behavior and overlays

loadFavorites() registers one native storage listener. Another same-origin tab's
setItem/removeItem changes are validated and applied to memory, then notify open
Favorites and visible hearts. A cleared key resets the in-memory list. Incoming
changes never write the same value back, preventing synchronization loops. Invalid
incoming data is sanitized; unfamiliar versions are preserved with session-only
behavior. Blocked storage access leaves the current tab's memory usable.

This is local browser synchronization, not cloud synchronization or an account.
Concurrent edits are last-write-wins snapshots; no transactional merge is added.
Refreshing loads the latest valid stored IDs, and ordinary interaction never reloads.

Search and Favorites share overlays.js: opening one closes the other through its
normal cleanup code. Search query and genre are retained. Native showModal()
blocks background interaction; shared keyboard handling traps Tab/Shift+Tab and
closes on Escape. Each dialog restores its own trigger or selection focus target.
main.js guards arrows, mobile swipes, and gallery Left/Right keys whenever either
dialog is open. Header auto-hide also waits for either modal to close.

Both dialogs keep Close visible while results scroll and account for the visible
viewport height. Hearts/removal controls have 44px touch targets. Mobile navigation
uses the existing Favorites item rather than adding another crowded header row.
No extra animation, motion, glass effect, or playback feature was introduced.

### Favorites tests performed

Pure controlled-fixture tests (no real saved data is modified):

```javascript
const { runFavoritesTests } = await import('./tests/favorites-tests.js');
console.table(runFavoritesTests().results);
```

Results: 44/44 passed, covering empty/valid storage, malformed JSON and roots,
missing/wrong arrays, duplicate/unknown/invalid IDs, pending rejection, schema
protection, read/quota exceptions, recovery on later writes, artist/track toggles,
removal, catalog ordering, ID-only serialization, a fresh store loading persisted
IDs, external updates without writes, subscriptions/unsubscribe, and copied snapshots.

Playwright code-file tests use isolated browser profiles, never production test
buttons or added npm packages:

- tests/playwright-favorites.js: 40/40 real-browser checks passed with actual Multo,
  including hearts across gallery/player/view, safe unavailable favorites, pending
  controls, no nested buttons, reload persistence, artist/active-track separation,
  removal focus, Tab/Escape, Search/Favorites exclusivity and retained filters,
  actual second-tab storage events, no echo writes, malformed/future external data,
  deletion synchronization, mobile swipe blocking/resumption, and no normal errors.
- tests/playwright-favorites-storage.js: 20/20 checks passed with explicitly
  controlled blocked-read, quota-write, and future-schema fixtures. Hearts continued
  in memory, notices were truthful, later writes recovered where allowed, unknown
  schemas remained unchanged, and actual Multo audio kept playing without exceptions.
- tests/playwright-transitions.js: 24/24 controlled transitions passed, including
  Favorites selecting a different test track, preserving volume/mute and updating
  its active heart. Mock URLs serve the existing Multo bytes, NOT real recordings
  of other songs. No new audio assets or fabricated recordings were created.
- Regression checks passed 28 catalog, 32 pure search, 22 search UI, 42 gallery,
  and 25 Playwright search/keyboard/touch/media checks. Real seeking/lyrics/vinyl,
  independent video, artwork fallback, reduced motion, search/genre behavior,
  native modal focus, and unchanged listener counts remain working.

Favorites dialogs were tested at 320, 390, 768, 1440, and 1920px with all ten
artists and 29 favoritable tracks saved. Close remained visible, lists scrolled,
hearts stayed at least 44px wide, and there was no horizontal overflow. Long artist
headings also fit with their heart at 320px. Desktop/mobile previews were captured
and reviewed at .playwright-mcp/favorites-step9-1440.png and favorites-step9-390.png.
The ignored artifact folder is not shipped as media.

Real reload persistence and cross-tab events were exercised; storage exceptions
were controlled mocks. Only Multo supplies actual recording bytes. As before,
media seek tests use byte-range responses in the test harness when the temporary
Python server lacks range support. Live Server remains the intended local workflow.
Physical phones, all browsers, private-mode persistence, a full screen-reader audit,
and an actual second-song recording were not tested.

## Known limitations and client decisions

- The publisher's list covers only the first half of 2026. A final annual list
  cannot be claimed; detailed ranking weights and tracking cutoffs are unavailable.
- Approve the featured-song selections; they are sourced project choices, not
  verified song popularity ranks. Select and verify Skusta Clee's third recording.
- Owners must supply authorized media for the other 28 selected songs, all artist
  images, and actual licensed lyrics/timings where appropriate. No copyrighted
  audio, video, photos, or lyric text was downloaded.
- All artists can be browsed, but only Multo is currently playable. Other selected
  titles have no authorized media yet. Additional playback controls and playlists
  remain outside Step 9. Real-title unavailable songs can still be favorited.
- Multo's lines are original demo text with artificial timings; entries beyond
  the MP3 duration remain unreachable. Native timeupdate can lag a boundary slightly.
- Autoplay, codecs, buffering, media volume, and motion preferences vary by browser.
- File failure recovery still requires correcting a file/path and reloading.
- No Git commit was made. Step 10 requires explicit client approval.
