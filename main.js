import { Worker } from "worker_threads";
import { io } from "socket.io-client";

const numThreads = process.argv[2] || 4; // Or any other user-defined number
const workers = new Map(); // Store workers by their IDs
let difficulty = 64;
let lastBlock = null;
let mining = false;
let restartMiningDueToDifficultyChange = false;

export const socket = io("http://localhost:3000");

socket.on("connect", () => {
  getDifficulty();
  getLastBlock();
});

function getLastBlock() {
  socket.emit("getLastBlock");
}

function getDifficulty() {
  socket.emit("getDifficulty");
}

socket.on("difficulty", (newDifficulty) => {
  if (newDifficulty !== 64 - difficulty) {
    console.log(`Difficulty changed to ${newDifficulty}`);
    difficulty = 64 - newDifficulty;
  }
  if (mining) {
    // Indicate that mining needs to be restarted due to a difficulty change
    restartMiningDueToDifficultyChange = true;
    stopAllWorkers(); // Implement this function to stop all workers
  } else {
    startMining(difficulty);
    mining = true;
  }
});

socket.on("getLastBlock", (block) => {
  lastBlock = block;
});

function stopAllWorkers() {
  workers.forEach((worker, workerId) => {
    worker.terminate().then(() => {
      workers.delete(workerId);
      // Once all workers are stopped, restart mining if needed
      if (workers.size === 0 && restartMiningDueToDifficultyChange) {
        restartMiningDueToDifficultyChange = false;
        startMining(difficulty); // This will start workers with the updated difficulty
        mining = true;
      }
    });
  });
}

function startMining() {
  if (restartMiningDueToDifficultyChange) {
    return;
  }
  const target = BigInt(
    "0x" + "0".repeat(64 - difficulty) + "f".repeat(difficulty)
  );

  for (let i = 0; i < numThreads; i++) {
    startWorker(i + 1);
  }

  function startWorker(workerId) {
    const worker = new Worker("./minerWorker.js");
    workers.set(workerId, worker);

    worker.postMessage({
      id: workerId,
      difficulty,
      target,
      previousHash: lastBlock ? lastBlock.hash : "",
    });
    console.clear();

    worker.on("message", (message) => {
      if (message.mined) {
        socket.emit("newBlock", message.block);

        worker.terminate().then(() => {
          workers.delete(workerId);
          setTimeout(() => {
            startWorker(workerId);
          }, 50);
        });

        getDifficulty();
        getLastBlock();
      }
    });
  }
}

export default socket;
