import crypto from 'crypto-js';

class Block {
  constructor(index, timestamp, data, previousHash = '') {
    this.index = index;
    this.timestamp = timestamp;
    // data will contain { voterId, candidateId }
    this.data = data;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return crypto.SHA256(
      this.index +
      this.previousHash +
      this.timestamp +
      JSON.stringify(this.data)
    ).toString();
  }
}

export default Block;
