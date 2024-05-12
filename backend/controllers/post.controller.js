const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;

const Post = require("../models/post.model");
const User = require("../models/user.model");
const Notification = require("../models/notification.model");

// *** @route /api/posts/...

// @route /all
const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });
    if (posts.length === 0) {
      return res.status(200).json([]);
    }
    res.status(200).json(posts);
  } catch (error) {
    console.log("Error in getAllPosts controller: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// @route /likes/:id
const getLikedPosts = async (req, res) => {
  try {
    const { id: userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const likedPosts = await Post.find({
      _id: { $in: user.likedPosts },
    })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });
    res.status(200).json(likedPosts);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.log("Error in getLikedPosts controller: ", error);
  }
};

// @route /following
const getFollowingPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const followingPost = await Post.find({
      user: { $in: user.following },
    })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    res.status(200).json(followingPost);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.log("Error in getLikedPosts controller: ", error);
  }
};

// @route /user/:username
const getUserPosts = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const userPosts = await Post.find({ user: user._id })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    if (userPosts.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(userPosts);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.log("Error in createPost controller: ", error);
  }
};

// @route /create
const createPost = async (req, res) => {
  try {
    const { text } = req.body;
    let { img } = req.body;

    const userId = req.user._id.toString();
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    if (!text && !img) {
      return res.status(400).json({ error: "Post must have text or image" });
    }

    if (img) {
      const uploadedResponse = await cloudinary.uploader.upload(img);
      img = uploadedResponse.secure_url;
    }

    const newPost = new Post({
      user: userId,
      text,
      img,
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.log("Error in createPost controller: ", error);
  }
};

// @route /:id
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res
        .status(400)
        .json({ error: "You are not authorized to delete this post" });
    }

    if (post.img) {
      const uploadedResponse = await cloudinary.uploader.destroy(
        post.img.split("/").pop().split(".")[0]
      );
    }

    await Post.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.log("Error in deletePost controller: ", error);
  }
};

// @route /comment/:id
const commentOnPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "No such post" });
    }

    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text field is required" });
    }

    const comment = {
      user: req.user._id,
      text,
    };

    post.comments.push(comment);
    await post.save();

    const { comments: updatedComments } = await Post.findOne({ _id: postId })
      .select("comments")
      .populate({
        path: "comments.user",
        select: "-password",
      });
    console.log(updatedComments);

    res.status(200).json(updatedComments);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.log("Error from commentOnPost controller: ", error);
  }
};

// @route /like/:id
const likeUnlikePost = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "No such post" });
    }

    const userLikedPost = post.likes.includes(userId);
    if (userLikedPost) {
      // Unlike
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });

      // scot like-ul user-ului actual
      const updatedLikes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );

      res.status(200).json(updatedLikes);

      //4:07:37
      //4:55:17
      //48min 40sec in 4h
    } else {
      // like
      await Post.updateOne({ _id: postId }, { $push: { likes: userId } });
      await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });

      const notification = new Notification({
        from: userId,
        to: post.user,
        type: "like",
      });
      await notification.save();

      post.likes.push(userId);
      const updatedLikes = post.likes;

      res.status(200).json(updatedLikes);
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.log("Error in likeUnlikePost controller: ", error);
  }
};

// 1:38:00
// 2:09:47
// 31 min in 2h 50min

module.exports = {
  getAllPosts,
  getLikedPosts,
  getFollowingPosts,
  getUserPosts,
  createPost,
  deletePost,
  commentOnPost,
  likeUnlikePost,
};
