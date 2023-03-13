import {
  createMatrixClient,
  debounce,
  isMobile,
  sleep,
} from "@/js/common/utils";
import { MATRIX_LOGIN_LOCAL_STORAGE_KEY } from "@/js/common/consts";
import { Game } from "@/js/index/game/game";
import ClipboardJS from "clipboard";

/**
 * @typedef MatrixLoginStored
 * @property {string} accessToken
 * @property {string} userId
 */

/**
 * @type {MatrixLoginStored}
 */
// @ts-ignore will redirect to login page if not set in onPageParsed
// eslint-disable-next-line import/no-mutable-exports
export let matrixLoginStored = null;

let appMode = "game";

let roomList = new Map();
let viewingRoom = null;
const messageHistory = {};
let client = null;

// This function bridges the chat client and game client
function gameCommOnMatrixMsg(matrixEvent) {
  // FIXME this couples the client code to the game code, and should be avoided
  console.log("New matrix message. gameCommOnMatrixMsg called");
  const matrixUserId = matrixEvent.getSender();
  const idUserMapping = Game.worldState.client_chat_user_ids;

  const gameUserIds = Object.entries(idUserMapping).filter(
    ([, v]) => v === matrixUserId,
  );
  console.log(gameUserIds);
  if (gameUserIds.length > 0) {
    gameUserIds.forEach(([gameUserId]) => {
      if (gameUserId in Game.renderState) {
        Game.renderState[gameUserId].messageToDisplay = [
          matrixEvent.getContent().body,
          performance.now(),
        ];
      }
    });
  }
}

// ============================================== //

function sendImageMessage(e) {
  e.preventDefault();
  /** @type {HTMLImageElement} */
  // @ts-ignore
  const imageEle = document.getElementById("uploadPreview");
  // get image blob from blob url
  fetch(imageEle.src).then((res) =>
    res.blob().then((blob) => {
      // upload blob to matrix server and get mxc url
      client.uploadContent(blob).then((r) => {
        const content = {
          body: "Image", // file name
          msgtype: "m.image",
          url: r.content_uri,
          info: {
            mimetype: blob.type,
          },
        };
        client
          .sendEvent(viewingRoom, "m.room.message", content, "")
          .then(() => {
            imageEle.src = "";
            /** @type {HTMLDialogElement} */
            // @ts-ignore
            const dialog = document.getElementById("uploadImageDialog");
            dialog.close();
            render();
          });
      });
    }),
  );
}

const handleSearchRooms = debounce((event) => {
  searchRooms(event);
}, 500);

const messageData = {
  messageMenuOpen: false,
  selectedMessage: null,
  replyingToMessage: null,

  /** @type {?ReturnType<typeof setTimeout>} */
  messageMenuTimer: null,
  messageMenuDelay: 800, // Length of time we want the user to touch before showing menu
  // WARNING: refresh the page whenever you enter/exit mobile simulator mode in the browser, otherwise the isMobile variable will be wrong (since we initialize it just once at the top of this file, don't want to reinitialize it every time user click)
  openMessageMenu(e) {
    this.messageMenuOpen = true;

    const clickedTop = isMobile
      ? e.targetTouches[0].clientY - 20
      : e.clientY - 30;
    const clickedLeft = isMobile ? e.targetTouches[0].clientX : e.clientX + 30;
    /** @type {HTMLDivElement} */
    // @ts-ignore
    const messageMenuEl = document.getElementById("message_menu");
    messageMenuEl.style.top = `${
      clickedTop - e.target.offsetParent.offsetTop
    }px`;
    messageMenuEl.style.left = `${
      clickedLeft - e.target.offsetParent.offsetLeft
    }px`;

    const { messageEventId } = e.target.closest("div").dataset;
    const message = messageHistory[viewingRoom].find(
      (m) => m.event.event_id === messageEventId,
    );
    this.selectedMessage = message;
  },
  handleRightClick(e) {
    if (!isMobile) {
      e.preventDefault();
      this.openMessageMenu(e);
    }
  },
  messageTouchStart(e) {
    const self = this;
    if (!this.messageMenuTimer) {
      this.messageMenuTimer = setTimeout(() => {
        self.messageMenuTimer = null;
        self.openMessageMenu(e);
      }, this.messageMenuDelay);
    }
  },
  messageTouchEnd() {
    // Stops short touches from firing the event
    if (this.messageMenuTimer) {
      clearTimeout(this.messageMenuTimer);
      this.messageMenuTimer = null;
    }
  },
  handleCloseMenu() {
    if (this.messageMenuOpen) {
      this.messageMenuOpen = false;
      this.selectedMessage = null;
      /** @type {HTMLDivElement} */
      // @ts-ignore
      const messageMenuEl = document.getElementById("message_menu");
      messageMenuEl.style.top = "";
      messageMenuEl.style.left = "";
    }
  },
  handleReply() {
    this.replyingToMessage = this.selectedMessage;
    this.handleCloseMenu();
  },
  handleUnselectReply() {
    this.replyingToMessage = null;
  },
  handleSendMessage(e) {
    // Button click
    if (!e) {
      // @ts-ignore
      sendMessage(this.replyingToMessage?.event.event_id);
      this.handleUnselectReply();
    } else if (e.keyCode === 13) {
      // Shift + enter pressed
      if (e.shiftKey) {
        e.stopPropagation();
        return;
      }

      // Enter pressed (on mobile just add a new line)
      if (!isMobile) {
        e.preventDefault();
        // @ts-ignore
        sendMessage(this.replyingToMessage?.event.event_id);
        this.handleUnselectReply();
      }
    }
  },
  handleCopy() {
    // @ts-ignore
    const text = this.selectedMessage.event.content.body;
    ClipboardJS.copy(text);
    this.handleCloseMenu();
  },
};

