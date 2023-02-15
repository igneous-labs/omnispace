var roomList = [];
var viewingRoom = null;
var messageHistory = {}

const client = matrixcs.createClient({
    baseUrl: "https://matrix.melchior.info",
    accessToken: "syt_ZnA_pAgfSpoWUqWbfCUMlJSd_1IImad",
    userId: "@fp:melchior.info",
});

// client.login("m.login.password", {"user": myUserId, "password": "123456789"}).then((response) => {
//     console.log(response.access_token);
// });

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
        messageHistory[room.name] += `${event.getSender()}: ${event.getContent().body} <br/>`
    });
}

start();

