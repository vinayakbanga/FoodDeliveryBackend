const mongoose = require('mongoose')

const validator= require('validator')
const bcrypt=require('bcryptjs')
const Schema = mongoose.Schema
const jwt=require('jsonwebtoken')
const crypto=require('crypto');

const userSchema = Schema({
    name: { type: String, required:[true,"Please Enter your name"] },
    email: { type: String, required: true, unique: true,validate:[validator.isEmail,"Please Enter your email"] },
    password: { type: String, required: true, select:false },
    role: { type: String, default: 'customer' },
    avatar:{public_id:{type:String,required:true},url:{
        type:String,
        required:true

    }},
    resetPasswordToken: String,
    resetPasswordExpire:Date,

}, { timestamps: true })

userSchema.pre("save",async function(next){
    if(!this.isModified("password")){
        next();
    }
    this.password=await bcrypt.hash(this.password,10);
})

//jwtToken
userSchema.methods.getJWTToken=function(){
    return jwt.sign({id:this._id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRE
    })
}
//compare password

userSchema.methods.comparePassword = async function (enteredPassword) {
    try {
      return await bcrypt.compare(enteredPassword, this.password);
    } catch (error) {
      throw error;
    }
  };
//generating password reset token
userSchema.methods.getResetPasswordToken= function(){

    //genereating token
    const resetToken = crypto.randomBytes(20).toString("hex");

  // Hashing and adding resetPasswordToken to userSchema
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  return resetToken;

}
//2.52

module.exports = mongoose.model('User', userSchema)