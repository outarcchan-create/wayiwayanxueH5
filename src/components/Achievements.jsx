// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Trophy, Award, Star, Target } from 'lucide-react';

export function Achievements({
  achievements
}) {
  return <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4">成就</h2>
      {achievements.length === 0 ? <div className="text-center py-8">
          <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">暂无成就</p>
        </div> : <div className="grid grid-cols-2 gap-4">
          {achievements.map(achievement => <div key={achievement.id} className={`border rounded-xl p-4 ${achievement.unlocked ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${achievement.unlocked ? 'bg-yellow-100' : 'bg-gray-200'}`}>
                  {achievement.icon}
                </div>
                {achievement.unlocked && <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>}
              </div>
              <h3 className={`font-medium mb-1 ${achievement.unlocked ? 'text-gray-800' : 'text-gray-500'}`}>
                {achievement.name}
              </h3>
              <p className={`text-xs ${achievement.unlocked ? 'text-gray-600' : 'text-gray-400'}`}>
                {achievement.description}
              </p>
            </div>)}
        </div>}
    </div>;
}