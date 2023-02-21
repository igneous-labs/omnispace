//
// Asset loader
//

var Loader = {
    images: {}
};

Loader.loadImage = function (key, src) {
    var img = new Image();

    var d = new Promise(function (resolve, reject) {
        img.onload = function () {
            this.images[key] = img;
            resolve(img);
        }.bind(this);

        img.onerror = function () {
            reject('Could not load image: ' + src);
        };
    }.bind(this));

    img.src = src;
    return d;
};

Loader.getImage = function (key) {
    return (key in this.images) ? this.images[key] : null;
};

/*
* Spritesheet mapping object
* Maps each matrix ID to their corresponding character spritesheet
*/

let PlayerSpriteSheetMap = {
    "default": "char_default",
    "@fp:melchior.info": "char_fp"
}

/*
* SpriteSheetFrameMap
* Splits up a spritesheet into its individual frames
*/

let SpriteSheetFrameMap = {
    "char_default": {
        "standing": [[0, 40], [41, 81]],
        "walking": [[82, 122], [123, 163], [164, 204], [205, 245]],
    }
}


/*
* Game object
*
*/ 

let Game = {
    ctx: null,
    lastRender: null,
    worldState: null,
    renderState: null,

    load: () => {},
    setInitialState: () => {},
    run: () => {},
    main: (tFrame) => {},
    update: () => {},
    render: (tFrame) => {},
};

Game.load = function () {
    return [
        Loader.loadImage('room', './img/room.png'),
        Loader.loadImage('char_default', './img/char_default.png'),
        Loader.loadImage('char_fp', './img/char_fp.png')
    ];
};

Game.setInitialState = function () {
    Game.worldState = {
        world_state_data: {
            0: {
                position: [200, 150],
                direction: "right",
                status: "standing",
            },
        },
        client_chat_user_ids: {
            0: "default",
        }, 
    };

    Game.renderState = {
        0: {
            currentAnimationFrame: 0,
            lastAnimationChangeTime: Game.lastRender,
        }
    }
};

Game.run = function () {
    console.log(this)
    Game.lastRender = performance.now(); // Pretend the first draw was on first update.
    Game.tickLength = 40; // This sets your simulation to run at 25Hz (40ms)
    var p = Game.load();
    Promise.all(p).then((loaded) => {
        Game.setInitialState();
        Game.main(performance.now());
    });
};

Game.main = function (tFrame) {
    window.requestAnimationFrame(Game.main);
    Game.update();
    Game.render(tFrame);
    Game.lastRender = tFrame;
}

Game.render = function (tFrame) {
    // Render characters and map
    // console.log(`Rendering at tFrame ${tFrame}. Last render: ${Game.lastRender}`)
    // 
    // In what frame should characters be rendered?
    // Standing0, Standing1, Walking0, Walking1, Walking2 or Walking3?

    const room = Loader.getImage("room")
    Game.ctx.drawImage(room, 0, 0, 383, 300)

    for (let playerId in Game.renderState) {
        let player = Game.renderState[playerId] // currentAnimationFrame, lastAnimationChangeTime
        const spriteSheetName = PlayerSpriteSheetMap[Game.worldState.client_chat_user_ids[playerId]] // this gives e.g. "char_default"
        const playerSpriteSheet = SpriteSheetFrameMap[spriteSheetName] // this gives {walking: [[]], standing: [[]]}
        let playerCurrentStatus = Game.worldState.world_state_data[playerId].status // this gives "walking" or "standing"
        
        switch(playerCurrentStatus) {
            case ("standing"):
                if (tFrame - player.lastAnimationChangeTime > 500) {
                    player.currentAnimationFrame = (player.currentAnimationFrame + 1) % (playerSpriteSheet[playerCurrentStatus].length)
                    player.lastAnimationChangeTime = tFrame;
                }
                break;
            case ("walking"):
                if (tFrame - player.lastAnimationChangeTime > 150) {
                    player.currentAnimationFrame = (player.currentAnimationFrame + 1) % (playerSpriteSheet[playerCurrentStatus].length)
                    player.lastAnimationChangeTime = tFrame;
                }
                break;
        }

        const sx = playerSpriteSheet[playerCurrentStatus][player.currentAnimationFrame][0]; // start x-coord of the slice of the spritesheet to draw
        const sy = 0;
        const sWidth = playerSpriteSheet[playerCurrentStatus][player.currentAnimationFrame][1] - sx; // width of the slice of the spritesheet to draw
        const char = Loader.getImage(spriteSheetName) // which spritesheet to use 
        const sHeight = char.height; // height of the spritesheet
        const [x, y] = [...Game.worldState.world_state_data[playerId].position] // FIXME: note this needs to be fixed because global position =/= position on canvas

        // flip or don't flip
        if (Game.worldState.world_state_data[playerId].direction === "right") {

            // https://stackoverflow.com/a/35973879 flipping sprite
            Game.ctx.translate(x + sWidth, y);
            Game.ctx.scale(-1, 1);            
            Game.ctx.drawImage(
                char, 
                sx, 
                sy,
                sWidth, 
                sHeight, 
                0, 
                0,
                sWidth, 
                sHeight
            )
            Game.ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
        else {
            Game.ctx.drawImage(
                char, 
                sx, 
                sy,
                sWidth, 
                sHeight, 
                x, 
                y,
                sWidth, 
                sHeight
            )
        }
    } 
}

Game.update = function () {
    // Update map and character status
    // Updating should be event-driven, not time/frame driven, since the server is authoritative.
    // console.log(`Updating game state.`)
}

/* 
* Player object
*
*/

let player = {
    currentAnimationState: null,
    currentAnimationFrame: null,
    lastAnimationChangeTime: null,
    spritesheet: "char_default",
    spriteMapping: {
        "standing": [[0, 40], [41, 81]],
        "walking": [[82, 122], [123, 163], [164, 204], [205, 245]]
    }
}

/*
* Touch handler
*
*
*/

const canvas = document.getElementById('canvas');

function touchHandler(e) {
    if (e.touches) {
      const playerX = e.touches[0].pageX - canvas.offsetLeft;
      const playerY = e.touches[0].pageY - canvas.offsetTop;
      console.log(`Touch:  x: ${playerX}, y: ${playerY}`);
    }
  }

// 
// Let's start the game!
//

document.addEventListener("touchstart", touchHandler);
document.addEventListener("touchmove", touchHandler);

window.onload = function () {
    Game.ctx = canvas.getContext('2d');
    Game.run();
};

