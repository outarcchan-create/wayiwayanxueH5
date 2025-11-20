// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast, Button } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Calendar, Clock, Trophy, Target, CheckCircle, Play, Star, Users, Filter, Search, RefreshCw, AlertTriangle, Wifi, WifiOff, MapPin, Award, TrendingUp } from 'lucide-react';

import { TabBar } from '@/components/TabBar';
export default function MyActivitiesPage(props) {
  const {
    $w,
    style
  } = props;
  const [activeTab, setActiveTab] = useState('activities');
  const [userActivities, setUserActivities] = useState([]);
  const [userTasks, setUserTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [networkStatus, setNetworkStatus] = useState('online');
  const [retryCount, setRetryCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [stats, setStats] = useState({
    totalActivities: 0,
    completedActivities: 0,
    inProgressActivities: 0,
    totalPoints: 0,
    totalTasks: 0,
    completedTasks: 0
  });
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
    loadUserActivities();
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  useEffect(() => {
    filterAndSortActivities();
  }, [userActivities, searchQuery, selectedStatus, sortBy]);
  const loadUserActivities = async (isRetry = false) => {
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
      // 并行获取用户活动和任务数据 - 调用真实的wywh5_user_activity和wywh5_user_task数据模型
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
              completed_time: -1,
              start_time: -1
            },
            limit: 200
          }
        }
      })])]);
      // 处理用户活动数据
      if (userActivityResult.status === 'fulfilled' && userActivityResult.value.success && userActivityResult.value.data) {
        setUserActivities(userActivityResult.value.data);
      } else {
        throw new Error('获取用户活动失败');
      }
      // 处理用户任务数据
      if (userTaskResult.status === 'fulfilled' && userTaskResult.value.success && userTaskResult.value.data) {
        setUserTasks(userTaskResult.value.data);
      }
      // 计算统计数据
      if (userActivityResult.status === 'fulfilled' && userActivityResult.value.success && userActivityResult.value.data) {
        const activities = userActivityResult.value.data;
        const completedActivities = activities.filter(a => a.status === 'completed').length;
        const inProgressActivities = activities.filter(a => a.status === 'in_progress').length;
        const totalPoints = activities.reduce((sum, a) => sum + (a.points || 0), 0);
        let totalTasks = 0;
        let completedTasks = 0;
        if (userTaskResult.status === 'fulfilled' && userTaskResult.value.success && userTaskResult.value.data) {
          const tasks = userTaskResult.value.data;
          totalTasks = tasks.length;
          completedTasks = tasks.filter(t => t.status === 'completed').length;
        }
        setStats({
          totalActivities: activities.length,
          completedActivities,
          inProgressActivities,
          totalPoints,
          totalTasks,
          completedTasks
        });
      }
      setRetryCount(0);
      if (isRetry) {
        toast({
          title: "刷新成功",
          description: "活动数据已更新"
        });
      }
    } catch (error) {
      console.error('加载用户活动失败:', error);
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
          description: error.message || "无法获取活动数据",
          variant: "destructive"
        });
      }
      // 不再使用模拟数据，直接显示错误状态
      setUserActivities([]);
      setUserTasks([]);
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
    loadUserActivities(true);
  };
  const filterAndSortActivities = () => {
    let filtered = [...userActivities];

    // 按状态筛选
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(activity => activity.status === selectedStatus);
    }

    // 按搜索关键词筛选
    if (searchQuery) {
      filtered = filtered.filter(activity => {
        // 这里需要根据activity_id获取活动详情，暂时使用activity_id进行搜索
        return activity.activity_id && activity.activity_id.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }

    // 排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.registered_time || 0) - new Date(a.registered_time || 0);
        case 'progress':
          const aProgress = getActivityProgress(a.activity_id);
          const bProgress = getActivityProgress(b.activity_id);
          return bProgress - aProgress;
        case 'points':
          return (b.points || 0) - (a.points || 0);
        case 'name':
          return (a.activity_id || '').localeCompare(b.activity_id || '');
        default:
          return 0;
      }
    });
    setUserActivities(filtered);
  };
  const getActivityProgress = activityId => {
    const activityTasks = userTasks.filter(task => task.activity_id === activityId);
    if (activityTasks.length === 0) return 0;
    const completedTasks = activityTasks.filter(task => task.status === 'completed').length;
    return Math.round(completedTasks / activityTasks.length * 100);
  };
  const handleTabChange = tabId => {
    setActiveTab(tabId);
    if (tabId === 'home') {
      $w.utils.navigateTo({
        pageId: 'home',
        params: {}
      });
    } else if (tabId === 'profile') {
      $w.utils.navigateTo({
        pageId: 'profile',
        params: {}
      });
    }
  };
  const handleActivityClick = activityId => {
    toast({
      title: "正在加载",
      description: "正在获取活动详情..."
    });
    $w.utils.navigateTo({
      pageId: 'activity-detail',
      params: {
        activityId: activityId
      }
    });
  };
  const handleContinueActivity = activityId => {
    toast({
      title: "正在加载",
      description: "正在准备活动地图..."
    });
    $w.utils.navigateTo({
      pageId: 'activity-map',
      params: {
        activityId: activityId
      }
    });
  };
  const handleSearch = query => {
    setSearchQuery(query);
  };
  const handleStatusChange = status => {
    setSelectedStatus(status);
  };
  const handleSortChange = sort => {
    setSortBy(sort);
    const sortText = {
      recent: '最近参与',
      progress: '完成进度',
      points: '获得积分',
      name: '活动名称'
    };
    toast({
      title: "排序方式已更改",
      description: `当前按${sortText[sort]}显示`
    });
  };
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
        return <Target className="w-4 h-4" />;
    }
  };
  if (loading) {
    return <div style={style} className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
          <p className="text-sm text-gray-500 mt-2">正在获取活动数据</p>
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
              <h1 className="text-xl font-bold text-yellow-300">我的活动</h1>
              <p className="text-blue-100 text-sm">查看参与的活动和任务</p>
            </div>
          </div>
          <button onClick={() => loadUserActivities(true)} disabled={refreshing} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
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

      {/* 统计卡片 */}
      <div className="px-4 py-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <span className="text-2xl font-bold text-gray-800">{stats.totalPoints}</span>
            </div>
            <p className="text-sm text-gray-600">总积分</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8 text-blue-500" />
              <span className="text-2xl font-bold text-gray-800">{stats.completedTasks}/{stats.totalTasks}</span>
            </div>
            <p className="text-sm text-gray-600">完成任务</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <span className="text-2xl font-bold text-gray-800">{stats.completedActivities}</span>
            </div>
            <p className="text-sm text-gray-600">已完成活动</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Play className="w-8 h-8 text-orange-500" />
              <span className="text-2xl font-bold text-gray-800">{stats.inProgressActivities}</span>
            </div>
            <p className="text-sm text-gray-600">进行中活动</p>
          </div>
        </div>

        {/* 搜索和筛选 */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="text" placeholder="搜索活动..." value={searchQuery} onChange={e => handleSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Filter className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          
          <div className="flex space-x-2 overflow-x-auto">
            {['all', 'registered', 'in_progress', 'completed'].map(status => <button key={status} onClick={() => handleStatusChange(status)} className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedStatus === status ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                {status === 'all' ? '全部' : getStatusText(status)}
              </button>)}
          </div>
        </div>

        {/* 排序选项 */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500">共 {userActivities.length} 个活动</span>
          <select value={sortBy} onChange={e => handleSortChange(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-1 focus:outline-none focus:border-blue-500">
            <option value="recent">最近参与</option>
            <option value="progress">完成进度</option>
            <option value="points">获得积分</option>
            <option value="name">活动名称</option>
          </select>
        </div>

        {/* 活动列表 */}
        {userActivities.length === 0 && !error ? <div className="text-center py-12">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">暂无活动记录</p>
            <button onClick={() => $w.utils.navigateTo({
          pageId: 'home',
          params: {}
        })} className="text-blue-600 text-sm">
              去发现活动
            </button>
          </div> : <div className="space-y-4">
            {userActivities.map((activity, index) => {
          const progress = getActivityProgress(activity.activity_id);
          const activityTasks = userTasks.filter(task => task.activity_id === activity.activity_id);
          return <div key={activity.user_activity_id || index} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 mb-1">活动 {activity.activity_id}</h3>
                      <div className="flex items-center space-x-2 mb-2">
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
                      <div className="flex items-center text-yellow-500 mb-1">
                        <Trophy className="w-4 h-4 mr-1" />
                        <span className="font-medium">{activity.points || 0}</span>
                      </div>
                      <p className="text-xs text-gray-500">积分</p>
                    </div>
                  </div>
                  
                  {/* 进度条 */}
                  {activity.status === 'in_progress' && <div className="mb-3">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>完成进度</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{
                    width: `${progress}%`
                  }}></div>
                      </div>
                    </div>}
                  
                  {/* 任务统计 */}
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <Target className="w-4 h-4 mr-1" />
                      <span>{activityTasks.length} 个任务</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                      <span>{activityTasks.filter(t => t.status === 'completed').length} 已完成</span>
                    </div>
                  </div>
                  
                  {/* 操作按钮 */}
                  <div className="flex space-x-2">
                    <button onClick={() => handleActivityClick(activity.activity_id)} className="flex-1 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium">
                      查看详情
                    </button>
                    {activity.status === 'registered' && <button onClick={() => handleContinueActivity(activity.activity_id)} className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                        开始活动
                      </button>}
                    {activity.status === 'in_progress' && <button onClick={() => handleContinueActivity(activity.activity_id)} className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                        继续活动
                      </button>}
                    {activity.status === 'completed' && <button disabled className="flex-1 py-2 bg-gray-300 text-gray-500 rounded-lg text-sm font-medium">
                        已完成
                      </button>}
                  </div>
                </div>
              </div>;
        })}
          </div>}
      </div>

      {/* 底部导航栏 */}
      <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
    </div>;
}