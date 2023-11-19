
const mongoose=require("mongoose")
const connectDb=()=>{
        mongoose.connect(process.env.MONGO_URL);
mongoose.connection
    .once('open', function () {
      console.log('MongoDB running');
    })
    .on('error', function (err) {
      console.log(err);
    });

    }
module.exports=connectDb