// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast, Button } from '@/components/ui';
// @ts-ignore;
import { Search, MapPin, Calendar, Users, Star, Clock, Trophy, Target, Filter, ChevronRight, Compass, BookOpen, Camera, HelpCircle } from 'lucide-react';

import { TabBar } from '@/components/TabBar';
export default function HomePage(props) {
  const {
    $w,
    style
  } = props;
  const [activeTab, setActiveTab] = useState('home');
  const [activities, setActivities] = useState([]);
  const [featuredActivities, setFeaturedActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories] = useState([{
    id: 'all',
    name: '全部',
    icon: <Compass className="w-4 h-4" />
  }, {
    id: 'history',
    name: '历史文化',
    icon: <BookOpen className="w-4 h-4" />
  }, {
    id: 'art',
    name: '艺术鉴赏',
    icon: <Camera className="w-4 h-4" />
  }, {
    id: 'interactive',
    name: '互动体验',
    icon: <HelpCircle className="w-4 h-4" />
  }]);
  const {
    toast
  } = useToast();
  useEffect(() => {
    loadActivities();
  }, []);
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
        const activityList = result.data;
        setActivities(activityList);
        // 设置推荐活动（前4个）
        setFeaturedActivities(activityList.slice(0, 4));
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
          start_time: '2024-01-20T09:00:00Z',
          end_time: '2024-01-20T18:00:00Z'
        }, {
          activity_id: 'act-002',
          name: '陶瓷艺术寻宝',
          desc: '探索中国陶瓷艺术的发展历程，寻找隐藏在展厅中的珍贵瓷器，了解不同朝代的陶瓷特色。',
          cover_img: 'https://picsum.photos/seed/ceramic-hunt/400/300.jpg',
          difficulty: 'easy',
          duration: '60分钟',
          participants: 89,
          rating: 4.6,
          tags: ['艺术', '陶瓷', '寻宝'],
          status: 'active',
          start_time: '2024-01-21T14:00:00Z',
          end_time: '2024-01-21T17:00:00Z'
        }, {
          activity_id: 'act-003',
          name: '古代文字解密',
          desc: '学习古代文字的演变历程，破解历史密码，体验古代文人的智慧结晶。',
          cover_img: 'https://picsum.photos/seed/ancient-text/400/300.jpg',
          difficulty: 'hard',
          duration: '120分钟',
          participants: 45,
          rating: 4.9,
          tags: ['文字', '历史', '解密'],
          status: 'active',
          start_time: '2024-01-22T10:00:00Z',
          end_time: '2024-01-22T16:00:00Z'
        }, {
          activity_id: 'act-004',
          name: '书画艺术体验',
          desc: '欣赏中国传统书画艺术，学习基本的书画技巧，创作属于自己的艺术作品。',
          cover_img: 'https://picsum.photos/seed/calligraphy-art/400/300.jpg',
          difficulty: 'medium',
          duration: '75分钟',
          participants: 67,
          rating: 4.7,
          tags: ['艺术', '书画', '体验'],
          status: 'active',
          start_time: '2024-01-23T13:00:00Z',
          end_time: '2024-01-23T17:00:00Z'
        }];
        setActivities(mockActivities);
        setFeaturedActivities(mockActivities.slice(0, 4));
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
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast({
        title: "请输入搜索关键词",
        variant: "destructive"
      });
      return;
    }
    // 这里可以实现搜索功能
    toast({
      title: "搜索功能",
      description: `搜索: ${searchQuery}`
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
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.name.toLowerCase().includes(searchQuery.toLowerCase()) || activity.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || activity.tags.some(tag => tag.includes(selectedCategory));
    return matchesSearch && matchesCategory;
  });
  if (loading) {
    return <div style={style} className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>;
  }
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
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-yellow-300 mb-2">博物馆探索之旅</h1>
            <p className="text-blue-100 text-lg">发现历史，探索文化，开启精彩旅程</p>
          </div>
          
          {/* 搜索框 */}
          <div className="max-w-md mx-auto">
            <div className="relative">
              <input type="text" placeholder="搜索活动..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSearch()} className="w-full px-4 py-3 pl-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:border-white/40 focus:bg-white/20 transition-all" />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-200 w-5 h-5" />
              <button onClick={handleSearch} className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-yellow-400 text-blue-900 px-4 py-2 rounded-lg font-medium hover:bg-yellow-300 transition-colors">
                搜索
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 分类筛选 */}
      <div className="px-4 py-6">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {categories.map(category => <button key={category.id} onClick={() => setSelectedCategory(category.id)} className={`flex items-center space-x-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${selectedCategory === category.id ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`}>
              {category.icon}
              <span className="text-sm font-medium">{category.name}</span>
            </button>)}
        </div>
      </div>

      {/* 推荐活动 */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">推荐活动</h2>
          <button onClick={() => $w.utils.navigateTo({
          pageId: 'my-activities',
          params: {}
        })} className="text-blue-600 text-sm font-medium">
            查看全部
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {featuredActivities.map((activity, index) => <div key={index} onClick={() => handleActivityClick(activity.activity_id)} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
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
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {activity.duration}
                    </span>
                    <span className="flex items-center">
                      <Users className="w-3 h-3 mr-1" />
                      {activity.participants}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-3 h-3 text-yellow-500 mr-1" />
                    <span>{activity.rating}</span>
                  </div>
                </div>
              </div>
            </div>)}
        </div>
      </div>

      {/* 全部活动 */}
      <div className="px-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">全部活动</h2>
        <div className="space-y-4">
          {filteredActivities.map((activity, index) => <div key={index} onClick={() => handleActivityClick(activity.activity_id)} className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center space-x-4">
                <img src={activity.cover_img} alt={activity.name} className="w-20 h-20 rounded-lg object-cover" />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 mb-1">{activity.name}</h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{activity.desc}</p>
                  <div className="flex items-center justify-between">
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
                    <div className="flex items-center">
                      <Star className="w-3 h-3 text-yellow-500 mr-1" />
                      <span className="text-sm text-gray-600">{activity.rating}</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>)}
        </div>
      </div>

      {/* 底部导航栏 */}
      <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
    </div>;
}