import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Users } from 'lucide-react';
import UserCard from './UserCard';

export default function FriendsList() {
  const { data: friends, isLoading } = useQuery({
    queryKey: ['friends'],
    queryFn: async () => {
      const response = await axios.get('https://friend-connect-backend.onrender.com/api/friends');
      return response.data;
    },
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <Users className="text-blue-600" size={24} />
        <h2 className="text-xl font-semibold">Your Friends</h2>
      </div>

      {isLoading ? (
        <div className="text-center py-4">Loading...</div>
      ) : friends && friends.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {friends.map((friend) => (
            <UserCard key={friend._id} user={friend} isFriend={true} />
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">
          You haven't added any friends yet
        </div>
      )}
    </div>
  );
}
