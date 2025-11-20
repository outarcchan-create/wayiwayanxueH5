// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Trophy, Medal, Award, Star, Users, Target, Clock, TrendingUp } from 'lucide-react';

export function LeaderboardList({
  leaderboardData,
  userRank,
  selectedType
}) {
  const getRankIcon = rank => {
    if (rank === 1) {
      return <Trophy className="w-6 h-6 text-yellow-500" />;
    } else if (rank === 2) {
      return <Medal className="w-6 h-6 text-gray-400" />;
    } else if (rank === 3) {
      return <Award className="w-6 h-6 text-orange-600" />;
    }
    return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-600">{rank}</span>;
  };
  const getRankBadgeColor = rank => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
    if (rank === 3) return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
    return 'bg-gray-100 text-gray-700';
  };
  const getTypeIcon = type => {
    switch (type) {
      case 'points':
        return <Star className="w-4 h-4 text-yellow-500" />;
      case 'activities':
        return <Users className="w-4 h-4 text-blue-500" />;
      case 'tasks':
        return <Target className="w-4 h-4 text-green-500" />;
      case 'score':
        return <TrendingUp className="w-4 h-4 text-purple-500" />;
      case 'time':
        return <Clock className="w-4 h-4 text-red-500" />;
      default:
        return <Star className="w-4 h-4 text-yellow-500" />;
    }
  };
  const getTypeValue = (user, type) => {
    switch (type) {
      case 'points':
        return user.totalPoints;
      case 'activities':
        return user.completedActivities;
      case 'tasks':
        return user.completedTasks;
      case 'score':
        return user.averageScore;
      case 'time':
        return Math.round(user.totalTimeSpent / 60);
      // 转换为分钟
      default:
        return user.totalPoints;
    }
  };
  const getTypeLabel = type => {
    switch (type) {
      case 'points':
        return '积分';
      case 'activities':
        return '活动';
      case 'tasks':
        return '任务';
      case 'score':
        return '分数';
      case 'time':
        return '分钟';
      default:
        return '积分';
    }
  };
  return <div className="space-y-4">
      {/* 当前用户排名 */}
      {userRank && <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getRankBadgeColor(userRank.rank)}`}>
                {getRankIcon(userRank.rank)}
              </div>
              <div>
                <div className="font-medium text-gray-800">我的排名</div>
                <div className="text-sm text-gray-600">第{userRank.rank}名</div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center text-blue-600">
                {getTypeIcon(selectedType)}
                <span className="ml-1 font-bold text-lg">{getTypeValue(userRank, selectedType)}</span>
              </div>
              <div className="text-xs text-gray-500">{getTypeLabel(selectedType)}</div>
            </div>
          </div>
        </div>}
      
      {/* 排行榜列表 */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>排名</span>
            <span>用户</span>
            <span className="text-right">{getTypeLabel(selectedType)}</span>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {leaderboardData.slice(0, 50).map((user, index) => <div key={user.userId} className={`px-4 py-3 hover:bg-gray-50 transition-colors ${userRank && user.userId === userRank.userId ? 'bg-blue-50' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${getRankBadgeColor(user.rank)}`}>
                    {getRankIcon(user.rank)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">{user.userName}</div>
                    {userRank && user.userId === userRank.userId && <div className="text-xs text-blue-600">您</div>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-gray-800">
                    {getTypeIcon(selectedType)}
                    <span className="ml-1 font-medium">{getTypeValue(user, selectedType)}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {selectedType === 'activities' && `共${user.totalActivities}个`}
                    {selectedType === 'tasks' && `共${user.totalTasks}个`}
                    {selectedType === 'score' && user.averageScore > 0 && `平均分`}
                    {selectedType === 'time' && `总时长`}
                  </div>
                </div>
              </div>
            </div>)}
        </div>
      </div>
      
      {leaderboardData.length === 0 && <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">暂无排行数据</p>
        </div>}
    </div>;
}