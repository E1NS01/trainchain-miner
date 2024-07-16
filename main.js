import { io } from "socket.io-client";
import { Block } from "./block.js";

const socket = io("http://localhost:3000");
let lastBlock = null;
let difficulty = 0;
let isMining = false;

function getLastBlock() {
  socket.emit("getLastBlock");
  socket.emit("getDifficulty");
}

socket.on("getLastBlock", (block) => {
  lastBlock = block;
  attemptMining();
});

socket.on("getDifficulty", (newDifficulty) => {
  difficulty = newDifficulty;
  attemptMining();
});
socket.on("newBlock", (block) => {
  lastBlock = block;
  attemptMining();
});

function attemptMining() {
  if (lastBlock && difficulty && !isMining) {
    isMining = true;
    mineNewBlock();
    isMining = false;
  }
}

function mineNewBlock() {
  if (!lastBlock) return; // Additional check for safety
  const newBlock = new Block(
    lastBlock.index + 1,
    Date.now(),
    "New Block",
    lastBlock.hash
  );

  newBlock.mineBlock(difficulty);
  isMining = false;
  socket.emit("newBlock", newBlock);
}

getLastBlock();
