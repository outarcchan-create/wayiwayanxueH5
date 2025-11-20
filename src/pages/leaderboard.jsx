// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast, Button } from '@/components/ui';
// @ts-ignore;
import { AlertTriangle, Wifi, WifiOff } from 'lucide-react';

import { TabBar } from '@/components/TabBar';
import { LeaderboardHeader } from '@/components/LeaderboardHeader';
import { LeaderboardFilters } from '@/components/LeaderboardFilters';
import { LeaderboardList } from '@/components/LeaderboardList';
export default function LeaderboardPage(props) {
  const {
    $w,
    style
  } = props;
  const [activeTab, setActiveTab] = useState('profile');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [networkStatus, setNetworkStatus] = useState('online');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedType, setSelectedType] = useState('points');
  const [searchQuery, setSearchQuery] = useState('');
  const [retryCount, setRetryCount] = useState(0);
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
    loadLeaderboard();
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [selectedPeriod, selectedType]);
  useEffect(() => {
    filterLeaderboard();
  }, [leaderboardData, searchQuery]);
  const loadLeaderboard = async (isRetry = false) => {
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
      // 获取用户活动数据来计算排行榜 - 调用真实的数据模型
      const [userActivityResult, userTaskResult] = await Promise.allSettled([Promise.race([timeoutPromise, $w.cloud.callFunction({
        name: 'callDataSource',
        data: {
          dataSourceName: 'wywh5_user_activity',
          methodName: 'list',
          params: {
            limit: 1000
          }
        }
      })]), Promise.race([timeoutPromise, $w.cloud.callFunction({
        name: 'callDataSource',
        data: {
          dataSourceName: 'wywh5_user_task',
          methodName: 'list',
          params: {
            limit: 2000
          }
        }
      })])]);
      // 处理数据并生成排行榜
      let activities = [];
      let tasks = [];
      if (userActivityResult.status === 'fulfilled' && userActivityResult.value.success && userActivityResult.value.data) {
        activities = userActivityResult.value.data;
      }
      if (userTaskResult.status === 'fulfilled' && userTaskResult.value.success && userTaskResult.value.data) {
        tasks = userTaskResult.value.data;
      }
      // 生成排行榜数据
      const leaderboard = generateLeaderboard(activities, tasks);
      setLeaderboardData(leaderboard);
      // 找到当前用户的排名
      const currentUserRank = leaderboard.find(user => user.userId === userId);
      setUserRank(currentUserRank || null);
      setRetryCount(0);
      if (isRetry) {
        toast({
          title: "刷新成功",
          description: "排行榜数据已更新"
        });
      }
    } catch (error) {
      console.error('加载排行榜失败:', error);
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
          description: error.message || "无法获取排行榜数据",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  const generateLeaderboard = (activities, tasks) => {
    // 按用户分组统计数据
    const userStats = {};

    // 处理活动数据
    activities.forEach(activity => {
      const userId = activity.user_id;
      if (!userStats[userId]) {
        userStats[userId] = {
          userId: userId,
          userName: `用户${userId.slice(-4)}`,
          avatarUrl: null,
          totalActivities: 0,
          completedActivities: 0,
          totalPoints: 0,
          totalTasks: 0,
          completedTasks: 0,
          averageScore: 0,
          totalTimeSpent: 0,
          shareCount: 0,
          lastActiveTime: null
        };
      }
      const stats = userStats[userId];
      stats.totalActivities++;
      if (activity.status === 'completed') {
        stats.completedActivities++;
        stats.totalPoints += activity.points || 0;
      }
      stats.shareCount += activity.share_count || 0;
      if (activity.registered_time) {
        const activeTime = new Date(activity.registered_time).getTime();
        if (!stats.lastActiveTime || activeTime > stats.lastActiveTime) {
          stats.lastActiveTime = activeTime;
        }
      }
    });

    // 处理任务数据
    tasks.forEach(task => {
      const userId = task.user_id;
      if (!userStats[userId]) {
        userStats[userId] = {
          userId: userId,
          userName: `用户${userId.slice(-4)}`,
          avatarUrl: null,
          totalActivities: 0,
          completedActivities: 0,
          totalPoints: 0,
          totalTasks: 0,
          completedTasks: 0,
          averageScore: 0,
          totalTimeSpent: 0,
          shareCount: 0,
          lastActiveTime: null
        };
      }
      const stats = userStats[userId];
      stats.totalTasks++;
      if (task.status === 'completed') {
        stats.completedTasks++;
        stats.totalPoints += task.points || 0;
        stats.totalTimeSpent += task.time_spent || 0;
      }
      stats.shareCount += task.share_count || 0;
      if (task.start_time) {
        const activeTime = new Date(task.start_time).getTime();
        if (!stats.lastActiveTime || activeTime > stats.lastActiveTime) {
          stats.lastActiveTime = activeTime;
        }
      }
    });

    // 计算平均分
    Object.keys(userStats).forEach(userId => {
      const stats = userStats[userId];
      const completedTasks = tasks.filter(t => t.user_id === userId && t.status === 'completed' && t.score);
      if (completedTasks.length > 0) {
        const totalScore = completedTasks.reduce((sum, t) => sum + t.score, 0);
        stats.averageScore = Math.round(totalScore / completedTasks.length);
      }
    });

    // 转换为数组并排序
    let leaderboard = Object.values(userStats);

    // 根据选择的类型排序
    switch (selectedType) {
      case 'points':
        leaderboard.sort((a, b) => b.totalPoints - a.totalPoints);
        break;
      case 'activities':
        leaderboard.sort((a, b) => b.completedActivities - a.completedActivities);
        break;
      case 'tasks':
        leaderboard.sort((a, b) => b.completedTasks - a.completedTasks);
        break;
      case 'score':
        leaderboard.sort((a, b) => b.averageScore - a.averageScore);
        break;
      case 'time':
        leaderboard.sort((a, b) => b.totalTimeSpent - a.totalTimeSpent);
        break;
      default:
        leaderboard.sort((a, b) => b.totalPoints - a.totalPoints);
    }

    // 添加排名
    leaderboard.forEach((user, index) => {
      user.rank = index + 1;
    });
    return leaderboard;
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
    loadLeaderboard(true);
  };
  const filterLeaderboard = () => {
    if (!searchQuery) return;
    // 这里可以实现搜索过滤逻辑
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
  const getTypeText = type => {
    switch (type) {
      case 'points':
        return '积分排行';
      case 'activities':
        return '活动排行';
      case 'tasks':
        return '任务排行';
      case 'score':
        return '分数排行';
      case 'time':
        return '时长排行';
      default:
        return '积分排行';
    }
  };
  const getPeriodText = period => {
    switch (period) {
      case 'all':
        return '总榜';
      case 'month':
        return '月榜';
      case 'week':
        return '周榜';
      case 'day':
        return '日榜';
      default:
        return '总榜';
    }
  };
  if (loading) {
    return <div style={style} className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
          <p className="text-sm text-gray-500 mt-2">正在获取排行榜数据</p>
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
      <LeaderboardHeader onBack={() => $w.utils.navigateBack()} onRefresh={() => loadLeaderboard(true)} refreshing={refreshing} typeText={getTypeText(selectedType)} periodText={getPeriodText(selectedPeriod)} />

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
                    重试
                  </Button>
                  <span className="text-xs text-red-500 self-center">重试次数: {retryCount}/3</span>
                </div>
              </div>
            </div>
          </div>
        </div>}

      <div className="px-4 py-6">
        {/* 筛选器 */}
        <LeaderboardFilters searchQuery={searchQuery} onSearchChange={setSearchQuery} selectedPeriod={selectedPeriod} onPeriodChange={setSelectedPeriod} selectedType={selectedType} onTypeChange={setSelectedType} />

        {/* 排行榜列表 */}
        <LeaderboardList leaderboardData={leaderboardData} userRank={userRank} selectedType={selectedType} />
      </div>

      {/* 底部导航栏 */}
      <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
    </div>;
}