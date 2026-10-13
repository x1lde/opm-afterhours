/**
 * FILE: layout.js
 * PURPOSE: Fits desktop listening content to the actual usable browser height.
 * RESPONSIBILITIES: Measures surrounding content before budgeting vinyl size.
 * CONNECTED FILES: main.js initializes this; responsive.css consumes the size.
 */

/** Accounts for browser zoom, text wrapping, and artist content when sizing vinyl. */
export function initializeDesktopLayout() {
  const section = document.querySelector('.listening-layout');
  const record = document.querySelector('.record-region');
  const stage = document.querySelector('.vinyl-stage');
  const introduction = document.querySelector('.page-introduction');
  const artist = document.querySelector('.artist-section');
  const desktop = window.matchMedia('(min-width: 1001px)');

  function fitLayout() {
    if (!desktop.matches) return;
    const style = getComputedStyle(section);
    const scale = section.getBoundingClientRect().width / parseFloat(style.width);
    const spacing = ['paddingTop', 'paddingBottom', 'marginTop', 'marginBottom']
      .reduce((sum, property) => sum + parseFloat(style[property]), 0);
    const controlsHeight = record.getBoundingClientRect().height - stage.getBoundingClientRect().height;
    const available = window.innerHeight - introduction.getBoundingClientRect().height
      - artist.getBoundingClientRect().height - spacing * scale - controlsHeight - 16;
    const size = `${Math.floor(Math.max(150, available / scale))}px`;
    if (section.style.getPropertyValue('--vinyl-available-size') !== size) {
      section.style.setProperty('--vinyl-available-size', size);
    }
  }

  const observer = new ResizeObserver(fitLayout);
  [introduction, artist, record].forEach(element => observer.observe(element));
  window.addEventListener('resize', fitLayout);
  desktop.addEventListener('change', fitLayout);
  fitLayout();
}
