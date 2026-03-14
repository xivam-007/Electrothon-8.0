require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");

const { addMoveJob } = require("./services/queueService");

const PORT = process.env.PORT || 5000;

connectDB();

addMoveJob({
 pickup: "Delhi",
 drop: "Pune"
});

app.listen(PORT, () => {
 console.log(`Server running on port ${PORT}`);
});