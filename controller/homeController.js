const Items=require("../Models/menuModel");


//create

exports.addItem=async(req,res,next)=>{
    const item= await Items.create(req.body);

    res.status(201).json({
        success:true,
        item

    })
}

exports.getAllItems=async(req,res,next)=>{

    const items=await Items.find();

    res.status(200).json({
       success:"true",
        items
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