function sendMessage(replyToEventId) {
  // @ts-ignore
  const message = document.getElementById("chat_input").innerText;
  console.log(`Message received: ${message}`);
  const content = {
    body: message,
    msgtype: "m.text",
    ...(replyToEventId
      ? {
          "m.relates_to": {
            "m.in_reply_to": {
              event_id: replyToEventId,
            },
          },
        }
      : {}),
  };
  client.sendEvent(viewingRoom, "m.room.message", content, "").then(() => {
    // @ts-ignore
    document.getElementById("chat_input").innerText = "";
    render();
  });
}

function setRoomList() {
  console.log("Setting room list");
  const tmp = client.getRooms();
  // console.log(roomList);
  tmp.sort((a, b) => {
    // < 0 = a comes first (lower index) - we want high indexes = newer
    const aMsg = a.timeline[a.timeline.length - 1];
    if (!aMsg) {
      return 1;
    }
    const bMsg = b.timeline[b.timeline.length - 1];
    if (!bMsg) {
      return -1;
    }
    if (aMsg.getTs() > bMsg.getTs()) {
      return -1;
    }
    if (aMsg.getTs() < bMsg.getTs()) {
      return 1;
    }
    return 0;
  });

  // making use of Map's property that it respects insertion order: that's
  // why we create a new Map rather than just editing the old one.
  const tmp2 = new Map();
  tmp.forEach((room) => {
    tmp2.set(room.roomId, room);
  });
  roomList = tmp2;
}

function setActiveRoom(roomId) {
  /** @type {HTMLDivElement} */
  // @ts-ignore
  const roomSearch = document.getElementById("room-search");
  if (roomId) {
    roomSearch.classList.add("hidden");
  } else {
    roomSearch.classList.remove("hidden");
  }
  viewingRoom = roomId;
}

function stringToColor(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    // eslint-disable-next-line no-bitwise
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }

  return `hsl(${hash % 360}, 85%, 35%)`;
}

function printRoomList() {
  console.log("printing room list");
  let html = "";

  if (roomList.size === 0) {
    html += `<p class="text-xl text-center">No rooms found.</p>`;
  } else {
    for (const [roomId, room] of roomList) {
      const thumbnailBg = stringToColor(roomId);
      const unreadMessagesCount = room.notificationCounts.total || 0;
      html += `
<div class="flex items-center justify-between w-full py-2 px-4 rounded-sm bg-gray-100" onClick="setActiveRoom('${roomId}'); render();">
  <div class="flex items-center space-x-2">
    <div class="rounded-full h-12 w-12 flex items-center justify-center text-lg font-bold text-white select-none" style="background-color: ${thumbnailBg}">${room.name
        .charAt(0)
        .toUpperCase()}</div>
    <span class="font-medium">${room.name}</span>
  </div>
  ${
    unreadMessagesCount > 0
      ? `<span class="text-sm font-medium h-6 min-w-[24px] box-content rounded-full p-[3px] bg-blue-500 text-white flex items-center justify-center">${unreadMessagesCount}</span>`
      : ""
  }
</div>
    `;
    }
  }

  // @ts-ignore
  document.getElementById("view").innerHTML = html;
}

