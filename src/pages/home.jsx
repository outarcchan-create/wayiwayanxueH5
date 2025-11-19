// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast, Button } from '@/components/ui';
// @ts-ignore;
import { Search, MapPin, Calendar, Star, Trophy, Users, Clock, Filter, ChevronRight, Compass, Camera, HelpCircle, Target } from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [userStats, setUserStats] = useState({
    totalActivities: 0,
    completedActivities: 0,
    totalPoints: 0
  });
  const {
    toast
  } = useToast();
  useEffect(() => {
    loadActivities();
    loadUserStats();
  }, []);
  useEffect(() => {
    filterAndSortActivities();
  }, [activities, searchQuery, selectedCategory, sortBy]);
  const loadActivities = async () => {
    try {
      setLoading(true);
      // 获取活动列表
      const result = await $w.cloud.callFunction({
        name: 'callDataSource',
        data: {
          dataSourceName: 'wywh5_activity',
          methodName: 'list',
          params: {
            filter: {
              status: 'active'
            },
            limit: 20
          }
        }
      });
      if (result.success && result.data) {
        setActivities(result.data);
      } else {
        // 使用模拟数据
        const mockActivities = [{
          activity_id: 'act-001',
          name: '青铜器探秘之旅',
          desc: '深入了解中国古代青铜器的历史文化和制作工艺，通过互动任务探索博物馆的珍贵藏品。',
          cover_img: 'https://picsum.photos/seed/bronze-tour/400/300.jpg',
          difficulty: 'medium',
          duration: '90分钟',
          participants: 156,
          rating: 4.8,
          tags: ['历史', '文化', '青铜器'],
          status: 'active',
          created_time: '2024-01-10T08:00:00Z'
        }, {
          activity_id: 'act-002',
          name: '陶瓷艺术寻宝',
          desc: '探索中国陶瓷艺术的发展历程和精美作品，完成寻宝任务赢取奖励。',
          cover_img: 'https://picsum.photos/seed/ceramic-hunt/400/300.jpg',
          difficulty: 'easy',
          duration: '60分钟',
          participants: 89,
          rating: 4.6,
          tags: ['艺术', '陶瓷', '寻宝'],
          status: 'active',
          created_time: '2024-01-12T10:00:00Z'
        }, {
          activity_id: 'act-003',
          name: '古代文字解密',
          desc: '学习古代文字的演变历程，破解历史密码，体验古代文化的魅力。',
          cover_img: 'https://picsum.photos/seed/ancient-text/400/300.jpg',
          difficulty: 'hard',
          duration: '120分钟',
          participants: 45,
          rating: 4.9,
          tags: ['文字', '历史', '解密'],
          status: 'active',
          created_time: '2024-01-15T14:00:00Z'
        }];
        setActivities(mockActivities);
      }
    } catch (error) {
      console.error('加载活动失败:', error);
      toast({
        title: "加载失败",
        description: "无法获取活动列表",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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
    }
  };
  const filterAndSortActivities = () => {
    let filtered = [...activities];

    // 按分类筛选
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(activity => activity.tags && activity.tags.includes(selectedCategory));
    }

    // 按搜索关键词筛选
    if (searchQuery) {
      filtered = filtered.filter(activity => activity.name.toLowerCase().includes(searchQuery.toLowerCase()) || activity.desc.toLowerCase().includes(searchQuery.toLowerCase()) || activity.tags && activity.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    }

    // 排序
    filtered.sort((a, b) => {
      switch (sortBy) {
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
    $w.utils.navigateTo({
      pageId: 'activity-detail',
      params: {
        activityId: activityId
      }
    });
  };
  const handleSearch = query => {
    setSearchQuery(query);
  };
  const handleCategoryChange = category => {
    setSelectedCategory(category);
  };
  const handleSortChange = sort => {
    setSortBy(sort);
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
  const categories = ['all', '历史', '文化', '艺术', '陶瓷', '青铜器', '文字', '解密', '寻宝'];
  if (loading) {
    return <div style={style} className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>;
  }
  return <div style={style} className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-20">
      {/* 顶部搜索栏 */}
      <div className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white">
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
          <button className="flex items-center text-blue-600 text-sm">
            <Filter className="w-4 h-4 mr-1" />
            筛选
          </button>
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
            <option value="popular">最受欢迎</option>
            <option value="rating">评分最高</option>
            <option value="newest">最新发布</option>
            <option value="difficulty">难度排序</option>
          </select>
        </div>
      </div>

      {/* 活动列表 */}
      <div className="px-4">
        {filteredActivities.length === 0 ? <div className="text-center py-12">
            <Compass className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">暂无相关活动</p>
            <button onClick={() => {
          setSearchQuery('');
          setSelectedCategory('all');
        }} className="text-blue-600 text-sm">
              清除筛选条件
            </button>
          </div> : <div className="space-y-4">
            {filteredActivities.map((activity, index) => <div key={activity.activity_id || index} onClick={() => handleActivityClick(activity.activity_id)} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                <div className="relative">
                  <img src={activity.cover_img} alt={activity.name} className="w-full h-48 object-cover" />
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
                        {activity.duration}
                      </span>
                      <span className="flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        {activity.participants}
                      </span>
                      <span className="flex items-center">
                        <Star className="w-3 h-3 mr-1 text-yellow-500" />
                        {activity.rating}
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