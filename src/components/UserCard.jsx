import React from 'react';
import { UserPlus, UserMinus, Check, X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function UserCard({ 
  user, 
  showActions = true, 
  isFriend = false, 
  isPending = false,
  requestId
}) {
  const queryClient = useQueryClient();

  const sendFriendRequest = useMutation({
    mutationFn: async () => {
      await axios.post(`http://localhost:5000/api/friends/request/${user._id}`);
    },
    onSuccess: () => {
      toast.success('Friend request sent!');
      queryClient.invalidateQueries(['users']);
    },
    onError: () => {
      toast.error('Failed to send friend request');
    },
  });

  const respondToRequest = useMutation({
    mutationFn: async ({ status }) => {
      await axios.post(`http://localhost:5000/api/friends/respond/${requestId}`, { status });
    },
    onSuccess: (_, { status }) => {
      toast.success(`Friend request ${status}!`);
      queryClient.invalidateQueries(['friendRequests']);
      queryClient.invalidateQueries(['friends']);
    },
    onError: () => {
      toast.error('Failed to respond to friend request');
    },
  });

  const removeFriend = useMutation({
    mutationFn: async () => {
      await axios.delete(`http://localhost:5000/api/friends/${user._id}`);
    },
    onSuccess: () => {
      toast.success('Friend removed');
      queryClient.invalidateQueries(['friends']);
    },
    onError: () => {
      toast.error('Failed to remove friend');
    },
  });

  return (
    <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
      <div>
        <h3 className="font-semibold text-lg">{user.username}</h3>
        <p className="text-gray-600 text-sm">{user.email}</p>
      </div>
      {showActions && (
        <div className="flex gap-2">
          {isFriend ? (
            <button
              onClick={() => removeFriend.mutate()}
              className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
              title="Remove friend"
            >
              <UserMinus size={20} />
            </button>
          ) : isPending ? (
            <div className="flex gap-2">
              <button
                onClick={() => respondToRequest.mutate({ status: 'accepted' })}
                className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                title="Accept request"
              >
                <Check size={20} />
              </button>
              <button
                onClick={() => respondToRequest.mutate({ status: 'rejected' })}
                className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                title="Reject request"
              >
                <X size={20} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => sendFriendRequest.mutate()}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
              title="Add friend"
            >
              <UserPlus size={20} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
