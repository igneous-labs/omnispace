/**
 * Define the Game singleton.
 * This file should have minimum deps to avoid circular deps since
 * most other game objects reference the singleton directly
 */

import CanvasTxt from "canvas-txt";
import { Loader } from "@/js/index/game/loader";
import { distanceBetween2D, truncate } from "@/js/common/utils";
import {
  entitySpriteSheetMap,
  PlayerSpriteSheetMap,
  SpriteSheetFrameMap,
} from "@/js/index/game/sprites";

/**
 * @typedef Entity
 * @property {() => void} render
 * @property {() => void} update
 */

/*
 * Game object
 *
 * TODO: am just @ts-ignore-ing all nulls for now
 * TODO: proper typedefs for worldState etc
 */
export const Game = {
  /** @type {import("@/js/index/game/camera").Camera} */
  // @ts-ignore
  camera: null,

  /** @type {CanvasRenderingContext2D} */
  // @ts-ignore
  ctx: null,

  /** @type {number} */
  lastRender: 0,

  /** @type {number} */
  lastTick: 0,

  /** @type {any} */
  worldState: null,

  /** @type {any} */
  receivedWorldStateBuffer: null,

  /** @type {any} */
  renderState: null,

  /** @type {import("@/js/index/game/networkHandler").NetworkHandler} */
  // @ts-ignore
  networkHandler: null,

  // TODO find a better place to put these variables
  /** @type {number} */
  // @ts-ignore
  ACTIVE_PLAYER: null,
  PLAYER_SPEED: 0.1,
  /** @type {?[number, number]} */
  PLAYER_TARGET_DEST: null,

  // FEATURE: coins
  /** @type {any} */
  renderEntityState: null,

  /** @type {?[number, number]} */
  coinPosition: null,

  playerCoins: 0,

  // FEATURE: global die singleton
  /** @type {import("@/js/index/game/entities/die").Die} */
  // @ts-ignore
  globalDie: null,

  // FEATURE: global sign singleton
  /** @type {import("@/js/index/game/entities/sign").Sign} */
  // @ts-ignore
  globalSign: null,

  /** @type {Array<Entity>} */
  entities: [],

  /** @type {() => Array<Promise<void>>} */
  load: () => [],
  setInitialState: () => {},
  run: () => {},
  main: (_tFrame) => {},
  update: (_tFrame) => {},
  render: (_tFrame) => {},
};

Game.load = function () {
  return [
    Loader.loadImage("room", "./img/room.png"),
    Loader.loadImage("room2", "./img/room2.jpg"),
    Loader.loadImage("farm", "./img/farm.jpg"),
    Loader.loadImage("town", "./img/town.png"),
    Loader.loadImage("overworld", "./img/bg.png"),
    Loader.loadImage("floathouse", "./img/floathouse.png"),
    Loader.loadImage("floatisland", "./img/floatisland.jpg"),
    Loader.loadImage("trivia", "./img/trivia.png"),
    Loader.loadImage("char_default", "./img/char_default.png"),
    Loader.loadImage("char_fp", "./img/char_fp.png"),
    Loader.loadImage("char_pixisu", "./img/char_pixisu.png"),
    Loader.loadImage("char_chinkeeyong", "./img/char_chinkeeyong.png"),
    Loader.loadImage("char_boven", "./img/char_boven.png"),
    Loader.loadImage("char_hunter2", "./img/char_hunter2.png"),
    Loader.loadImage("char_fe", "./img/char_fe.png"),
    Loader.loadImage("char_lieu", "./img/char_lieu.png"),
    Loader.loadImage("char_rczjian", "./img/char_rczjian.png"),
    Loader.loadImage("char_sf", "./img/char_sf.png"),
    Loader.loadImage("char_seulgi", "./img/char_seulgi.png"),
    Loader.loadImage("char_fp2", "./img/char_fp2.png"),
    Loader.loadImage("char_ellinx", "./img/char_ellinx.png"),

    // Load coin animation
    Loader.loadImage("coin", "./img/coin.png"),

    // Toys: pressurePlate
    Loader.loadImage("tile", "./img/tile.png"),

    // Toys: die
    Loader.loadImage("die", "./img/die.png"),
  ];
};

Game.main = function (tFrame) {
  window.requestAnimationFrame(Game.main);
  Game.update(tFrame);
  Game.render(tFrame);
  Game.lastRender = tFrame;
  Game.lastTick = tFrame;
};

