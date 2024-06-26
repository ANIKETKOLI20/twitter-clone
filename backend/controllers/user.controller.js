import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import { v2 as cloudinary } from 'cloudinary'

// Get a user profile by username
export const getUserProfile = async (req, res) => {
    const { username } = req.params;

    try {
        const user = await User.findOne({ username }).select("-password");

        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        res.status(200).json(user);

    } catch (error) {
        console.log("Error in getUserProfile: " + error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

// Follow or unfollow a user
export const followUnfollowUser = async (req, res) => {
    try {
        const { id } = req.params; 
        const userToModify = await User.findById(id); // Find the user to follow/unfollow
        const currentUser = await User.findById(req.user._id); // Find the current logged-in user

        // Debug logs
        console.log("Target User ID:", id);
        console.log("Current User ID:", req.user._id);

        // Check if the user is trying to follow/unfollow themselves
        if (id === req.user._id.toString()) {
            return res.status(400).json({ msg: "You can't follow/unfollow yourself" });
        }

        // Check if both users exist
        if (!userToModify || !currentUser) {
            return res.status(404).json({ msg: "User not found" });
        }

        const isFollowing = currentUser.following.includes(id); // Check if the current user is already following the target user

        if (isFollowing) {
            // Unfollow the user
            await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } }); // Remove the current user's ID from the followers array of the user being unfollowed
            await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } }); // Remove the ID of the user being unfollowed from the following array of the current user
            res.status(200).json({ msg: "User unfollowed successfully" });
        } else {
            // Follow the user
            await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } }); 
            await User.findByIdAndUpdate(req.user._id, { $push: { following: id } }); 

            // send notification to the user
            try {
                const newNotification = new Notification({
                    type: "follow",
                    from: req.user._id,
                    to: userToModify._id,
                });

                await newNotification.save();
                console.log("Notification saved successfully");
            } catch (notificationError) {
                console.log("Error saving notification:", notificationError.message);
            }

            res.status(200).json({ msg: "User followed successfully" });
        }
    } catch (error) {
        console.log("Error in followUnfollowUser: " + error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

// Get suggested User
export const getSuggestedUsers = async (req, res) => {
    try {
        const userId = req.user._id;

        // Correct the variable here to use userId
        const userFollowedByMe = await User.findById(userId).select("following");

        const users = await User.aggregate([
            {
                $match: {
                    _id: { $ne: userId },
                },
            },
            { $sample: { size: 10 } }
        ]);

        const filteredUsers = users.filter((user) => !userFollowedByMe.following.includes(user._id));
        const suggestedUser = filteredUsers.slice(0, 4);

        suggestedUser.forEach((user) => (user.password = null));

        res.status(200).json(suggestedUser);
    } catch (error) {
        console.log("Error in getSuggestedUser: " + error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

// Update user profile
export const updateUser = async (req, res) => {
    const { fullName, email, username, currentPassword, newPassword, bio, link } = req.body;
    let { profileImg, coverImg } = req.body;

    const userId = req.user._id;

    try {
        let user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        if ((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
            return res.status(400).json({ msg: "Please enter both current and new password" });
        }

        if (currentPassword && newPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ msg: "Current password is incorrect" });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({ msg: "New password must be at least 6 characters long" });
            }

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        if (profileImg) {
            if (user.profileImg) {
                await cloudinary.uploader.destroy(user.profileImg.split('/').pop().split(".")[0]);
            }
            const uploadedResponse = await cloudinary.uploader.upload(profileImg);
            profileImg = uploadedResponse.secure_url;
        }

        if (coverImg) {
            if (user.coverImg) {
                await cloudinary.uploader.destroy(user.coverImg.split('/').pop().split(".")[0]);
            }
            const uploadedResponse = await cloudinary.uploader.upload(coverImg);
            coverImg = uploadedResponse.secure_url;
        }

        user.fullName = fullName || user.fullName;
        user.email = email || user.email;
        user.username = username || user.username;
        user.bio = bio || user.bio;
        user.link = link || user.link;
        user.profileImg = profileImg || user.profileImg;
        user.coverImg = coverImg || user.coverImg;

        user = await user.save();

        res.status(200).json({ msg: "User updated successfully", user });

    } catch (error) {
        console.log("Error in updateUser: " + error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
