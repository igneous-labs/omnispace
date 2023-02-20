const matrixLoginStr = window.localStorage.getItem(MATRIX_LOGIN_LOCAL_STORAGE_KEY);
if (!matrixLoginStr) {
    window.location.replace("login.html");
}

const { accessToken: MATRIX_ACCESS_TOKEN, userId: MATRIX_USER_ID } = JSON.parse(matrixLoginStr);

var roomList = [];
var viewingRoom = null;
var messageHistory = {}

const client = matrixcs.createClient({
    baseUrl: MATRIX_BASEURL,
    accessToken: MATRIX_ACCESS_TOKEN,
    userId : MATRIX_USER_ID,
});

function sendMessage() {
    const message = document.getElementById("chat_input").value
    console.log(`Message received: ${message}`)
    const content = {
        "body": message,
        "msgtype": "m.text"
    };
    client.sendEvent(viewingRoom, "m.room.message", content, "").then((result) => {
        document.getElementById("chat_input").value = ''
        render();
    })
}

function setRoomList() {
    console.log("Setting room list")
    roomList = client.getRooms();
    // console.log(roomList);
    roomList.sort((a, b) => {
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
}

function setActiveRoom(roomId) {
    viewingRoom = roomId
}

function printRoomList() {
    console.log("printing room list")
    let html = ''
    for (let i = 0; i < roomList.length; i++) {
        html += `<div onClick="setActiveRoom('${roomList[i].roomId}'); render();"> ${roomList[i].name} </div>`
    }    
    document.getElementById("view").innerHTML = html
}

function render() {
    document.getElementById("view").innerHTML = ""
    if (viewingRoom === null) {
        document.getElementById("title").textContent = "Omnispaces"
        printRoomList();
    }
    else {
        console.log(viewingRoom)
        document.getElementById("title").textContent = roomList.filter((room) => room.roomId === viewingRoom)[0].name;
        document.getElementById("view").innerHTML = messageHistory[viewingRoom];
    }
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

    const c = event.getContent();
    messageHistory[room.roomId] += `${event.getSender()}: ${c.body} <br/>`;
}

async function start() { 
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

function logout() {
    window.localStorage.removeItem(MATRIX_LOGIN_LOCAL_STORAGE_KEY);
    window.location.replace("login.html");
}

start();
