const Order= require("../Models/orderModel")
const Items= require("../Models/menuModel")
const ErrorHandler=require("../Utils/errorHandler")
const catchAsyncErrors=require("../middleware/catchAsyncErrors")


//create new order
exports.newOrder= catchAsyncErrors(async(req,res,next)=>{

    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
      } = req.body;
    //   console.log(req.user._id);

      const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt: Date.now(),
        user: req.user._id,
      });
    //   console.log(req.user._id);
    
      res.status(201).json({
        success: true,
        order,
      });


})

//get single order
exports.getSingleOrder=catchAsyncErrors(async(req,res,next)=>{
    const order = await Order.findById(req.params.id).populate(
        "user",
        "name email"
      );
      //populate will give user name and email from user model
    
      if (!order) {
        return next(new ErrorHandler("Order not found with this Id", 404));
      }
    
      res.status(200).json({
        success: true,
        order,
      });
})

// get logged in user  Orders
// get logged in user  Orders
exports.myOrders = catchAsyncErrors(async (req, res, next) => {
    const orders = await Order.find({ user: req.user._id });
  
    res.status(200).json({
      success: true,
      orders,
    });
  });
//4:25
// get all Orders -- Admin
exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find();

  let totalAmount = 0;

  orders.forEach((order) => {
    totalAmount += order.totalPrice;
  });

  res.status(200).json({
    success: true,
    totalAmount,
    orders,
  });
});

//update order status
exports.updateOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if(order.orderStatus==="Delivered"){
    return next(new ErrorHandler("You have delivered this order",400))

  }

  order.orderStatus= req.body.status;
  if (req.body.status === "Delivered") {
    order.deliveredAt = Date.now();
  }
  await order.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    
  });
});
// / delete Order -- Admin
exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("Order not found with this Id", 404));
  }

  await order.deleteOne();

  res.status(200).json({
    success: true,
  });
});