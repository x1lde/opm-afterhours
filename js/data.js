/**
 * FILE: data.js
 * PURPOSE: Configures the single demonstration song and original demo lyrics.
 * RESPONSIBILITIES: Stores independent audio/video paths, cover, and demo timings.
 * CONNECTED FILES: main.js passes this object to player.js. A full artist
 * catalog will be added later; lyrics.js renders this song's timestamped lines.
 */

// The MP3 alone supplies music and duration; the MP4 is a silent visual background.
// The developer supplied the local cover; no video poster is configured.
export const demoSong = Object.freeze({
  id: 'cup-of-joe-multo',
  title: 'Multo',
  artist: 'Cup of Joe',
  audioSrc: 'assets/audio/multo.mp3',
  videoSrc: 'assets/videos/multo.mp4',
  coverArt: 'assets/covers/multo.jpg',
  // Original presentation-demo text and artificial test timings, not Multo lyrics.
  // The first timestamp is after zero so the opening has no highlighted line.
  lyrics: [
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
  ],
});
