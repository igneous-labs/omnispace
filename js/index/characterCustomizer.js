import { saveAs } from "file-saver";
import JSZip from "jszip";

// poseName: numberOfPoseFrames (starting from 0)
const poses = {
  slashingBehind: 3,
  alert: 2,
  bashing: 3,
  firingBigBow: 3,
  firingBow: 3,
  firingCrossbow: 4,
  flying: 2,
  jumping: 1,
  jumpingSmash: 4,
  lungingOneHanded: 3,
  lungingTwoHanded: 4,
  lyingDown: 1,
  lyingDownStabbing: 2,
  sitting: 1,
  slashingFront: 3,
  slashingUpward: 3,
  smashing: 3,
  spinningSlash: 4,
  spinningThrow: 4,
  stabbingOneHanded: 2,
  stabbingTwoHanded: 3,
  standingOneHanded: 2,
  standingTwoHanded: 2,
  throwingBackhanded: 3,
  throwingDownward: 3,
  throwingForehanded: 3,
  thrustingOneHanded: 2,
  thrustingTwoHanded: 3,
  walkingOneHanded: 4,
  walkingTwoHanded: 4,
};

function readBlob(b) {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      resolve(reader.result);
    };

    reader.readAsDataURL(b);
  });
}

async function characterPreviewFetcher(selectors, zip, pose, poseFrame) {
  const res = await fetch("https://api.maplestory.net/character/render", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      skin: selectors.skin,
      ears: selectors.ears,
      faceEmote: selectors.expression,
      hairId: selectors.hair.hairId,
      faceId: selectors.face.faceId,
      itemIds: [
        selectors.faceAccessory && selectors.faceAccessory.itemId,
        selectors.eyeAccessory && selectors.eyeAccessory.itemId,
        selectors.hat && selectors.hat.itemId,
        selectors.earrings && selectors.earrings.itemId,
        selectors.top && selectors.top.itemId,
        selectors.bottom && selectors.bottom.itemId,
        selectors.overall && selectors.overall.itemId,
        selectors.gloves && selectors.gloves.itemId,
        selectors.weapon && selectors.weapon.itemId,
        selectors.shield && selectors.shield.itemId,
        selectors.cape && selectors.cape.itemId,
        selectors.shoes && selectors.shoes.itemId,
      ].filter(Boolean),
      pose,
      poseFrame,
    }),
  });

  const blob = await res.blob();

  // Don't do anything if the image is broken (due to an invalid pose)
  if (blob === undefined) {
    return undefined;
  }

  // If zip is specified - save img there
  if (zip) {
    zip.file(`${pose}-${poseFrame}.png`, blob);
    return undefined;
  }
  // Otherwise just return the blob
  return blob;
}

const generateSpritesheet = async (zip, selectors) => {
  const spritesheetFolder = zip.folder("spritesheet");
  const posesToFetch = [];

  for (const [pose, numOfFrames] of Object.entries(poses)) {
    for (let i = 0; i < numOfFrames; i++) {
      posesToFetch.push(
        characterPreviewFetcher(selectors, spritesheetFolder, pose, i)
      );
    }
  }

  return Promise.all(posesToFetch);
};

const saveZip = async (zip) => {
  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, "spritesheet.zip");
};

async function characterSaver(selectors) {
  const zip = new JSZip();
  await generateSpritesheet(zip, selectors);
  saveZip(zip);
}

const characterOptions = {
  skins: [
    {
      value: "light",
      label: "Light",
    },
    {
      value: "tanned",
      label: "Tanned",
    },
    {
      value: "dark",
      label: "Dark",
    },
    {
      value: "pale",
      label: "Pale",
    },
    {
      value: "ashen",
      label: "Ashen",
    },
    {
      value: "white",
      label: "White",
    },
    {
      value: "palePink",
      label: "Pale Pink",
    },
    {
      value: "clay",
      label: "Clay",
    },
    {
      value: "mercedes",
      label: "Mercedes",
    },
    {
      value: "ghostly",
      label: "Ghostly",
    },
    {
      value: "softPetal",
      label: "Soft Petal",
    },
    {
      value: "blushingPetal",
      label: "Blushing Petal",
    },
  ],
  expressions: [
    {
      value: "default",
      label: "Default",
    },
    {
      value: "hit",
      label: "Hit",
    },
    {
      value: "smile",
      label: "Smile",
    },
    {
      value: "troubled",
      label: "Troubled",
    },
    {
      value: "cry",
      label: "Cry",
    },
    {
      value: "angry",
      label: "Angry",
    },
    {
      value: "bewildered",
      label: "Bewildered",
    },
    {
      value: "stunned",
      label: "Stunned",
    },
    {
      value: "blaze",
      label: "Blaze",
    },
    {
      value: "bowing",
      label: "Bowing",
    },
    {
      value: "cheers",
      label: "Cheers",
    },
    {
      value: "chu",
      label: "Chu",
    },
    {
      value: "dam",
      label: "Dam",
    },
    {
      value: "despair",
      label: "Despair",
    },
    {
      value: "glitter",
      label: "Glitter",
    },
    {
      value: "hot",
      label: "Hot",
    },
    {
      value: "hum",
      label: "Hum",
    },
    {
      value: "love",
      label: "Love",
    },
    {
      value: "oops",
      label: "Oops",
    },
    {
      value: "pain",
      label: "Pain",
    },
    {
      value: "qBlue",
      label: "QBlue",
    },
    {
      value: "shine",
      label: "Shine",
    },
    {
      value: "vomit",
      label: "Vomit",
    },
    {
      value: "wink",
      label: "Wink",
    },
  ],
  ears: [
    {
      value: "humanEars",
      label: "Human",
    },
    {
      value: "elvenEars",
      label: "Elven",
    },
    {
      value: "lefEars",
      label: "Lef",
    },
    {
      value: "highLefEars",
      label: "High Lef",
    },
  ],
};

const defaultSelectors = {
  skin: characterOptions.skins[0].value,
  expression: undefined,
  ears: characterOptions.ears[0].value,
  hair: {
    hairId: 30000,
    name: "Toben Hair",
    requiredStats: { gender: "any" },
  },
  face: {
    faceId: 20000,
    name: "Motivated Look (Black)",
    requiredStats: { gender: "any" },
  },
  faceAccessory: undefined,
  eyeAccessory: undefined,
  hat: undefined,
  earrings: undefined,
  top: undefined,
  bottom: undefined,
  overall: undefined,
  gloves: undefined,
  weapon: undefined,
  shield: undefined,
  cape: undefined,
  shoes: undefined,
};

const menuData = {
  selectors: { ...defaultSelectors },
  characterPreview: null,
  async fetchCharacterPreview() {
    const blob = await characterPreviewFetcher(this.selectors);

    const characterPreviewURI = await readBlob(blob);

    this.characterPreview = characterPreviewURI;
  },
  handleRemoveItem(itemName) {
    if (this.selectors[itemName] !== defaultSelectors[itemName]) {
      this.selectors[itemName] = defaultSelectors[itemName];
      this.fetchCharacterPreview();
    }
  },
};

/**
 * Pollute global scope with required functions and consts
 * so that alpine can reference them
 */
export function onPageParsed() {
  // @ts-ignore
  window.menuData = menuData;
  // @ts-ignore
  window.defaultSelectors = defaultSelectors;
  // @ts-ignore
  window.characterOptions = characterOptions;
  // @ts-ignore
  window.characterSaver = characterSaver;
}
