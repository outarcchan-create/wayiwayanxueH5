// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast, Button } from '@/components/ui';
// @ts-ignore;
import { Calendar, Clock, Star, Filter, Search, ChevronRight, Trophy, Target, Heart, Share2 } from 'lucide-react';

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
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const {
    toast
  } = useToast();
  useEffect(() => {
    loadActivities();
  }, []);
  useEffect(() => {
    filterActivities();
  }, [activities, filterStatus, searchQuery]);
  const loadActivities = async () => {
    try {
      setLoading(true);
      const result = await $w.cloud.callFunction({
        name: 'callDataSource',
        data: {
          dataSourceName: 'wyw_user_activity',
          methodName: 'list',
          params: {
            filter: {
              user_id: $w.auth.currentUser?.userId
            },
            sort: {
              created_time: -1
            },
            limit: 50
          }
        }
      });
      if (result.success && result.data) {
        // 获取活动详情
        const activityIds = result.data.map(item => item.activity_id);
        const activityDetailsResult = await $w.cloud.callFunction({
          name: 'callDataSource',
          data: {
            dataSourceName: 'wyw_activity',
            methodName: 'list',
            params: {
              filter: {
                activity_id: activityIds.length > 0 ? {
                  $in: activityIds
                } : 'invalid'
              }
            }
          }
        });
        if (activityDetailsResult.success && activityDetailsResult.data) {
          const activityMap = {};
          activityDetailsResult.data.forEach(activity => {
            activityMap[activity.activity_id] = activity;
          });
          const enrichedActivities = result.data.map(userActivity => ({
            ...userActivity,
            activity_name: activityMap[userActivity.activity_id]?.name || '未知活动',
            activity_desc: activityMap[userActivity.activity_id]?.desc || '',
            cover_img: activityMap[userActivity.activity_id]?.cover_img || '',
            difficulty: activityMap[userActivity.activity_id]?.difficulty || '简单',
            duration: activityMap[userActivity.activity_id]?.duration || '45分钟'
          }));
          setActivities(enrichedActivities);
        } else {
          setActivities(result.data);
        }
      } else {
        // 使用模拟数据
        setActivities([{
          activity_id: 'demo-1',
          activity_name: '青铜器探秘之旅',
          activity_desc: '探索古代青铜器的神秘世界',
          cover_img: 'https://picsum.photos/seed/bronze-activity/400/300.jpg',
          status: 'completed',
          completed_time: '2024-01-15',
          points: 300,
          difficulty: '简单',
          duration: '45分钟',
          is_favorite: true
        }, {
          activity_id: 'demo-2',
          activity_name: '陶瓷艺术寻宝',
          activity_desc: '寻找隐藏的陶瓷珍品',
          cover_img: 'https://picsum.photos/seed/ceramic-art/400/300.jpg',
          status: 'in_progress',
          started_time: '2024-01-18',
          progress: 60,
          difficulty: '中等',
          duration: '60分钟',
          is_favorite: false
        }, {
          activity_id: 'demo-3',
          activity_name: '古代文字解密',
          activity_desc: '破解甲骨文和金文的秘密',
          cover_img: 'https://picsum.photos/seed/ancient-writing/400/300.jpg',
          status: 'registered',
          registered_time: '2024-01-20',
          difficulty: '困难',
          duration: '30分钟',
          is_favorite: true
        }]);
      }
    } catch (error) {
      console.error('加载活动失败:', error);
      toast({
        title: "加载失败",
        description: "无法获取活动数据",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const filterActivities = () => {
    let filtered = activities;
    if (filterStatus !== 'all') {
      filtered = filtered.filter(activity => activity.status === filterStatus);
    }
    if (searchQuery) {
      filtered = filtered.filter(activity => activity.activity_name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
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
    $w.utils.navigateTo({
      pageId: 'activity-detail',
      params: {
        activityId: activity.activity_id
      }
    });
  };
  const handleToggleFavorite = async (activity, e) => {
    e.stopPropagation();
    try {
      const result = await $w.cloud.callFunction({
        name: 'callDataSource',
        data: {
          dataSourceName: 'wyw_user_activity',
          methodName: 'update',
          params: {
            filter: {
              user_id: $w.auth.currentUser?.userId,
              activity_id: activity.activity_id
            },
            data: {
              is_favorite: !activity.is_favorite
            }
          }
        }
      });
      if (result.success) {
        setActivities(prev => prev.map(item => item.activity_id === activity.activity_id ? {
          ...item,
          is_favorite: !item.is_favorite
        } : item));
        toast({
          title: activity.is_favorite ? "已取消收藏" : "已添加收藏"
        });
      }
    } catch (error) {
      toast({
        title: "操作失败",
        description: error.message,
        variant: "destructive"
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
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'registered':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };
  const getProgressColor = progress => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    return 'bg-orange-500';
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
        
        <div className="relative z-10 px-6 py-4">
          <h1 className="text-xl font-bold text-yellow-300 mb-4">我的活动</h1>
          
          {/* 搜索和筛选 */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" placeholder="搜索活动名称" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-white/40" />
            </div>
            
            <div className="flex space-x-2">
              <button onClick={() => setFilterStatus('all')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filterStatus === 'all' ? 'bg-white text-blue-700' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                全部
              </button>
              <button onClick={() => setFilterStatus('registered')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filterStatus === 'registered' ? 'bg-white text-blue-700' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                已报名
              </button>
              <button onClick={() => setFilterStatus('in_progress')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filterStatus === 'in_progress' ? 'bg-white text-blue-700' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                进行中
              </button>
              <button onClick={() => setFilterStatus('completed')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filterStatus === 'completed' ? 'bg-white text-blue-700' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                已完成
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 活动列表 */}
      <div className="px-4 py-6">
        {filteredActivities.length === 0 ? <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">暂无活动记录</p>
            <p className="text-gray-400 text-sm mb-6">快去探索精彩的博物馆活动吧</p>
            <Button onClick={() => $w.utils.navigateTo({
          pageId: 'home',
          params: {}
        })} className="bg-blue-600 hover:bg-blue-700">
              探索活动
            </Button>
          </div> : <div className="space-y-4">
            {filteredActivities.map((activity, index) => <div key={index} onClick={() => handleActivityClick(activity)} className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all duration-200 hover:scale-[1.02] hover:shadow-lg cursor-pointer">
              {/* 活动封面图 */}
              <div className="relative h-40 overflow-hidden">
                <img src={activity.cover_img || 'https://picsum.photos/seed/activity-default/400/300.jpg'} alt={activity.activity_name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                
                {/* 状态标签 */}
                <div className="absolute top-3 left-3">
                  <div className={`${getStatusColor(activity.status)} text-white px-3 py-1 rounded-full text-xs font-medium flex items-center`}>
                    {getStatusText(activity.status)}
                  </div>
                </div>

                {/* 收藏按钮 */}
                <button onClick={e => handleToggleFavorite(activity, e)} className="absolute top-3 right-3 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors">
                  <Heart className={`w-4 h-4 ${activity.is_favorite ? 'text-red-500 fill-current' : 'text-white'}`} />
                </button>

                {/* 活动标题 */}
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-lg font-bold text-white">{activity.activity_name}</h3>
                </div>
              </div>

              {/* 活动信息 */}
              <div className="p-4">
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{activity.activity_desc}</p>
                
                {/* 进度条（进行中的活动） */}
                {activity.status === 'in_progress' && activity.progress && <div className="mb-3">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                      <span>完成进度</span>
                      <span>{activity.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className={`${getProgressColor(activity.progress)} h-2 rounded-full transition-all duration-300`} style={{
                  width: `${activity.progress}%`
                }}></div>
                    </div>
                  </div>}

                {/* 活动信息栏 */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{activity.duration}</span>
                    </div>
                    <div className="flex items-center">
                      <Target className="w-4 h-4 mr-1" />
                      <span>{activity.difficulty}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {activity.points > 0 && <div className="flex items-center text-yellow-600">
                        <Trophy className="w-4 h-4 mr-1 fill-current" />
                        <span className="font-medium">+{activity.points}</span>
                      </div>}
                    <ChevronRight className="w-4 h-4 text-gray-400" />
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