// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast, Button } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Calendar, Clock, Star, Trophy, Target, Users, Filter, Search, ChevronRight, MapPin, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';

import { TabBar } from '@/components/TabBar';
export default function MyActivitiesPage(props) {
  const {
    $w,
    style
  } = props;
  const [activeTab, setActiveTab] = useState('activities');
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    registered: 0,
    totalPoints: 0
  });
  const {
    toast
  } = useToast();
  useEffect(() => {
    loadActivities();
  }, []);
  useEffect(() => {
    filterAndSortActivities();
  }, [activities, searchQuery, filterStatus, sortBy]);
  const loadActivities = async () => {
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
        const userActivities = result.data;
        // 获取活动详情
        const activityIds = [...new Set(userActivities.map(ua => ua.activity_id))];
        const activityDetails = await Promise.all(activityIds.map(async activityId => {
          const activityResult = await $w.cloud.callFunction({
            name: 'callDataSource',
            data: {
              dataSourceName: 'wywh5_activity',
              methodName: 'get',
              params: {
                filter: {
                  activity_id: activityId
                }
              }
            }
          });
          return activityResult.success ? activityResult.data : null;
        }));
        // 合并数据
        const mergedActivities = userActivities.map(userActivity => {
          const activityDetail = activityDetails.find(ad => ad && ad.activity_id === userActivity.activity_id);
          return {
            ...userActivity,
            activity_name: activityDetail?.name || userActivity.activity_name || '未知活动',
            activity_desc: activityDetail?.desc || '暂无描述',
            cover_img: activityDetail?.cover_img || 'https://picsum.photos/seed/activity-' + userActivity.activity_id + '/300/200.jpg',
            difficulty: activityDetail?.difficulty || 'medium',
            duration: activityDetail?.duration || '60分钟',
            participants: activityDetail?.participants || 0,
            rating: activityDetail?.rating || 0,
            tags: activityDetail?.tags || []
          };
        });
        setActivities(mergedActivities);
        // 计算统计数据
        const completed = mergedActivities.filter(a => a.status === 'completed').length;
        const inProgress = mergedActivities.filter(a => a.status === 'in_progress').length;
        const registered = mergedActivities.filter(a => a.status === 'registered').length;
        const totalPoints = mergedActivities.reduce((sum, a) => sum + (a.points || 0), 0);
        setStats({
          total: mergedActivities.length,
          completed,
          inProgress,
          registered,
          totalPoints
        });
      } else {
        // 使用模拟数据
        const mockActivities = [{
          activity_id: 'act-001',
          activity_name: '青铜器探秘之旅',
          activity_desc: '深入了解中国古代青铜器的历史文化和制作工艺',
          cover_img: 'https://picsum.photos/seed/bronze-tour/300/200.jpg',
          status: 'completed',
          start_time: '2024-01-10T09:00:00Z',
          completed_time: '2024-01-15T16:30:00Z',
          points: 300,
          difficulty: 'medium',
          duration: '90分钟',
          participants: 156,
          rating: 4.8,
          tags: ['历史', '文化', '青铜器']
        }, {
          activity_id: 'act-002',
          activity_name: '陶瓷艺术寻宝',
          activity_desc: '探索中国陶瓷艺术的发展历程和精美作品',
          cover_img: 'https://picsum.photos/seed/ceramic-hunt/300/200.jpg',
          status: 'in_progress',
          start_time: '2024-01-18T14:00:00Z',
          points: 0,
          difficulty: 'easy',
          duration: '60分钟',
          participants: 89,
          rating: 4.6,
          tags: ['艺术', '陶瓷', '寻宝']
        }, {
          activity_id: 'act-003',
          activity_name: '古代文字解密',
          activity_desc: '学习古代文字的演变历程，破解历史密码',
          cover_img: 'https://picsum.photos/seed/ancient-text/300/200.jpg',
          status: 'registered',
          registered_time: '2024-01-20T10:00:00Z',
          points: 0,
          difficulty: 'hard',
          duration: '120分钟',
          participants: 45,
          rating: 4.9,
          tags: ['文字', '历史', '解密']
        }];
        setActivities(mockActivities);
        setStats({
          total: 3,
          completed: 1,
          inProgress: 1,
          registered: 1,
          totalPoints: 300
        });
      }
    } catch (error) {
      console.error('加载活动数据失败:', error);
      toast({
        title: "加载失败",
        description: "无法获取活动数据",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const filterAndSortActivities = () => {
    let filtered = [...activities];
    // 按状态筛选
    if (filterStatus !== 'all') {
      filtered = filtered.filter(activity => activity.status === filterStatus);
    }
    // 按搜索关键词筛选
    if (searchQuery) {
      filtered = filtered.filter(activity => activity.activity_name.toLowerCase().includes(searchQuery.toLowerCase()) || activity.activity_desc.toLowerCase().includes(searchQuery.toLowerCase()) || activity.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    }
    // 排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.start_time || b.registered_time || 0) - new Date(a.start_time || a.registered_time || 0);
        case 'name':
          return a.activity_name.localeCompare(b.activity_name);
        case 'difficulty':
          const difficultyOrder = {
            'easy': 1,
            'medium': 2,
            'hard': 3
          };
          return (difficultyOrder[a.difficulty] || 2) - (difficultyOrder[b.difficulty] || 2);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });
    setFilteredActivities(filtered);
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
  const handleActivityClick = activity => {
    if (activity.status === 'registered') {
      $w.utils.navigateTo({
        pageId: 'activity-detail',
        params: {
          activityId: activity.activity_id
        }
      });
    } else {
      $w.utils.navigateTo({
        pageId: 'activity-map',
        params: {
          activityId: activity.activity_id
        }
      });
    }
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
  if (loading) {
    return <div style={style} className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>;
  }
  return <div style={style} className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-20">
      {/* 顶部导航 */}
      <div className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-32 h-32 border-4 border-yellow-400 rounded-full transform -translate-x-16 -translate-y-16"></div>
          <div className="absolute top-10 right-10 w-24 h-24 border-4 border-yellow-400 rounded-lg transform rotate-45"></div>
        </div>
        
        <div className="relative z-10 px-6 py-4 flex items-center">
          <button onClick={() => $w.utils.navigateBack()} className="mr-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-yellow-300">我的活动</h1>
            <p className="text-blue-100 text-sm">查看参与的活动记录</p>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="px-4 py-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">活动统计</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-2xl font-bold text-blue-700 mb-1">{stats.total}</div>
              <div className="text-sm text-gray-600">总活动数</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="text-2xl font-bold text-green-700 mb-1">{stats.completed}</div>
              <div className="text-sm text-gray-600">已完成</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-xl">
              <div className="text-2xl font-bold text-yellow-700 mb-1">{stats.inProgress}</div>
              <div className="text-sm text-gray-600">进行中</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <div className="text-2xl font-bold text-purple-700 mb-1">{stats.totalPoints}</div>
              <div className="text-sm text-gray-600">总积分</div>
            </div>
          </div>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <div className="px-4 mb-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center mb-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="text" placeholder="搜索活动名称或标签" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500" />
            </div>
            <button className="ml-3 p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              <Filter className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm">
              <option value="all">全部状态</option>
              <option value="registered">已报名</option>
              <option value="in_progress">进行中</option>
              <option value="completed">已完成</option>
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm">
              <option value="recent">最近参与</option>
              <option value="name">按名称</option>
              <option value="difficulty">按难度</option>
              <option value="rating">按评分</option>
            </select>
          </div>
        </div>
      </div>

      {/* 活动列表 */}
      <div className="px-4">
        {filteredActivities.length === 0 ? <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">暂无活动记录</p>
            <Button onClick={() => $w.utils.navigateTo({
          pageId: 'home',
          params: {}
        })} className="bg-blue-600 hover:bg-blue-700">
              去探索活动
            </Button>
          </div> : <div className="space-y-4">
            {filteredActivities.map((activity, index) => <div key={index} onClick={() => handleActivityClick(activity)} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                <div className="relative">
                  <img src={activity.cover_img} alt={activity.activity_name} className="w-full h-48 object-cover" />
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                      {getStatusText(activity.status)}
                    </span>
                  </div>
                  {activity.status === 'completed' && activity.points > 0 && <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      +{activity.points}
                    </div>}
                </div>
                
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 mb-2">{activity.activity_name}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{activity.activity_desc}</p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      <span className={`px-2 py-1 rounded ${getDifficultyColor(activity.difficulty)}`}>
                        {getDifficultyText(activity.difficulty)}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {activity.duration}
                      </span>
                      <span className="flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        {activity.participants}
                      </span>
                    </div>
                    {activity.rating > 0 && <div className="flex items-center text-xs">
                      <Star className="w-3 h-3 text-yellow-500 mr-1 fill-current" />
                      <span className="text-gray-600">{activity.rating}</span>
                    </div>}
                  </div>
                  
                  {activity.tags.length > 0 && <div className="flex flex-wrap gap-1 mb-3">
                      {activity.tags.slice(0, 3).map((tag, tagIndex) => <span key={tagIndex} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full">
                          {tag}
                        </span>)}
                      {activity.tags.length > 3 && <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                          +{activity.tags.length - 3}
                        </span>}
                    </div>}
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      {activity.completed_time && <span>完成时间: {new Date(activity.completed_time).toLocaleDateString()}</span>}
                      {activity.start_time && !activity.completed_time && <span>开始时间: {new Date(activity.start_time).toLocaleDateString()}</span>}
                      {activity.registered_time && !activity.start_time && <span>报名时间: {new Date(activity.registered_time).toLocaleDateString()}</span>}
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