/**
 * FILE: data.js
 * PURPOSE: Stores the Step 6A artist catalog, track slots, and verified sources.
 * RESPONSIBILITIES: Links ten artists to three tracks each and preserves Multo's
 * supplied media and original demonstration lyrics. No media is downloaded here.
 * CONNECTED FILES: catalog.js renders the initial artist; catalog-validation.js
 * checks relationships; main.js uses demoSong to preserve player compatibility.
 */

export const catalogSource = Object.freeze({
  status: 'verified-publisher-ranking',
  publisher: 'Billboard Philippines',
  title: 'SB19, BINI, Cup Of Joe, And More Named Billboard Philippines’ Top 10 Artists Of 2026 (So Far)',
  url: 'https://billboardphilippines.com/music/news/billboard-philippines-top-opm-artists-h1-2026/',
  publishedDate: '2026-07-24',
  period: 'First half of 2026',
  periodStart: '2026-01-01',
  periodEnd: '2026-06-30',
  periodBoundsNote: 'Calendar bounds for the first half; the publisher does not disclose exact chart tracking cutoffs.',
  verifiedDate: '2026-10-13',
  methodology: 'Publisher considers chart data, streaming, sales, and cultural impact; numerical weights and scoring are not published.',
});

// Research links verify metadata, not permission to copy recordings or artwork.
export const researchSources = {
  ranking: catalogSource.url,
  cupSongs: 'https://billboardphilippines.com/market/chart-beat/all-the-cup-of-joe-songs-on-the-philippines-hot-100-this-week/',
  multo: 'https://billboardphilippines.com/music/news/cup-of-joe-summon-the-ghosts-of-their-past-on-new-single-multo-release-2024/',
  cupProfile: 'https://billboardphilippines.com/market/industry-news/cup-of-joe-and-janine-tenoso-enter-billboards-philippines-songs-chart-with-tingin/',
  arthur: 'https://www.vivaartistsagency.ph/artists/arthur-nery',
  fitterkarma: 'https://billboardphilippines.com/music/news/fitterkarma-maryclaire-new-single-2026/',
  benDuyan: 'https://billboardphilippines.com/music/news/ben-and-ben-duyan-new-single-release-2026/',
  benReimagined: 'https://billboardphilippines.com/market/chart-beat/benbens-autumn-reimagined-debuts-on-the-philippines-hot-100/',
  skustaKalimutan: 'https://www.shazam.com/en-us/song/1797062667/kalimutan-ka',
  sb19: 'https://billboardphilippines.com/music/news/sb19-bini-billboard-philippines-mid-year-top-10-2026/',
  spades: 'https://billboardphilippines.com/music/news/iv-of-spades-isang-pag-ibig-unreleased-track/',
  december: 'https://billboardphilippines.com/music/news/december-avenue-to-celebrate-15th-anniversary-with-concert-this-february/',
  bini: 'https://billboardphilippines.com/music/news/bini-make-their-mark-on-vevo-studios-with-blush/',
  rob: 'https://billboardphilippines.com/media-channels/volumes/rob-deniel-on-the-stories-behind-his-biggest-hits-i-like-writing-songs-that-speak-for-my-generation/',
};

// Original presentation-demo text and artificial timings, NOT Multo's lyrics.
const multoDemoLyrics = [
    { time: 2, text: 'Sa tahimik na daan' },
    { time: 6, text: 'May himig ang mga ilaw' },
    { time: 10, text: 'Dito muna tayo, sa pagitan ng gabi' },
    { time: 16, text: 'Habang gising pa ang buwan' },
    { time: 25, text: 'May awit pang naghihintay' },
    { time: 40, text: 'Sa bintana ng umaga' },
    { time: 60, text: 'May bagong tunog na darating' },
    { time: 80, text: 'Isang hakbang, isang himig' },
    { time: 105, text: 'Dahan-dahan, huminga muna' },
    { time: 135, text: 'Pinapakinggan ang pag-uwi' },
    { time: 165, text: 'Ilagay ang pagod sa tabi' },
    { time: 195, text: 'Bawat kanto, may kuwento' },
    { time: 225, text: 'Hayaang sumabay ang hangin' },
    { time: 255, text: 'Sa mga gabing hindi nagmamadali' },
    { time: 285, text: 'May pahinga sa pagitan ng nota' },
    { time: 315, text: 'Dito nagtatagpo ang mga tunog' },
    { time: 335, text: 'Salamat sa gabing kasama ang musika' },
  ];

