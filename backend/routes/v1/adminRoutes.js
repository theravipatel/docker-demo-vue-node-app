const express = require("express");
const router = express.Router();
const adminController = require("../../controllers/v1/adminController");
const categoryController = require("../../controllers/v1/categoryController");
const postController = require("../../controllers/v1/postController");
const adminMiddleware = require("../../middlewares/v1/adminMiddleware");

// Middlewares
router.use("/signup", adminMiddleware.checkUserExist);
router.use("/me", adminMiddleware.authenticateToken);
router.use("/logout", adminMiddleware.authenticateToken);
router.use("/update-profile", adminMiddleware.authenticateToken);
router.use("/change-password", adminMiddleware.authenticateToken);
router.use("/get-counts", adminMiddleware.authenticateToken);

router.post("/login", adminController.login);
router.post("/signup", adminController.signup);
router.get("/me", adminController.me);
router.post("/logout", adminController.logout);
router.post("/update-profile", adminController.updateProfile);
router.post("/change-password", adminController.changePassword);
router.get("/get-counts", adminController.getCounts);

router.post("/category/save", [adminMiddleware.authenticateToken, adminMiddleware.uploadFileMiddleware, adminMiddleware.checkCategoryExists], categoryController.saveCategory);
router.get("/category/get/:id?", adminMiddleware.authenticateToken, categoryController.getCategories);
router.delete("/category/delete/:id", adminMiddleware.authenticateToken, categoryController.deleteCategory);

router.post("/post/save", [adminMiddleware.authenticateToken, adminMiddleware.uploadFileMiddleware, adminMiddleware.checkPostExists], postController.savePost);
router.get("/post/get/:id?", adminMiddleware.authenticateToken, postController.getPosts);
router.delete("/post/delete/:id", adminMiddleware.authenticateToken, postController.deletePost);

module.exports = router;