import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { UserPlus } from 'lucide-react';
import UserCard from './UserCard';

export default function RecommendationsList() {
  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['recommendations'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:5000/api/users/recommendations');
      return response.data;
    },
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <UserPlus className="text-blue-600" size={24} />
        <h2 className="text-xl font-semibold">Recommended Friends</h2>
      </div>

      {isLoading ? (
        <div className="text-center py-4">Loading...</div>
      ) : recommendations && recommendations.length > 0 ? (
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <div key={rec._id} className="border-b pb-4 last:border-b-0 last:pb-0">
              <UserCard user={rec.user} />
              <p className="text-sm text-gray-500 mt-2">
                {rec.mutualCount} mutual friend{rec.mutualCount !== 1 ? 's' : ''}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">
          No recommendations available
        </div>
      )}
    </div>
  );
}
