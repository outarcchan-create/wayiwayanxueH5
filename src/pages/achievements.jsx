// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast, Button } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Trophy, Award, Star, Target, Lock, CheckCircle, Calendar, TrendingUp, Share2, Download, Filter, Search, RefreshCw, AlertTriangle, Wifi, WifiOff } from 'lucide-react';

import { TabBar } from '@/components/TabBar';
export default function AchievementsPage(props) {
  const {
    $w,
    style
  } = props;
  const [activeTab, setActiveTab] = useState('profile');
  const [achievements, setAchievements] = useState([]);
  const [userStats, setUserStats] = useState({
    totalAchievements: 0,
    unlockedAchievements: 0,
    totalPoints: 0,
    completionRate: 0,
    rank: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [networkStatus, setNetworkStatus] = useState('online');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [retryCount, setRetryCount] = useState(0);
  const [sharing, setSharing] = useState(false);
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
    loadAchievements();
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  useEffect(() => {
    filterAndSortAchievements();
  }, [achievements, selectedCategory, searchQuery, sortBy]);
  const loadAchievements = async (isRetry = false) => {
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
      // 获取用户活动数据来计算成就
      const [userActivityResult, userTaskResult] = await Promise.allSettled([Promise.race([timeoutPromise, $w.cloud.callFunction({
        name: 'callDataSource',
        data: {
          dataSourceName: 'wywh5_user_activity',
          methodName: 'list',
          params: {
            filter: {
              user_id: userId
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
            limit: 200
          }
        }
      })])]);
      // 处理用户活动数据
      let activities = [];
      if (userActivityResult.status === 'fulfilled' && userActivityResult.value.success && userActivityResult.value.data) {
        activities = userActivityResult.value.data;
      }
      // 处理用户任务数据
      let tasks = [];
      if (userTaskResult.status === 'fulfilled' && userTaskResult.value.success && userTaskResult.value.data) {
        tasks = userTaskResult.value.data;
      }
      // 生成成就数据
      const achievementsList = generateAchievements(activities, tasks);
      setAchievements(achievementsList);
      // 计算统计数据
      const unlockedCount = achievementsList.filter(a => a.unlocked).length;
      const totalPoints = achievementsList.filter(a => a.unlocked).reduce((sum, a) => sum + (a.points || 0), 0);
      setUserStats({
        totalAchievements: achievementsList.length,
        unlockedAchievements: unlockedCount,
        totalPoints: totalPoints,
        completionRate: Math.round(unlockedCount / achievementsList.length * 100),
        rank: Math.floor(Math.random() * 100) + 1 // 模拟排名
      });
      setRetryCount(0);
      if (isRetry) {
        toast({
          title: "刷新成功",
          description: "成就数据已更新"
        });
      }
    } catch (error) {
      console.error('加载成就失败:', error);
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
          description: error.message || "无法获取成就数据",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  const generateAchievements = (activities, tasks) => {
    const completedActivities = activities.filter(a => a.status === 'completed').length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const totalPoints = activities.reduce((sum, a) => sum + (a.points || 0), 0);
    const taskPoints = tasks.reduce((sum, t) => sum + (t.points || 0), 0);
    const allPoints = totalPoints + taskPoints;
    const shareCount = activities.reduce((sum, a) => sum + (a.share_count || 0), 0);
    const perfectScores = tasks.filter(t => t.status === 'completed' && t.score >= 90).length;
    const quizTasks = tasks.filter(t => t.task_type === 'quiz').length;
    const photoTasks = tasks.filter(t => t.task_type === 'photo').length;
    const locationTasks = tasks.filter(t => t.task_type === 'location').length;
    const achievementsList = [
    // 活动相关成就
    {
      id: 'first_activity',
      name: '初学者',
      description: '完成第一个活动',
      icon: <Trophy className="w-6 h-6 text-yellow-500" />,
      category: 'activity',
      points: 50,
      unlocked: completedActivities >= 1,
      progress: Math.min(completedActivities, 1),
      maxProgress: 1,
      unlockedDate: completedActivities >= 1 ? activities.find(a => a.status === 'completed')?.completed_time : null
    }, {
      id: 'five_activities',
      name: '活动达人',
      description: '完成5个活动',
      icon: <Award className="w-6 h-6 text-blue-500" />,
      category: 'activity',
      points: 200,
      unlocked: completedActivities >= 5,
      progress: Math.min(completedActivities, 5),
      maxProgress: 5,
      unlockedDate: completedActivities >= 5 ? activities.filter(a => a.status === 'completed')[4]?.completed_time : null
    }, {
      id: 'ten_activities',
      name: '活动专家',
      description: '完成10个活动',
      icon: <Star className="w-6 h-6 text-purple-500" />,
      category: 'activity',
      points: 500,
      unlocked: completedActivities >= 10,
      progress: Math.min(completedActivities, 10),
      maxProgress: 10,
      unlockedDate: completedActivities >= 10 ? activities.filter(a => a.status === 'completed')[9]?.completed_time : null
    },
    // 任务相关成就
    {
      id: 'first_task',
      name: '任务新手',
      description: '完成第一个任务',
      icon: <Target className="w-6 h-6 text-green-500" />,
      category: 'task',
      points: 30,
      unlocked: completedTasks >= 1,
      progress: Math.min(completedTasks, 1),
      maxProgress: 1,
      unlockedDate: completedTasks >= 1 ? tasks.find(t => t.status === 'completed')?.completed_time : null
    }, {
      id: 'ten_tasks',
      name: '任务专家',
      description: '完成10个任务',
      icon: <CheckCircle className="w-6 h-6 text-green-600" />,
      category: 'task',
      points: 300,
      unlocked: completedTasks >= 10,
      progress: Math.min(completedTasks, 10),
      maxProgress: 10,
      unlockedDate: completedTasks >= 10 ? tasks.filter(t => t.status === 'completed')[9]?.completed_time : null
    }, {
      id: 'fifty_tasks',
      name: '任务大师',
      description: '完成50个任务',
      icon: <Trophy className="w-6 h-6 text-yellow-600" />,
      category: 'task',
      points: 1000,
      unlocked: completedTasks >= 50,
      progress: Math.min(completedTasks, 50),
      maxProgress: 50,
      unlockedDate: completedTasks >= 50 ? tasks.filter(t => t.status === 'completed')[49]?.completed_time : null
    },
    // 积分相关成就
    {
      id: 'hundred_points',
      name: '积分新手',
      description: '累计获得100积分',
      icon: <Star className="w-6 h-6 text-yellow-500" />,
      category: 'points',
      points: 100,
      unlocked: allPoints >= 100,
      progress: Math.min(allPoints, 100),
      maxProgress: 100,
      unlockedDate: allPoints >= 100 ? new Date().toISOString() : null
    }, {
      id: 'thousand_points',
      name: '积分大师',
      description: '累计获得1000积分',
      icon: <Award className="w-6 h-6 text-yellow-600" />,
      category: 'points',
      points: 500,
      unlocked: allPoints >= 1000,
      progress: Math.min(allPoints, 1000),
      maxProgress: 1000,
      unlockedDate: allPoints >= 1000 ? new Date().toISOString() : null
    },
    // 分享相关成就
    {
      id: 'first_share',
      name: '分享达人',
      description: '首次分享活动成果',
      icon: <Share2 className="w-6 h-6 text-blue-500" />,
      category: 'social',
      points: 50,
      unlocked: shareCount >= 1,
      progress: Math.min(shareCount, 1),
      maxProgress: 1,
      unlockedDate: shareCount >= 1 ? new Date().toISOString() : null
    }, {
      id: 'ten_shares',
      name: '社交达人',
      description: '分享10次活动成果',
      icon: <Trophy className="w-6 h-6 text-blue-600" />,
      category: 'social',
      points: 200,
      unlocked: shareCount >= 10,
      progress: Math.min(shareCount, 10),
      maxProgress: 10,
      unlockedDate: shareCount >= 10 ? new Date().toISOString() : null
    },
    // 完美表现成就
    {
      id: 'perfect_score',
      name: '完美表现',
      description: '获得10次满分',
      icon: <Star className="w-6 h-6 text-yellow-500" />,
      category: 'performance',
      points: 400,
      unlocked: perfectScores >= 10,
      progress: Math.min(perfectScores, 10),
      maxProgress: 10,
      unlockedDate: perfectScores >= 10 ? new Date().toISOString() : null
    },
    // 任务类型成就
    {
      id: 'quiz_master',
      name: '答题高手',
      description: '完成20个答题任务',
      icon: <Target className="w-6 h-6 text-blue-500" />,
      category: 'specialist',
      points: 300,
      unlocked: quizTasks >= 20,
      progress: Math.min(quizTasks, 20),
      maxProgress: 20,
      unlockedDate: quizTasks >= 20 ? new Date().toISOString() : null
    }, {
      id: 'photo_expert',
      name: '摄影专家',
      description: '完成15个拍照任务',
      icon: <Award className="w-6 h-6 text-green-500" />,
      category: 'specialist',
      points: 250,
      unlocked: photoTasks >= 15,
      progress: Math.min(photoTasks, 15),
      maxProgress: 15,
      unlockedDate: photoTasks >= 15 ? new Date().toISOString() : null
    }, {
      id: 'location_explorer',
      name: '探索者',
      description: '完成10个定位任务',
      icon: <Trophy className="w-6 h-6 text-red-500" />,
      category: 'specialist',
      points: 350,
      unlocked: locationTasks >= 10,
      progress: Math.min(locationTasks, 10),
      maxProgress: 10,
      unlockedDate: locationTasks >= 10 ? new Date().toISOString() : null
    }];
    return achievementsList;
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
    loadAchievements(true);
  };
  const filterAndSortAchievements = () => {
    let filtered = [...achievements];

    // 按分类筛选
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(achievement => achievement.category === selectedCategory);
    }

    // 按搜索关键词筛选
    if (searchQuery) {
      filtered = filtered.filter(achievement => achievement.name.toLowerCase().includes(searchQuery.toLowerCase()) || achievement.description.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    // 排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          // 已解锁的排在前面，按解锁时间排序
          if (a.unlocked && !b.unlocked) return -1;
          if (!a.unlocked && b.unlocked) return 1;
          return new Date(b.unlockedDate || 0) - new Date(a.unlockedDate || 0);
        case 'points':
          return (b.points || 0) - (a.points || 0);
        case 'progress':
          const aProgress = a.maxProgress > 0 ? a.progress / a.maxProgress : 0;
          const bProgress = b.maxProgress > 0 ? b.progress / b.maxProgress : 0;
          return bProgress - aProgress;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
    setAchievements(filtered);
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
  const handleShareAchievements = async () => {
    setSharing(true);
    try {
      const shareData = {
        title: `我的成就展示 - 已解锁${userStats.unlockedAchievements}个成就！`,
        text: `我在博物馆探索中获得了${userStats.totalPoints}积分，解锁了${userStats.unlockedAchievements}个成就，完成率${userStats.completionRate}%！快来一起探索博物馆吧！`,
        url: window.location.href
      };
      if (navigator.share) {
        await navigator.share(shareData);
        toast({
          title: "分享成功",
          description: "成就展示已分享"
        });
      } else {
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
        toast({
          title: "链接已复制",
          description: "分享内容已复制到剪贴板"
        });
      }
    } catch (error) {
      toast({
        title: "分享失败",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSharing(false);
    }
  };
  const handleDownloadCertificate = async () => {
    try {
      toast({
        title: "证书生成中",
        description: "正在为您生成成就证书..."
      });
      // 模拟生成证书
      setTimeout(() => {
        toast({
          title: "证书已生成",
          description: "成就证书已保存到您的相册"
        });
      }, 2000);
    } catch (error) {
      toast({
        title: "生成失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const getCategoryColor = category => {
    switch (category) {
      case 'activity':
        return 'text-blue-600 bg-blue-100';
      case 'task':
        return 'text-green-600 bg-green-100';
      case 'points':
        return 'text-yellow-600 bg-yellow-100';
      case 'social':
        return 'text-purple-600 bg-purple-100';
      case 'performance':
        return 'text-red-600 bg-red-100';
      case 'specialist':
        return 'text-indigo-600 bg-indigo-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };
  const getCategoryText = category => {
    switch (category) {
      case 'activity':
        return '活动';
      case 'task':
        return '任务';
      case 'points':
        return '积分';
      case 'social':
        return '社交';
      case 'performance':
        return '表现';
      case 'specialist':
        return '专精';
      default:
        return '其他';
    }
  };
  const categories = ['all', 'activity', 'task', 'points', 'social', 'performance', 'specialist'];
  if (loading) {
    return <div style={style} className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
          <p className="text-sm text-gray-500 mt-2">正在获取成就数据</p>
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
              <h1 className="text-xl font-bold text-yellow-300">我的成就</h1>
              <p className="text-blue-100 text-sm">查看获得的成就和徽章</p>
            </div>
          </div>
          <button onClick={() => loadAchievements(true)} disabled={refreshing} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
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

      {/* 统计概览 */}
      <div className="px-4 py-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">成就概览</h2>
            <div className="flex items-center space-x-2">
              <button onClick={handleShareAchievements} disabled={sharing} className="p-2 rounded-full bg-blue-50 hover:bg-blue-100 transition-colors">
                <Share2 className="w-4 h-4 text-blue-600" />
              </button>
              <button onClick={handleDownloadCertificate} className="p-2 rounded-full bg-green-50 hover:bg-green-100 transition-colors">
                <Download className="w-4 h-4 text-green-600" />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-2xl font-bold text-blue-700 mb-1">
                {userStats.unlockedAchievements}/{userStats.totalAchievements}
              </div>
              <div className="text-sm text-gray-600">已解锁成就</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-xl">
              <div className="text-2xl font-bold text-yellow-700 mb-1">
                {userStats.totalPoints}
              </div>
              <div className="text-sm text-gray-600">成就积分</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-600">完成进度</span>
            <span className="text-sm font-medium text-gray-800">{userStats.completionRate}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300" style={{
            width: `${userStats.completionRate}%`
          }}></div>
          </div>
          
          <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
            <span>全国排名</span>
            <span className="font-medium text-gray-800">#{userStats.rank}</span>
          </div>
        </div>

        {/* 搜索和筛选 */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="text" placeholder="搜索成就..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Filter className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {categories.map(category => <button key={category} onClick={() => setSelectedCategory(category)} className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === category ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                {category === 'all' ? '全部' : getCategoryText(category)}
              </button>)}
          </div>
        </div>

        {/* 排序选项 */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500">共 {achievements.length} 个成就</span>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-1 focus:outline-none focus:border-blue-500">
            <option value="recent">最近解锁</option>
            <option value="points">积分排序</option>
            <option value="progress">完成进度</option>
            <option value="name">名称排序</option>
          </select>
        </div>

        {/* 成就列表 */}
        <div className="space-y-4">
          {achievements.map(achievement => <div key={achievement.id} className={`bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow ${achievement.unlocked ? 'border-2 border-yellow-300' : 'border border-gray-200'}`}>
              <div className="p-4">
                <div className="flex items-start space-x-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${achievement.unlocked ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' : 'bg-gray-200'}`}>
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`font-bold text-lg ${achievement.unlocked ? 'text-gray-800' : 'text-gray-500'}`}>
                        {achievement.name}
                      </h3>
                      {achievement.unlocked && <div className="flex items-center text-yellow-500">
                        <Star className="w-4 h-4 mr-1 fill-current" />
                        <span className="text-sm font-medium">{achievement.points}</span>
                      </div>}
                    </div>
                    <p className={`text-sm mb-3 ${achievement.unlocked ? 'text-gray-600' : 'text-gray-400'}`}>
                      {achievement.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(achievement.category)}`}>
                          {getCategoryText(achievement.category)}
                        </span>
                        {achievement.unlocked && achievement.unlockedDate && <span className="text-xs text-gray-500">
                            {new Date(achievement.unlockedDate).toLocaleDateString()}
                          </span>}
                      </div>
                      {achievement.unlocked ? <div className="flex items-center text-green-600">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          <span className="text-sm font-medium">已解锁</span>
                        </div> : <div className="flex items-center text-gray-400">
                          <Lock className="w-4 h-4 mr-1" />
                          <span className="text-sm">未解锁</span>
                        </div>}
                    </div>
                    {/* 进度条 */}
                    {achievement.maxProgress > 1 && <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>进度</span>
                          <span>{achievement.progress}/{achievement.maxProgress}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className={`h-2 rounded-full transition-all duration-300 ${achievement.unlocked ? 'bg-green-500' : 'bg-blue-500'}`} style={{
                      width: `${achievement.progress / achievement.maxProgress * 100}%`
                    }}></div>
                        </div>
                      </div>}
                  </div>
                </div>
              </div>
            </div>)}
        </div>
      </div>

      {/* 底部导航栏 */}
      <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
    </div>;
}