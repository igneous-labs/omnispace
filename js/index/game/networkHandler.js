import { Game } from "@/js/index/game/game";
import { matrixLoginStored } from "@/js/index/matrix";

/*
 * NetworkHandler
 */
const SERVER_URL = "wss://space.melchior.info:1338";

// enum values from the protocol
const ACKNOWLEDGE_MESSAGE_TYPE = 0;
const PLAYER_STATE_MESSAGE_TYPE = 1;
const WORLD_STATE_MESSAGE_TYPE = 2;
const PLAYER_INSTANCE_MESSAGE_TYPE = 5;
const PLAYER_INSTANCE_ACKNOWLEDGE_MESSAGE_TYPE = 6;
const PLAYER_CHAT_USER_ID_MESSAGE_TYPE = 7;
const PLAYER_CHAT_USER_ID_ACKNOWLEDGE_MESSAGE_TYPE = 8;
const DIRECTION_LEFT = 1;
const DIRECTION_RIGHT = 2;
const STATUS_IDLE = 0;
const STATUS_WALK = 1;

// from godot's binary serialization API
const VECTOR2_TYPE_MAGIC_NUMBER = 5;

const U32_BYTES = 4;

// parsing utility functions for World State Sync

/**
 * slices binary serialized PackedByteArray starting from the given offset
 *  @param {ArrayBuffer} arrayBuffer *required
 *  @param {number} offset *required
 *  @returns {[number, ArrayBuffer]} [endOffset, array] the offset of last byte of the array, sliced binary serialized array
 */
function slicePackedByteArray(arrayBuffer, offset) {
  const dataView = new DataView(arrayBuffer, offset);
  const dataLength = dataView.getUint32(U32_BYTES, true);
  const dataOffset = offset + U32_BYTES + U32_BYTES;
  const endOffset = dataOffset + dataLength;
  return [endOffset, arrayBuffer.slice(dataOffset, endOffset)];
}

/**
 *
 * @param {ArrayBufferLike} arrayBuffer
 * @returns {[number, { position: [number, number], direction: "left" | "right", status: "standing" | "walking"}]} [client_id, player_state]
 */
function parseWorldStateDataEntry(arrayBuffer) {
  const dataView = new DataView(arrayBuffer);
  return [
    dataView.getUint16(0, true),
    {
      position: [dataView.getFloat32(6, true), dataView.getFloat32(10, true)],
      direction: dataView.getUint8(14) === DIRECTION_LEFT ? "left" : "right",
      status: dataView.getUint8(15) === STATUS_IDLE ? "standing" : "walking",
    },
  ];
}

/**
 *
 * @param {ArrayBufferLike} arrayBuffer
 * @returns {[number, string]} [clientId, matrixId]
 */
function parseInstanceChatUserIdsEntry(arrayBuffer) {
  const dataView = new DataView(arrayBuffer);
  return [
    dataView.getUint16(0, true),
    new TextDecoder().decode(arrayBuffer.slice(2)),
  ];
}

/**
 *
 * @template K, V
 * @param {(a: ArrayBufferLike) => [K, V]} parser
 * @param {ArrayBufferLike} arrayBuffer
 * @returns {{ [k in K]: V }}
 */
function parseEntriesFromArrayBytes(parser, arrayBuffer) {
  const dataView = new DataView(arrayBuffer);
  // number of entries
  const n = dataView.getUint32(U32_BYTES, true);
  const entries = [];
  let offset = U32_BYTES * 2;
  for (let i = 0; i < n; i++) {
    const [endOffset, entryBytes] = slicePackedByteArray(arrayBuffer, offset);
    // NOTE: godot's array is always padded to 4 bytes when serialized
    const padding =
      (U32_BYTES - (entryBytes.byteLength % U32_BYTES)) % U32_BYTES;
    entries.push(parser(entryBytes));
    offset = endOffset + padding;
  }
  return Object.fromEntries(entries);
}

