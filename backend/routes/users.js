import express from 'express';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/search', auth, async (req, res) => {
  try {
    const { query } = req.query;
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ],
      _id: { $ne: req.user.userId }
    }).select('-password');
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error searching users', error: error.message });
  }
});

router.get('/recommendations', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('friends');
    const friendIds = user.friends.map(friend => friend._id);
    
    // Find friends of friends who aren't already friends
    const recommendations = await User.aggregate([
      { $match: { _id: { $in: friendIds } } },
      { $lookup: {
          from: 'users',
          localField: 'friends',
          foreignField: '_id',
          as: 'mutualFriends'
      }},
      { $unwind: '$mutualFriends' },
      { $match: {
          'mutualFriends._id': { 
            $nin: [...friendIds, user._id]
          }
      }},
      { $group: {
          _id: '$mutualFriends._id',
          user: { $first: '$mutualFriends' },
          mutualCount: { $sum: 1 }
      }},
      { $sort: { mutualCount: -1 } },
      { $limit: 5 }
    ]);
    
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: 'Error getting recommendations', error: error.message });
  }
});

export default router;