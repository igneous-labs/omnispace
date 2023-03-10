import { MATRIX_BASEURL } from "@/js/common/consts";

export const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

/**
 * helper function to truncate long strings (used in bubble rendering)
 * @param {string} str
 * @param {number} n
 * @returns {string} the truncated string
 */
export function truncate(str, n) {
  return str.length > n ? `${str.slice(0, n - 1)}...` : str;
}

export function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 *
 * @param {[number, number]} a
 * @param {[number, number]} b
 * @returns {number}
 */
export function distanceBetween2D(a, b) {
  if (!a || !b) return -1;
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
}

/**
 *
 * @param {Partial<import("matrix-js-sdk").ICreateClientOpts>} [localStorageLoginOpt]
 * @returns
 */
export async function createMatrixClient(localStorageLoginOpt) {
  // dynamic import in fn here for smaller bundle sizes
  const matrixcs = await import("matrix-js-sdk");

  const store = new matrixcs.IndexedDBStore({
    indexedDB: window.indexedDB,
    localStorage: window.localStorage,
  });
  await store.startup();
  const opts = {
    baseUrl: MATRIX_BASEURL,
    store,
  };
  if (localStorageLoginOpt) {
    opts.accessToken = localStorageLoginOpt.accessToken;
    opts.userId = localStorageLoginOpt.userId;
  }
  return matrixcs.createClient(opts);
}

export function debounce(callback, wait = 300) {
  let timeoutId = null;
  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      callback(...args);
    }, wait);
  };
}
