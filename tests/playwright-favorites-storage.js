/**
 * FILE: playwright-favorites-storage.js
 * PURPOSE: Controlled browser storage failure and version-protection UI checks.
 * RESPONSIBILITIES: Simulates exceptions before bootstrap in isolated profiles;
 * actual Multo playback still runs, but storage failures are explicit mocks.
 */
async (page) => {
  const results = [];
  const check = (name, passed) => results.push({name, passed: Boolean(passed)});
  for (const mode of ['read', 'write', 'future']) {
    const context = await page.context().browser().newContext({viewport:{width:1440,height:900}});
    const test = await context.newPage();
    const errors = [];
    test.on('pageerror', error => errors.push(error.message));
    await context.addInitScript(mode => {
      window.fixtureStorage = window.localStorage;
      if (mode === 'read') Object.defineProperty(window, 'localStorage', {configurable:true, get(){throw new DOMException('Controlled storage block','SecurityError');}});
      if (mode === 'write') {
        const original = Storage.prototype.setItem;
        window.restoreStorage = () => Storage.prototype.setItem = original;
        Storage.prototype.setItem = function(key, value) {
          if (key === 'opm-afterhours:favorites:v1') throw new DOMException('Controlled quota failure','QuotaExceededError');
          return original.call(this,key,value);
        };
      }
      if (mode === 'future') localStorage.setItem('opm-afterhours:favorites:v1', JSON.stringify({version:9, unknown:['preserve-me']}));
    }, mode);
    try {
      await test.goto('http://127.0.0.1:5500/index.html');
      await test.waitForFunction(() => !document.querySelector('#play-pause').disabled);
      await test.locator('#play-pause').click();
      await test.waitForFunction(() => document.querySelector('audio').currentTime > 0.1);
      await test.locator('#artist-favorite').click();
      const state = await test.evaluate(async()=> (await import('./js/favorites.js')).getFavoritesState());
      check(`${mode}: hearts work in memory`, state.artistIds.includes('cup-of-joe'));
      check(`${mode}: failure/protection notice is visible`, await test.locator('#favorites-storage-notice').isVisible());
      check(`${mode}: never claims successful permanent save`, state.persistence !== 'saved');
      check(`${mode}: actual MP3 still plays`, await test.locator('audio').evaluate(el=>!el.paused && el.currentTime>0));
      if (mode === 'future') check('Future schema remains byte-for-byte preserved in browser', await test.evaluate(()=>localStorage.getItem('opm-afterhours:favorites:v1')===JSON.stringify({version:9,unknown:['preserve-me']})));
      if (mode === 'read') await test.evaluate(()=>Object.defineProperty(window,'localStorage',{configurable:true,get(){return window.fixtureStorage;}}));
      if (mode === 'write') await test.evaluate(()=>window.restoreStorage());
      if (mode !== 'future') {
        await test.locator('#active-track-favorite').click();
        check(`${mode}: later changes recover persistence`, await test.evaluate(async()=> (await import('./js/favorites.js')).getFavoritesState().persistence==='saved' && JSON.parse(localStorage.getItem('opm-afterhours:favorites:v1')).artistIds.includes('cup-of-joe')));
        check(`${mode}: recovery removes session-only notice`, !(await test.locator('#favorites-storage-notice').isVisible()));
      }
      check(`${mode}: no unhandled exceptions`, errors.length===0);
    } finally {await context.close();}
  }
  return {mode:'CONTROLLED storage exceptions and future schema; actual supplied Multo audio',passed:results.filter(r=>r.passed).length,failed:results.filter(r=>!r.passed).length,results};
}
