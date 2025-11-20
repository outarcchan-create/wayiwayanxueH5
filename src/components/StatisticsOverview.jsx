// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Trophy, Target, TrendingUp, Calendar, Clock, Users, Star, Award, BarChart3 } from 'lucide-react';

export function StatisticsOverview({
  userStats
}) {
  return <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">总览</h2>
        <div className="flex items-center text-sm text-gray-500">
          <BarChart3 className="w-4 h-4 mr-1" />
          排名 #{userStats.rank}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Trophy className="w-8 h-8 text-blue-500" />
            <span className="text-2xl font-bold text-gray-800">{userStats.totalPoints}</span>
          </div>
          <p className="text-sm text-gray-600">总积分</p>
        </div>
        
        <div className="bg-green-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-8 h-8 text-green-500" />
            <span className="text-2xl font-bold text-gray-800">{userStats.completedActivities}</span>
          </div>
          <p className="text-sm text-gray-600">已完成活动</p>
        </div>
        
        <div className="bg-yellow-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Star className="w-8 h-8 text-yellow-500" />
            <span className="text-2xl font-bold text-gray-800">{userStats.averageScore}</span>
          </div>
          <p className="text-sm text-gray-600">平均分数</p>
        </div>
        
        <div className="bg-purple-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-purple-500" />
            <span className="text-2xl font-bold text-gray-800">{userStats.totalTime}</span>
          </div>
          <p className="text-sm text-gray-600">总用时(分钟)</p>
        </div>
      </div>
    </div>;
}