export const artists = [
  {
    id: "cup-of-joe", name: "Cup of Joe", rank: 1,
    biography: "Cup of Joe is a Filipino pop-alternative band based in Baguio.",
    imageSrc: 'assets/artists/cup-of-joe.jpg',
    genres: ["OPM", "Pop Alternative"],
    trackIds: ["cup-of-joe-multo", "cup-of-joe-tingin", "cup-of-joe-misteryoso"],
    sourceUrls: [researchSources.cupProfile, researchSources.ranking],
  },
  {
    id: "arthur-nery", name: "Arthur Nery", rank: 2,
    biography: "Arthur Nery is a Filipino singer and songwriter.",
    imageSrc: 'assets/artists/arthur-nery.jpg',
    genres: ["OPM"],
    trackIds: ["arthur-nery-pagsamo", "arthur-nery-higa", "arthur-nery-binhi"],
    sourceUrls: [researchSources.arthur],
  },
  {
    id: "fitterkarma", name: "fitterkarma", rank: 3,
    biography: "fitterkarma is a Filipino independent art rock band.",
    imageSrc: 'assets/artists/fitterkarma.jpg',
    genres: ["OPM", "Art Rock"],
    trackIds: ["fitterkarma-kalapastangan", "fitterkarma-pag-ibig-ay-kanibalismo-ii", "fitterkarma-maryclaire"],
    sourceUrls: [researchSources.fitterkarma],
  },
  {
    id: "ben-and-ben", name: "Ben&Ben", rank: 4,
    biography: "Ben&Ben is a Filipino folk-pop band.",
    imageSrc: 'assets/artists/ben-and-ben.jpg',
    genres: ["OPM", "Folk Pop"],
    trackIds: ["ben-and-ben-duyan", "ben-and-ben-lifetime-reimagined", "ben-and-ben-autumn-reimagined"],
    sourceUrls: [researchSources.benDuyan],
  },
  {
    id: "skusta-clee", name: "Skusta Clee", rank: 5,
    biography: "Skusta Clee is a Filipino hip-hop artist.",
    imageSrc: 'assets/artists/skusta-clee.jpg',
    genres: ["OPM", "Hip-Hop"],
    trackIds: ["skusta-clee-since-day-one", "skusta-clee-kalimutan-ka", "skusta-clee-slot-3"],
    sourceUrls: [researchSources.ranking],
  },
  {
    id: "sb19", name: "SB19", rank: 6,
    biography: "SB19 is a five-member Filipino pop group.",
    imageSrc: 'assets/artists/sb19.jpg',
    genres: ["OPM", "P-Pop"],
    trackIds: ["sb19-dam", "sb19-dungka", "sb19-visa"],
    sourceUrls: [researchSources.sb19],
  },
  {
    id: "iv-of-spades", name: "IV OF SPADES", rank: 7,
    biography: "IV OF SPADES is a Filipino indie-alternative band.",
    imageSrc: 'assets/artists/iv-of-spades.jpg',
    genres: ["OPM", "Indie Alternative"],
    trackIds: ["iv-of-spades-mundo", "iv-of-spades-aura", "iv-of-spades-kabisado"],
    sourceUrls: [researchSources.spades],
  },
  {
    id: "december-avenue", name: "December Avenue", rank: 8,
    biography: "December Avenue is a Filipino rock band.",
    imageSrc: 'assets/artists/december-avenue.jpg',
    genres: ["OPM", "Rock"],
    trackIds: ["december-avenue-bulong", "december-avenue-saksi-ang-langit", "december-avenue-huling-sandali"],
    sourceUrls: [researchSources.ranking, researchSources.december],
  },
  {
    id: "bini", name: "BINI", rank: 9,
    biography: "BINI is an eight-member Filipino pop group.",
    imageSrc: 'assets/artists/bini.jpg',
    genres: ["OPM", "P-Pop"],
    trackIds: ["bini-blush", "bini-unang-kilig", "bini-step-back"],
    sourceUrls: [researchSources.bini],
  },
  {
    id: "rob-deniel", name: "Rob Deniel", rank: 10,
    biography: "Rob Deniel is a Filipino pop singer and songwriter.",
    imageSrc: 'assets/artists/rob-deniel.jpg',
    genres: ["OPM", "Pop"],
    trackIds: ["rob-deniel-ulap", "rob-deniel-romcom", "rob-deniel-miss-miss"],
    sourceUrls: [researchSources.rob],
  },
 ];

/**
 * Prepares predictable local paths without pretending that files already exist.
 * @param {string} id Unique track ID; also the filename for future supplied media.
 * @param {string} artistId Owning artist's ID.
 * @param {string|null} title Verified title, or null for an unselected slot.
 * @param {string[]} sourceUrls Sources verifying the title and artist credit.
 * @returns {object} A nonplayable catalog entry until authorized media is supplied.
 */
function createTrack(id, artistId, title, sourceUrls = []) {
  return {
    id, artistId, title,
    status: title === null ? 'pending-selection' : 'pending-media',
    audioSrc: `assets/audio/${id}.mp3`,
    backgroundVideoSrc: `assets/videos/${id}.mp4`,
    coverArt: `assets/covers/${id}.jpg`,
    lyrics: [],
    genres: [],
    sourceUrls,
  };
}

