const express = require("express");
const cors = require("cors");

const db = require("./db");

const { UsersRouter } = require("./routers/user");
const { DoctorRouter } = require("./routers/doctor");
const { AdminRouter } = require("./routers/admin");

const app = express();

app.use(cors({origin: "*"}));

app.use(express.json());

app.use("/api/v1/users", UsersRouter);
app.use("/api/v1/admin", AdminRouter);
app.use("/api/v1/doctor-admin", DoctorRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, (err)=>{
    if(err){
        console.log("An error has occured while starting the server. The error is: " + err);
    } else {
        console.log(`The server is running on port ${PORT}: http://localhost:${PORT}/`);
    }
});