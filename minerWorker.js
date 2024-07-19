import { Block } from "./block.js";

const id = process.argv[2];
const difficulty = 64 - process.argv[3];
const previousHash = process.argv[4];
const target = BigInt(
  "0x" + "0".repeat(64 - difficulty) + "f".repeat(difficulty)
);

function findHash() {
  let found = false;
  const block = new Block(0, Date.now(), "NewBlock", previousHash, "");
  block.nonce = id * 10000000;

  while (!found) {
    block.nonce = parseInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));
    block.hash = block.calculateHash();
    const hashBigInt = BigInt("0x" + block.hash);

    if (hashBigInt < target) {
      process.stdout.write(JSON.stringify(block) + "\n");
      found = true;
    }
  }
}

findHash();