Game.render = function (tFrame) {
  // Render characters and map
  // console.log(`Rendering at tFrame ${tFrame}. Last render: ${Game.lastRender}`)

  // if the networkHandler is not initialized, then there should be nothing to render
  if (!Game.networkHandler.isInitialized) return;

  Game.camera.moveTo(
    Game.worldState.world_state_data[Game.ACTIVE_PLAYER].position[0],
    // FIXME 50 is a magic number because I am offsetting the player display
    Game.worldState.world_state_data[Game.ACTIVE_PLAYER].position[1] - 50,
  );
  Game.camera.begin();

  Game.ctx.fillStyle = "rgb(102, 204, 255)";
  Game.ctx.fillRect(0, 0, 1500, 1500);

  // const room = Loader.getImage("floathouse")
  // // Scale down half cos source image is big
  // const rw = room.width/2;
  // const rh = room.height/2

  // Game.ctx.drawImage(
  //     room,
  //     (1500-rw)/2,
  //     (1500-rh)/2,
  //     rw,
  //     rh,
  // )

  // const room = Loader.getImage("floatisland");
  // const rw = room.width * 1;
  // const rh = room.height * 1;

  // Game.ctx.drawImage(room, (1500 - rw) / 2, (1500 - rh) / 2, rw, rh);

  const room = Loader.getImage("trivia");
  const rw = room.width * 1.5;
  const rh = room.height * 1.5;

  Game.ctx.drawImage(room, (1500 - rw) / 2, (1500 - rh) / 2, rw, rh);

  // // overworld is big
  // const overworld = Loader.getImage("overworld")
  // const rw = overworld.width * 2.5
  // const rh = overworld.height * 2.5
  // Game.ctx.drawImage(
  //     overworld,
  //     (1500-rw)/2,
  //     (1500-rh)/2,
  //     rw,
  //     rh,
  // )

  // const room = Loader.getImage("town")
  // const rw = room.width * 2.5;
  // const rh = room.height * 2.5;
  // Game.ctx.drawImage(
  //     room,
  //     (1500-rw)/2,
  //     (1500-rh)/2,
  //     rw,
  //     rh,
  // )

  // Render entities
  for (const entity of Game.entities) {
    entity.render();
  }

  for (const [playerId, player] of Object.entries(Game.renderState)) {
    // Render the player, then any chat bubbles

    // First render the player

    // currentAnimationFrame, lastAnimationChangeTime
    if (player) {
      // Default spritesheet
      let spriteSheetName = "char_default";
      if (
        Game.worldState.client_chat_user_ids[playerId] in PlayerSpriteSheetMap
      ) {
        spriteSheetName =
          PlayerSpriteSheetMap[Game.worldState.client_chat_user_ids[playerId]]; // this gives e.g. "char_default"
      }

      const playerSpriteSheet = SpriteSheetFrameMap[spriteSheetName]; // this gives {walking: [[]], standing: [[]]}
      const playerCurrentStatus =
        Game.worldState.world_state_data[playerId].status; // this gives "walking" or "standing"

      switch (playerCurrentStatus) {
        case "standing":
          if (tFrame - player.lastAnimationChangeTime > 500) {
            player.currentAnimationFrame =
              (player.currentAnimationFrame + 1) %
              playerSpriteSheet[playerCurrentStatus].length;
            player.lastAnimationChangeTime = tFrame;
          }
          break;
        case "walking":
          if (tFrame - player.lastAnimationChangeTime > 150) {
            player.currentAnimationFrame =
              (player.currentAnimationFrame + 1) %
              playerSpriteSheet[playerCurrentStatus].length;
            player.lastAnimationChangeTime = tFrame;
          }
          break;
        default:
          throw new Error("unreachable");
      }

      const sx =
        playerSpriteSheet[playerCurrentStatus][player.currentAnimationFrame][0]; // start x-coord of the slice of the spritesheet to draw
      const sy = 0;
      const sWidth =
        playerSpriteSheet[playerCurrentStatus][
          player.currentAnimationFrame
        ][1] - sx; // width of the slice of the spritesheet to draw
      const char = Loader.getImage(spriteSheetName); // which spritesheet to use
      const sHeight = char.height; // height of the spritesheet
      const [x, y] = [...Game.worldState.world_state_data[playerId].position]; // FIXME: note this needs to be fixed because global position =/= position on canvas

      // flip or don't flip
      if (Game.worldState.world_state_data[playerId].direction === "right") {
        // https://stackoverflow.com/a/35973879 flipping sprite
        Game.ctx.save();
        Game.ctx.translate(x + sWidth, y);
        Game.ctx.scale(-1, 1);
        Game.ctx.drawImage(
          char,
          sx,
          sy,
          sWidth,
          sHeight,
          0 + sWidth / 2,
          0 - sHeight,
          sWidth,
          sHeight,
        );
        Game.ctx.restore();
      } else {
        Game.ctx.drawImage(
          char,
          sx,
          sy,
          sWidth,
          sHeight,
          x - sWidth / 2,
          y - sHeight,
          sWidth,
          sHeight,
        );
      }

      Game.ctx.fillRect(x, y, 1, 10);
    }
  }

  // render bubbles separately from the players
  // TODO: bubbles should be rendered in time order not playerId order
  // (newer messages should take priority over older ones)
  for (const [playerId, player] of Object.entries(Game.renderState)) {
    // Render chat bubbles
    // TODO use measureText() to get width and do like line breaks/hyphenation
    // There should exist a library to do this
    // currentAnimationFrame, lastAnimationChangeTime
    if (player) {
      const [x, y] = [...Game.worldState.world_state_data[playerId].position]; // FIXME: note this needs to be fixed because global position =/= position on canvas

      const matrixUserId = Game.worldState.client_chat_user_ids[playerId];

      const boxHt = 20;
      const boxWh = 80;
      const offsetX = x - boxWh / 2;
      const offsetY = y;
      Game.ctx.font = "16px sans-serif";
      Game.ctx.fillStyle = `rgba(220, 220, 220, 0.7)`;
      Game.ctx.fillRect(offsetX, offsetY, boxWh, boxHt);
      Game.ctx.strokeStyle = `rgba(100, 100, 100, 1.0)`;
      Game.ctx.strokeRect(offsetX, offsetY, boxWh, boxHt);
      Game.ctx.fillStyle = "black";

      if (matrixUserId) {
        CanvasTxt.drawText(
          Game.ctx,
          Game.worldState.client_chat_user_ids[playerId]
            .replace(":melchior.info", "")
            .slice(1),
          offsetX,
          offsetY,
          boxWh,
          boxHt,
        );
      } else {
        CanvasTxt.drawText(Game.ctx, "Guest", offsetX, offsetY, boxWh, boxHt);
      }

      if (player.messageToDisplay !== null) {
        // Render messages only for five seconds (FIXME: pull this out into a constant somewhere)
        if (tFrame - player.messageToDisplay[1] < 5000) {
          let spriteSheetName = "char_default";

          if (matrixUserId in PlayerSpriteSheetMap) {
            spriteSheetName =
              PlayerSpriteSheetMap[
                Game.worldState.client_chat_user_ids[playerId]
              ]; // this gives e.g. "char_default"
          }
          const boxHtMsg = 150;
          const boxWhMsg = 80;
          const padding = 5;
          const char = Loader.getImage(spriteSheetName); // which spritesheet to use
          const sHeight = char.height; // height of the spritesheet
          const offsetXMsg = x - boxWhMsg / 2;
          const offsetYMsg = y - boxHtMsg - padding - sHeight;
          Game.ctx.font = "16px sans-serif";
          Game.ctx.fillStyle = `rgba(220, 220, 220, 0.7)`;
          Game.ctx.fillRect(offsetXMsg, offsetYMsg, boxWhMsg, boxHtMsg);
          Game.ctx.strokeStyle = `rgba(200, 200, 200, 1.0)`;
          Game.ctx.strokeRect(offsetXMsg, offsetYMsg, boxWhMsg, boxHtMsg);
          Game.ctx.fillStyle = "black";
          CanvasTxt.drawText(
            Game.ctx,
            truncate(player.messageToDisplay[0], 100),
            offsetXMsg,
            offsetYMsg,
            boxWhMsg,
            boxHtMsg,
          );
        }
      }
    }
  }

  // Render coins
  for (const entityId of Object.keys(Game.renderEntityState)) {
    const entity = Game.renderEntityState[entityId];
    if (entity.entityType === "coin" && "coin" in entitySpriteSheetMap) {
      if (tFrame - entity.lastAnimationChangeTime > 150) {
        entity.currentAnimationFrame =
          (entity.currentAnimationFrame + 1) %
          SpriteSheetFrameMap[entity.entityType].default.length;
        entity.lastAnimationChangeTime = tFrame;
      }

      const sx =
        SpriteSheetFrameMap[entity.entityType].default[
          entity.currentAnimationFrame
        ][0]; // start x-coord of the slice of the spritesheet to draw
      const sy = 0;
      const sWidth =
        SpriteSheetFrameMap[entity.entityType].default[
          entity.currentAnimationFrame
        ][1] - sx;
      const coinImg = Loader.getImage("coin");
      const sHeight = coinImg.height; // height of the spritesheet
      // @ts-ignore
      const [x, y] = [...Game.coinPosition];
      Game.ctx.drawImage(
        coinImg,
        sx,
        sy,
        sWidth,
        sHeight,
        x,
        y,
        sWidth,
        sHeight,
      );
    }
  }

  Game.camera.end();
};

