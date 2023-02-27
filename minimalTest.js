const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

const matrixLoginStoredStr = window.localStorage.getItem(MATRIX_LOGIN_LOCAL_STORAGE_KEY);
if (!matrixLoginStoredStr) {
    window.location.replace("login.html");
}

const MATRIX_LOGIN_STORED = JSON.parse(matrixLoginStoredStr);
const { accessToken: MATRIX_ACCESS_TOKEN, userId: MATRIX_USER_ID } = MATRIX_LOGIN_STORED;

var roomList = [];
var viewingRoom = null;
var messageHistory = {};
var client = null;
var prevVisualViewportHeight = 999999;

// This function bridges the chat client and game client
function gameCommOnMatrixMsg(matrixEvent) {
    // FIXME this couples the client code to the game code, and should be avoided
    console.log("New matrix message. gameCommOnMatrixMsg called")
    const matrixUserId = matrixEvent.getSender();
    const idUserMapping = Game.worldState.client_chat_user_ids

    const gameUserIds = Object.entries(idUserMapping).filter(([ , v]) => v === matrixUserId)
    console.log(gameUserIds)
    if (gameUserIds.length > 0) {
        gameUserIds.forEach(([gameUserId, matrixUserId]) => {
            if (gameUserId in Game.renderState) {
                Game.renderState[gameUserId].messageToDisplay = [matrixEvent.getContent().body, performance.now()]
            } 
        });
    }
    
}

// ============================================== //

function sendImageMessage(e) {
    e.preventDefault();
    const imageEle = document.getElementById('uploadPreview')
    // get image blob from blob url
    fetch(imageEle.src).then(res => res.blob().then(blob => {
        // upload blob to matrix server and get mxc url
        client.uploadContent(blob).then((res) => {
            const content = {
                "body": "Image", // file name
                "msgtype": "m.image",
                "url": res.content_uri,
                "info": {
                    "mimetype": blob.type,
                }
            }
            client.sendEvent(viewingRoom, "m.room.message", content, "").then((result) => {
                imageEle.src = ""
                document.getElementById('uploadImageDialog').close()
                render();
            })
        })
    }));
}

const messageData = {
    messageMenuOpen: false,
    selectedMessage: null,
    replyingToMessage: null,
    messageMenuTimer: null,
    messageMenuDelay: 800, // Length of time we want the user to touch before showing menu
    // WARNING: refresh the page whenever you enter/exit mobile simulator mode in the browser, otherwise the isMobile variable will be wrong (since we initialize it just once at the top of this file, don't want to reinitialize it every time user click)
    openMessageMenu(e) {
        this.messageMenuOpen = true;

        const clickedTop = isMobile ? e.targetTouches[0].clientY - 20 : e.clientY - 30;
        const clickedLeft = isMobile ? e.targetTouches[0].clientX : e.clientX + 30;
        const messageMenuEl = document.getElementById('message_menu');
        messageMenuEl.style.top = `${clickedTop - e.target.offsetParent.offsetTop}px`;
        messageMenuEl.style.left = `${clickedLeft - e.target.offsetParent.offsetLeft}px`;
      
        const messageEventId = e.target.closest('div').dataset.messageEventId;
        const message = messageHistory[viewingRoom].find((message) => message.event.event_id === messageEventId);
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
            this.messageMenuTimer = setTimeout(function () {
                self.messageMenuTimer = null;
                self.openMessageMenu(e);
              }, this.messageMenuDelay);
          }
    },
    messageTouchEnd(e) {
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
          const messageMenuEl = document.getElementById('message_menu');
          messageMenuEl.style.top = null;
          messageMenuEl.style.left = null;
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
        sendMessage(this.replyingToMessage?.event.event_id);
        this.replyingToMessage = null;
      } else if (e.keyCode === 13) {
          // Shift + enter pressed
          if (e.shiftKey) {
              e.stopPropagation();
              return;
          }

          // Enter pressed (on mobile just add a new line)
          if (!isMobile) {
              e.preventDefault();
              sendMessage(this.replyingToMessage?.event.event_id);
              this.replyingToMessage = null;
          }
      }
    }
}

