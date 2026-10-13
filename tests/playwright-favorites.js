/**
 * FILE: playwright-favorites.js
 * PURPOSE: Real-browser favorites, persistence, cross-tab, focus and responsive checks.
 * RESPONSIBILITIES: Uses actual Multo; isolated profiles protect normal saved data.
 * Storage exceptions/future versions are controlled fixtures, not normal browser behavior.
 */
async (page) => {
  const context = await page.context().browser().newContext({ viewport: { width: 1440, height: 900 } });
  const test = await context.newPage();
  const errors = [];
  const results = [];
  const check = (name, passed) => results.push({ name, passed: Boolean(passed) });
  context.on('page', p => {
    p.on('pageerror', e => errors.push(e.message));
    p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  });
  test.on('pageerror', e => errors.push(e.message));
  await context.addInitScript(() => {
    window.listenerCounts = {};
    window.documentToken = Math.random();
    window.favoriteWriteCount = 0;
    const add = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(type, ...args) {
      const id = this.id || (this === window ? 'window' : this === document ? 'document' : null);
      if (id) { const key = id + ':' + type; window.listenerCounts[key] = (window.listenerCounts[key] || 0) + 1; }
      return add.call(this, type, ...args);
    };
    const write = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) {
      if (key === 'opm-afterhours:favorites:v1') window.favoriteWriteCount++;
      return write.call(this, key, value);
    };
  });
  const bytes = await (await page.request.get('http://127.0.0.1:5500/assets/audio/multo.mp3')).body();
  await context.route('**/assets/audio/multo.mp3', async route => {
    if (route.request().method() === 'HEAD') return route.continue();
    const m = route.request().headers().range?.match(/bytes=(\d+)-(\d*)/);
    const start = m ? Number(m[1]) : 0;
    const end = m?.[2] ? Math.min(Number(m[2]), bytes.length - 1) : bytes.length - 1;
    await route.fulfill({ status: m ? 206 : 200, headers: {
      'content-type': 'audio/mpeg', 'accept-ranges': 'bytes', 'content-length': String(end - start + 1),
      ...(m ? { 'content-range': `bytes ${start}-${end}/${bytes.length}` } : {}),
    }, body: bytes.subarray(start, end + 1) });
  });
  try {
    await test.goto('http://127.0.0.1:5500/index.html');
    await test.waitForFunction(() => !document.querySelector('#play-pause').disabled);
    await test.mouse.move(720, 8);
    await test.locator('#favorites-toggle').click();
    check('Empty favorites has useful overall and section messages', await test.evaluate(() => !document.querySelector('#favorites-empty').hidden && !document.querySelector('#favorite-artists-empty').hidden && !document.querySelector('#favorite-tracks-empty').hidden));
    await test.locator('#close-favorites').click();
    await test.locator('#play-pause').click();
    await test.waitForFunction(() => document.querySelector('audio').currentTime > 0.1);
    const listeners = await test.evaluate(() => JSON.stringify(window.listenerCounts));
    const documentToken = await test.evaluate(() => window.documentToken);
    const audioBefore = await test.locator('audio').evaluate(el => el.currentTime);
    const heightBefore = await test.locator('.artist-section').evaluate(el => el.getBoundingClientRect().height);
    await test.locator('#artist-favorite').click();
    await test.locator('.song-card[data-track-id="cup-of-joe-multo"] .favorite-toggle').click();
    await test.locator('.song-card[data-track-id="cup-of-joe-tingin"] .favorite-toggle').click();
    check('Artist and song hearts immediately toggle', await test.locator('#artist-favorite').getAttribute('aria-pressed') === 'true' && await test.locator('#active-track-favorite').getAttribute('aria-pressed') === 'true');
    check('Unavailable real-title song can be saved', await test.evaluate(async () => (await import('./js/favorites.js')).isTrackFavorite('cup-of-joe-tingin')));
    check('Favorites never interrupt actual MP3 playback', await test.locator('audio').evaluate((el, before) => !el.paused && el.currentTime >= before, audioBefore));
    check('Heart changes do not shift normal artist layout', await test.locator('.artist-section').evaluate((el, before) => el.getBoundingClientRect().height === before, heightBefore));
    check('No nested buttons in playback cards', await test.locator('button button').count() === 0);
    check('Only schema version and catalog IDs stored', await test.evaluate(() => {
      const saved = JSON.parse(localStorage.getItem('opm-afterhours:favorites:v1'));
      return Object.keys(saved).join(',') === 'version,artistIds,trackIds' && saved.version === 1 && saved.trackIds.length === 2;
    }));
    await test.evaluate(async () => (await import('./js/main.js')).selectArtist('arthur-nery'));
    await test.locator('#artist-favorite').click();
    check('Artist heart targets browsed artist independently of active song', await test.evaluate(async () => {
      const state = (await import('./js/main.js')).getApplicationState();
      return state.selectedArtistId === 'arthur-nery' && state.activeTrackId === 'cup-of-joe-multo' && (await import('./js/favorites.js')).isArtistFavorite('arthur-nery');
    }));
    check('Browsing and artist favorite preserve active track heart target', await test.locator('#active-track-favorite').getAttribute('data-favorite-id') === 'cup-of-joe-multo');
    await test.locator('#artist-favorite').click();
    await test.evaluate(async () => (await import('./js/main.js')).selectArtist('skusta-clee'));
    check('Pending-selection favorite control is disabled', await test.locator('.song-card[data-track-id="skusta-clee-slot-3"] .favorite-toggle').isDisabled());
    await test.evaluate(async () => (await import('./js/main.js')).selectArtist('cup-of-joe'));
    await test.mouse.move(720, 8);
    await test.locator('#favorites-toggle').click();
    check('Favorites shows saved artist and both tracks', await test.locator('#favorite-artists li').count() === 1 && await test.locator('#favorite-tracks li').count() === 2);
    check('Unavailable favorite playback remains disabled', await test.locator('[data-favorite-result-id="cup-of-joe-tingin"]').isDisabled());
    await test.evaluate(() => document.querySelector('[data-favorite-result-id="cup-of-joe-tingin"]').click());
    check('Unavailable favorite does not imply playback changed', await test.evaluate(async () => (await import('./js/main.js')).getApplicationState().activeTrackId === 'cup-of-joe-multo' && !document.querySelector('audio').paused));
    await test.locator('#favorite-tracks .favorite-toggle[data-favorite-id="cup-of-joe-multo"]').click();
    check('Removal updates both active and featured heart states', await test.locator('#active-track-favorite').getAttribute('aria-pressed') === 'false' && await test.locator('.song-card[data-track-id="cup-of-joe-multo"] .favorite-toggle').getAttribute('aria-pressed') === 'false');
    check('Removed row disappears without focus escaping modal', await test.locator('#favorite-tracks li').count() === 1 && await test.evaluate(() => document.querySelector('#favorites-dialog').contains(document.activeElement)));
    await test.locator('#close-favorites').focus();
    await test.keyboard.press('Shift+Tab');
    check('Favorites traps reverse Tab', await test.evaluate(() => document.querySelector('#favorites-dialog').contains(document.activeElement)));
    await test.locator('#favorite-tracks .favorite-remove').last().focus();
    await test.keyboard.press('Tab');
    check('Favorites traps forward Tab', await test.evaluate(() => document.querySelector('#favorites-dialog').contains(document.activeElement)));
    await test.keyboard.press('Escape');
    check('Escape closes and restores header favorite trigger focus', await test.evaluate(() => !document.querySelector('#favorites-dialog').open && document.activeElement.id === 'favorites-toggle'));
    await test.locator('#active-track-favorite').click();
    await test.locator('#favorites-toggle').click();
    await test.locator('[data-favorite-result-type="artist"][data-favorite-result-id="cup-of-joe"]').click();
    check('Favorite artist uses coordinator and preserves playing MP3', await test.evaluate(async () => (await import('./js/main.js')).getApplicationState().selectedArtistId === 'cup-of-joe' && !document.querySelector('audio').paused && document.activeElement === document.querySelector('.artist-section')));
    await test.mouse.move(720, 8);
    await test.locator('#favorites-toggle').click();
    await test.waitForFunction(() => !document.querySelector('[data-favorite-result-id="cup-of-joe-multo"]').disabled);
    const timeBefore = await test.locator('audio').evaluate(el => el.currentTime);
    await test.locator('[data-favorite-result-id="cup-of-joe-multo"]').click();
    await test.waitForFunction(() => !document.querySelector('#favorites-dialog').open);
    check('Available favorite uses existing active-track flow without restart', await test.locator('audio').evaluate((el, before) => !el.paused && el.currentTime >= before, timeBefore));
    await test.mouse.move(720, 8);
    await test.locator('#desktop-search-toggle').click();
    await test.locator('#catalog-search-query').fill('bini');
    await test.locator('#search-genre').selectOption('P-Pop');
    await test.evaluate(async () => (await import('./js/favorites-view.js')).openFavorites());
    check('Favorites cleanly replaces Search', await test.evaluate(() => document.querySelectorAll('dialog[open]').length === 1 && !document.querySelector('#search-dialog').open));
    await test.evaluate(async () => (await import('./js/search.js')).openSearch());
    check('Search cleanly replaces Favorites and retains filters', await test.evaluate(async () => document.querySelectorAll('dialog[open]').length === 1 && !document.querySelector('#favorites-dialog').open && (await import('./js/search.js')).getSearchState().query === 'bini' && document.querySelector('#search-genre').value === 'P-Pop'));
    await test.locator('#close-search').click();
    check('Interactions do not reload document or duplicate listeners', await test.evaluate(({token, before}) => window.documentToken === token && JSON.stringify(window.listenerCounts) === before, {token: documentToken, before: listeners}));
    await test.reload();
    await test.waitForFunction(() => !document.querySelector('#play-pause').disabled);
    check('Favorites persist after actual browser reload', await test.evaluate(async () => {
      const favorites = await import('./js/favorites.js');
      return favorites.isArtistFavorite('cup-of-joe') && favorites.isTrackFavorite('cup-of-joe-multo') && favorites.isTrackFavorite('cup-of-joe-tingin');
    }));
    const second = await context.newPage();
    await second.goto('http://127.0.0.1:5500/index.html');
    await second.waitForFunction(() => !document.querySelector('#play-pause').disabled);
    await test.bringToFront();
    await test.mouse.move(720, 8);
    await test.locator('#favorites-toggle').click();
    const writeBefore = await test.evaluate(() => window.favoriteWriteCount);
    await second.evaluate(async () => (await import('./js/favorites.js')).toggleArtistFavorite('bini'));
    await test.waitForFunction(() => !!document.querySelector('[data-favorite-result-id="bini"]'));
    check('Native second-tab change updates open Favorites', await test.locator('#favorite-artists li').count() === 2);
    check('Cross-tab updates preserve catalog order', await test.locator('#favorite-artists [data-favorite-result-id]').evaluateAll(es => es.map(e => e.dataset.favoriteResultId).join(',')) === 'cup-of-joe,bini');
    check('Native storage event does not echo writes', await test.evaluate(before => window.favoriteWriteCount === before, writeBefore));
    await second.evaluate(() => localStorage.setItem('opm-afterhours:favorites:v1', '{broken'));
    await test.waitForFunction(() => !document.querySelector('#favorites-empty').hidden);
    check('Malformed external storage safely updates visible state', await test.locator('#favorite-artists li').count() === 0);
    check('Malformed external storage is not echoed or rewritten', await test.evaluate(before => window.favoriteWriteCount === before && localStorage.getItem('opm-afterhours:favorites:v1') === '{broken', writeBefore));
    await second.evaluate(() => localStorage.setItem('opm-afterhours:favorites:v1', JSON.stringify({version: 99, future: ['keep']})));
    await test.waitForFunction(() => document.querySelector('#favorites-storage-message').textContent.includes('another version'));
    await test.locator('#close-favorites').click();
    await test.locator('#artist-favorite').click();
    check('Future external schema is preserved while session hearts work', await test.evaluate(() => JSON.parse(localStorage.getItem('opm-afterhours:favorites:v1')).version === 99 && document.querySelector('#artist-favorite').getAttribute('aria-pressed') === 'true'));
    await second.evaluate(() => localStorage.removeItem('opm-afterhours:favorites:v1'));
    await test.waitForFunction(() => document.querySelector('#artist-favorite').getAttribute('aria-pressed') === 'false');
    check('Native storage-key deletion synchronizes hearts', true);
    await second.close();
    await test.evaluate(async () => {
      const data = await import('./js/data.js');
      const favorites = await import('./js/favorites.js');
      for (const artist of data.artists) if (!favorites.isArtistFavorite(artist.id)) favorites.toggleArtistFavorite(artist.id);
      for (const track of data.tracks) if (track.status !== 'pending-selection' && !favorites.isTrackFavorite(track.id)) favorites.toggleTrackFavorite(track.id);
    });
    await test.mouse.move(720, 8);
    await test.locator('#favorites-toggle').click();
    const layouts = [];
    for (const width of [320, 390, 768, 1440, 1920]) {
      await test.setViewportSize({width, height: width <= 390 ? 844 : 900});
      await test.waitForTimeout(50);
      const layout = await test.evaluate(() => {
        const modal = document.querySelector('#favorites-dialog').getBoundingClientRect();
        const close = document.querySelector('#close-favorites').getBoundingClientRect();
        const scroller = document.querySelector('.favorites-results');
        return {width: innerWidth, overflow: document.documentElement.scrollWidth > innerWidth,
          modalFits: modal.left >= 0 && modal.right <= innerWidth && modal.bottom <= innerHeight,
          closeVisible: close.top >= 0 && close.bottom <= innerHeight,
          scrolls: scroller.scrollHeight > scroller.clientHeight,
          heartWidth: document.querySelector('.favorite-remove').getBoundingClientRect().width};
      });
      layouts.push(layout);
      check(`Favorites fits and scrolls at ${width}px`, !layout.overflow && layout.modalFits && layout.closeVisible && layout.scrolls && layout.heartWidth >= 44);
      if (width === 390 || width === 1440) await test.screenshot({path: `.playwright-mcp/favorites-step9-${width}.png`, fullPage: false});
    }
    await test.setViewportSize({width:390, height:844});
    const touch = await context.newCDPSession(test);
    async function swipe(x1,y1,x2,y2) {
      await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:x1,y:y1}]});
      for(let i=1;i<=5;i++) await touch.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x1+(x2-x1)*i/5,y:y1+(y2-y1)*i/5}]});
      await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    }
    await swipe(300,420,100,420);
    check('Mobile swipe cannot browse behind Favorites', await test.locator('#artist-heading').textContent() === 'Cup of Joe');
    await test.locator('#close-favorites').click();
    await test.evaluate(() => window.scrollTo(0,0));
    await swipe(300,420,100,420);
    check('Mobile gallery swipe resumes after closing Favorites', await test.locator('#artist-heading').textContent() === 'Arthur Nery');
    check('Mobile header remains visible and usable', await test.locator('#favorites-toggle').isVisible() && await test.locator('#site-header').evaluate(el => !el.classList.contains('is-hidden')));
    check('No normal console errors or unhandled exceptions', errors.length === 0);
    return {passed:results.filter(r=>r.passed).length,failed:results.filter(r=>!r.passed).length,results,layouts,errors};
  } finally { await context.close(); }
}
