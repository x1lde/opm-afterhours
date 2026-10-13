/**
 * FILE: playwright-search.js
 * PURPOSE: Real-Multo browser checks for native modal focus, touch, and layouts.
 * RESPONSIBILITIES: Tests keyboard/scroll/navigation isolation and records previews.
 * CONNECTED FILES: Run with the Playwright code-file tool; not a production import.
 */
async (page) => {
  const context = await page.context().browser().newContext({ viewport: { width: 1440, height: 900 } });
  const test = await context.newPage();
  const errors = [];
  const results = [];
  const check = (name, passed) => results.push({ name, passed: Boolean(passed) });
  test.on('pageerror', error => errors.push(error.message));
  test.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
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
  const bytes = await (await page.request.get('http://127.0.0.1:5500/assets/audio/multo.mp3')).body();
  await test.route('**/assets/audio/multo.mp3', async route => {
    if (route.request().method() === 'HEAD') return route.continue();
    const match = route.request().headers().range?.match(/bytes=(\d+)-(\d*)/);
    const start = match ? Number(match[1]) : 0;
    const end = match?.[2] ? Math.min(Number(match[2]), bytes.length - 1) : bytes.length - 1;
    await route.fulfill({ status: match ? 206 : 200, headers: {
      'content-type': 'audio/mpeg', 'accept-ranges': 'bytes', 'content-length': String(end - start + 1),
      ...(match ? { 'content-range': `bytes ${start}-${end}/${bytes.length}` } : {}),
    }, body: bytes.subarray(start, end + 1) });
  });
  try {
    await test.goto('http://127.0.0.1:5500/index.html');
    await test.waitForFunction(() => !document.querySelector('#play-pause').disabled);
    await test.locator('#play-pause').click();
    await test.waitForFunction(() => document.querySelector('audio').currentTime > 0.1);
    const beforeListeners = await test.evaluate(() => JSON.stringify(window.listenerCounts));
    await test.mouse.move(720, 8);
    await test.locator('#desktop-search-toggle').click();
    await test.waitForFunction(() => !document.querySelector('#search-tracks button:not(:disabled)').disabled);
    await test.locator('#catalog-search-query').fill('  rOb   ');
    await test.locator('#search-genre').selectOption('Pop');
    check('Live text plus genre shows one artist and three tracks', await test.locator('#search-artists li').count() === 1 && await test.locator('#search-tracks li').count() === 3);
    await test.locator('#reset-search').click();
    await test.waitForFunction(() => !!document.querySelector('#search-tracks button:not(:disabled)'));
    await test.locator('#search-tracks button:not(:disabled)').last().focus();
    await test.keyboard.press('Tab');
    check('Modal traps forward Tab focus', await test.evaluate(() => document.querySelector('dialog').contains(document.activeElement)));
    await test.locator('#close-search').focus();
    await test.keyboard.press('Shift+Tab');
    check('Modal traps reverse Tab focus', await test.evaluate(() => document.querySelector('dialog').contains(document.activeElement)));
    await test.locator('#catalog-search-query').focus();
    await test.keyboard.press('ArrowRight');
    check('Typing arrow key does not browse artist', await test.locator('#artist-heading').textContent() === 'Cup of Joe');
    await test.waitForTimeout(2300);
    check('Header remains available while search is modal', await test.locator('#site-header').evaluate(el => !el.inert && !el.classList.contains('is-hidden')));
    await test.locator('#catalog-search-query').fill('Cup');
    await test.keyboard.press('Escape');
    check('Actual Escape closes and restores desktop trigger focus', await test.evaluate(() => !document.querySelector('dialog').open && document.activeElement.id === 'desktop-search-toggle'));
    check('Escape preserves a nonempty query', await test.evaluate(async () => (await import('./js/search.js')).getSearchState().query === 'Cup'));
    await test.locator('#next-artist').click();
    check('Desktop gallery arrow works after search closes', await test.locator('#artist-heading').textContent() === 'Arthur Nery');
    await test.setViewportSize({ width: 390, height: 844 });
    await test.locator('#mobile-search-toggle').click();
    await test.locator('#reset-search').click();
    const touch = await context.newCDPSession(test);
    async function swipe(x1, y1, x2, y2) {
      await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x1, y: y1 }] });
      for (let i = 1; i <= 5; i++) await touch.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x1 + (x2 - x1) * i / 5, y: y1 + (y2 - y1) * i / 5 }] });
      await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    }
    await swipe(300, 450, 100, 450);
    check('Actual touch swipe in search cannot change background artist', await test.locator('#artist-heading').textContent() === 'Arthur Nery');
    await test.locator('#close-search').click();
    check('Mobile close restores compact trigger focus', await test.evaluate(() => document.activeElement.id === 'mobile-search-toggle'));
    await test.evaluate(() => window.scrollTo(0, 0));
    await swipe(300, 420, 100, 420);
    check('Actual mobile swipe resumes after search closes', await test.locator('#artist-heading').textContent() === 'fitterkarma');
    await swipe(200, 440, 205, 280);
    check('Vertical scrolling remains protected', await test.locator('#artist-heading').textContent() === 'fitterkarma');
    await test.locator('#mobile-search-toggle').click();
    const layouts = [];
    for (const width of [320, 390, 768, 1440, 1920]) {
      await test.setViewportSize({ width, height: width <= 390 ? 844 : 900 });
      await test.waitForTimeout(60);
      const layout = await test.evaluate(() => {
        const box = document.querySelector('dialog').getBoundingClientRect();
        const close = document.querySelector('#close-search').getBoundingClientRect();
        const results = document.querySelector('#search-results');
        return { width: innerWidth, overflow: document.documentElement.scrollWidth > innerWidth,
          dialogFits: box.left >= 0 && box.right <= innerWidth && box.top >= 0 && box.bottom <= innerHeight,
          closeVisible: close.top >= 0 && close.bottom <= innerHeight,
          fieldWidth: document.querySelector('#catalog-search-query').getBoundingClientRect().width,
          resultsScroll: results.scrollHeight > results.clientHeight };
      });
      layouts.push(layout);
      check(`Search fits and scrolls at ${width}px`, !layout.overflow && layout.dialogFits && layout.closeVisible && layout.fieldWidth > 100 && layout.resultsScroll);
      if (width === 390 || width === 1440) await test.screenshot({ path: `.playwright-mcp/search-step8-${width}.png`, fullPage: false });
    }
    await test.setViewportSize({ width: 390, height: 360 });
    await test.waitForTimeout(60);
    check('Short viewport keeps close control and field usable', await test.evaluate(() => document.querySelector('dialog').getBoundingClientRect().bottom <= innerHeight && document.querySelector('#close-search').getBoundingClientRect().bottom <= innerHeight && document.querySelector('#catalog-search-query').getBoundingClientRect().width > 100));
    await test.locator('#close-search').click();
    await test.setViewportSize({ width: 1440, height: 900 });
    await test.evaluate(async () => {
      (await import('./js/main.js')).selectArtist('cup-of-joe');
      const progress = document.querySelector('#playback-progress');
      progress.value = '60'; progress.dispatchEvent(new Event('change'));
    });
    await test.waitForFunction(() => document.querySelector('.is-active')?.textContent === 'May bagong tunog na darating');
    check('Real MP3 seeking and lyrics still work after search', true);
    check('Vinyl follows actual playing MP3', await test.locator('.vinyl').evaluate(el => el.classList.contains('is-playing')));
    const videoTime = await test.locator('video').evaluate(el => el.currentTime);
    await test.locator('#play-pause').click();
    await test.waitForTimeout(200);
    check('Decorative video remains independent after real audio pause', await test.locator('video').evaluate((el, before) => el.currentTime > before && el.muted, videoTime));
    await test.emulateMedia({ reducedMotion: 'reduce' });
    check('Reduced motion still pauses decoration', await test.evaluate(() => document.querySelector('video').paused && getComputedStyle(document.querySelector('.vinyl')).animationPlayState === 'paused'));
    check('Search adds no duplicate listeners', await test.evaluate(before => JSON.stringify(window.listenerCounts) === before, beforeListeners));
    check('No reload and only one audio/video', await test.evaluate(() => performance.getEntriesByType('navigation').length === 1 && document.querySelectorAll('audio').length === 1 && document.querySelectorAll('video').length === 1));
    check('No console errors or unhandled exceptions', errors.length === 0);
    return { passed: results.filter(r => r.passed).length, failed: results.filter(r => !r.passed).length, results, layouts, errors };
  } finally { await context.close(); }
}
