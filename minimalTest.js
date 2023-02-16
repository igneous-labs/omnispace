var roomList = new Map();
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
    let tmp = client.getRooms();
    // console.log(roomList);
    tmp.sort((a, b) => {
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
    tmp = tmp.reverse()
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
    document.getElementById("view").innerHTML = ""
    if (viewingRoom === null) {
        document.getElementById("title").textContent = "Omnispaces"
        printRoomList();
    }
    else {
        console.log(viewingRoom)
        document.getElementById("title").textContent = roomList.get(viewingRoom).name

        var messageHistoryHTML = messageHistory[viewingRoom].reduce((acc, message) => {
            // Find the room where 
            const roomId = message['event']['room_id']
            const senderId = message['event']['sender']
            const members = roomList.get(roomId).getMembers()
            const senderName = members.filter((member) => member.userId === senderId)[0].rawDisplayName
            return acc + `<div><strong>${senderName}: </strong> ${message.event.content.body} </div>`
        }, '')

        console.log(messageHistoryHTML)
        document.getElementById("view").innerHTML = messageHistoryHTML
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
        if (!messageHistory[room.roomId]) {
            messageHistory[room.roomId] = []
        }
        messageHistory[room.roomId].push(event)
        setRoomList();
        render();
    });
}

start();