function sendMessage(replyToEventId) {
    const message = document.getElementById("chat_input").innerText
    console.log(`Message received: ${message}`)
    const content = {
        "body": message,
        "msgtype": "m.text",
        ...(replyToEventId
            ? {
                'm.relates_to': {
                    'm.in_reply_to': {
                        event_id: replyToEventId,
                    },
                },
            }
            : {}),
    };
    client.sendEvent(viewingRoom, "m.room.message", content, "").then((result) => {
        document.getElementById("chat_input").innerText = ''
        render();
    })
}

function setRoomList() {
    console.log("Setting room list")
    let tmp = client.getRooms();
    // console.log(roomList);
    tmp.sort((a, b) => {
        // < 0 = a comes first (lower index) - we want high indexes = newer
        var aMsg = a.timeline[a.timeline.length - 1];
        if (!aMsg) {
            return 1;
        }
        var bMsg = b.timeline[b.timeline.length - 1];
        if (!bMsg) {
            return -1;
        }
        if (aMsg.getTs() > bMsg.getTs()) {
            return -1;
        } else if (aMsg.getTs() < bMsg.getTs()) {
            return 1;
        }
        return 0;
    });
 
    // making use of Map's property that it respects insertion order: that's
    // why we create a new Map rather than just editing the old one.
    let tmp2 = new Map();
    tmp.map((room) => {tmp2.set(room.roomId, room)})
    roomList = tmp2
}

function setActiveRoom(roomId) {
    viewingRoom = roomId
}

function printRoomList() {
    console.log("printing room list")
    let html = ''
    for (const [roomId, room] of roomList) {
        html += `<div onClick="setActiveRoom('${roomId}'); render();"> ${room.name} </div>`
    }    
    document.getElementById("view").innerHTML = html
}

function render() {
    const view = document.getElementById("view")
    view.innerHTML = ""
    if (viewingRoom === null) {
        document.getElementById("title").textContent = "Omnispaces"
        printRoomList();

      view.classList.add('overflow-y-scroll')

      view.scrollTop = 0
    }
    else {
        document.getElementById("title").textContent = roomList.get(viewingRoom).name
        var messageHistoryHTML = messageHistory[viewingRoom].reduce((acc, message) => {
            // Find the room where 
            const roomId = message['event']['room_id']
            const senderId = message['event']['sender']
            const members = roomList.get(roomId).getMembers()
            const senderName = members.filter((member) => member.userId === senderId)[0].rawDisplayName
          
            return acc + `
                <div :class="{'select-none': isMobile}" data-message-event-id="${message.event.event_id}" 
                    class="message_bubble ${senderId === MATRIX_USER_ID ? "self_message" : "other_message"}"
                >
                    ${senderId === MATRIX_USER_ID ? "" : `<strong>${senderName}: </strong>`}
                    <span class="message" x-on:touchstart="messageTouchStart(event);" x-on:touchend="messageTouchEnd(event);" x-on:contextmenu="handleRightClick(event)">
                      ${message.event.content.msgtype === "m.image" ? `<img src=${client.mxcUrlToHttp(message.event.content.url)} />` : message.event.content.body}
                    </span>
                </span>
                </div>
            `
        }, '')

      
        view.innerHTML = `<div id='chat_log'> ${messageHistoryHTML} </div>`

        view.classList.remove('overflow-y-scroll')

        // Autoscroll to new message, when scrollbar is at the bottom of chatbox
        const isScrolledToBottom = view.scrollHeight - view.clientHeight <= view.scrollTop + 1
      
        if (isScrolledToBottom) {
          view.scrollTop = view.scrollHeight - view.clientHeight
        }
    }
}

