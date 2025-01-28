import express from 'express';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Send friend request
router.post('/request/:userId', auth, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.userId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existingRequest = targetUser.friendRequests.find(
      request => request.from.toString() === req.user.userId
    );

    if (existingRequest) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }

    targetUser.friendRequests.push({ from: req.user.userId });
    await targetUser.save();

    res.json({ message: 'Friend request sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending friend request', error: error.message });
  }
});

// Get friend requests
router.get('/requests', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate('friendRequests.from', 'username email');
    
    res.json(user.friendRequests);
  } catch (error) {
    res.status(500).json({ message: 'Error getting friend requests', error: error.message });
  }
});

// Respond to friend request
router.post('/respond/:requestId', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findById(req.user.userId);
    const request = user.friendRequests.id(req.params.requestId);

    if (!request) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    if (status === 'accepted') {
      user.friends.push(request.from);
      const otherUser = await User.findById(request.from);
      otherUser.friends.push(user._id);
      await otherUser.save();
    }

    user.friendRequests.pull(req.params.requestId);
    await user.save();

    res.json({ message: `Friend request ${status}` });
  } catch (error) {
    res.status(500).json({ message: 'Error responding to friend request', error: error.message });
  }
});

// Get friends list
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate('friends', 'username email');
    
    res.json(user.friends);
  } catch (error) {
    res.status(500).json({ message: 'Error getting friends list', error: error.message });
  }
});

// Remove friend
router.delete('/:friendId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const friend = await User.findById(req.params.friendId);

    if (!friend) {
      return res.status(404).json({ message: 'Friend not found' });
    }

    user.friends.pull(req.params.friendId);
    friend.friends.pull(req.user.userId);

    await Promise.all([user.save(), friend.save()]);

    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing friend', error: error.message });
  }
});

export default router;