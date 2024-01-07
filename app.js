const express = require("express")
const dotenv=require("dotenv")
const app=express();
// const http = require('http');
const cookieParser=require('cookie-parser')
// const socketIo=require('socket.io')
const cors= require("cors")
//config
dotenv.config({path:'config/config.env'})
app.use(express.json());
app.use(cookieParser());
app.use(cors());
const errorMiddleware = require("./middleware/error");


//route imports

const items=require("./routes/homeRoute")
const user=require("./routes/userRoute")
const order=require("./routes/orderRoute")
const payment=require("./routes/paymentRoute")

app.use("/api/v1",items)
app.use("/api/v1",user)
app.use("/api/v1",order)
app.use("/api/v1",payment)


// Middleware for Errors
app.use(errorMiddleware);
// const server = http.createServer(app);
// const io = socketIo(server, {
//   cors: {
//       origin: "http://localhost:3000", // Adjust this to match your client-side URL
//       methods: ["GET", "POST","PUT"]
//   }
// }); // instance of socket.io

// Socket.IO setup
// io.on('connection', (socket) => {
//   // console.log('A user connected');

//   socket.on('joined',(roomName)=>{
//     console.log(roomName);
//     socket.join(roomName)

//   })

//   socket.on('disconnect', () => {
//     console.log('User disconnected');
//   });

//   // Additional Socket.IO event handling here
// });

module.exports = app