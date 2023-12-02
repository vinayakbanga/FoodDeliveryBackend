const catchAsyncErrors= require("./catchAsyncErrors")
const ErrorHandler=require("../Utils/errorHandler")
const jwt=require("jsonwebtoken");
const User= require("../Models/userModel");

//for making authenticated access
exports.isAuthenticatedUser= catchAsyncErrors( async(req,res,next)=>{

    const {token}=req.cookies;
    // console.log(token);
    if(!token){
        return next(new ErrorHandler("Please Login to access this",401))
    }
    
    const decodedData=jwt.verify(token,process.env.JWT_SECRET);

    req.user= await User.findById(decodedData.id);
    next();

});

exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return next(
          new ErrorHandler(
            `Role: ${req.user.role} is not allowed to access this resouce `,
            403
          )
        );
      }
  
      next();
    };
  }
//2:35