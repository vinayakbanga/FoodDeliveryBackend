const express=require("express");
const { getAllItems,addItem, updateItems, deleteitem } = require("../controller/homeController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");


const router=express.Router()
router.route("/items").get(getAllItems);
router.route("/admin/items/new").post(isAuthenticatedUser ,authorizeRoles("admin"),addItem);
router.route("/admin/items/:id").put(isAuthenticatedUser ,authorizeRoles("admin"),updateItems).delete(isAuthenticatedUser ,authorizeRoles("admin"),deleteitem);

module.exports=router;