
const app=require("./app");
const dotenv=require("dotenv")
const connectDb=require("./config/database")


//config
dotenv.config({path:'config/config.env'})

//connectdb
connectDb();

app.listen(process.env.PORT,()=>{

    console.log(`SERVER IS WORKING ON ${process.env.PORT}`);
})