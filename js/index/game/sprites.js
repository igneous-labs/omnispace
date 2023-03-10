/*
 * Spritesheet mapping object
 * Maps each matrix ID to their corresponding character spritesheet
 */

export const PlayerSpriteSheetMap = {
  "default": "char_default",
  "@fp:melchior.info": "char_fp2",
  "@pixisu:melchior.info": "char_pixisu",
  "@chinkeeyong:melchior.info": "char_chinkeeyong",
  "@Boven:melchior.info": "char_boven",
  "@hunter2:melchior.info": "char_hunter2",
  "@fe:melchior.info": "char_fe",
  "@thesmolbeann:melchior.info": "char_fe",
  "@lieu:melchior.info": "char_lieu",
  "@rczjian:melchior.info": "char_rczjian",
  "@sf:melchior.info": "char_sf",
  "@seulgi:melchior.info": "char_seulgi",
  "@ellinx:melchior.info": "char_ellinx",
};

export const entitySpriteSheetMap = {
  coin: "coin",
};

/*
 * SpriteSheetFrameMap
 * Splits up a spritesheet into its individual frames
 */

export const SpriteSheetFrameMap = {
  char_default: {
    standing: [
      [0, 40],
      [41, 81],
    ],
    walking: [
      [82, 122],
      [123, 163],
      [164, 204],
      [205, 245],
    ],
  },
  char_fp: {
    standing: [
      [0, 55],
      [56, 116],
    ],
    walking: [
      [118, 172],
      [173, 235],
      [236, 296],
      [297, 354],
    ],
  },
  char_pixisu: {
    standing: [
      [1, 52],
      [54, 101],
    ],
    walking: [
      [103, 155],
      [157, 206],
      [208, 251],
      [253, 304],
    ],
  },
  char_chinkeeyong: {
    standing: [
      [1, 48],
      [50, 97],
    ],
    walking: [
      [99, 146],
      [148, 195],
      [197, 244],
      [246, 293],
    ],
  },
  char_boven: {
    standing: [
      [1, 47],
      [49, 95],
    ],
    walking: [
      [97, 143],
      [145, 191],
      [193, 239],
      [241, 287],
    ],
  },
  char_hunter2: {
    standing: [
      [1, 51],
      [53, 103],
    ],
    walking: [
      [105, 155],
      [157, 207],
      [209, 259],
      [261, 312],
    ],
  },
  char_fe: {
    standing: [
      [1, 62],
      [64, 125],
    ],
    walking: [
      [127, 188],
      [190, 251],
      [253, 314],
      [316, 377],
    ],
  },
  char_lieu: {
    standing: [
      [1, 95],
      [97, 188],
    ],
    walking: [
      [190, 287],
      [289, 393],
      [395, 493],
      [495, 590],
    ],
  },
  char_rczjian: {
    standing: [
      [1, 154],
      [156, 309],
    ],
    walking: [
      [311, 464],
      [466, 619],
      [621, 774],
      [776, 929],
    ],
  },
  char_sf: {
    standing: [
      [1, 68],
      [70, 137],
    ],
    walking: [
      [139, 206],
      [208, 275],
      [277, 344],
      [346, 413],
    ],
  },
  coin: {
    default: [
      [0, 15],
      [16, 31],
      [32, 47],
      [48, 63],
      [64, 79],
    ],
  },
  char_seulgi: {
    standing: [
      [1, 110],
      [112, 221],
    ],
    walking: [
      [223, 335],
      [337, 446],
      [448, 560],
      [562, 671],
    ],
  },
  char_fp2: {
    standing: [
      [1, 65],
      [67, 132],
    ],
    walking: [
      [134, 208],
      [210, 285],
      [287, 372],
      [374, 460],
    ],
  },
  char_ellinx: {
    standing: [
      [1, 49],
      [51, 99],
    ],
    walking: [
      [101, 149],
      [151, 199],
      [201, 249],
      [251, 299],
    ],
  },
};