export class NetworkHandler {
  constructor() {
    // this flag is used to delay sending player state,
    this.isInitialized = false;
    this.socket = new WebSocket(SERVER_URL);
    this.socket.binaryType = "blob";

    this.socket.addEventListener("open", (_event) => {
      console.log("[NetworkHandler] socket opened");
    });
    this.socket.addEventListener("message", (event) => {
      event.data.arrayBuffer().then((arrayBuffer) => {
        const payload = new DataView(arrayBuffer);
        const messageType = payload.getUint8(0);
        // console.log(`[NetworkHandler] received event type: ${messageType}`);
        switch (messageType) {
          case ACKNOWLEDGE_MESSAGE_TYPE: {
            const clientId = payload.getUint16(1, true);
            console.log(
              `[NetworkHandler::on_message] server acknowledged connection, client_id: ${clientId}`,
            );
            console.log(
              `[NetworkHandler::on_message] sending player chat user id: ${matrixLoginStored.userId}`,
            );
            Game.ACTIVE_PLAYER = clientId;
            // FIXME: I don't really like the fact that we mutate Game state here.
            // It feels like this should be done in the render loop.
            // populating default player state
            Game.worldState.world_state_data[clientId] = {
              // FIXME magic number -- check other instances of 1500
              position: [1500 / 2, 1500 / 2],
              direction: "right",
              status: "standing",
            };
            Game.renderState[clientId] = {
              messageToDisplay: null,
              currentAnimationFrame: 0,
              lastAnimationChangeTime: Game.lastRender,
            };
            this.sendPlayerChatUserId(matrixLoginStored.userId);
            break;
          }
          case PLAYER_CHAT_USER_ID_ACKNOWLEDGE_MESSAGE_TYPE:
            console.log(
              "[NetworkHandler::on_message] server acknowledged PLAYER_CHAT_USER_ID message",
            );
            console.log(
              "[NetworkHandler::on_message] registering player to instance",
            );
            this.sendPlayerInstance(0n);
            break;
          case PLAYER_INSTANCE_ACKNOWLEDGE_MESSAGE_TYPE:
            console.log(
              "[NetworkHandler::on_message] server acknowledged PLAYER_INSTANCE message",
            );
            console.log(
              "[NetworkHandler::on_message] network handler is initialized",
            );
            this.isInitialized = true;
            this.sendPlayerState({
              position: [2, 1],
              direction: "left",
              status: "standing",
            });
            break;
          case WORLD_STATE_MESSAGE_TYPE: {
            // console.log("[NetworkHandler::on_message] received world state");
            const worldStateDataOffset = 9;
            const [instanceChatUserIdsOffset, worldStateDataBytes] =
              slicePackedByteArray(arrayBuffer, worldStateDataOffset);
            const [, instanceChatUserIdsBytes] = slicePackedByteArray(
              arrayBuffer,
              instanceChatUserIdsOffset,
            );

            // Parse worldStateData
            Game.receivedWorldStateBuffer = parseEntriesFromArrayBytes(
              parseWorldStateDataEntry,
              worldStateDataBytes,
            );

            // Parse instanceChatUserIds
            Game.worldState.client_chat_user_ids = parseEntriesFromArrayBytes(
              parseInstanceChatUserIdsEntry,
              instanceChatUserIdsBytes,
            );
            break;
          }
          default:
            console.log(
              "[NetworkHandler::on_message] received unexpected message: ",
              arrayBuffer,
            );
        }
      });
    });
    this.socket.addEventListener("close", (_event) => {
      console.log("[NetworkHandler] socket closed");
    });
    this.socket.addEventListener("error", (event) => {
      console.log(`[NetworkHandler] error: ${JSON.stringify(event)}`);
    });
  }

  /**
   *  @param {string} userId *required
   */
  sendPlayerChatUserId(userId) {
    this.sendMessage(
      PLAYER_CHAT_USER_ID_MESSAGE_TYPE,
      new TextEncoder().encode(userId),
    );
  }

  /**
   *  @param {bigint} instanceId (U64) *required
   */
  sendPlayerInstance(instanceId) {
    const buffer = new ArrayBuffer(8);
    new DataView(buffer).setBigUint64(0, instanceId, true /* littleEndian */);
    this.sendMessage(PLAYER_INSTANCE_MESSAGE_TYPE, new Uint8Array(buffer));
  }

  /**
   * @typedef PlayerState
   * @property {[number, number]} position
   * @property {"right" | "left"} direction
   * @property {"standing" | "walking"} status
   */

  /**
   *  @param {PlayerState} playerState *required
   *
   *  NOTE: godot's Vector2 type uses 12 bytes: 4 bytes for type identifier, 4 bytes for each axis
   */
  sendPlayerState(playerState) {
    if (!this.isInitialized) return;
    const buffer = new ArrayBuffer(14);
    const dataView = new DataView(buffer);

    // pack position
    dataView.setUint32(0, VECTOR2_TYPE_MAGIC_NUMBER, true /* littleEndian */);
    dataView.setFloat32(4, playerState.position[0], true /* littleEndian */);
    dataView.setFloat32(8, playerState.position[1], true /* littleEndian */);

    // pack direction
    const direction =
      playerState.direction === "left" ? DIRECTION_LEFT : DIRECTION_RIGHT;
    dataView.setUint8(12, direction);

    // pack status
    const status =
      playerState.status === "standing" ? STATUS_IDLE : STATUS_WALK;
    dataView.setUint8(13, status);

    this.sendMessage(PLAYER_STATE_MESSAGE_TYPE, new Uint8Array(buffer));
  }

  /**
   *  @param {number} messageType *required
   *  @param {Uint8Array} messageData *required
   */
  sendMessage(messageType, messageData) {
    const payload = new Uint8Array([messageType, ...messageData]);
    // console.log("[NetworkHandler::send] sending: ", payload);
    this.socket.send(payload);
  }
}
