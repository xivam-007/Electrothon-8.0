const { Queue } = require("bullmq");

const moveQueue = new Queue("moveQueue", {
 connection: {
  host: "127.0.0.1",
  port: 6379
 }
});

const addMoveJob = async (data) => {
console.log("🟡 Adding job to queue");
 await moveQueue.add("newMove", data);

};

module.exports = {
 addMoveJob
};