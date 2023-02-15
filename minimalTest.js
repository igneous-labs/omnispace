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

function setRoomList() {
    roomList = client.getRooms();
}

function setActiveRoom(roomName) {
    viewingRoom = roomName
}

function printRoomList() {
    console.log("printing room list")
    let html = ''
    for (let i = 0; i < roomList.length; i++) {
        html += `<div onClick="setActiveRoom('${roomList[i].name}'); render();">${roomList[i].name} </div>`
    }    
    document.getElementById("view").innerHTML = html
}

function render() {
    document.getElementById("view").innerHTML = ""
    if (viewingRoom === null) {
        printRoomList();
    }
    else {
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
        // console.log("event.getContent:", c);
        messageHistory[room.name] += `${event.getSender()}: ${c.body} <br/>`

        if (gameCommOnMatrixMsg) {
            gameCommOnMatrixMsg(event);
        }
    });
}

start();
