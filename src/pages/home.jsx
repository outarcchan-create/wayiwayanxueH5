// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast, Button } from '@/components/ui';
// @ts-ignore;
import { Search, MapPin, Calendar, Star, Trophy, Users, Clock, Filter, ChevronRight, Compass, Camera, HelpCircle, Target, RefreshCw, AlertTriangle, Wifi, WifiOff, Flame, Crown, Pin } from 'lucide-react';

import { TabBar } from '@/components/TabBar';
export default function HomePage(props) {
  const {
    $w,
    style
  } = props;
  const [activeTab, setActiveTab] = useState('home');
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [networkStatus, setNetworkStatus] = useState('online');
  const [retryCount, setRetryCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [userStats, setUserStats] = useState({
    totalActivities: 0,
    completedActivities: 0,
    totalPoints: 0
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
    loadActivities();
    loadUserStats();
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  useEffect(() => {
    filterAndSortActivities();
  }, [activities, searchQuery, selectedCategory, sortBy]);
  const loadActivities = async (isRetry = false) => {
    try {
      if (isRetry) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      // 检查网络状态
      if (!navigator.onLine) {
        throw new Error('网络连接已断开，请检查网络设置');
      }
      // 设置请求超时
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('请求超时，请稍后重试')), 10000);
      });
      // 获取活动列表 - 调用真实的wywh5_activity数据模型
      const result = await Promise.race([timeoutPromise, $w.cloud.callFunction({
        name: 'callDataSource',
        data: {
          dataSourceName: 'wywh5_activity',
          methodName: 'list',
          params: {
            filter: {
              status: 'active'
            },
            sort: {
              sort_order: -1,
              // 置顶活动优先，然后按创建时间排序
              is_pinned: -1,
              created_time: -1
            },
            limit: 50
          }
        }
      })]);
      if (result.success && result.data) {
        setActivities(result.data);
        setRetryCount(0);
        // 成功加载时的提示
        if (isRetry) {
          toast({
            title: "刷新成功",
            description: `已加载 ${result.data.length} 个活动`
          });
        }
        // 检查是否有玉架山考古博物馆活动
        const yujiaActivity = result.data.find(activity => activity.name && activity.name.includes('玉架山'));
        if (yujiaActivity) {
          toast({
            title: "发现特色活动",
            description: "玉架山考古博物馆探索活动已上线"
          });
        }
      } else {
        throw new Error(result.message || '获取活动列表失败');
      }
    } catch (error) {
      console.error('加载活动失败:', error);
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
          description: error.message || "无法获取活动列表",
          variant: "destructive"
        });
      }
      // 不再使用模拟数据，直接显示错误状态
      setActivities([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  const loadUserStats = async () => {
    try {
      const userId = $w.auth.currentUser?.userId;
      if (!userId) return;

      // 获取用户活动统计
      const result = await $w.cloud.callFunction({
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
      });
      if (result.success && result.data) {
        const activities = result.data;
        const completedActivities = activities.filter(a => a.status === 'completed').length;
        const totalPoints = activities.reduce((sum, a) => sum + (a.points || 0), 0);
        setUserStats({
          totalActivities: activities.length,
          completedActivities,
          totalPoints
        });
      }
    } catch (error) {
      console.error('加载用户统计失败:', error);
      // 静默失败，不影响主要功能
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
    loadActivities(true);
  };
  const filterAndSortActivities = () => {
    let filtered = [...activities];

    // 按分类筛选
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(activity => activity.tags && activity.tags.includes(selectedCategory));
    }

    // 按搜索关键词筛选
    if (searchQuery) {
      filtered = filtered.filter(activity => activity.name && activity.name.toLowerCase().includes(searchQuery.toLowerCase()) || activity.desc && activity.desc.toLowerCase().includes(searchQuery.toLowerCase()) || activity.tags && activity.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    }

    // 排序 - 保持置顶活动在最前面
    filtered.sort((a, b) => {
      // 首先按置顶状态排序
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;

      // 然后按选择的排序方式排序
      switch (sortBy) {
        case 'featured':
          // 精选活动优先
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          return (b.sort_order || 0) - (a.sort_order || 0);
        case 'popular':
          return (b.participants || 0) - (a.participants || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'newest':
          return new Date(b.created_time || 0) - new Date(a.created_time || 0);
        case 'difficulty':
          const difficultyOrder = {
            'easy': 1,
            'medium': 2,
            'hard': 3
          };
          return (difficultyOrder[a.difficulty] || 2) - (difficultyOrder[b.difficulty] || 2);
        default:
          return 0;
      }
    });
    setFilteredActivities(filtered);
  };
  const handleTabChange = tabId => {
    setActiveTab(tabId);
    if (tabId === 'activities') {
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
  const handleActivityClick = activityId => {
    // 添加点击反馈
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
  const handleSearch = query => {
    setSearchQuery(query);
    if (query && filteredActivities.length === 0) {
      toast({
        title: "无搜索结果",
        description: "没有找到匹配的活动"
      });
    }
  };
  const handleCategoryChange = category => {
    setSelectedCategory(category);
    const count = activities.filter(activity => category === 'all' || activity.tags && activity.tags.includes(category)).length;
    toast({
      title: "筛选完成",
      description: `找到 ${count} 个相关活动`
    });
  };
  const handleSortChange = sort => {
    setSortBy(sort);
    const sortText = {
      featured: '精选推荐',
      popular: '最受欢迎',
      rating: '评分最高',
      newest: '最新发布',
      difficulty: '难度排序'
    };
    toast({
      title: "排序方式已更改",
      description: `当前按${sortText[sort]}显示`
    });
  };
  const getDifficultyColor = difficulty => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'hard':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };
  const getDifficultyText = difficulty => {
    switch (difficulty) {
      case 'easy':
        return '简单';
      case 'medium':
        return '中等';
      case 'hard':
        return '困难';
      default:
        return '未知';
    }
  };
  const categories = ['all', '历史', '文化', '艺术', '陶瓷', '青铜器', '文字', '解密', '寻宝', '考古'];
  if (loading) {
    return <div style={style} className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
          <p className="text-sm text-gray-500 mt-2">正在获取活动列表</p>
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

      {/* 顶部搜索栏 */}
      <div className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white mt-8">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-32 h-32 border-4 border-yellow-400 rounded-full transform -translate-x-16 -translate-y-16"></div>
          <div className="absolute top-10 right-10 w-24 h-24 border-4 border-yellow-400 rounded-lg transform rotate-45"></div>
        </div>
        
        <div className="relative z-10 px-6 py-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-yellow-300 mb-2">博物馆探索</h1>
            <p className="text-blue-100">发现精彩活动，开启文化之旅</p>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" placeholder="搜索活动、标签或关键词" value={searchQuery} onChange={e => handleSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400" />
          </div>
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

      {/* 用户统计卡片 */}
      {$w.auth.currentUser && <div className="px-4 -mt-4">
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xl font-bold text-blue-600">{userStats.totalActivities}</div>
                <div className="text-xs text-gray-500">参与活动</div>
              </div>
              <div>
                <div className="text-xl font-bold text-green-600">{userStats.completedActivities}</div>
                <div className="text-xs text-gray-500">已完成</div>
              </div>
              <div>
                <div className="text-xl font-bold text-yellow-600">{userStats.totalPoints}</div>
                <div className="text-xs text-gray-500">总积分</div>
              </div>
            </div>
          </div>
        </div>}

      {/* 分类筛选 */}
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">活动分类</h2>
          <div className="flex items-center space-x-2">
            <button onClick={() => loadActivities(true)} disabled={refreshing} className="flex items-center text-blue-600 text-sm">
              <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
              刷新
            </button>
            <button className="flex items-center text-blue-600 text-sm">
              <Filter className="w-4 h-4 mr-1" />
              筛选
            </button>
          </div>
        </div>
        
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {categories.map(category => <button key={category} onClick={() => handleCategoryChange(category)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === category ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
              {category === 'all' ? '全部' : category}
            </button>)}
        </div>
      </div>

      {/* 排序选项 */}
      <div className="px-4 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">共 {filteredActivities.length} 个活动</span>
          <select value={sortBy} onChange={e => handleSortChange(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-1 focus:outline-none focus:border-blue-500">
            <option value="featured">精选推荐</option>
            <option value="popular">最受欢迎</option>
            <option value="rating">评分最高</option>
            <option value="newest">最新发布</option>
            <option value="difficulty">难度排序</option>
          </select>
        </div>
      </div>

      {/* 活动列表 */}
      <div className="px-4">
        {filteredActivities.length === 0 && !error ? <div className="text-center py-12">
            <Compass className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">暂无相关活动</p>
            <button onClick={() => {
          setSearchQuery('');
          setSelectedCategory('all');
        }} className="text-blue-600 text-sm">
              清除筛选条件
            </button>
          </div> : <div className="space-y-4">
            {filteredActivities.map((activity, index) => <div key={activity.activity_id || index} onClick={() => handleActivityClick(activity.activity_id)} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer relative">
                {/* 活动状态标识 */}
                <div className="absolute top-2 left-2 z-10 flex space-x-1">
                  {activity.is_pinned && <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                      <Pin className="w-3 h-3 mr-1" />
                      置顶
                    </div>}
                  {activity.is_featured && <div className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                      <Crown className="w-3 h-3 mr-1" />
                      精选
                    </div>}
                  {activity.is_hot && <div className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                      <Flame className="w-3 h-3 mr-1" />
                      热门
                    </div>}
                </div>
                
                <div className="relative">
                  <img src={activity.cover_img || 'https://picsum.photos/seed/activity-default/400/300.jpg'} alt={activity.name} className="w-full h-48 object-cover" />
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(activity.difficulty)}`}>
                      {getDifficultyText(activity.difficulty)}
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 mb-2">{activity.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{activity.desc}</p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {activity.duration || '60分钟'}
                      </span>
                      <span className="flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        {activity.participants || 0}
                      </span>
                      <span className="flex items-center">
                        <Star className="w-3 h-3 mr-1 text-yellow-500" />
                        {activity.rating || 0}
                      </span>
                    </div>
                  </div>
                  
                  {activity.tags && activity.tags.length > 0 && <div className="flex flex-wrap gap-1 mb-3">
                      {activity.tags.slice(0, 3).map((tag, tagIndex) => <span key={tagIndex} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full">
                          {tag}
                        </span>)}
                      {activity.tags.length > 3 && <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                          +{activity.tags.length - 3}
                        </span>}
                    </div>}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-500">博物馆</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>)}
          </div>}
      </div>

      {/* 底部导航栏 */}
      <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
    </div>;
}