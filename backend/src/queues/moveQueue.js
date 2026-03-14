const { Queue } = require("bullmq");
const connection = require("./connection");

const moveQueue = new Queue("moveQueue", { connection });

module.exports = moveQueue;