// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast, Button } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, MapPin, Calendar, Clock, Users, Star, Trophy, Target, CheckCircle, Share2, Heart, MessageCircle, Camera, HelpCircle, Navigation, RefreshCw, AlertTriangle, Wifi, WifiOff } from 'lucide-react';

import { TabBar } from '@/components/TabBar';
export default function ActivityDetailPage(props) {
  const {
    $w,
    style
  } = props;
  const [activeTab, setActiveTab] = useState('home');
  const [activity, setActivity] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [networkStatus, setNetworkStatus] = useState('online');
  const [registering, setRegistering] = useState(false);
  const [userActivityRecord, setUserActivityRecord] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const {
    toast
  } = useToast();
  const activityId = props.$w.page.dataset.params.activityId;
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
    if (activityId) {
      loadActivityData();
    }
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [activityId]);
  const loadActivityData = async (isRetry = false) => {
    try {
      if (isRetry) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const userId = $w.auth.currentUser?.userId;

      // 检查网络状态
      if (!navigator.onLine) {
        throw new Error('网络连接已断开，请检查网络设置');
      }

      // 设置请求超时
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('请求超时，请稍后重试')), 10000);
      });

      // 并行获取数据
      const [activityResult, taskResult, userActivityResult] = await Promise.allSettled([Promise.race([timeoutPromise, $w.cloud.callFunction({
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
      })]), Promise.race([timeoutPromise, $w.cloud.callFunction({
        name: 'callDataSource',
        data: {
          dataSourceName: 'wywh5_task',
          methodName: 'list',
          params: {
            filter: {
              activity_id: activityId
            },
            sort: {
              task_order: 1
            }
          }
        }
      })]), userId ? Promise.race([timeoutPromise, $w.cloud.callFunction({
        name: 'callDataSource',
        data: {
          dataSourceName: 'wywh5_user_activity',
          methodName: 'get',
          params: {
            filter: {
              user_id: userId,
              activity_id: activityId
            }
          }
        }
      })]) : Promise.resolve(null)]);

      // 处理活动数据
      if (activityResult.status === 'fulfilled' && activityResult.value.success && activityResult.value.data) {
        setActivity(activityResult.value.data);
      } else {
        throw new Error('获取活动详情失败');
      }

      // 处理任务数据
      if (taskResult.status === 'fulfilled' && taskResult.value.success && taskResult.value.data) {
        setTasks(taskResult.value.data);
      }

      // 处理用户活动记录
      if (userActivityResult && userActivityResult.status === 'fulfilled' && userActivityResult.value.success && userActivityResult.value.data) {
        setUserActivityRecord(userActivityResult.value.data);
      }
      setRetryCount(0);
      if (isRetry) {
        toast({
          title: "刷新成功",
          description: "活动数据已更新"
        });
      }
    } catch (error) {
      console.error('加载活动详情失败:', error);
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
          description: error.message || "无法获取活动详情",
          variant: "destructive"
        });
      }

      // 使用模拟数据作为降级方案
      setActivity({
        activity_id: activityId,
        name: '青铜器探秘之旅',
        desc: '深入了解中国古代青铜器的历史文化和制作工艺，通过互动任务探索博物馆的珍贵藏品。本次活动将带您穿越时空，感受青铜文明的魅力。',
        cover_img: 'https://picsum.photos/seed/bronze-detail/400/300.jpg',
        activity_map_img: 'https://picsum.photos/seed/museum-map/800/600.jpg',
        difficulty: 'medium',
        duration: '90分钟',
        participants: 156,
        rating: 4.8,
        tags: ['历史', '文化', '青铜器'],
        status: 'active',
        created_time: '2024-01-10T08:00:00Z',
        organizer: '博物馆教育部',
        max_participants: 200,
        requirements: ['对历史文化感兴趣', '具备基本移动设备操作能力'],
        rewards: ['完成证书', '积分奖励', '专属徽章']
      });
      setTasks([{
        task_id: 'task-001',
        activity_id: activityId,
        task_name: '寻找镇馆之宝',
        task_desc: '找到并拍摄博物馆的镇馆之宝 - 四羊方尊',
        task_type: 'photo',
        points: 150,
        location_name: '中央大厅',
        target_description: '四羊方尊是中国商代晚期青铜礼器',
        task_order: 1,
        is_required: true,
        status: 'active'
      }, {
        task_id: 'task-002',
        activity_id: activityId,
        task_name: '青铜器知识问答',
        task_desc: '测试你对青铜器历史和文化的了解',
        task_type: 'quiz',
        points: 100,
        time_limit: 300,
        task_order: 2,
        is_required: true,
        status: 'active'
      }]);
      toast({
        title: "使用离线数据",
        description: "当前显示的是示例数据"
      });
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
    loadActivityData(true);
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
  const handleRegister = async () => {
    const userId = $w.auth.currentUser?.userId;
    if (!userId) {
      toast({
        title: "请先登录",
        description: "登录后即可报名参加活动",
        variant: "destructive"
      });
      return;
    }
    if (!navigator.onLine) {
      toast({
        title: "网络错误",
        description: "请检查网络连接后重试",
        variant: "destructive"
      });
      return;
    }
    setRegistering(true);
    try {
      // 创建用户活动记录
      const result = await $w.cloud.callFunction({
        name: 'callDataSource',
        data: {
          dataSourceName: 'wywh5_user_activity',
          methodName: 'create',
          data: {
            user_id: userId,
            activity_id: activityId,
            status: 'registered',
            registered_time: new Date().toISOString(),
            points: 0
          }
        }
      });
      if (result.success) {
        setUserActivityRecord(result.data);
        toast({
          title: "报名成功",
          description: "您已成功报名参加此活动"
        });

        // 更新活动参与人数
        await $w.cloud.callFunction({
          name: 'callDataSource',
          data: {
            dataSourceName: 'wywh5_activity',
            methodName: 'update',
            params: {
              filter: {
                activity_id: activityId
              },
              data: {
                participants: (activity?.participants || 0) + 1
              }
            }
          }
        });
      } else {
        throw new Error(result.message || '报名失败');
      }
    } catch (error) {
      console.error('报名失败:', error);
      toast({
        title: "报名失败",
        description: error.message || "请稍后重试",
        variant: "destructive"
      });
    } finally {
      setRegistering(false);
    }
  };
  const handleStartActivity = () => {
    if (!navigator.onLine) {
      toast({
        title: "网络错误",
        description: "请检查网络连接后重试",
        variant: "destructive"
      });
      return;
    }
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
  const handleShare = async () => {
    try {
      const shareData = {
        title: activity?.name || '精彩活动',
        text: activity?.desc || '一起来参加这个有趣的活动吧！',
        url: window.location.href
      };
      if (navigator.share) {
        await navigator.share(shareData);
        toast({
          title: "分享成功",
          description: "活动已分享"
        });
      } else {
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
        toast({
          title: "链接已复制",
          description: "分享内容已复制到剪贴板"
        });
      }
    } catch (error) {
      console.error('分享失败:', error);
      toast({
        title: "分享失败",
        description: error.message || "请稍后重试",
        variant: "destructive"
      });
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
  const getTaskIcon = taskType => {
    switch (taskType) {
      case 'quiz':
        return <HelpCircle className="w-5 h-5" />;
      case 'photo':
        return <Camera className="w-5 h-5" />;
      case 'location':
        return <Navigation className="w-5 h-5" />;
      default:
        return <Target className="w-5 h-5" />;
    }
  };
  const getTaskTypeText = taskType => {
    switch (taskType) {
      case 'quiz':
        return '答题任务';
      case 'photo':
        return '拍照任务';
      case 'location':
        return '定位任务';
      default:
        return '未知任务';
    }
  };
  const getTaskTypeColor = taskType => {
    switch (taskType) {
      case 'quiz':
        return 'text-blue-600 bg-blue-100';
      case 'photo':
        return 'text-green-600 bg-green-100';
      case 'location':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };
  if (loading) {
    return <div style={style} className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
          <p className="text-sm text-gray-500 mt-2">正在获取活动详情</p>
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
      <div className="relative mt-8">
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent z-10"></div>
        <img src={activity?.cover_img || 'https://picsum.photos/seed/activity-cover/400/300.jpg'} alt={activity?.name} className="w-full h-64 object-cover" />
        
        <div className="absolute top-0 left-0 right-0 z-20 p-6">
          <div className="flex items-center justify-between">
            <button onClick={() => $w.utils.navigateBack()} className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex space-x-2">
              <button onClick={() => loadActivityData(true)} disabled={refreshing} className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors">
                <RefreshCw className={`w-5 h-5 text-white ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button onClick={handleShare} className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors">
                <Share2 className="w-5 h-5 text-white" />
              </button>
            </div>
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

      <div className="px-4 py-6">
        {/* 活动基本信息 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">{activity?.name}</h1>
              <div className="flex items-center space-x-3 mb-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(activity?.difficulty)}`}>
                  {getDifficultyText(activity?.difficulty)}
                </span>
                <div className="flex items-center text-sm text-gray-500">
                  <Star className="w-4 h-4 mr-1 text-yellow-500" />
                  <span>{activity?.rating || 0}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="w-4 h-4 mr-1" />
                  <span>{activity?.participants || 0}人参与</span>
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-gray-600 leading-relaxed mb-4">{activity?.desc}</p>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="w-4 h-4 mr-2 text-blue-500" />
              <span>时长: {activity?.duration || '60分钟'}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-2 text-red-500" />
              <span>地点: 博物馆</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2 text-green-500" />
              <span>状态: 活跃</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Trophy className="w-4 h-4 mr-2 text-yellow-500" />
              <span>奖励: 积分+证书</span>
            </div>
          </div>
          
          {activity?.tags && activity.tags.length > 0 && <div className="flex flex-wrap gap-2">
              {activity.tags.map((tag, index) => <span key={index} className="px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-full">
                  {tag}
                </span>)}
            </div>}
        </div>

        {/* 活动要求 */}
        {activity?.requirements && activity.requirements.length > 0 && <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">参与要求</h3>
            <ul className="space-y-2">
              {activity.requirements.map((requirement, index) => <li key={index} className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">{requirement}</span>
                </li>)}
            </ul>
          </div>}

        {/* 任务列表 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">活动任务</h3>
          <div className="space-y-3">
            {tasks.map((task, index) => <div key={task.task_id || index} className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getTaskTypeColor(task.task_type)}`}>
                    {getTaskIcon(task.task_type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800 mb-1">{task.task_name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{task.task_desc}</p>
                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      <span className={`px-2 py-1 rounded ${getTaskTypeColor(task.task_type)}`}>
                        {getTaskTypeText(task.task_type)}
                      </span>
                      <span className="flex items-center">
                        <Trophy className="w-3 h-3 mr-1 text-yellow-500" />
                        {task.points}分
                      </span>
                      {task.is_required && <span className="px-2 py-1 bg-red-100 text-red-600 rounded">
                          必做
                        </span>}
                    </div>
                  </div>
                </div>
              </div>)}
          </div>
        </div>

        {/* 活动奖励 */}
        {activity?.rewards && activity.rewards.length > 0 && <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">活动奖励</h3>
            <div className="grid grid-cols-3 gap-3">
              {activity.rewards.map((reward, index) => <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Trophy className="w-6 h-6 text-yellow-600" />
                  </div>
                  <p className="text-sm text-gray-600">{reward}</p>
                </div>)}
            </div>
          </div>}

        {/* 操作按钮 */}
        <div className="space-y-3">
          {!userActivityRecord ? <Button onClick={handleRegister} disabled={registering} className="w-full bg-blue-600 hover:bg-blue-700">
              {registering ? '报名中...' : '立即报名'}
            </Button> : userActivityRecord.status === 'registered' ? <Button onClick={handleStartActivity} className="w-full bg-green-600 hover:bg-green-700">
              开始活动
            </Button> : userActivityRecord.status === 'in_progress' ? <Button onClick={handleStartActivity} className="w-full bg-blue-600 hover:bg-blue-700">
              继续活动
            </Button> : <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-gray-600 font-medium">活动已完成</p>
              <p className="text-sm text-gray-500">恭喜您完成了所有任务</p>
            </div>}
        </div>
      </div>

      {/* 底部导航栏 */}
      <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
    </div>;
}