Game.update = function (tFrame) {
  // Update map and character status
  // console.log(`Updating game state.`)
  const delta = tFrame - Game.lastTick;

  if (!Game.networkHandler.isInitialized) {
    return;
  }

  // console.log(`Delta: ${delta}`)
  const playerData = Game.worldState.world_state_data[Game.ACTIVE_PLAYER];

  // Pull worldStateData from Game.receivedWorldStateBuffer and overwrite client's copy of Game.worldState
  if (Game.receivedWorldStateBuffer !== null) {
    const newRenderState = {};
    for (const clientId of Object.keys(Game.receivedWorldStateBuffer)) {
      // Clients may drop in and out so we need to check for this
      if (clientId in Game.renderState) {
        // Check if there are any changes of state from the players (e.g. walking --> standing)
        // and if there are, reset currentAnimationFrame to 0
        const oldPlayerState = Game.worldState.world_state_data[clientId];
        const oldPlayerRenderState = Game.renderState[clientId];
        if (
          oldPlayerState &&
          oldPlayerState.status !==
            Game.receivedWorldStateBuffer[clientId].status
        ) {
          // reset the currentAnimationFrame
          newRenderState[clientId] = {
            messageToDisplay: oldPlayerRenderState.messageToDisplay,
            currentAnimationFrame: 0,
            lastAnimationChangeTime:
              oldPlayerRenderState.lastAnimationChangeTime,
          };
        } else {
          newRenderState[clientId] = oldPlayerRenderState;
        }
      }
      // This is a new clientId, so just set default
      else {
        newRenderState[clientId] = {
          messageToDisplay: null,
          currentAnimationFrame: 0,
          lastAnimationChangeTime: tFrame,
        };
      }
    }
    Game.worldState.world_state_data = Game.receivedWorldStateBuffer;
    Game.worldState.world_state_data[Game.ACTIVE_PLAYER] = playerData;

    newRenderState[Game.ACTIVE_PLAYER] = Game.renderState[Game.ACTIVE_PLAYER];
    Game.renderState = newRenderState;
  }

  // Update position
  if (
    Game.PLAYER_TARGET_DEST !== null &&
    playerData !== null &&
    playerData.position !== null
  ) {
    // console.log(Game.worldState.world_state_data[Game.ACTIVE_PLAYER].position)
    playerData.status = "walking";
    let [dx, dy] = [
      Game.PLAYER_TARGET_DEST[0] - playerData.position[0],
      Game.PLAYER_TARGET_DEST[1] - playerData.position[1],
    ];
    // console.log(dx, dy)
    const l = Math.sqrt(dx ** 2 + dy ** 2);
    dx /= l;
    dy /= l;
    playerData.direction = dx > 0 ? "right" : "left";
    // console.log(`Normalised: ${dx}, ${dy}`)
    playerData.position[0] += delta * Game.PLAYER_SPEED * dx;
    playerData.position[1] += delta * Game.PLAYER_SPEED * dy;

    // Remove the target point
    if (distanceBetween2D(playerData.position, Game.PLAYER_TARGET_DEST) < 1) {
      Game.PLAYER_TARGET_DEST = null;
      // Reset player state to standinga
      playerData.status = "standing";
      Game.renderState[Game.ACTIVE_PLAYER].currentAnimationFrame = 0;
    }
  }

  Game.networkHandler.sendPlayerState(playerData);

  // Coin! check if coin is close enough to the player, if yes, take it
  if (
    Game.coinPosition !== null &&
    distanceBetween2D(playerData.position, Game.coinPosition) < 10
  ) {
    Game.coinPosition = null;
    delete Game.renderEntityState.coin;
    Game.playerCoins += 1;
  }

  // Entities
  for (const entity of Game.entities) {
    entity.update();
  }
};
