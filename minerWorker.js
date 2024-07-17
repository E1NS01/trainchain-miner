import { parentPort } from "worker_threads";
import { Block } from "./block.js";

parentPort.on("message", (data) => {
  const { id, difficulty, target, previousHash } = data;
  mineBlock(id, difficulty, target, previousHash);
});

parentPort.on("error", (error) => {
  console.error(`Worker ${id} error:`, error);
});

function mineBlock(id, difficulty, target, previousHash) {
  const block = new Block(0, Date.now(), "NewBlock", previousHash, "");

  while (true) {
    block.nonce = parseInt(Math.random() * 1000000);
    block.hash = block.calculateHash();
    const hashBigInt = BigInt("0x" + block.hash);

    if (hashBigInt < target) {
      console.clear();
      console.log(`Worker ${id}: Block mined: ${block.hash}`);
      parentPort.postMessage({ id, mined: true, block });
      return;
    }
  }
}
