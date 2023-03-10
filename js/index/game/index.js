import { Game } from "@/js/index/game/game";
import { Die } from "@/js/index/game/entities/die";
import { Sign } from "@/js/index/game/entities/sign";
import { PressurePlate } from "@/js/index/game/entities/pressureplate";
import { NetworkHandler } from "@/js/index/game/networkHandler";
import { Camera } from "@/js/index/game/camera";

// Moved some game mutating functions here to avoid circular dependencies

function gameSetInitialState() {
  Game.worldState = {
    world_state_data: {},
    client_chat_user_ids: {},
  };

  Game.renderState = {};
  Game.renderEntityState = {};

  // TEMP: Spawn a coin
  Game.coinPosition = [650, 650];

  Game.renderEntityState.coin = {
    entityType: "coin",
    currentAnimationFrame: 0,
    lastAnimationChangeTime: Game.lastRender,
  };

  Game.globalDie = new Die({ position: [600, 700] });

  Game.globalSign = new Sign({
    position: [160, 420],
    height: 200,
    width: 380,
    direction: "front",
    messages: {
      0: "You've lost your face in an accident. The plastic surgeon can either give you a face that looks exactly like Kurt Tay or Steven Lim.	Which new face do you get?",
      1: "Your health is failing and modern medicine can't save you. The sorcerer offers you a cure. You'll have a perfect health if you copulate with a goat or eat faeces from a Thai restaurant toilet. Which do you pick?",
      2: "You reach the afterlife and discover that reincarnation is real. You are given the choice to come back as an ugly woman or as the guy who got kicked out of BTS a month before debut. Who do you pick?",
      3: "You've survived a mountain plane crash and it's time to start eating people. You can choose your mother or your girlfriend. Who do you eat?",
      4: "If you could self suck, do you spit or swallow?",
      5: "A billionaire candidate for president promises that he will pay all your taxes as long as you give up the right to masturbate. Do you vote for him?",
    },
  });

  Game.entities.push(
    Game.globalDie,
    new PressurePlate({ position: [600, 600] }),
    Game.globalSign
  );
}

function gameRun() {
  console.log(this);
  Game.lastRender = performance.now(); // Pretend the first draw was on first update.
  Game.tickLength = 40; // This sets your simulation to run at 25Hz (40ms)
  const p = Game.load();
  Promise.all(p).then((_loaded) => {
    Game.setInitialState();
    Game.networkHandler = new NetworkHandler();
    Game.main(performance.now());
  });
}

/**
 *
 * @returns {HTMLCanvasElement}
 */
function getCanvas() {
  // @ts-ignore
  return document.getElementById("canvas");
}

/*
 * Touch handler
 *
 *
 */
function handleTouchOrClick(e) {
  const canvas = getCanvas();
  /** @type {number} */
  let playerX;
  /** @type {number} */
  let playerY;
  if (e.touches) {
    playerX = e.touches[0].pageX - canvas.offsetLeft;
    playerY = e.touches[0].pageY - canvas.offsetTop;
    console.log(`Touch:  x: ${playerX}, y: ${playerY}`);
  }
  if (e.type === "click" && e.button === 0) {
    playerX = e.pageX - canvas.offsetLeft;
    playerY = e.pageY - canvas.offsetTop;
    console.log(`Click:  x: ${playerX}, y: ${playerY}`);
  }
  // @ts-ignore
  const coords = Game.camera.screenToWorld(playerX, playerY);
  Game.PLAYER_TARGET_DEST = [coords.x, coords.y];
}

/**
 *
 * @param {number} dim
 */
function setCanvasDims(dim) {
  const canvas = getCanvas();
  canvas.height = dim;
  canvas.width = dim;
  canvas.style.height = `${Math.round(dim)}px`;
  canvas.style.width = canvas.style.height;
}

function resizeCanvas() {
  // @ts-ignore
  const vpH = window.visualViewport.height;
  // @ts-ignore
  const vpW = window.visualViewport.width;

  /** @type {number} */
  let dim;
  if (window.innerHeight > window.innerWidth) {
    dim = Math.max(Math.min(vpH, vpW), window.innerWidth);
  } else {
    dim = Math.min(
      Math.min(vpH, vpW),
      // bec flex children cant exceed parent dims
      // @ts-ignore
      document.getElementById("main").clientHeight
    );
  }
  setCanvasDims(dim);
  Game.camera.updateViewport();
}

export function onPageParsed() {
  Game.setInitialState = gameSetInitialState;
  Game.run = gameRun;

  const canvas = getCanvas();
  canvas.addEventListener("touchstart", handleTouchOrClick);
  canvas.addEventListener("touchmove", handleTouchOrClick);
  canvas.addEventListener("click", handleTouchOrClick);

  // @ts-ignore
  Game.ctx = canvas.getContext("2d");
  Game.camera = new Camera(Game.ctx, { distance: 400 });
  resizeCanvas();
  Game.run();

  window.addEventListener("resize", resizeCanvas);
}
