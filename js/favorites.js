/**
 * FILE: favorites.js
 * PURPOSE: Owns ID-only favorites and safe browser persistence.
 * RESPONSIBILITIES: Validates against data.js, recovers bad data, notifies UI,
 * and accepts cross-tab changes without writing them back.
 * CONNECTED FILES: catalog/main/favorites-view share this single production store.
 */

import { artists, tracks, getArtistById, getTrackById } from './data.js';

export const FAVORITES_KEY = 'opm-afterhours:favorites:v1';
const emptyState = () => ({ version: 1, artistIds: [], trackIds: [] });

/** Pending slots are not real recordings; missing audio does not prevent saving. */
export function canFavoriteTrack(id) {
  const track = getTrackById(id);
  return !!track && track.status !== 'pending-selection' && typeof track.title === 'string' && !!track.title.trim();
}

/**
 * Sanitizes stored JSON while preserving valid IDs. Unfamiliar versions are protected.
 * @param {string|null} raw Browser storage value, or null when absent.
 * @returns {{state: object, protectedVersion: boolean, needsRepair: boolean}}
 */
export function validateStoredFavorites(raw) {
  if (raw === null) return { state: emptyState(), protectedVersion: false, needsRepair: false };
  let value;
  try { value = JSON.parse(raw); }
  catch { return { state: emptyState(), protectedVersion: false, needsRepair: true }; }
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { state: emptyState(), protectedVersion: false, needsRepair: true };
  }
  if (value.version !== undefined && value.version !== 1) {
    return { state: emptyState(), protectedVersion: true, needsRepair: false };
  }
  function validIds(values, valid) {
    return [...new Set((Array.isArray(values) ? values : []).filter(id => typeof id === 'string' && valid(id)))];
  }
  const state = {
    version: 1,
    artistIds: validIds(value.artistIds, id => !!getArtistById(id)),
    trackIds: validIds(value.trackIds, canFavoriteTrack),
  };
  return { state, protectedVersion: false, needsRepair: JSON.stringify(value) !== JSON.stringify(state) };
}

/**
 * Small store factory permits isolated storage-failure tests. The website uses
 * exactly one instance below; test stores never register browser listeners.
 * @param {Function} storageProvider Returns localStorage (or a controlled test fixture).
 * @returns {object} ID toggles, catalog-ordered retrieval, subscription and load API.
 */
export function createFavoritesStore(storageProvider = () => window.localStorage) {
  let state = emptyState();
  let loaded = false;
  let persistence = 'available';
  const listeners = new Set();

  function snapshot() {
    return {
      ...state, artistIds: [...state.artistIds], trackIds: [...state.trackIds], persistence,
      message: persistence === 'session-only' ? 'Favorites work for this visit, but may not survive a refresh.'
        : persistence === 'protected-version' ? 'Saved data uses another version. Favorites work for this visit; existing storage is preserved.' : '',
    };
  }
  function notify() { for (const listener of listeners) listener(snapshot()); }

  function persist() {
    try {
      const storage = storageProvider();
      // Check again before writing: another tab may have introduced a future schema.
      if (validateStoredFavorites(storage.getItem(FAVORITES_KEY)).protectedVersion) {
        persistence = 'protected-version';
        return false;
      }
      storage.setItem(FAVORITES_KEY, JSON.stringify(state));
      persistence = 'saved';
      return true;
    } catch {
      persistence = 'session-only';
      return false;
    }
  }

  function load() {
    if (loaded) return snapshot();
    loaded = true;
    try {
      const result = validateStoredFavorites(storageProvider().getItem(FAVORITES_KEY));
      state = result.state;
      persistence = result.protectedVersion ? 'protected-version' : 'available';
      if (result.needsRepair) persist();
    } catch { persistence = 'session-only'; }
    notify();
    return snapshot();
  }

  function toggle(type, id) {
    load();
    if (type === 'artist' ? !getArtistById(id) : !canFavoriteTrack(id)) return false;
    const key = type === 'artist' ? 'artistIds' : 'trackIds';
    const present = state[key].includes(id);
    state[key] = present ? state[key].filter(value => value !== id) : [...state[key], id];
    persist();
    notify();
    return !present;
  }

  function applyExternal(raw) {
    load();
    const result = validateStoredFavorites(raw);
    state = result.state;
    persistence = result.protectedVersion ? 'protected-version' : 'available';
    // Incoming storage changes only notify UI. Never echo writes across tabs.
    notify();
  }

  return {
    load, getState: () => { load(); return snapshot(); },
    isArtistFavorite: id => { load(); return state.artistIds.includes(id); },
    isTrackFavorite: id => { load(); return state.trackIds.includes(id); },
    toggleArtistFavorite: id => toggle('artist', id),
    toggleTrackFavorite: id => toggle('track', id),
    getFavoriteArtists: () => { load(); return artists.filter(artist => state.artistIds.includes(artist.id)); },
    getFavoriteTracks: () => { load(); return tracks.filter(track => canFavoriteTrack(track.id) && state.trackIds.includes(track.id)); },
    subscribe(listener) {
      load();
      listeners.add(listener);
      listener(snapshot());
      return () => listeners.delete(listener);
    },
    applyExternal,
  };
}

const store = createFavoritesStore();
let storageListenerInstalled = false;

/** Loads the authoritative store once and registers exactly one cross-tab listener. */
export function loadFavorites() {
  const state = store.load();
  if (!storageListenerInstalled) {
    storageListenerInstalled = true;
    window.addEventListener('storage', event => {
      if (event.key !== FAVORITES_KEY && event.key !== null) return;
      try {
        if (event.storageArea && event.storageArea !== window.localStorage) return;
        store.applyExternal(event.key === null ? null : event.newValue);
      } catch { /* Blocked storage keeps this tab's current in-memory favorites. */ }
    });
  }
  return state;
}

export const getFavoritesState = store.getState;
export const isArtistFavorite = store.isArtistFavorite;
export const isTrackFavorite = store.isTrackFavorite;
export const toggleArtistFavorite = store.toggleArtistFavorite;
export const toggleTrackFavorite = store.toggleTrackFavorite;
export const getFavoriteArtists = store.getFavoriteArtists;
export const getFavoriteTracks = store.getFavoriteTracks;
export const subscribeToFavorites = store.subscribe;
