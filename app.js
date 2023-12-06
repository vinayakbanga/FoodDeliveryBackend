const express = require("express")
const app=express();
const cookieParser=require('cookie-parser')

app.use(express.json());
app.use(cookieParser());

const errorMiddleware = require("./middleware/error");


//route imports

const items=require("./routes/homeRoute")
const user=require("./routes/userRoute")
const order=require("./routes/orderRoute")


app.use("/api/v1",items)
app.use("/api/v1",user)
app.use("/api/v1",order)


// Middleware for Errors
app.use(errorMiddleware);

module.exports=app