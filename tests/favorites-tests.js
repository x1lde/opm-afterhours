/**
 * FILE: favorites-tests.js
 * PURPOSE: Checks storage recovery and favorites without changing browser storage.
 * RESPONSIBILITIES: Controlled fixtures for corruption, versions, quota/read failure.
 * CONNECTED FILES: favorites.js exposes the same factory used by its one real store.
 */

import { FAVORITES_KEY, createFavoritesStore, validateStoredFavorites } from '../js/favorites.js';

/** Returns dependency-free test results; fixture stores do not register listeners. */
export function runFavoritesTests() {
  const results = [];
  const check = (name, passed) => results.push({ name, passed: Boolean(passed) });
  function fixture(raw = null) {
    let value = raw;
    let reads = 0;
    let writes = 0;
    const storage = {
      getItem(key) { if (key !== FAVORITES_KEY) throw new Error('Wrong key'); reads++; return value; },
      setItem(key, next) { if (key !== FAVORITES_KEY) throw new Error('Wrong key'); writes++; value = next; },
    };
    return { store: createFavoritesStore(() => storage), storage, value: () => value, writes: () => writes, reads: () => reads };
  }
  const ids = { version: 1, artistIds: ['bini', 'cup-of-joe'], trackIds: ['cup-of-joe-tingin', 'cup-of-joe-multo'] };
  const empty = fixture();
  check('Missing key starts empty', empty.store.load().artistIds.length === 0 && empty.store.getState().trackIds.length === 0);
  check('Missing key is not unnecessarily written', empty.writes() === 0);
  const valid = fixture(JSON.stringify(ids));
  check('Valid artist IDs load', valid.store.load().artistIds.length === 2);
  check('Valid track IDs load', valid.store.getState().trackIds.length === 2);
  check('Valid data is not unnecessarily written', valid.writes() === 0);
  check('Artist retrieval follows catalog order', valid.store.getFavoriteArtists().map(a => a.id).join(',') === 'cup-of-joe,bini');
  check('Track retrieval follows catalog order', valid.store.getFavoriteTracks().map(t => t.id).join(',') === 'cup-of-joe-multo,cup-of-joe-tingin');
  const corrupt = fixture('{broken json');
  check('Malformed JSON recovers safely', corrupt.store.load().artistIds.length === 0);
  check('Malformed supported data repairs to ID-only JSON', JSON.parse(corrupt.value()).version === 1);
  for (const root of [null, [], 12, 'text', true]) {
    check(`Unexpected root ${JSON.stringify(root)} recovers`, validateStoredFavorites(JSON.stringify(root)).state.artistIds.length === 0);
  }
  const bad = fixture(JSON.stringify({ version: 1,
    artistIds: ['bini', 'bini', 'missing-artist', 4, null, {}, 'cup-of-joe'],
    trackIds: ['cup-of-joe-multo', 'cup-of-joe-multo', 'missing-track', false, [], 'skusta-clee-slot-3'],
  }));
  const repaired = bad.store.load();
  check('Duplicate and invalid artist IDs removed, valid preserved', repaired.artistIds.join(',') === 'bini,cup-of-joe');
  check('Unknown, invalid and pending track IDs removed', repaired.trackIds.join(',') === 'cup-of-joe-multo');
  check('Missing arrays recover', validateStoredFavorites('{"version":1}').state.trackIds.length === 0);
  check('Wrong array types recover', validateStoredFavorites('{"version":1,"artistIds":"bini","trackIds":12}').state.artistIds.length === 0);
  const futureRaw = JSON.stringify({ version: 2, artistIds: ['bini'], futureField: ['untouched'] });
  const future = fixture(futureRaw);
  check('Future version uses safe memory state', future.store.load().persistence === 'protected-version' && future.store.getState().artistIds.length === 0);
  future.store.toggleArtistFavorite('cup-of-joe');
  check('Future version never overwritten', future.value() === futureRaw && future.writes() === 0);
  check('Future version permits session favorites', future.store.isArtistFavorite('cup-of-joe'));
  const readFailure = createFavoritesStore(() => { throw new DOMException('Blocked', 'SecurityError'); });
  check('Storage read exception uses session memory', readFailure.load().persistence === 'session-only');
  readFailure.toggleArtistFavorite('cup-of-joe');
  check('Read failure does not disable toggles', readFailure.isArtistFavorite('cup-of-joe'));
  check('Read failure shows refresh limitation', readFailure.getState().message.includes('refresh'));
  const quota = fixture();
  const realWrite = quota.storage.setItem;
  quota.storage.setItem = () => { throw new DOMException('Full', 'QuotaExceededError'); };
  quota.store.toggleTrackFavorite('cup-of-joe-multo');
  check('Quota/write failure preserves in-memory track', quota.store.isTrackFavorite('cup-of-joe-multo') && quota.store.getState().persistence === 'session-only');
  check('Write failure never claims saved persistence', quota.store.getState().persistence !== 'saved');
  quota.storage.setItem = realWrite;
  quota.store.toggleArtistFavorite('bini');
  check('Later changes retry persistence safely', quota.store.getState().persistence === 'saved' && JSON.parse(quota.value()).trackIds.includes('cup-of-joe-multo'));
  check('Artist add toggles on', empty.store.toggleArtistFavorite('cup-of-joe') === true);
  check('Artist remove toggles off', empty.store.toggleArtistFavorite('cup-of-joe') === false && !empty.store.isArtistFavorite('cup-of-joe'));
  check('Track add toggles on', empty.store.toggleTrackFavorite('cup-of-joe-multo') === true);
  check('Track remove toggles off', empty.store.toggleTrackFavorite('cup-of-joe-multo') === false);
  check('Unavailable real-title song can be favorited', empty.store.toggleTrackFavorite('cup-of-joe-tingin') === true);
  check('Pending selection cannot be favorited', empty.store.toggleTrackFavorite('skusta-clee-slot-3') === false && !empty.store.isTrackFavorite('skusta-clee-slot-3'));
  check('Unknown artist cannot be favorited', empty.store.toggleArtistFavorite('unknown') === false);
  const serialized = JSON.parse(empty.value());
  check('Only IDs and version stored', Object.keys(serialized).join(',') === 'version,artistIds,trackIds' && serialized.trackIds.every(id => typeof id === 'string'));
  const reloaded = createFavoritesStore(() => empty.storage);
  check('New instance retains persisted IDs', reloaded.load().trackIds.includes('cup-of-joe-tingin'));
  const beforeWrites = empty.writes();
  empty.store.applyExternal(JSON.stringify(ids));
  check('External changes synchronize state', empty.store.isArtistFavorite('bini') && empty.store.isTrackFavorite('cup-of-joe-multo'));
  check('External changes never echo writes', empty.writes() === beforeWrites);
  empty.store.applyExternal('{invalid');
  check('Invalid external data safely clears invalid state', empty.store.getState().artistIds.length === 0 && empty.writes() === beforeWrites);
  empty.store.applyExternal(null);
  check('External key removal clears memory', empty.store.getState().trackIds.length === 0);
  let notifications = 0;
  const unsubscribe = empty.store.subscribe(() => notifications++);
  empty.store.toggleArtistFavorite('bini');
  check('Subscriber receives initial state and changes', notifications === 2);
  unsubscribe();
  empty.store.toggleArtistFavorite('bini');
  check('Unsubscribe removes listener', notifications === 2);
  const copy = valid.store.getState();
  copy.artistIds.length = 0;
  check('Snapshot mutations do not corrupt store', valid.store.getState().artistIds.length === 2);
  const lateFuture = fixture();
  lateFuture.store.load();
  lateFuture.storage.setItem(FAVORITES_KEY, futureRaw);
  lateFuture.store.toggleArtistFavorite('bini');
  check('Write checks future versions introduced after initial load', lateFuture.value() === futureRaw && lateFuture.store.getState().persistence === 'protected-version');
  return { passed: results.filter(r => r.passed).length, failed: results.filter(r => !r.passed).length, results };
}
