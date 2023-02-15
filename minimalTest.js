const MATRIX_USER_ID = "@fp:melchior.info";
const MATRIX_PASSWORD = "123456789";
const MATRIX_BASEURL = "https://matrix.melchior.info";

var roomList = [];
var viewingRoom = null;
var messageHistory = {}
var accessToken = undefined;

const client = matrixcs.createClient({
    baseUrl: MATRIX_BASEURL,
    accessToken,
    userId : MATRIX_USER_ID,
});

if (accessToken === undefined) {
    client.login("m.login.password", { user: MATRIX_USER_ID, password: MATRIX_PASSWORD }).then((response) => {
        accessToken = response.access_token;
    });
}

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
            return -1;
        }
        var bMsg = b.timeline[b.timeline.length - 1];
        if (!bMsg) {
            return 1;
        }
        if (aMsg.getTs() > bMsg.getTs()) {
            return 1;
        } else if (aMsg.getTs() < bMsg.getTs()) {
            return -1;
        }
        return 0;
    });
    roomList = roomList.reverse()
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
        printRoomList();
    }
    else {
        console.log(viewingRoom)
        document.getElementById("view").innerHTML = messageHistory[viewingRoom];
    }
}

async function start() {
    await client.startClient();
    
    client.once('sync', function(state, prevState, res) {
        console.log(state); // state will be 'PREPARED' when the client is ready to use
        switch (state) {
            case "PREPARED":
                setRoomList();
                render();
                break;
        }
    });

    client.on("Room", () => {
        setRoomList();
    })

    client.on("Room.timeline", (event, room, toStartOfTimeline) => {
        if (toStartOfTimeline) {
            return; // don't print paginated results
        }
        if (event.getType() !== "m.room.message") {
            return; // only print messages
        }
        const c = event.getContent();
        messageHistory[room.roomId] += `${event.getSender()}: ${c.body} <br/>`;

        if (gameCommOnMatrixMsg) {
            gameCommOnMatrixMsg(event);
        }
    });
}

start();
