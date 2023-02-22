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

function sendMessage(e) {
    if (e.keyCode === 13) {
        // Shift + enter pressed
        if (e.shiftKey) {
            e.stopPropagation();
            return;
        }

        // Enter pressed
        e.preventDefault();

        const message = document.getElementById("chat_input").innerText
        console.log(`Message received: ${message}`)
        const content = {
            "body": message,
            "msgtype": "m.text"
        };
        client.sendEvent(viewingRoom, "m.room.message", content, "").then((result) => {
            document.getElementById("chat_input").innerText = ''
            render();
        })
    }
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
    }
    else {
        document.getElementById("title").textContent = roomList.get(viewingRoom).name
        var messageHistoryHTML = messageHistory[viewingRoom].reduce((acc, message) => {
            // Find the room where 
            const roomId = message['event']['room_id']
            const senderId = message['event']['sender']
            const members = roomList.get(roomId).getMembers()
            const senderName = members.filter((member) => member.userId === senderId)[0].rawDisplayName
            return acc + `<div><strong>${senderName}: </strong> ${message.event.content.body} </div>`
        }, '')

      
        view.innerHTML = messageHistoryHTML

        // Autoscroll to new message, when scrollbar is at the bottom of chatbox
        const isScrolledToBottom = view.scrollHeight - view.clientHeight <= view.scrollTop + 1
      
        if (isScrolledToBottom) {
          view.scrollTop = view.scrollHeight - view.clientHeight
        }
    }
}

function handleImagePaste(evt) {
    const imageUploadDialog = document.getElementById("uploadImageDialog")
    console.log("pasted")
    imageUploadDialog.showModal();
    // Handle the `paste` event
    // Get the data of clipboard
    const clipboardItems = evt.clipboardData.items;
    const items = [].slice.call(clipboardItems).filter(function (item) {
        // Filter the image items only
        return item.type.indexOf('image') !== -1;
    });
    if (items.length === 0) {
        return;
    }   

    const item = items[0];
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
        appendMessageEvent(event, room, toStartOfTimeline);
        // only send recent/new messages to game
        if (gameCommOnMatrixMsg && isRecentEvent(event)) {
            gameCommOnMatrixMsg(event);
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
    if (event.getType() !== "m.room.message") {
        return; // only print messages
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
    window.location.replace("login.html");
}

document.addEventListener('paste', handleImagePaste);
start();
