/**
 * Common consts and singletons
 * Make sure to import this file first and only once
 */

const MATRIX_DOMAIN = "melchior.info";

const MATRIX_BASEURL = `https://matrix.${MATRIX_DOMAIN}`;

const MATRIX_LOGIN_LOCAL_STORAGE_KEY = "matrixLogin";

async function createMatrixClient(localStorageLoginOpt) {
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
