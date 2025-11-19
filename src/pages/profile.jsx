// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast, Button } from '@/components/ui';
// @ts-ignore;
import { User, Settings, Trophy, Calendar, Star, ChevronRight, Award, BookOpen, Target, TrendingUp, LogOut, Edit, Camera } from 'lucide-react';

import { TabBar } from '@/components/TabBar';
export default function ProfilePage(props) {
  const {
    $w,
    style
  } = props;
  const [activeTab, setActiveTab] = useState('profile');
  const [userStats, setUserStats] = useState({
    totalActivities: 0,
    completedActivities: 0,
    totalPoints: 0,
    achievements: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const {
    toast
  } = useToast();
  useEffect(() => {
    loadUserData();
  }, []);
  const loadUserData = async () => {
    try {
      setLoading(true);
      // 获取用户统计数据
      const statsResult = await $w.cloud.callFunction({
        name: 'callDataSource',
        data: {
          dataSourceName: 'wyw_user_activity',
          methodName: 'list',
          params: {
            filter: {
              user_id: $w.auth.currentUser?.userId
            },
            limit: 100
          }
        }
      });
      if (statsResult.success && statsResult.data) {
        const activities = statsResult.data;
        const completed = activities.filter(a => a.status === 'completed').length;
        setUserStats({
          totalActivities: activities.length,
          completedActivities: completed,
          totalPoints: activities.reduce((sum, a) => sum + (a.points || 0), 0),
          achievements: Math.floor(completed / 3) // 每3个完成活动获得1个成就
        });
        setRecentActivities(activities.slice(0, 3));
      }
    } catch (error) {
      console.error('加载用户数据失败:', error);
      // 使用模拟数据
      setUserStats({
        totalActivities: 12,
        completedActivities: 8,
        totalPoints: 2450,
        achievements: 3
      });
      setRecentActivities([{
        activity_id: 'demo-1',
        activity_name: '青铜器探秘之旅',
        status: 'completed',
        completed_time: '2024-01-15',
        points: 300
      }, {
        activity_id: 'demo-2',
        activity_name: '陶瓷艺术寻宝',
        status: 'in_progress',
        started_time: '2024-01-18',
        points: 0
      }]);
    } finally {
      setLoading(false);
    }
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
    }
  };
  const handleEditProfile = () => {
    $w.utils.navigateTo({
      pageId: 'edit-profile',
      params: {}
    });
  };
  const handleLogout = () => {
    // 调用登出API
    $w.cloud.callFunction({
      name: 'logout',
      data: {}
    }).then(() => {
      toast({
        title: "退出成功",
        description: "您已安全退出登录"
      });
      $w.utils.navigateTo({
        pageId: 'login',
        params: {}
      });
    }).catch(error => {
      toast({
        title: "退出失败",
        description: error.message,
        variant: "destructive"
      });
    });
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
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-yellow-300">个人中心</h1>
            <button onClick={handleEditProfile} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
              <Edit className="w-5 h-5" />
            </button>
          </div>
          
          {/* 用户信息 */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <button className="absolute bottom-0 right-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white">
                <Camera className="w-3 h-3 text-white" />
              </button>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">
                {$w.auth.currentUser?.nickName || $w.auth.currentUser?.name || '探索者'}
              </h2>
              <p className="text-blue-100 text-sm">
                ID: {$w.auth.currentUser?.userId || 'guest'}
              </p>
              <div className="flex items-center mt-2">
                <Trophy className="w-4 h-4 text-yellow-400 mr-1" />
                <span className="text-yellow-400 text-sm font-medium">
                  Lv.{Math.floor(userStats.totalPoints / 500) + 1} 文化探索者
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 统计数据卡片 */}
      <div className="px-4 -mt-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-2xl font-bold text-blue-700 mb-1">
                {userStats.totalActivities}
              </div>
              <div className="text-sm text-gray-600">参与活动</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="text-2xl font-bold text-green-700 mb-1">
                {userStats.completedActivities}
              </div>
              <div className="text-sm text-gray-600">已完成</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-xl">
              <div className="text-2xl font-bold text-yellow-700 mb-1">
                {userStats.totalPoints}
              </div>
              <div className="text-sm text-gray-600">积分</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <div className="text-2xl font-bold text-purple-700 mb-1">
                {userStats.achievements}
              </div>
              <div className="text-sm text-gray-600">成就</div>
            </div>
          </div>
        </div>
      </div>

      {/* 快捷功能入口 */}
      <div className="px-4 mt-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">快捷功能</h3>
          <div className="space-y-3">
            <button onClick={() => $w.utils.navigateTo({
            pageId: 'my-activities',
            params: {}
          })} className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-800">我的活动</div>
                  <div className="text-sm text-gray-500">查看参与的活动记录</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            <button onClick={() => $w.utils.navigateTo({
            pageId: 'achievements',
            params: {}
          })} className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                  <Award className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-800">我的成就</div>
                  <div className="text-sm text-gray-500">查看获得的成就和徽章</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            <button onClick={() => $w.utils.navigateTo({
            pageId: 'statistics',
            params: {}
          })} className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-800">数据统计</div>
                  <div className="text-sm text-gray-500">查看个人数据统计</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            <button onClick={() => $w.utils.navigateTo({
            pageId: 'settings',
            params: {}
          })} className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <Settings className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-800">设置</div>
                  <div className="text-sm text-gray-500">账号设置和隐私管理</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* 最近活动 */}
      <div className="px-4 mt-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">最近活动</h3>
            <button onClick={() => $w.utils.navigateTo({
            pageId: 'my-activities',
            params: {}
          })} className="text-blue-600 text-sm font-medium">
              查看全部
            </button>
          </div>
          <div className="space-y-3">
            {recentActivities.length === 0 ? <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">暂无活动记录</p>
                <button onClick={() => $w.utils.navigateTo({
              pageId: 'home',
              params: {}
            })} className="mt-3 text-blue-600 text-sm font-medium">
                  去探索活动
                </button>
              </div> : recentActivities.map((activity, index) => <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-gray-800">{activity.activity_name}</div>
                  <div className="text-sm text-gray-500">
                    {activity.completed_time || activity.started_time || '未知时间'}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                    {getStatusText(activity.status)}
                  </span>
                  {activity.points > 0 && <div className="flex items-center text-yellow-600">
                      <Star className="w-4 h-4 mr-1 fill-current" />
                      <span className="text-sm font-medium">+{activity.points}</span>
                    </div>}
                </div>
              </div>)}
          </div>
        </div>
      </div>

      {/* 退出登录按钮 */}
      <div className="px-4 mt-6 mb-6">
        <button onClick={handleLogout} className="w-full flex items-center justify-center p-4 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors">
          <LogOut className="w-5 h-5 mr-2" />
          <span className="font-medium">退出登录</span>
        </button>
      </div>

      {/* 底部导航栏 */}
      <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
    </div>;
}