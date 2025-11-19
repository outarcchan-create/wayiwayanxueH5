// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast } from '@/components/ui';
// @ts-ignore;
import { Clock, Users, Star, ChevronRight, Trophy, MapPin, RefreshCw, Lock } from 'lucide-react';

import { TabBar } from '@/components/TabBar';
export default function HomePage(props) {
  const {
    $w,
    style
  } = props;
  const [activeTab, setActiveTab] = useState('home');
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const {
    toast
  } = useToast();
  useEffect(() => {
    loadActivities();
  }, []);
  const loadActivities = async () => {
    try {
      setLoading(true);
      // 使用数据模型API调用
      const result = await $w.cloud.callFunction({
        name: 'callDataSource',
        data: {
          dataSourceName: 'wyw_activity',
          methodName: 'list',
          params: {
            filter: {
              status: 'published',
              is_hot: true
            },
            sort: {
              sort_order: -1,
              participants: -1
            },
            limit: 10
          }
        }
      });
      if (result.success && result.data) {
        // 转换数据格式以匹配页面需求
        const formattedActivities = result.data.map(item => ({
          id: item.activity_id,
          title: item.name,
          description: item.desc,
          coverImg: item.cover_img,
          participants: item.participants || 0,
          duration: item.duration || '45分钟',
          difficulty: item.difficulty || '简单',
          rating: item.rating || 5.0,
          tags: item.tags || [],
          status: item.status === 'published' ? 'active' : 'inactive',
          unlock_type: item.unlock_type || 'free'
        }));
        setActivities(formattedActivities);
      } else {
        // 如果数据模型调用失败，使用模拟数据作为fallback
        setActivities([{
          id: 'demo-1',
          title: '青铜器探秘之旅',
          description: '探索古代青铜器的神秘世界，了解商周时期的礼器文化',
          coverImg: 'https://picsum.photos/seed/bronze-museum/400/300.jpg',
          participants: 1234,
          duration: '45分钟',
          difficulty: '简单',
          rating: 4.8,
          tags: ['历史文化', '互动体验'],
          status: 'active',
          unlock_type: 'free'
        }, {
          id: 'demo-2',
          title: '陶瓷艺术寻宝',
          description: '寻找隐藏在博物馆各个角落的陶瓷珍品，感受千年窑火魅力',
          coverImg: 'https://picsum.photos/seed/ceramic-art/400/300.jpg',
          participants: 892,
          duration: '60分钟',
          difficulty: '中等',
          rating: 4.6,
          tags: ['艺术鉴赏', '寻宝游戏'],
          status: 'active',
          unlock_type: 'free'
        }, {
          id: 'demo-3',
          title: '古代文字解密',
          description: '破解甲骨文和金文的秘密，体验古代文字的演变历程',
          coverImg: 'https://picsum.photos/seed/ancient-writing/400/300.jpg',
          participants: 567,
          duration: '30分钟',
          difficulty: '困难',
          rating: 4.9,
          tags: ['文字学', '解谜挑战'],
          status: 'active',
          unlock_type: 'passcode'
        }]);
      }
    } catch (error) {
      console.error('加载活动失败:', error);
      toast({
        title: "加载失败",
        description: "无法获取活动数据，显示默认内容",
        variant: "destructive"
      });
      // 使用模拟数据作为fallback
      setActivities([{
        id: 'demo-1',
        title: '青铜器探秘之旅',
        description: '探索古代青铜器的神秘世界，了解商周时期的礼器文化',
        coverImg: 'https://picsum.photos/seed/bronze-museum/400/300.jpg',
        participants: 1234,
        duration: '45分钟',
        difficulty: '简单',
        rating: 4.8,
        tags: ['历史文化', '互动体验'],
        status: 'active',
        unlock_type: 'free'
      }]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadActivities();
  };
  const handleActivityClick = activity => {
    if (activity.status !== 'active') {
      toast({
        title: "活动暂未开始",
        description: "该活动还未开始，请稍后再试",
        variant: "destructive"
      });
      return;
    }
    toast({
      title: "进入活动",
      description: `正在进入"${activity.title}"活动...`
    });
    $w.utils.navigateTo({
      pageId: 'activity-detail',
      params: {
        activityId: activity.id
      }
    });
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
  const handleViewAll = () => {
    $w.utils.navigateTo({
      pageId: 'activities-list',
      params: {}
    });
  };
  return <div style={style} className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-20">
      {/* 顶部文物装饰区 */}
      <div className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white overflow-hidden">
        {/* 青铜纹样装饰背景 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-32 h-32 border-4 border-yellow-400 rounded-full transform -translate-x-16 -translate-y-16"></div>
          <div className="absolute top-10 right-10 w-24 h-24 border-4 border-yellow-400 rounded-lg transform rotate-45"></div>
          <div className="absolute bottom-0 left-20 w-40 h-40 border-4 border-yellow-400 rounded-full transform translate-y-20"></div>
          <div className="absolute bottom-10 right-0 w-28 h-28 border-4 border-yellow-400 transform rotate-12"></div>
        </div>
        
        <div className="relative z-10 px-6 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2 text-yellow-300">挖一挖博物馆</h1>
            <p className="text-blue-100 text-sm">探索历史，发现文明</p>
          </div>
          
          {/* 统计数据 */}
          <div className="flex justify-around mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-300">12</div>
              <div className="text-xs text-blue-100">精彩活动</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-300">3.2k</div>
              <div className="text-xs text-blue-100">参与用户</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-300">98%</div>
              <div className="text-xs text-blue-100">好评率</div>
            </div>
          </div>
        </div>
      </div>

      {/* 活动推荐区域 */}
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
            热门活动
          </h2>
          <div className="flex items-center space-x-2">
            <button onClick={handleRefresh} disabled={refreshing} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={handleViewAll} className="text-blue-600 text-sm font-medium flex items-center">
              查看全部
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>

        {/* 加载状态 */}
        {loading && <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>}

        {/* 活动卡片列表 */}
        {!loading && <div className="space-y-4">
            {activities.length === 0 ? <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500">暂无活动</p>
                <button onClick={handleRefresh} className="mt-4 text-blue-600 text-sm font-medium">
                  刷新重试
                </button>
              </div> : activities.map(activity => <div key={activity.id} onClick={() => handleActivityClick(activity)} className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all duration-200 hover:scale-[1.02] hover:shadow-lg cursor-pointer">
                {/* 活动封面图 */}
                <div className="relative h-48 overflow-hidden">
                  <img src={activity.coverImg} alt={activity.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute top-3 right-3 bg-yellow-400 text-blue-900 px-3 py-1 rounded-full text-xs font-bold">
                    {activity.difficulty}
                  </div>
                  {activity.status === 'active' && <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
                      <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
                      进行中
                    </div>}
                  {activity.status === 'upcoming' && <div className="absolute top-3 left-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      即将开始
                  </div>}
                  {activity.unlock_type === 'passcode' && <div className="absolute top-3 left-3 bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
                      <Lock className="w-3 h-3 mr-1" />
                      需要口令
                    </div>}
                </div>

                {/* 活动信息 */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{activity.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{activity.description}</p>
                  
                  {/* 标签 */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {activity.tags.map((tag, index) => <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {tag}
                      </span>)}
                  </div>

                  {/* 活动信息栏 */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        <span>{activity.participants}人参与</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{activity.duration}</span>
                      </div>
                    </div>
                    <div className="flex items-center text-yellow-500">
                      <Star className="w-4 h-4 mr-1 fill-current" />
                      <span className="font-medium">{activity.rating}</span>
                    </div>
                  </div>
                </div>
              </div>)}
          </div>}
      </div>

      {/* 底部导航栏 */}
      <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
    </div>;
}