export function render() {
  /** @type {HTMLDivElement} */
  // @ts-ignore
  const view = document.getElementById("view");
  if (viewingRoom === null) {
    // @ts-ignore
    document.getElementById("title").textContent = "All Chats";
    // @ts-ignore
    document.getElementById("back").classList.add("invisible");
    // @ts-ignore
    document.getElementById("message_form").classList.remove("flex");
    // @ts-ignore
    document.getElementById("message_form").classList.add("hidden");
    printRoomList();
  } else {
    // @ts-ignore
    document.getElementById("title").textContent =
      roomList.get(viewingRoom).name;
    // @ts-ignore
    document.getElementById("back").classList.remove("invisible");
    // @ts-ignore
    document.getElementById("message_form").classList.remove("hidden");
    // @ts-ignore
    document.getElementById("message_form").classList.add("flex");

    // because view is col-reverse while messageHistory is in chronological order,
    // we need to add latest first so that it renders at the bottom
    const messageHistoryHTML = messageHistory[viewingRoom]
      .map((x) => x)
      .reverse()
      .reduce((acc, message) => {
        // Find the room where
        const roomId = message.event.room_id;
        const senderId = message.event.sender;
        const members = roomList.get(roomId).getMembers();
        const senderName = members.filter(
          (member) => member.userId === senderId,
        )[0].rawDisplayName;

        return `${acc}
                <div :class="{'select-none': isMobile}" data-message-event-id="${
                  message.event.event_id
                }" class="message_bubble ${
          senderId === matrixLoginStored.userId
            ? "self_message"
            : "other_message"
        }">
                    ${
                      senderId === matrixLoginStored.userId
                        ? ""
                        : `<strong>${senderName}: </strong>`
                    }
                    <span x-on:touchstart="messageTouchStart(event);" x-on:touchend="messageTouchEnd(event);" x-on:contextmenu="handleRightClick(event)">
                        ${message.event.content.body}
                      ${
                        message.event.content.msgtype === "m.image"
                          ? `<img src=${client.mxcUrlToHttp(
                              message.event.content.url,
                            )} />`
                          : ""
                      }
                    </span>
                </span>
                </div>
            `;
      }, "");

    const prevScrollTop = view.scrollTop;
    const isAtBottom = view.scrollTop === 0;
    view.innerHTML = messageHistoryHTML;

    if (isAtBottom) {
      view.scrollTop = 0;
    } else {
      view.scrollTop = prevScrollTop;
    }
  }

  /** @type {HTMLCanvasElement} */
  // @ts-ignore
  const canvas = document.getElementById("canvas");

  /** @type {HTMLButtonElement} */
  // @ts-ignore
  const toggleChat = document.getElementById("toggle_chat");
  console.log(appMode);
  if (appMode === "game") {
    // Always show canvas in game mode
    canvas.style.display = "block";
    toggleChat.classList.add("bg-slate-600");
    toggleChat.classList.add("hover:bg-slate-700");
    toggleChat.classList.remove("bg-green-400");
    toggleChat.classList.remove("hover:bg-green-500");
  } else {
    canvas.style.display = "none";
    toggleChat.classList.remove("bg-slate-600");
    toggleChat.classList.remove("hover:bg-slate-700");
    toggleChat.classList.add("bg-green-400");
    toggleChat.classList.add("hover:bg-green-500");
  }
}

function handlePaste(evt) {
  const clipboardItems = evt.clipboardData.items;
  const images = [].slice.call(clipboardItems).filter(
    (item) =>
      // Filter the image items only
      item.type.indexOf("image") !== -1,
  );
  if (images.length === 0) {
    return;
  }
  console.log(images);
  handleImagePaste(images);
}

function handleImagePaste(images) {
  /** @type {HTMLDialogElement} */
  // @ts-ignore
  const imageUploadDialog = document.getElementById("uploadImageDialog");
  console.log("pasted");
  imageUploadDialog.showModal();
  // Handle the `paste` event
  // Get the data of clipboard

  const item = images[0];
  console.log(item);
  // Get the blob of image
  const blob = item.getAsFile();
  console.log(blob);
  /** @type {HTMLImageElement} */
  // @ts-ignore
  const imageEle = document.getElementById("uploadPreview");
  imageEle.src = URL.createObjectURL(blob);
}

// Hack: matrix events are recent if localTimestamp within 60s
function isRecentEvent(event) {
  return Math.abs(event.localTimestamp - Date.now()) < 60000;
}

// trivial folding hash function that takes string and returns integer < U16 MAX
// intended to be used to convert matrix event_id (base64 string) to a dice roll
function simpleHash(str) {
  const U16_MAX = 65536;
  let res = 0;
  for (let i = 0; i < str.length; i++) {
    res += str[i].charCodeAt(0);
    res %= U16_MAX;
  }
  return res;
}

/**
 * Tracks the event.event.origin_server_ts of the latest processed
 * !roll to mitigate race conditions
 */
