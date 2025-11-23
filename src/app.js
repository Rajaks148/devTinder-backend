const express = require("express");
const connectDB  = require("./config/database");
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type"],
}));

app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/requests");
const userRouter = require("./routes/user");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

connectDB().then(() => {
    console.log("Database connection established");
    app.listen(3000, () => {
        console.log("Server is successfully listening on port 3000");
    }); 
}).catch(err => {
    console.log("Failed to connect the database.");
}) 
 
 
