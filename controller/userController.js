const User = require("../Models/userModel");
const sendToken = require("../Utils/jwtToke");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler= require("../Utils/errorhander")
const sendEmail= require("../Utils/sendEmail")
const crypto = require("crypto")


exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered",
      });
    }

    // Create a new user
    const user = await User.create({
      name,
      email,
      password,
      avatar: {
        public_id: "This is a sample",
        url: "Sample",
      },
    });
  //  const token=user.getJWTToken(); 
   

  //   res.status(201).json({
  //     success: true,
  //     token,
  //   });
  sendToken(user,201,res);
  } catch (error) {
    console.error("Error registering user:", error);

    // Handle specific errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error. Check your input.",
        error: error.message,
      });
    }

    // Handle other errors
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//login user
exports.loginUser=async(req,res,next)=>{
  const{email,password} =req.body;

  if(!email||!password){
    res.status(500).json({
      success: false,
      message: "Please enter email password",
    });
  }
  const user= await User.findOne({email}).select("+password");
  if(!user){
    return  res.status(400).json({
      success: false,
      message: "No user",
    });
  }

  const isPasswordMatched=user.comparePassword(password);

  if(!isPasswordMatched){
    return  res.status(400).json({
      success: false,
      message: "Wrong Email or password",
    });
  }
  // const token=user.getJWTToken(); 
   

  //   res.status(201).json({
  //     success: true,
  //     token,
  //   });
  sendToken(user,201,res);


}

exports.logout=catchAsyncErrors(async(req,res,next)=>{
res.cookie('token',null,{
 expires: new Date(Date.now()),
 httpOnly:true,
})

  res.status(200).json({
    success:true,
    message:"Logout"
  })
})

//forgot password
exports.forgotPassword= catchAsyncErrors(async(req,res,next)=>{
  
  const user= await User.findOne({email:req.body.email});

  if(!user){
    return res.status(404).json({
      success: false,
      message: "No user Found",
    });
  }

  //get resetPassword token

 const resetToken= user.getResetPasswordToken();
 await user.save({validateBeforeSave:false});

 const resetPasswordUrl= `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`
 const message = `Your reset Password token is : \n \n  ${resetPasswordUrl}`
 try {

  await sendEmail({
    email: user.email,
    subject: `Password Recovery`,
    message,
  });

  res.status(200).json({
    success: true,
    message: `Email sent to ${user.email} successfully`,
  });
  
 } catch (error) {
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire= undefined;

  await user.save({validateBeforeSave:false});

  return next(
    new ErrorHandler(error.message,500)
  )


  //3.05
 }


});
// Reset Password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  // creating token hash
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHander(
        "Reset Password Token is invalid or has been expired",
        400
      )
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHander("Password does not password", 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendToken(user, 200, res);
});



