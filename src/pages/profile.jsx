// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast, Button } from '@/components/ui';
// @ts-ignore;
import { User, Settings, Trophy, Calendar, Star, ChevronRight, Award, BookOpen, Target, TrendingUp, LogOut, Edit, Camera, Clock, CheckCircle, BarChart3 } from 'lucide-react';

import { TabBar } from '@/components/TabBar';
export default function ProfilePage(props) {
  const {
    $w,
    style
  } = props;
  const [activeTab, setActiveTab] = useState('profile');
  const [userStats, setUserStats] = useState({
    totalActivities: 0,
    completedActivities: 0,
    totalTasks: 0,
    completedTasks: 0,
    totalPoints: 0,
    averageScore: 0,
    totalTimeSpent: 0,
    achievements: 0,
    taskCompletionRate: 0,
    recentActivityCount: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [taskStats, setTaskStats] = useState({
    quizTasks: 0,
    photoTasks: 0,
    locationTasks: 0,
    completedQuizTasks: 0,
    completedPhotoTasks: 0,
    completedLocationTasks: 0
  });
  const [loading, setLoading] = useState(true);
  const {
    toast
  } = useToast();
  useEffect(() => {
    loadUserData();
  }, []);
  const loadUserData = async () => {
    try {
      setLoading(true);
      const userId = $w.auth.currentUser?.userId;
      if (!userId) {
        toast({
          title: "请先登录",
          variant: "destructive"
        });
        return;
      }
      // 获取用户活动记录
      const userActivityResult = await $w.cloud.callFunction({
        name: 'callDataSource',
        data: {
          dataSourceName: 'wyw_user_activity',
          methodName: 'list',
          params: {
            filter: {
              user_id: userId
            },
            limit: 100
          }
        }
      });
      // 获取用户任务记录
      const userTaskResult = await $w.cloud.callFunction({
        name: 'callDataSource',
        data: {
          dataSourceName: 'wyw_user_task',
          methodName: 'list',
          params: {
            filter: {
              user_id: userId
            },
            limit: 200
          }
        }
      });
      // 获取任务详情用于统计
      const taskResult = await $w.cloud.callFunction({
        name: 'callDataSource',
        data: {
          dataSourceName: 'wyw_task',
          methodName: 'list',
          params: {
            limit: 100
          }
        }
      });
      if (userActivityResult.success && userActivityResult.data) {
        const activities = userActivityResult.data;
        const completedActivities = activities.filter(a => a.status === 'completed').length;
        const totalPoints = activities.reduce((sum, a) => sum + (a.points || 0), 0);
        // 获取最近活动
        const recentActivitiesData = activities.slice(0, 3).map(activity => ({
          activity_id: activity.activity_id,
          activity_name: activity.activity_name || '未知活动',
          status: activity.status,
          completed_time: activity.completed_time,
          points: activity.points || 0
        }));
        setRecentActivities(recentActivitiesData);
        // 更新统计数据
        setUserStats(prev => ({
          ...prev,
          totalActivities: activities.length,
          completedActivities: completedActivities,
          totalPoints: totalPoints,
          achievements: Math.floor(completedActivities / 3),
          recentActivityCount: recentActivitiesData.length
        }));
      }
      if (userTaskResult.success && userTaskResult.data && taskResult.success && taskResult.data) {
        const userTasks = userTaskResult.data;
        const tasks = taskResult.data;
        const completedTasks = userTasks.filter(t => t.status === 'completed');
        const totalTasks = userTasks.length;
        const totalPoints = userTasks.reduce((sum, t) => sum + (t.points || 0), 0);
        const totalTimeSpent = userTasks.reduce((sum, t) => sum + (t.time_spent || 0), 0);
        const averageScore = completedTasks.length > 0 ? Math.round(completedTasks.reduce((sum, t) => sum + (t.score || 0), 0) / completedTasks.length) : 0;
        const taskCompletionRate = totalTasks > 0 ? Math.round(completedTasks.length / totalTasks * 100) : 0;
        // 按任务类型统计
        const taskTypeMap = {};
        tasks.forEach(task => {
          taskTypeMap[task.task_id] = task.task_type;
        });
        const taskStats = {
          quizTasks: 0,
          photoTasks: 0,
          locationTasks: 0,
          completedQuizTasks: 0,
          completedPhotoTasks: 0,
          completedLocationTasks: 0
        };
        userTasks.forEach(userTask => {
          const taskType = taskTypeMap[userTask.task_id];
          if (taskType === 'quiz') {
            taskStats.quizTasks++;
            if (userTask.status === 'completed') taskStats.completedQuizTasks++;
          } else if (taskType === 'photo') {
            taskStats.photoTasks++;
            if (userTask.status === 'completed') taskStats.completedPhotoTasks++;
          } else if (taskType === 'location') {
            taskStats.locationTasks++;
            if (userTask.status === 'completed') taskStats.completedLocationTasks++;
          }
        });
        setTaskStats(taskStats);
        // 更新统计数据
        setUserStats(prev => ({
          ...prev,
          totalTasks: totalTasks,
          completedTasks: completedTasks.length,
          totalPoints: totalPoints,
          averageScore: averageScore,
          totalTimeSpent: totalTimeSpent,
          taskCompletionRate: taskCompletionRate,
          achievements: Math.floor(completedTasks.length / 5) // 每5个任务获得1个成就
        }));
      }
      // 如果没有数据，使用模拟数据
      if (!userActivityResult.success || !userTaskResult.success) {
        setUserStats({
          totalActivities: 12,
          completedActivities: 8,
          totalTasks: 25,
          completedTasks: 18,
          totalPoints: 2450,
          averageScore: 85,
          totalTimeSpent: 7200,
          // 2小时
          achievements: 3,
          taskCompletionRate: 72,
          recentActivityCount: 3
        });
        setTaskStats({
          quizTasks: 15,
          photoTasks: 8,
          locationTasks: 2,
          completedQuizTasks: 12,
          completedPhotoTasks: 5,
          completedLocationTasks: 1
        });
        setRecentActivities([{
          activity_id: 'demo-1',
          activity_name: '青铜器探秘之旅',
          status: 'completed',
          completed_time: '2024-01-15',
          points: 300
        }, {
          activity_id: 'demo-2',
          activity_name: '陶瓷艺术寻宝',
          status: 'in_progress',
          started_time: '2024-01-18',
          points: 0
        }, {
          activity_id: 'demo-3',
          activity_name: '古代文字解密',
          status: 'registered',
          registered_time: '2024-01-20',
          points: 0
        }]);
      }
    } catch (error) {
      console.error('加载用户数据失败:', error);
      toast({
        title: "加载失败",
        description: "无法获取用户统计数据",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleTabChange = tabId => {
    setActiveTab(tabId);
    if (tabId === 'home') {
      $w.utils.navigateTo({
        pageId: 'home',
        params: {}
      });
    } else if (tabId === 'activities') {
      $w.utils.navigateTo({
        pageId: 'my-activities',
        params: {}
      });
    }
  };
  const handleEditProfile = () => {
    $w.utils.navigateTo({
      pageId: 'edit-profile',
      params: {}
    });
  };
  const handleLogout = () => {
    // 调用登出API
    $w.cloud.callFunction({
      name: 'logout',
      data: {}
    }).then(() => {
      toast({
        title: "退出成功",
        description: "您已安全退出登录"
      });
      $w.utils.navigateTo({
        pageId: 'login',
        params: {}
      });
    }).catch(error => {
      toast({
        title: "退出失败",
        description: error.message,
        variant: "destructive"
      });
    });
  };
  const getStatusText = status => {
    switch (status) {
      case 'completed':
        return '已完成';
      case 'in_progress':
        return '进行中';
      case 'registered':
        return '已报名';
      default:
        return '未知';
    }
  };
  const getStatusColor = status => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'in_progress':
        return 'text-blue-600 bg-blue-100';
      case 'registered':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };
  const formatTime = seconds => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor(seconds % 3600 / 60);
    if (hours > 0) {
      return `${hours}小时${minutes}分钟`;
    }
    return `${minutes}分钟`;
  };
  const getLevelInfo = points => {
    if (points < 500) return {
      level: 1,
      title: '初级探索者',
      color: 'text-gray-600',
      bgColor: 'bg-gray-100'
    };
    if (points < 1500) return {
      level: 2,
      title: '中级探索者',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    };
    if (points < 3000) return {
      level: 3,
      title: '高级探索者',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    };
    return {
      level: 4,
      title: '资深探索者',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    };
  };
  if (loading) {
    return <div style={style} className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>;
  }
  const levelInfo = getLevelInfo(userStats.totalPoints);
  return <div style={style} className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-20">
      {/* 顶部装饰区域 */}
      <div className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white overflow-hidden">
        {/* 青铜纹样装饰 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-32 h-32 border-4 border-yellow-400 rounded-full transform -translate-x-16 -translate-y-16"></div>
          <div className="absolute top-10 right-10 w-24 h-24 border-4 border-yellow-400 rounded-lg transform rotate-45"></div>
          <div className="absolute bottom-0 left-20 w-40 h-40 border-4 border-yellow-400 rounded-full transform translate-y-20"></div>
        </div>
        
        <div className="relative z-10 px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-yellow-300">个人中心</h1>
            <button onClick={handleEditProfile} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
              <Edit className="w-5 h-5" />
            </button>
          </div>
          
          {/* 用户信息 */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <button className="absolute bottom-0 right-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white">
                <Camera className="w-3 h-3 text-white" />
              </button>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">
                {$w.auth.currentUser?.nickName || $w.auth.currentUser?.name || '探索者'}
              </h2>
              <p className="text-blue-100 text-sm">
                ID: {$w.auth.currentUser?.userId || 'guest'}
              </p>
              <div className="flex items-center mt-2">
                <Trophy className="w-4 h-4 text-yellow-400 mr-1" />
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${levelInfo.bgColor} ${levelInfo.color}`}>
                  Lv.{levelInfo.level} {levelInfo.title}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 统计数据卡片 */}
      <div className="px-4 -mt-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-2xl font-bold text-blue-700 mb-1">
                {userStats.totalActivities}
              </div>
              <div className="text-sm text-gray-600">参与活动</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="text-2xl font-bold text-green-700 mb-1">
                {userStats.completedActivities}
              </div>
              <div className="text-sm text-gray-600">已完成</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-xl">
              <div className="text-2xl font-bold text-yellow-700 mb-1">
                {userStats.totalPoints}
              </div>
              <div className="text-sm text-gray-600">总积分</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <div className="text-2xl font-bold text-purple-700 mb-1">
                {userStats.achievements}
              </div>
              <div className="text-sm text-gray-600">成就</div>
            </div>
          </div>
        </div>
      </div>

      {/* 任务统计 */}
      <div className="px-4 mt-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
            任务统计
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">任务完成率</span>
              <div className="flex items-center">
                <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full" style={{
                  width: `${userStats.taskCompletionRate}%`
                }}></div>
                </div>
                <span className="text-sm font-medium text-gray-800">{userStats.taskCompletionRate}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">平均得分</span>
              <span className="text-sm font-medium text-gray-800">{userStats.averageScore}分</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">总用时</span>
              <span className="text-sm font-medium text-gray-800">{formatTime(userStats.totalTimeSpent)}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{taskStats.completedQuizTasks}/{taskStats.quizTasks}</div>
                <div className="text-xs text-gray-500">答题任务</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">{taskStats.completedPhotoTasks}/{taskStats.photoTasks}</div>
                <div className="text-xs text-gray-500">拍照任务</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-red-600">{taskStats.completedLocationTasks}/{taskStats.locationTasks}</div>
                <div className="text-xs text-gray-500">定位任务</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 快捷功能入口 */}
      <div className="px-4 mt-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">快捷功能</h3>
          <div className="space-y-3">
            <button onClick={() => $w.utils.navigateTo({
            pageId: 'my-activities',
            params: {}
          })} className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-800">我的活动</div>
                  <div className="text-sm text-gray-500">查看参与的活动记录</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            <button onClick={() => $w.utils.navigateTo({
            pageId: 'achievements',
            params: {}
          })} className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                  <Award className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-800">我的成就</div>
                  <div className="text-sm text-gray-500">查看获得的成就和徽章</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            <button onClick={() => $w.utils.navigateTo({
            pageId: 'statistics',
            params: {}
          })} className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-800">数据统计</div>
                  <div className="text-sm text-gray-500">查看个人数据统计</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            <button onClick={() => $w.utils.navigateTo({
            pageId: 'settings',
            params: {}
          })} className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <Settings className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-800">设置</div>
                  <div className="text-sm text-gray-500">账号设置和隐私管理</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* 最近活动 */}
      <div className="px-4 mt-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">最近活动</h3>
            <button onClick={() => $w.utils.navigateTo({
            pageId: 'my-activities',
            params: {}
          })} className="text-blue-600 text-sm font-medium">
              查看全部
            </button>
          </div>
          <div className="space-y-3">
            {recentActivities.length === 0 ? <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">暂无活动记录</p>
                <button onClick={() => $w.utils.navigateTo({
              pageId: 'home',
              params: {}
            })} className="mt-3 text-blue-600 text-sm font-medium">
                  去探索活动
                </button>
              </div> : recentActivities.map((activity, index) => <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-gray-800">{activity.activity_name}</div>
                  <div className="text-sm text-gray-500">
                    {activity.completed_time || activity.started_time || activity.registered_time || '未知时间'}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                    {getStatusText(activity.status)}
                  </span>
                  {activity.points > 0 && <div className="flex items-center text-yellow-600">
                      <Star className="w-4 h-4 mr-1 fill-current" />
                      <span className="text-sm font-medium">+{activity.points}</span>
                    </div>}
                </div>
              </div>)}
          </div>
        </div>
      </div>

      {/* 退出登录按钮 */}
      <div className="px-4 mt-6 mb-6">
        <button onClick={handleLogout} className="w-full flex items-center justify-center p-4 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors">
          <LogOut className="w-5 h-5 mr-2" />
          <span className="font-medium">退出登录</span>
        </button>
      </div>

      {/* 底部导航栏 */}
      <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
    </div>;
}