export const tracks = [
  {
    ...createTrack('cup-of-joe-multo', 'cup-of-joe', 'Multo', [researchSources.multo]),
    status: 'ready-demo',
    audioSrc: 'assets/audio/multo.mp3',
    backgroundVideoSrc: 'assets/videos/multo.mp4',
    coverArt: 'assets/covers/multo.jpg',
    lyrics: multoDemoLyrics,
    releaseYear: 2024,
  },
  { ...createTrack("cup-of-joe-tingin", "cup-of-joe", "Tingin", [researchSources.cupSongs]), featuredArtists: ["Janine Teñoso"] },
  createTrack("cup-of-joe-misteryoso", "cup-of-joe", "Misteryoso", [researchSources.cupSongs]),
  createTrack("arthur-nery-pagsamo", "arthur-nery", "Pagsamo", [researchSources.arthur]),
  createTrack("arthur-nery-higa", "arthur-nery", "Higa", [researchSources.arthur]),
  createTrack("arthur-nery-binhi", "arthur-nery", "Binhi", [researchSources.arthur]),
  createTrack("fitterkarma-kalapastangan", "fitterkarma", "Kalapastangan", [researchSources.fitterkarma]),
  createTrack("fitterkarma-pag-ibig-ay-kanibalismo-ii", "fitterkarma", "Pag-Ibig ay Kanibalismo II", [researchSources.fitterkarma]),
  createTrack("fitterkarma-maryclaire", "fitterkarma", "maryclaire", [researchSources.fitterkarma]),
  createTrack("ben-and-ben-duyan", "ben-and-ben", "Duyan", [researchSources.benDuyan]),
  createTrack("ben-and-ben-lifetime-reimagined", "ben-and-ben", "Lifetime (Reimagined)", [researchSources.benReimagined]),
  createTrack("ben-and-ben-autumn-reimagined", "ben-and-ben", "Autumn (Reimagined)", [researchSources.benReimagined]),
  { ...createTrack("skusta-clee-since-day-one", "skusta-clee", "Since Day One", [researchSources.ranking]), featuredArtists: ["Flow G"] },
  createTrack("skusta-clee-kalimutan-ka", "skusta-clee", "Kalimutan Ka", [researchSources.skustaKalimutan]),
  createTrack("skusta-clee-slot-3", "skusta-clee", null, []),
  createTrack("sb19-dam", "sb19", "DAM", [researchSources.sb19]),
  createTrack("sb19-dungka", "sb19", "DUNGKA!", [researchSources.sb19]),
  createTrack("sb19-visa", "sb19", "VISA", [researchSources.sb19]),
  createTrack("iv-of-spades-mundo", "iv-of-spades", "Mundo", [researchSources.spades]),
  createTrack("iv-of-spades-aura", "iv-of-spades", "Aura", [researchSources.spades]),
  createTrack("iv-of-spades-kabisado", "iv-of-spades", "Kabisado", [researchSources.spades]),
  createTrack("december-avenue-bulong", "december-avenue", "Bulong", [researchSources.december]),
  createTrack("december-avenue-saksi-ang-langit", "december-avenue", "Saksi Ang Langit", [researchSources.december]),
  createTrack("december-avenue-huling-sandali", "december-avenue", "Huling Sandali", [researchSources.december]),
  createTrack("bini-blush", "bini", "Blush", [researchSources.bini]),
  createTrack("bini-unang-kilig", "bini", "Unang Kilig", [researchSources.bini]),
  createTrack("bini-step-back", "bini", "Step Back", [researchSources.bini]),
  createTrack("rob-deniel-ulap", "rob-deniel", "Ulap", [researchSources.rob]),
  createTrack("rob-deniel-romcom", "rob-deniel", "RomCom", [researchSources.rob]),
  createTrack("rob-deniel-miss-miss", "rob-deniel", "Miss Miss", [researchSources.rob]),
 ];

export const initialTrackId = 'cup-of-joe-multo';

/** @returns {object|null} Artist matching the ID, or null for unknown IDs. */
export function getArtistById(id) {
  return artists.find(artist => artist?.id === id) || null;
}

/** @returns {object|null} Track matching the ID, or null for unknown IDs. */
export function getTrackById(id) {
  return tracks.find(track => track?.id === id) || null;
}

/** @returns {object[]} Existing featured tracks in the artist's configured order. */
export function getArtistTracks(artistId) {
  const artist = getArtistById(artistId);
  const ids = Array.isArray(artist?.trackIds) ? artist.trackIds : [];
  return ids.map(getTrackById).filter(Boolean);
}

// Compatibility adapter: player.js expects artist; background-video.js expects
// videoSrc. Both derive from the catalog, so there is no second copy of the song.
const initialTrack = getTrackById(initialTrackId);
export const demoSong = Object.freeze({
  ...initialTrack,
  id: initialTrack?.id || initialTrackId,
  title: initialTrack?.title || 'Track unavailable',
  artist: getArtistById(initialTrack?.artistId)?.name || 'Artist unavailable',
  videoSrc: initialTrack?.backgroundVideoSrc || null,
  lyrics: initialTrack?.lyrics || [],
});
