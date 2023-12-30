const Items=require("../Models/menuModel");
const ErrorHandler = require("../Utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
// const catch catchAsyncErrors

//create

exports.addItem=async(req,res,next)=>{
    const item= await Items.create(req.body);

    res.status(201).json({
        success:true,
        item

    })
}

exports.getAllItems=async(req,res,next)=>{
    // return next(new ErrorHandler("This is my tem error",500))

    const items=await Items.find();
    const itemCount=await Items.countDocuments()

    res.status(200).json({
       success:"true",
        items,
        itemCount
    })
}

///update
exports.updateItems=async(req,res,next)=>{

    let item=await Items.findById(req.params.id);

    if(!item){
        return res.status(500).json({
            success:"FALSE",
             message:"item not found"
         })
    }
        item= await Items.findByIdAndUpdate(req.params.id,req.body,{
            new:true,
            runValidators:true,
            useFindandModify:false
        })

    res.status(200).json({
       success:"true",
        item
    })
}

//del;ete

exports.deleteitem=async(req,res,next)=>{

    const item=await Items.findById(req.params.id)

    if(!item){
        return res.status(500).json({
            success:"FALSE",
             message:"item not found"
         })

    }

    await item.deleteOne();
     res.status(200).json({
        success:"true",
         message:"item deleted"
     })
}

exports.getitemDetails = catchAsyncErrors(async (req, res, next) => {
    const item = await Items.findById(req.params.id);
  
    if (!item) {
      return next(new ErrorHandler("Product not found", 404));
    }
  
    res.status(200).json({
      success: true,
      item,
    });
  });