let lastRollCmdTs = 0;

/**
 *
 * @returns {Promise<void>} that resolves when remote echo complete for the
 */
async function pollRemoteEcho(matrixEvent) {
  while (true) {
    // before remote echo, event_id is of the format
    // `~!...@melchior.info...`
    if (matrixEvent.getId().startsWith("$")) {
      return;
    }
    // give enough time for the full sync with server to happen
    // eslint-disable-next-line no-await-in-loop
    await sleep(1000);
  }
}

function handleCmd(event) {
  const cmd = event.event.content.body.split(" ")[0].substring(1);
  switch (cmd) {
    case "roll":
      pollRemoteEcho(event).then(() => {
        // hash the event id (excluding the leading '$' character)
        console.log("[handleCmd::roll] event_id: ", event.getId().slice(1));
        /** @type {import("./game/entities/die.js").DieChoice} */
        // @ts-ignore
        const choice = (simpleHash(event.getId().slice(1)) % 6) + 1;
        console.log("[handleCmd::roll] choice: ", choice);
        if (event.getTs() <= lastRollCmdTs) {
          console.log("roll expired, discarding");
          return;
        }
        lastRollCmdTs = event.getTs();
        Game.globalDie.choice = choice;
        Game.globalSign.state = choice - 1;
      });
      break;
    default:
      console.error(`Unknown cmd ${cmd}`);
      break;
  }
}

function setCallbacksOnPrepared() {
  client.on("Room", () => {
    setRoomList();
    render();
  });

  client.on("Room.timeline", (event, room, toStartOfTimeline) => {
    if (event.getType() === "m.room.message") {
      const isChatCmd = event.event.content.body.startsWith("!");
      // only respond to commands in hello-world-0
      if (isChatCmd && room.name === "hello-world-0") {
        handleCmd(event);
      }

      appendMessageEvent(event, room, toStartOfTimeline);
      if (isRecentEvent(event)) {
        gameCommOnMatrixMsg(event);
      }
    }
    // so that most recent appears first
    setRoomList();
    render();
  });
}

function appendMessageEvent(event, room, toStartOfTimeline) {
  if (toStartOfTimeline) {
    return; // don't print paginated results
  }
  if (!messageHistory[room.roomId]) {
    messageHistory[room.roomId] = [];
  }
  messageHistory[room.roomId].push(event);
}

async function start() {
  client = await createMatrixClient(matrixLoginStored);

  // @ts-ignore
  client.on("Room.timeline", appendMessageEvent);

  // See matrix-js-sdk src/client.ts comment:
  // initial state can only transition to either "PREPARED" or "ERROR",
  // so once() is safe
  // @ts-ignore
  client.once("sync", (state, _prevState, _res) => {
    console.log(state); // state will be 'PREPARED' when the client is ready to use
    switch (state) {
      case "PREPARED":
        client.off("Room.timeline", appendMessageEvent);
        setCallbacksOnPrepared();
        setRoomList();
        render();
        break;
      case "ERROR":
        throw new Error("Error syncing matrix");
      default:
        throw new Error("unreachable");
    }
  });

  await client.startClient();
}

export async function logout() {
  const logoutPromise = client.logout();
  window.localStorage.removeItem(MATRIX_LOGIN_LOCAL_STORAGE_KEY);
  await logoutPromise;
  client.stopClient();
  await client.clearStores();
  window.location.replace("login.html");
}

function searchRooms(event) {
  const { value } = event.target;
  console.log(value);

  setRoomList();

  if (value !== "") {
    const foundRooms = [...roomList].filter((item) => {
      const room = item[1];
      return room.name.toLowerCase().includes(value.toLowerCase());
    });
    roomList = new Map(foundRooms);
  }

  printRoomList();
}

export function toggleAppMode() {
  appMode = appMode === "game" ? "chat" : "game";
}

export function onPageParsed() {
  const matrixLoginStoredStr = window.localStorage.getItem(
    MATRIX_LOGIN_LOCAL_STORAGE_KEY,
  );
  if (!matrixLoginStoredStr) {
    window.location.replace("login.html");
    return;
  }

  matrixLoginStored = JSON.parse(matrixLoginStoredStr);
  document.addEventListener("paste", handlePaste);
  start();

  // pollute global scope so alpine can use
  // @ts-ignore
  window.messageData = messageData;
  // @ts-ignore
  window.render = render;
  // @ts-ignore
  window.setActiveRoom = setActiveRoom;
  // @ts-ignore
  window.handleSearchRooms = handleSearchRooms;
  // @ts-ignore
  window.sendImageMessage = sendImageMessage;
}
