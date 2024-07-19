import os from "os";
import readline from "readline";
import { spawn } from "child_process";
import { io } from "socket.io-client";

const maxThreads = os.cpus().length;
let numWorkers = null;
let lastBlock = null;
let difficulty = null;
let sentBlocks = new Set();
let workers = [];

const socket = io("http://localhost:3000");

socket.on("disconnect", () => {
  socket.connect();
});

socket.on("getLastBlock", (data) => {
  lastBlock = data;
});

socket.on("getDifficulty", (data) => {
  difficulty = data;
  sentBlocks.clear();
});

socket.on("newBlock", (data) => {
  lastBlock = data;
  restartAllWorkers();
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function runWorker(id) {
  if (!lastBlock || difficulty === null) {
    console.log("Waiting for initial data...");
    setTimeout(() => runWorker(id), 1000);
    return;
  }

  const worker = spawn("node", [
    "minerWorker.js",
    id.toString(),
    difficulty.toString(),
    lastBlock.hash,
  ]);

  workers[id] = worker;

  worker.stdout.on("data", (data) => {
    try {
      const output = JSON.parse(data.toString().trim());
      if (sentBlocks.has(output.hash)) {
        console.log(`Duplicate block found by worker ${id}, restarting...`);
        restartWorker(id);
      } else {
        console.log("Worker " + id + ": ", output.hash);
        socket.emit("newBlock", output);
        sentBlocks.add(output.hash);
        restartWorker(id);
      }
    } catch (error) {
      console.error(`Error processing worker ${id} output:`, error);
    }
  });
}

function startWorkers(num) {
  for (let i = 0; i < num; i++) {
    runWorker(i);
  }
}

function restartWorker(id) {
  if (workers[id]) {
    workers[id].removeAllListeners();
    workers[id].kill();
  }
  runWorker(id);
}

function restartAllWorkers() {
  workers.forEach((worker, id) => {
    if (worker) {
      worker.removeAllListeners();
      worker.kill();
    }
  });
  workers = [];
  startWorkers(numWorkers);
}

function getLastBlock() {
  socket.emit("getLastBlock");
}

function getDifficulty() {
  socket.emit("getDifficulty");
}
getLastBlock();
getDifficulty();
console.log(Math.random() * Number.MAX_SAFE_INTEGER);
rl.question(
  `Enter the number of threads to run (1-${maxThreads}, default is ${maxThreads}): `,
  (answer) => {
    rl.close();

    numWorkers = parseInt(answer);

    if (isNaN(numWorkers) || numWorkers < 1) {
      numWorkers = maxThreads;
    } else if (numWorkers > maxThreads) {
      numWorkers = maxThreads;
    }

    console.log("Starting", numWorkers, "workers...");

    startWorkers(numWorkers);
  }
);
