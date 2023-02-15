/**
 * Make sure to include this file after minimalTest.js
 * since it uses:
 * - `MATRIX_USER_ID` 
 */

/**
 * Gets set to the postMessage callback once GAME_CHANNEL.port2
 * is successfully sent to the game iframe
 */
var gameCommOnMatrixMsg = undefined;

let gameChannel;

const sleep = ms => new Promise(r => setTimeout(r, ms));

function toInitMsg() {
    return JSON.stringify({ matrix_id: MATRIX_USER_ID });
}

function toMessageMsg(matrixEvent) {
    return JSON.stringify({ matrix_id: matrixEvent.getSender(), body: matrixEvent.getContent().body });
}

async function initLoop() {
    while (true) {
        const gameIFrame = document.getElementById("game_frame");
        if (gameIFrame) {
            // console.log("trying to connect to game_iframe");
            gameChannel = new MessageChannel();
            const port1 = gameChannel.port1
            port1.onmessage = (msg) => {
                // received echo from game
                if (msg.data === toInitMsg()) {
                    gameCommOnMatrixMsg = (matrixEvent) => {
                        port1.postMessage(toMessageMsg(matrixEvent));
                    }
                    // TODO: delete since game shouldn't be sending any msgs
                    port1.onmessage = (msg) => {
                        console.log("Received from game:", msg.data);
                    }
                    // console.log("gameCommOnMatrixMsg set");
                    return;
                }
                throw new Error(`unexpected init echo from iframe: ${msg}`);
            }

            gameIFrame.contentWindow.postMessage(toInitMsg(), "*", [gameChannel.port2]);
            await sleep(250);
            if (gameCommOnMatrixMsg !== undefined) {
                console.log("gameComm init");
                return;
            }
        }
        await sleep(250);
    }
}

initLoop();
