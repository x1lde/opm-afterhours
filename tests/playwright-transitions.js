/**
 * FILE: playwright-transitions.js
 * PURPOSE: Controlled-mock switching checks for the Playwright browser tool.
 * RESPONSIBILITIES: Serves the supplied Multo bytes under test-only URLs; this
 * does NOT claim these are recordings of the other catalog songs. No fixtures
 * are written or downloaded. Run through browser_run_code_unsafe filename.
 */
async (page) => {
  const results = [];
  let phase = "setup";
  const check = (name, passed) => results.push({ name, passed: Boolean(passed) });
  const context = await page.context().browser().newContext({ viewport: { width: 1440, height: 900 } });
  const test = await context.newPage();
  const exceptions = [];
  test.on('pageerror', error => exceptions.push(error.message));
  const bytes = await (await page.request.get('http://127.0.0.1:5500/assets/audio/multo.mp3')).body();
  await context.addInitScript(() => {
    window.listenerCounts = {};
    const original = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(type, ...args) {
      if (this.id) {
        const key = this.id + ':' + type;
        window.listenerCounts[key] = (window.listenerCounts[key] || 0) + 1;
      }
      return original.call(this, type, ...args);
    };
  });
  await test.route('**/js/data.js', async route => {
    const response = await route.fetch();
    const body = await response.text();
    await route.fulfill({ response, body: body + `
      Object.assign(getTrackById('cup-of-joe-tingin'), {
        status: 'ready', audioSrc: 'assets/audio/mock-tingin.mp3',
        backgroundVideoSrc: null, coverArt: null, lyrics: []
      });
      Object.assign(getTrackById('cup-of-joe-misteryoso'), {
        status: 'ready', audioSrc: 'assets/audio/mock-misteryoso.mp3',
        backgroundVideoSrc: 'assets/videos/multo.mp4',
        coverArt: 'assets/covers/multo.jpg', lyrics: tracks[0].lyrics
      });
      Object.assign(getTrackById('arthur-nery-pagsamo'), {
        status: 'ready', audioSrc: 'assets/audio/mock-arthur.mp3',
        backgroundVideoSrc: 'assets/videos/mock-missing.mp4',
        coverArt: 'assets/covers/mock-missing.jpg', lyrics: []
      });
      Object.assign(getTrackById('arthur-nery-higa'), {
        status: 'ready', audioSrc: 'assets/audio/mock-missing.mp3'
      });
    ` });
  });
  await test.route('**/assets/audio/*.mp3', async route => {
    const request = route.request();
    const path = request.url();
    if (path.includes('mock-missing')) return route.fulfill({ status: 404, body: '' });
    if (request.method() === 'HEAD') {
      if (path.includes('mock-tingin')) await new Promise(resolve => setTimeout(resolve, 150));
      return route.fulfill({ status: 200, headers: { 'content-type': 'audio/mpeg', 'content-length': String(bytes.length) }, body: '' });
    }
    const match = request.headers().range?.match(/bytes=(\d+)-(\d*)/);
    const start = match ? Number(match[1]) : 0;
    const end = match?.[2] ? Math.min(Number(match[2]), bytes.length - 1) : bytes.length - 1;
    await route.fulfill({ status: match ? 206 : 200, headers: {
      'content-type': 'audio/mpeg', 'accept-ranges': 'bytes',
      'content-length': String(end - start + 1),
      ...(match ? { 'content-range': `bytes ${start}-${end}/${bytes.length}` } : {}),
    }, body: bytes.subarray(start, end + 1) });
  });
  await test.route('**/assets/videos/mock-missing.mp4', route => route.fulfill({ status: 404, body: '' }));
  await test.route('**/assets/covers/mock-missing.jpg', route => route.fulfill({ status: 404, body: '' }));
  try {
    await test.goto('http://127.0.0.1:5500/index.html');
    await test.waitForFunction(() => !document.querySelector('#play-pause').disabled);
    await test.waitForFunction(() => !document.querySelector('button[data-track-id="cup-of-joe-tingin"]').disabled);
    await test.evaluate(async () => {
      const player = await import('./js/player.js');
      window.transitions = [];
      player.subscribeToPlaybackState(state => window.transitions.push({ id: state.trackId, status: state.status, time: state.currentTime, duration: state.duration }));
      const audio = document.querySelector('audio');
      audio.volume = 0.31;
      audio.muted = true;
    });
    await test.locator('#play-pause').click();
    await test.waitForFunction(() => document.querySelector('audio').currentTime > 0.2);
    const listeners = await test.evaluate(() => JSON.stringify(window.listenerCounts));
    phase = "switch to mock Tingin";
    await test.locator('button[data-track-id="cup-of-joe-tingin"]').click();
    await test.waitForFunction(() => document.querySelector('#song-heading').textContent === 'Tingin' && !document.querySelector('audio').paused && document.querySelector('audio').currentTime > 0.1);
    const first = await test.evaluate(async () => ({
      state: (await import('./js/main.js')).getApplicationState(),
      volume: document.querySelector('audio').volume, muted: document.querySelector('audio').muted,
      lyrics: document.querySelectorAll('#lyric-lines li').length,
      lyricsFallback: !document.querySelector('#lyrics-fallback').hidden,
      artworkFallback: !document.querySelector('#vinyl-artwork-placeholder').hidden,
      videoCleared: !document.querySelector('video').getAttribute('src') && document.querySelector('video').hidden,
      vinyl: document.querySelector('.vinyl').classList.contains('is-playing'),
      title: document.querySelector('#song-heading').textContent,
      reset: window.transitions.some(s => s.id === 'cup-of-joe-tingin' && s.status === 'loading' && s.time === 0 && s.duration === 0),
    }));
    check('Mock second track commits with coherent metadata', first.state.activeTrackId === 'cup-of-joe-tingin' && first.state.selectedArtistId === 'cup-of-joe' && first.title === 'Tingin');
    check('Switch resets time and duration before new metadata', first.reset);
    check('Volume and mute survive switching', first.volume === 0.31 && first.muted);
    check('Old lyrics clear and missing lyrics show fallback', first.lyrics === 0 && first.lyricsFallback);
    check('Missing artwork and video use fallbacks', first.artworkFallback && first.videoCleared);
    check('Vinyl follows new confirmed MP3 playback', first.vinyl);
    await test.evaluate(() => {
      const progress = document.querySelector('#playback-progress');
      progress.value = '60'; progress.dispatchEvent(new Event('change'));
    });
    await test.waitForFunction(() => document.querySelector('audio').currentTime >= 60);
    check('Seeking works on the switched source', true);
    phase = "switch to mock Misteryoso";
    await test.locator('button[data-track-id="cup-of-joe-misteryoso"]').click();
    await test.waitForFunction(() => document.querySelector('#song-heading').textContent === 'Misteryoso' && document.querySelector('audio').currentTime > 0.1);
    phase = "wait for switched video";
    await test.waitForFunction(() => !document.querySelector('video').hidden);
    check('Mock next track restores only its own lyrics/video/artwork', await test.evaluate(() => document.querySelectorAll('#lyric-lines li').length === 17 && !document.querySelector('video').paused && document.querySelector('video').muted && !document.querySelector('#vinyl-artwork').hidden));
    const videoBefore = await test.locator('video').evaluate(el => el.currentTime);
    await test.locator('#play-pause').click();
    await test.waitForTimeout(150);
    check('Pausing switched MP3 leaves video advancing', await test.locator('video').evaluate((el, before) => el.currentTime > before, videoBefore));
    await test.evaluate(async () => {
      const main = await import('./js/main.js');
      const slow = main.selectTrack('cup-of-joe-tingin');
      const fast = main.selectTrack('cup-of-joe-multo');
      await Promise.all([slow, fast]);
    });
    check('Rapid overlapping selections commit only latest track', await test.evaluate(async () => (await import('./js/main.js')).getApplicationState().activeTrackId === 'cup-of-joe-multo'));
    await test.evaluate(async () => {
      const main = await import('./js/main.js');
      const slow = main.selectTrack('cup-of-joe-tingin');
      await main.selectTrack('cup-of-joe-multo');
      await slow;
    });
    check('Re-selecting active song cancels a slow pending switch', await test.evaluate(async () => (await import('./js/main.js')).getApplicationState().activeTrackId === 'cup-of-joe-multo'));
    const unavailable = await test.evaluate(async () => {
      const main = await import('./js/main.js');
      const before = document.querySelector('audio').currentTime;
      await main.selectTrack('arthur-nery-higa');
      return main.getApplicationState().activeTrackId === 'cup-of-joe-multo' && document.querySelector('audio').currentTime >= before;
    });
    check('Ready-looking but missing audio never replaces current track', unavailable);
    await test.evaluate(async () => {
      const original = HTMLMediaElement.prototype.play;
      HTMLMediaElement.prototype.play = function() {
        return this.tagName === 'AUDIO' ? Promise.reject(new DOMException('Controlled autoplay refusal', 'NotAllowedError')) : original.call(this);
      };
      window.restorePlay = () => HTMLMediaElement.prototype.play = original;
      await (await import('./js/main.js')).selectTrack('cup-of-joe-tingin');
    });
    await test.waitForFunction(() => !document.querySelector('#play-pause').disabled);
    check('Mock autoplay rejection leaves paused controls and useful message', await test.evaluate(() => document.querySelector('audio').paused && document.querySelector('#player-status').textContent.includes('blocked') && document.querySelector('#play-pause').getAttribute('aria-label').startsWith('Play')));
    await test.evaluate(() => window.restorePlay());
    await test.locator('#play-pause').click();
    await test.waitForFunction(() => document.querySelector('audio').currentTime > 0.1);
    check('Play retries after blocked automatic playback', true);
    await test.locator('#next-artist').click();
    await test.waitForFunction(() => !document.querySelector('button[data-track-id="arthur-nery-pagsamo"]').disabled);
    await test.locator('button[data-track-id="arthur-nery-pagsamo"]').click();
    await test.waitForFunction(() => document.querySelector('#song-heading').textContent === 'Pagsamo' && document.querySelector('audio').currentTime > 0.2);
    check('Cross-artist selection keeps active artist and title coherent', await test.evaluate(async () => {
      const state = (await import('./js/main.js')).getApplicationState();
      return state.selectedArtistId === 'arthur-nery' && state.activeTrackId === 'arthur-nery-pagsamo' && document.querySelector('#song-artist').textContent === 'Arthur Nery';
    }));
    check('Selected card retains keyboard focus after same-artist track commit', await test.locator('button[data-track-id="arthur-nery-pagsamo"]').evaluate(el => el === document.activeElement));
    check('Supplied but missing video/artwork cannot stop MP3', await test.evaluate(() => !document.querySelector('audio').paused && document.querySelector('video').hidden && !document.querySelector('#vinyl-artwork-placeholder').hidden));
    // Search selection is a controlled second-recording transition, not real Tingin.
    await test.mouse.move(720, 8);
    await test.locator('#desktop-search-toggle').click();
    await test.locator('#catalog-search-query').fill('Tingin');
    await test.waitForFunction(() => !document.querySelector('[data-result-type="track"][data-result-id="cup-of-joe-tingin"]').disabled);
    await test.locator('[data-result-type="track"][data-result-id="cup-of-joe-tingin"]').click();
    await test.waitForFunction(() => !document.querySelector('#search-dialog').open && document.querySelector('#song-heading').textContent === 'Tingin' && document.querySelector('audio').currentTime > 0.1);
    check('Search mock track result uses existing switch and closes on success', await test.evaluate(async () => {
      const state = (await import('./js/main.js')).getApplicationState();
      return state.activeTrackId === 'cup-of-joe-tingin' && state.selectedArtistId === 'cup-of-joe' && document.activeElement.id === 'play-pause';
    }));
    check('Search mock switch preserves volume and mute', await test.evaluate(() => document.querySelector('audio').volume === 0.31 && document.querySelector('audio').muted));
    // Favorite playback also uses the same mocked-recording selection flow.
    await test.evaluate(async () => (await import('./js/favorites.js')).toggleTrackFavorite('cup-of-joe-misteryoso'));
    await test.mouse.move(720, 8);
    await test.locator('#favorites-toggle').click();
    await test.waitForFunction(() => !document.querySelector('[data-favorite-result-id="cup-of-joe-misteryoso"]').disabled);
    await test.locator('[data-favorite-result-id="cup-of-joe-misteryoso"]').click();
    await test.waitForFunction(() => !document.querySelector('#favorites-dialog').open && document.querySelector('#song-heading').textContent === 'Misteryoso' && document.querySelector('audio').currentTime > 0.1);
    check('Favorite mock track loads through existing coordinator and closes', await test.evaluate(async () => (await import('./js/main.js')).getApplicationState().activeTrackId === 'cup-of-joe-misteryoso' && document.activeElement.id === 'play-pause'));
    check('Favorite mock switch preserves volume/mute and updates active heart', await test.evaluate(() => document.querySelector('audio').volume === 0.31 && document.querySelector('audio').muted && document.querySelector('#active-track-favorite').getAttribute('aria-pressed') === 'true'));
    check('Switches add no media/control listeners', await test.evaluate(before => JSON.stringify(window.listenerCounts) === before, listeners));
    check('Only one audio element and no page reload', await test.evaluate(() => document.querySelectorAll('audio').length === 1 && performance.getEntriesByType('navigation').length === 1));
    check('No unhandled JavaScript exceptions', exceptions.length === 0);
    return { mode: 'CONTROLLED MOCKS: all mock audio URLs serve the same supplied Multo bytes', passed: results.filter(r => r.passed).length, failed: results.filter(r => !r.passed).length, results, exceptions, first };
  } catch (error) {
    return {phase, error: error.message, results, exceptions, debug: await test.evaluate(() => ({
      title: document.querySelector('#song-heading')?.textContent,
      status: document.querySelector('#player-status')?.textContent,
      audio: {src: document.querySelector('audio')?.src, ready: document.querySelector('audio')?.readyState},
      video: {hidden: document.querySelector('video')?.hidden},
    }))};
  } finally {
    await context.close();
  }
}
