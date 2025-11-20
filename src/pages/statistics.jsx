// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast, Button } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, RefreshCw, AlertTriangle, Wifi, WifiOff, Trophy, Award, Star, Target } from 'lucide-react';

import { TabBar } from '@/components/TabBar';
import { StatisticsOverview } from '@/components/StatisticsOverview';
import { RecentActivities } from '@/components/RecentActivities';
import { Achievements } from '@/components/Achievements';
export default function StatisticsPage(props) {
  const {
    $w,
    style
  } = props;
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [networkStatus, setNetworkStatus] = useState('online');
  const [retryCount, setRetryCount] = useState(0);
  const [userStats, setUserStats] = useState({
    totalActivities: 0,
    completedActivities: 0,
    inProgressActivities: 0,
    totalPoints: 0,
    totalTasks: 0,
    completedTasks: 0,
    averageScore: 0,
    totalTime: 0,
    rank: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const {
    toast
  } = useToast();
  useEffect(() => {
    // 监听网络状态
    const handleOnline = () => {
      setNetworkStatus('online');
      toast({
        title: "网络已连接",
        description: "数据同步已恢复"
      });
    };
    const handleOffline = () => {
      setNetworkStatus('offline');
      toast({
        title: "网络已断开",
        description: "请检查网络连接",
        variant: "destructive"
      });
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setNetworkStatus(navigator.onLine ? 'online' : 'offline');
    loadStatistics();
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  const loadStatistics = async (isRetry = false) => {
    try {
      if (isRetry) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const userId = $w.auth.currentUser?.userId;
      if (!userId) {
        throw new Error('请先登录');
      }
      // 检查网络状态
      if (!navigator.onLine) {
        throw new Error('网络连接已断开，请检查网络设置');
      }
      // 设置请求超时
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('请求超时，请稍后重试')), 10000);
      });
      // 并行获取用户活动、任务和统计数据 - 调用真实的数据模型
      const [userActivityResult, userTaskResult] = await Promise.allSettled([Promise.race([timeoutPromise, $w.cloud.callFunction({
        name: 'callDataSource',
        data: {
          dataSourceName: 'wywh5_user_activity',
          methodName: 'list',
          params: {
            filter: {
              user_id: userId
            },
            sort: {
              registered_time: -1
            },
            limit: 100
          }
        }
      })]), Promise.race([timeoutPromise, $w.cloud.callFunction({
        name: 'callDataSource',
        data: {
          dataSourceName: 'wywh5_user_task',
          methodName: 'list',
          params: {
            filter: {
              user_id: userId
            },
            sort: {
              completed_time: -1
            },
            limit: 200
          }
        }
      })])]);
      // 处理用户活动数据
      let activities = [];
      if (userActivityResult.status === 'fulfilled' && userActivityResult.value.success && userActivityResult.value.data) {
        activities = userActivityResult.value.data;
      } else {
        throw new Error('获取用户活动失败');
      }
      // 处理用户任务数据
      let tasks = [];
      if (userTaskResult.status === 'fulfilled' && userTaskResult.value.success && userTaskResult.value.data) {
        tasks = userTaskResult.value.data;
      }
      // 计算统计数据
      const completedActivities = activities.filter(a => a.status === 'completed').length;
      const inProgressActivities = activities.filter(a => a.status === 'in_progress').length;
      const totalPoints = activities.reduce((sum, a) => sum + (a.points || 0), 0);
      const completedTasks = tasks.filter(t => t.status === 'completed').length;
      const averageScore = completedTasks > 0 ? tasks.filter(t => t.status === 'completed' && t.score).reduce((sum, t) => sum + t.score, 0) / completedTasks : 0;
      const totalTime = tasks.reduce((sum, t) => {
        if (t.start_time && t.completed_time) {
          return sum + (new Date(t.completed_time) - new Date(t.start_time)) / 1000 / 60; // 分钟
        }
        return sum;
      }, 0);
      // 模拟排名（实际应该从排行榜获取）
      const rank = Math.floor(Math.random() * 100) + 1;
      setUserStats({
        totalActivities: activities.length,
        completedActivities,
        inProgressActivities,
        totalPoints,
        totalTasks: tasks.length,
        completedTasks,
        averageScore: Math.round(averageScore),
        totalTime: Math.round(totalTime),
        rank
      });
      // 获取最近活动
      setRecentActivities(activities.slice(0, 5));
      // 生成成就数据
      const achievementsList = [];
      if (completedActivities >= 1) {
        achievementsList.push({
          id: 'first_activity',
          name: '初学者',
          description: '完成第一个活动',
          icon: <Trophy className="w-6 h-6 text-yellow-500" />,
          unlocked: true
        });
      }
      if (completedActivities >= 5) {
        achievementsList.push({
          id: 'five_activities',
          name: '活动达人',
          description: '完成5个活动',
          icon: <Award className="w-6 h-6 text-blue-500" />,
          unlocked: true
        });
      }
      if (totalPoints >= 100) {
        achievementsList.push({
          id: 'hundred_points',
          name: '积分大师',
          description: '累计获得100积分',
          icon: <Star className="w-6 h-6 text-yellow-500" />,
          unlocked: true
        });
      }
      if (completedTasks >= 10) {
        achievementsList.push({
          id: 'ten_tasks',
          name: '任务专家',
          description: '完成10个任务',
          icon: <Target className="w-6 h-6 text-green-500" />,
          unlocked: true
        });
      }
      setAchievements(achievementsList);
      setRetryCount(0);
      if (isRetry) {
        toast({
          title: "刷新成功",
          description: "统计数据已更新"
        });
      }
    } catch (error) {
      console.error('加载统计数据失败:', error);
      setError(error.message);
      // 根据错误类型显示不同的提示
      if (error.message.includes('网络')) {
        toast({
          title: "网络错误",
          description: error.message,
          variant: "destructive"
        });
      } else if (error.message.includes('超时')) {
        toast({
          title: "请求超时",
          description: "服务器响应较慢，请稍后重试",
          variant: "destructive"
        });
      } else {
        toast({
          title: "加载失败",
          description: error.message || "无法获取统计数据",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    if (retryCount >= 2) {
      toast({
        title: "重试次数过多",
        description: "请检查网络连接或稍后再试",
        variant: "destructive"
      });
      return;
    }
    loadStatistics(true);
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
    } else if (tabId === 'profile') {
      $w.utils.navigateTo({
        pageId: 'profile',
        params: {}
      });
    }
  };
  if (loading) {
    return <div style={style} className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
          <p className="text-sm text-gray-500 mt-2">正在获取统计数据</p>
        </div>
      </div>;
  }
  return <div style={style} className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-20">
      {/* 网络状态指示器 */}
      <div className={`fixed top-0 left-0 right-0 z-50 px-4 py-2 ${networkStatus === 'online' ? 'bg-green-500' : 'bg-red-500'} text-white text-center text-sm transition-all duration-300`}>
        <div className="flex items-center justify-center">
          {networkStatus === 'online' ? <><Wifi className="w-4 h-4 mr-2" />网络连接正常</> : <><WifiOff className="w-4 h-4 mr-2" />网络连接已断开</>}
        </div>
      </div>

      {/* 顶部导航 */}
      <div className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white mt-8">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-32 h-32 border-4 border-yellow-400 rounded-full transform -translate-x-16 -translate-y-16"></div>
          <div className="absolute top-10 right-10 w-24 h-24 border-4 border-yellow-400 rounded-lg transform rotate-45"></div>
        </div>
        
        <div className="relative z-10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => $w.utils.navigateBack()} className="mr-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-yellow-300">数据统计</h1>
              <p className="text-blue-100 text-sm">查看您的活动成就</p>
            </div>
          </div>
          <button onClick={() => loadStatistics(true)} disabled={refreshing} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 错误提示 */}
      {error && <div className="px-4 py-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-red-800 font-medium mb-1">加载失败</h3>
                <p className="text-red-600 text-sm mb-3">{error}</p>
                <div className="flex space-x-2">
                  <Button onClick={handleRetry} disabled={refreshing} variant="outline" size="sm" className="border-red-300 text-red-600 hover:bg-red-50">
                    <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    {refreshing ? '重试中...' : '重试'}
                  </Button>
                  <span className="text-xs text-red-500 self-center">重试次数: {retryCount}/3</span>
                </div>
              </div>
            </div>
          </div>
        </div>}

      <div className="px-4 py-6">
        {/* 统计总览 */}
        <StatisticsOverview userStats={userStats} />

        {/* 最近活动 */}
        <RecentActivities activities={recentActivities} />

        {/* 成就 */}
        <Achievements achievements={achievements} />
      </div>

      {/* 底部导航栏 */}
      <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
    </div>;
}