function handlePaste(evt) {
    const clipboardItems = evt.clipboardData.items;
    const images = [].slice.call(clipboardItems).filter(function (item) {
        // Filter the image items only
        return item.type.indexOf('image') !== -1;
    });
    if (images.length === 0) {
        return;
    }
    else {
        console.log(images)
        handleImagePaste(images);
    }
}

function handleImagePaste(images) {
    const imageUploadDialog = document.getElementById("uploadImageDialog")
    console.log("pasted")
    imageUploadDialog.showModal();
    // Handle the `paste` event
    // Get the data of clipboard
       
    const item = images[0];
    console.log(item)
    // Get the blob of image
    const blob = item.getAsFile();
    console.log(blob)
    const imageEle = document.getElementById('uploadPreview');
    imageEle.src = URL.createObjectURL(blob);
}

// Hack: matrix events are recent if localTimestamp within 60s
function isRecentEvent(event) {
    return Math.abs(event.localTimestamp - Date.now()) < 60_000;
}

function setCallbacksOnPrepared() {
    client.on("Room", () => {
        setRoomList();
        render();
    });

    client.on("Room.timeline", (event, room, toStartOfTimeline) => {
        if (event.getType() === "m.room.message") {
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
        messageHistory[room.roomId] = []
    }
    messageHistory[room.roomId].push(event);
}

async function start() {
    client = await createMatrixClient(MATRIX_LOGIN_STORED);

    client.on("Room.timeline", appendMessageEvent);
    
    // See matrix-js-sdk src/client.ts comment:
    // initial state can only transition to either "PREPARED" or "ERROR",
    // so once() is safe
    client.once("sync", function (state, _prevState, _res) {
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
        }
    });

    await client.startClient();
}

async function logout() {
    const logoutPromise = client.logout();
    window.localStorage.removeItem(MATRIX_LOGIN_LOCAL_STORAGE_KEY);
    await logoutPromise;
    client.stopClient();
    await client.clearStores();
    window.location.replace("login.html");
}

document.addEventListener('paste', handlePaste);

// let pendingUpdate = false;
// const viewportHandler = (event) => {
//     if (pendingUpdate) {
//         return;
//     }
//     pendingUpdate = true;

//     requestAnimationFrame(() => {
//         pendingUpdate = false;
//         const layoutViewport = document.getElementById('game');
//         layoutViewport.style.transform = "none";
//         document.body.style.overflow = "";
//         if (layoutViewport.getBoundingClientRect().top < 0) {
//             layoutViewport.style.transform = `translate(0, ${-layoutViewport.getBoundingClientRect().top}px)`;
//             document.body.style.overflow = "hidden";
//         }
//     });
// };
// window.visualViewport.addEventListener("scroll", viewportHandler);
// window.visualViewport.addEventListener("resize", viewportHandler);

const MIN_KEYBOARD_HEIGHT = 300;
window.visualViewport.addEventListener("resize", (event) => {
    if (!isMobile) return;
    var chat_area = document.getElementById("chat_area");
    var view = document.getElementById("view");
    if (window.screen.height - MIN_KEYBOARD_HEIGHT > window.visualViewport.height) {
      chat_area.style.marginTop = "0px";
      view.style.minHeight = `${400 - 46}px`;
      view.style.maxHeight = `${400 - 46}px`;
      window.scrollTo(0, header?.clientHeight + 26)
    } else {
      chat_area.style.marginTop = "400px";
      view.style.maxHeight = "calc(100vh - 48px - 100vw - 80px)";
      view.style.minHeight = "unset";
      window.scrollTo(0, document.body.scrollHeight)
    }
});

// document.body.addEventListener("touchmove", (event) => {
//     if (isMobile && window.screen.height - MIN_KEYBOARD_HEIGHT > window.visualViewport.height && !canScroll) {
//       const shouldDisableScroll = !event.target.closest('#rooms_messages_list')
//       if (shouldDisableScroll) {
//         event.preventDefault();
//       }
//     }
// }, { passive: false });

start();
