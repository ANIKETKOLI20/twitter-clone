import express from "express";
import { protectedRoute } from "../middleware/protectedRoute.js";
import { createPost, deletePost, commentPost, likeUnlikePost , getAllPost , getLikedPosts , getFollowingPosts , getUserPosts } from '../controllers/post.controller.js';

const router = express.Router();

router.get("/all" , protectedRoute , getAllPost)
router.get("/following" , protectedRoute , getFollowingPosts)
router.get("/likes/:id" , protectedRoute , getLikedPosts)
router.get("/user/:username" , protectedRoute , getUserPosts)
router.post("/create", protectedRoute, createPost);
router.delete("/:id", protectedRoute, deletePost);
router.post("/comment/:id", protectedRoute, commentPost);
router.post("/like/:id", protectedRoute, likeUnlikePost);

export default router;
