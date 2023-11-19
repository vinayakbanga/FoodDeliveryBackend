const express=require("express");
const { getAllItems,addItem, updateItems, deleteitem } = require("../controller/homeController");


const router=express.Router()
router.route("/items").get(getAllItems);
router.route("/items/new").post(addItem);
router.route("/items/:id").put(updateItems).delete(deleteitem);

module.exports=router;