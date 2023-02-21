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
* Game object
*
*/ 

let Game = {
    ctx: null,
    lastRender: null,
    worldState: null,

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
    player.currentAnimationState = "standing"
    player.currentAnimationFrame = 0;
    player.lastAnimationChangeTime = Game.lastRender;
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
    console.log(`Rendering at tFrame ${tFrame}. Last render: ${Game.lastRender}`)
    // 
    // In what frame should characters be rendered?
    // Standing0, Standing1, Walking0, Walking1, Walking2 or Walking3?

    const room = Loader.getImage("room")
    const char0 = Loader.getImage("char_default")
    Game.ctx.drawImage(room, 0, 0, 383, 300)

    console.log(player)
    switch(player.currentAnimationState) {
        case ("standing"):
            if (tFrame - player.lastAnimationChangeTime > 500) {
                player.currentAnimationFrame = (player.currentAnimationFrame + 1) % (player.spriteMapping[player.currentAnimationState].length)
                player.lastAnimationChangeTime = tFrame;
            }
            break;
        case ("walking"):
            if (tFrame - player.lastAnimationChangeTime > 150) {
                player.currentAnimationFrame = (player.currentAnimationFrame + 1) % (player.spriteMapping[player.currentAnimationState].length)
                player.lastAnimationChangeTime = tFrame;
            }
            break;
    }
    const sx = player.spriteMapping[player.currentAnimationState][player.currentAnimationFrame][0];
    const sWidth = player.spriteMapping[player.currentAnimationState][player.currentAnimationFrame][1] - sx;
    const sHeight = char0.height;
    Game.ctx.drawImage(char0, 
        sx, 
        0,
        sWidth, 
        sHeight, 
        200, 
        150, 
        sWidth, 
        sHeight)    
}

Game.update = function () {
    // Update map and character status
    // Updating should be event-driven, not time/frame driven, since the server is authoritative.
    console.log(`Updating game state.`)
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

// Let's start the game!

window.onload = function () {
    Game.ctx = document.getElementById('canvas').getContext('2d');
    Game.run();
};

