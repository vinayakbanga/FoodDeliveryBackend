const express = require("express")
const app=express();

app.use(express.json());

//route imports

const items=require("./routes/homeRoute")


app.use("/api/v1",items)
module.exports=app