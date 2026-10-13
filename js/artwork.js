/**
 * FILE: artwork.js
 * PURPOSE: Reveals only successfully loaded artwork for the current selection.
 * RESPONSIBILITIES: Keeps placeholders while loading and ignores stale images.
 * CONNECTED FILES: catalog.js, main.js, and background-video.js share this helper.
 */

const imageVersions = new WeakMap();

/**
 * @param {HTMLImageElement} image Existing visible image element.
 * @param {string|null} path Authorized image path, or null for a placeholder.
 * @param {HTMLElement|null} placeholder Optional replacement text/container.
 * @param {Function} onLoad Optional callback after current artwork succeeds.
 */
export function loadArtwork(image, path, placeholder = null, onLoad = () => {}) {
  const version = (imageVersions.get(image) || 0) + 1;
  imageVersions.set(image, version);
  image.hidden = true;
  image.removeAttribute('src');
  if (placeholder) placeholder.hidden = false;
  if (!path) return;
  const probe = new Image();
  probe.onload = () => {
    if (imageVersions.get(image) !== version) return;
    image.src = path;
    image.hidden = false;
    if (placeholder) placeholder.hidden = true;
    onLoad();
  };
  // A failed probe leaves the existing placeholder and never reveals a broken image.
  probe.onerror = () => {};
  probe.src = path;
}
