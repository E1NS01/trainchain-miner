import * as crypto from "crypto";

export class Block {
  constructor(index, timestamp, data, previousHash, hash) {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.hash = hash;
    this.nonce = 0;
  }
  calculateHash() {
    const data =
      this.index +
      this.previousHash +
      this.timestamp +
      JSON.stringify(this.data);

    const dataString = JSON.stringify(data) + this.nonce;
    return crypto.createHash("sha256").update(dataString).digest("hex");
  }
}
