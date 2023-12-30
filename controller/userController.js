const User = require("../Models/userModel");
const sendToken = require("../Utils/jwtToke");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler= require("../Utils/errorHandler")
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

exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter email and password",
      });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "No user found",
      });
    }
      
    const isPasswordMatched = await user.comparePassword(password);
    
    if (!isPasswordMatched) {
      return res.status(400).json({
        success: false,
        message: "Wrong email or password",
      });
    }

    sendToken(user, 201, res);
  } catch (error) {
    // Handle unexpected errors
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

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
      new ErrorHandler(
        "Reset Password Token is invalid or has been expired",
        400
      )
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password does not password", 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendToken(user, 200, res);
});
// Get User Detail
//only user login can get this route
//this route is used in combination with auth.js function
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});
// update User password
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Old password is incorrect", 400));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHandler("password does not match", 400));
  }

  user.password = req.body.newPassword;

  await user.save();

  sendToken(user, 200, res);
});


//update user profile
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  };

  // if (req.body.avatar !== "") {
  //   const user = await User.findById(req.user.id);

  //   const imageId = user.avatar.public_id;

  //   await cloudinary.v2.uploader.destroy(imageId);

  //   const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
  //     folder: "avatars",
  //     width: 150,
  //     crop: "scale",
  //   });

  //   newUserData.avatar = {
  //     public_id: myCloud.public_id,
  //     url: myCloud.secure_url,
  //   };
  // }

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    user
  });
});

exports.getAllUsers= catchAsyncErrors(async(req,res,next)=>{

  const users= await User.find();

  res.status(200).json({
    status:true,
    users
  })


})
// Get single user
exports.getSingleUser= catchAsyncErrors(async(req,res,next)=>{

  const user= await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User does not exist with Id: ${req.params.id}`)
    );
  }


  res.status(200).json({
    status:true,
    user
  })


})
//pdate user role admin
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role:req.body.role
  };


  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,


  });

  res.status(200).json({
    success: true,
    user
  });
});

//delete user
exports.deleteUser=catchAsyncErrors(async(req,res,next)=>{

   const user=User.findById(req.params.id);
   if (!user) {
    return next(
      new ErrorHandler(`User does not exist with Id: ${req.params.id}`, 400)
    );
  }

  // const imageId = user.avatar.public_id;

  // await cloudinary.v2.uploader.destroy(imageId);

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: "User Deleted Successfully",
  });

})



