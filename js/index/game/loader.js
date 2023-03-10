//
// Asset loader
//

export const Loader = {
  images: {},
};

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

Loader.getImage = function (key) {
  return key in this.images ? this.images[key] : null;
};
