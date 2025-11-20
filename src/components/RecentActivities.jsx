// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Calendar, Clock, Trophy, CheckCircle, Play } from 'lucide-react';

export function RecentActivities({
  activities
}) {
  const getStatusColor = status => {
    switch (status) {
      case 'registered':
        return 'text-blue-600 bg-blue-100';
      case 'in_progress':
        return 'text-yellow-600 bg-yellow-100';
      case 'completed':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };
  const getStatusText = status => {
    switch (status) {
      case 'registered':
        return '已报名';
      case 'in_progress':
        return '进行中';
      case 'completed':
        return '已完成';
      default:
        return '未知';
    }
  };
  const getStatusIcon = status => {
    switch (status) {
      case 'registered':
        return <Calendar className="w-4 h-4" />;
      case 'in_progress':
        return <Play className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };
  return <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4">最近活动</h2>
      {activities.length === 0 ? <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">暂无活动记录</p>
        </div> : <div className="space-y-3">
          {activities.map((activity, index) => <div key={activity.user_activity_id || index} className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800 mb-1">活动 {activity.activity_id}</h3>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(activity.status)}`}>
                      {getStatusIcon(activity.status)}
                      <span className="ml-1">{getStatusText(activity.status)}</span>
                    </span>
                    <span className="text-xs text-gray-500">
                      {activity.registered_time && new Date(activity.registered_time).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-yellow-500">
                    <Trophy className="w-4 h-4 mr-1" />
                    <span className="font-medium">{activity.points || 0}</span>
                  </div>
                  <p className="text-xs text-gray-500">积分</p>
                </div>
              </div>
            </div>)}
        </div>}
    </div>;
}