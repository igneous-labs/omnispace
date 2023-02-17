function saveCharacter(selectedItems) {
  alert(JSON.stringify(selectedItems, null, 2))
}

const characterOptions = {
  skins: [
    {
      value: 'light',
      label: 'Light',
    },
    {
      value: 'tanned',
      label: 'Tanned',
    },
    {
      value: 'dark',
      label: 'Dark',
    },
    {
      value: 'pale',
      label: 'Pale',
    },
    {
      value: 'ashen',
      label: 'Ashen',
    },
    {
      value: 'white',
      label: 'White',
    },
    {
      value: 'palePink',
      label: 'Pale Pink',
    },
    {
      value: 'clay',
      label: 'Clay',
    },
    {
      value: 'mercedes',
      label: 'Mercedes',
    },
    {
      value: 'ghostly',
      label: 'Ghostly',
    },
    {
      value: 'softPetal',
      label: 'Soft Petal',
    },
    {
      value: 'blushingPetal',
      label: 'Blushing Petal',
    },
  ],
  expressions: [
    {
      value: 'default',
      label: 'Default',
    },
    {
      value: 'hit',
      label: 'Hit',
    },
    {
      value: 'smile',
      label: 'Smile',
    },
    {
      value: 'troubled',
      label: 'Troubled',
    },
    {
      value: 'cry',
      label: 'Cry',
    },
    {
      value: 'angry',
      label: 'Angry',
    },
    {
      value: 'bewildered',
      label: 'Bewildered',
    },
    {
      value: 'stunned',
      label: 'Stunned',
    },
    {
      value: 'blaze',
      label: 'Blaze',
    },
    {
      value: 'bowing',
      label: 'Bowing',
    },
    {
      value: 'cheers',
      label: 'Cheers',
    },
    {
      value: 'chu',
      label: 'Chu',
    },
    {
      value: 'dam',
      label: 'Dam',
    },
    {
      value: 'despair',
      label: 'Despair',
    },
    {
      value: 'glitter',
      label: 'Glitter',
    },
    {
      value: 'hot',
      label: 'Hot',
    },
    {
      value: 'hum',
      label: 'Hum',
    },
    {
      value: 'love',
      label: 'Love',
    },
    {
      value: 'oops',
      label: 'Oops',
    },
    {
      value: 'pain',
      label: 'Pain',
    },
    {
      value: 'qBlue',
      label: 'QBlue',
    },
    {
      value: 'shine',
      label: 'Shine',
    },
    {
      value: 'vomit',
      label: 'Vomit',
    },
    {
      value: 'wink',
      label: 'Wink',
    },
  ],
  ears: [
    {
      value: 'humanEars',
      label: 'Human',
    },
    {
      value: 'elvenEars',
      label: 'Elven',
    },
    {
      value: 'lefEars',
      label: 'Lef',
    },
    {
      value: 'highLefEars',
      label: 'High Lef',
    },
  ],
}

function readBlob(b) {
  return new Promise(function (resolve, reject) {
    const reader = new FileReader()

    reader.onloadend = function () {
      resolve(reader.result)
    }

    reader.readAsDataURL(b)
  })
}

const defaultSelectors = {
  skin: characterOptions.skins[0].value,
  expression: undefined,
  ears: characterOptions.ears[0].value,
  hair: {
    hairId: 30000,
    name: 'Toben Hair',
    requiredStats: { gender: 'any' },
  },
  face: {
    faceId: 20000,
    name: 'Motivated Look (Black)',
    requiredStats: { gender: 'any' },
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
}

const menuData = {
  selectors: defaultSelectors,
  characterPreview: null,
  async fetchCharacterPreview() {
    const rawResponse = await fetch(
      'https://api.maplestory.net/character/render',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skin: this.selectors.skin,
          ears: this.selectors.ears,
          faceEmote: this.selectors.expression,
          hairId: this.selectors.hair.hairId,
          faceId: this.selectors.face.faceId,
          itemIds: [
            this.selectors.faceAccessory && this.selectors.faceAccessory.itemId,
            this.selectors.eyeAccessory && this.selectors.eyeAccessory.itemId,
            this.selectors.hat && this.selectors.hat.itemId,
            this.selectors.earrings && this.selectors.earrings.itemId,
            this.selectors.top && this.selectors.top.itemId,
            this.selectors.bottom && this.selectors.bottom.itemId,
            this.selectors.overall && this.selectors.overall.itemId,
            this.selectors.gloves && this.selectors.gloves.itemId,
            this.selectors.weapon && this.selectors.weapon.itemId,
            this.selectors.shield && this.selectors.shield.itemId,
            this.selectors.cape && this.selectors.cape.itemId,
            this.selectors.shoes && this.selectors.shoes.itemId,
          ].filter(Boolean),
        }),
      },
    )

    const blob = await rawResponse.blob()

    const characterPreviewURI = await readBlob(blob)

    this.characterPreview = characterPreviewURI
  },
  selectedItems: {},
  handleSelectItem(item) {
    const { category, subcategory } = this.selectors
    const selectedItems = this.selectedItems
    if (!selectedItems[category]) {
      selectedItems[category] = {}
    }
    selectedItems[category][subcategory] = item
  },
  handleRemoveItem(category, subcategory) {
    const selectedItems = this.selectedItems
    delete selectedItems[category][subcategory]
    if (Object.keys(selectedItems[category]).length === 0) {
      delete selectedItems[category]
    }
  },
  handleRemoveAllItems() {
    this.selectedItems = {}
  },
  categories: ['Character', 'Accessory', 'Clothes'],
  subcategories: {
    Character: ['Face', 'Head', 'Hair'],
    Accessory: [
      'Face Accessory',
      'Eye Decoration',
      'Earrings',
      'Ring',
      'Pendant',
      'Belt',
      'Medal',
      'Shoulder Accessory',
      'Pocket Item',
      'Badge',
      'Emblem',
    ],
    Clothes: [
      'Hat',
      'Cape',
      'Top',
      'Overall',
      'Glove',
      'Bottom',
      'Shield',
      'Shoes',
    ],
  },
}
