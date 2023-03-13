//
// Asset loader
//

export const Loader = {
  images: {},
};

/**
 * Loads an image entry into Loader.images
 * @param {string} key image key in Loader.images
 * @param {string} src img src (path)
 * @returns
 */
Loader.loadImage = function (key, src) {
  const img = new Image();

  const d = new Promise((resolve, reject) => {
    img.onload = function () {
      this.images[key] = img;
      resolve(img);
    }.bind(this);

    img.onerror = function () {
      reject(new Error(`Could not load image: ${src}`));
    };
  });

  img.src = src;
  return d;
};

/**
 *
 * @param {string} key
 * @returns {?HTMLImageElement}
 */
Loader.getImage = function (key) {
  return key in this.images ? this.images[key] : null;
};
