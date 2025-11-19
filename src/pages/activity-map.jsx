// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast, Button } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, MapPin, Navigation, Clock, Star, Trophy, Target, CheckCircle, Lock, Users, Camera, HelpCircle, Share2, Heart, MessageCircle } from 'lucide-react';

import { TabBar } from '@/components/TabBar';
export default function ActivityMapPage(props) {
  const {
    $w,
    style
  } = props;
  const [activeTab, setActiveTab] = useState('activities');
  const [activity, setActivity] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [userTaskRecords, setUserTaskRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const {
    toast
  } = useToast();
  const activityId = props.$w.page.dataset.params.activityId;
  useEffect(() => {
    if (activityId) {
      loadActivityData();
      getUserLocation();
    }
  }, [activityId]);
  const loadActivityData = async () => {
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
      // 获取活动详情
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
      // 获取任务列表
      const taskResult = await $w.cloud.callFunction({
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
      });
      // 获取用户任务记录
      const userTaskResult = await $w.cloud.callFunction({
        name: 'callDataSource',
        data: {
          dataSourceName: 'wywh5_user_task',
          methodName: 'list',
          params: {
            filter: {
              user_id: userId,
              activity_id: activityId
            }
          }
        }
      });
      if (activityResult.success && activityResult.data) {
        setActivity(activityResult.data);
      }
      if (taskResult.success && taskResult.data) {
        setTasks(taskResult.data);
      }
      if (userTaskResult.success && userTaskResult.data) {
        setUserTaskRecords(userTaskResult.data);
      }
      // 如果没有数据，使用模拟数据
      if (!activityResult.success || !taskResult.success) {
        setActivity({
          activity_id: activityId,
          name: '青铜器探秘之旅',
          desc: '深入了解中国古代青铜器的历史文化和制作工艺，通过互动任务探索博物馆的珍贵藏品。',
          cover_img: 'https://picsum.photos/seed/bronze-activity/400/200.jpg',
          activity_map_img: 'https://picsum.photos/seed/museum-map/800/600.jpg',
          difficulty: 'medium',
          duration: '90分钟',
          participants: 156,
          rating: 4.8,
          tags: ['历史', '文化', '青铜器'],
          status: 'active'
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
        }, {
          task_id: 'task-003',
          activity_id: activityId,
          task_name: '探索古代工艺',
          task_desc: '前往指定地点了解青铜器制作工艺',
          task_type: 'location',
          points: 80,
          location_name: '工艺展厅',
          target_description: '了解青铜器的制作流程和工艺特点',
          task_order: 3,
          is_required: false,
          status: 'active'
        }]);
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
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      }, error => {
        console.error('获取位置失败:', error);
        // 使用模拟位置
        setUserLocation({
          lat: 39.9042,
          lng: 116.4074
        });
      });
    } else {
      // 使用模拟位置
      setUserLocation({
        lat: 39.9042,
        lng: 116.4074
      });
    }
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
  const handleTaskClick = task => {
    setSelectedTask(task);
    setShowTaskDetail(true);
  };
  const handleStartTask = task => {
    const userId = $w.auth.currentUser?.userId;
    if (!userId) {
      toast({
        title: "请先登录",
        variant: "destructive"
      });
      return;
    }
    // 检查是否已有任务记录
    const existingRecord = userTaskRecords.find(record => record.task_id === task.task_id);
    if (existingRecord) {
      // 如果任务已开始，继续任务
      if (existingRecord.status === 'in_progress') {
        navigateToTask(task);
      } else if (existingRecord.status === 'completed') {
        toast({
          title: "任务已完成",
          description: "您已完成此任务"
        });
      }
    } else {
      // 开始新任务
      navigateToTask(task);
    }
  };
  const navigateToTask = task => {
    if (task.task_type === 'quiz') {
      $w.utils.navigateTo({
        pageId: 'quiz-task',
        params: {
          taskId: task.task_id,
          activityId: activityId
        }
      });
    } else if (task.task_type === 'photo') {
      $w.utils.navigateTo({
        pageId: 'photo-task',
        params: {
          taskId: task.task_id,
          activityId: activityId
        }
      });
    } else if (task.task_type === 'location') {
      $w.utils.navigateTo({
        pageId: 'location-task',
        params: {
          taskId: task.task_id,
          activityId: activityId
        }
      });
    }
  };
  const getTaskStatus = task => {
    const record = userTaskRecords.find(r => r.task_id === task.task_id);
    if (record) {
      return record.status;
    }
    return 'not_started';
  };
  const getTaskIcon = taskType => {
    switch (taskType) {
      case 'quiz':
        return <HelpCircle className="w-5 h-5" />;
      case 'photo':
        return <Camera className="w-5 h-5" />;
      case 'location':
        return <MapPin className="w-5 h-5" />;
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
  const getStatusColor = status => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'in_progress':
        return 'text-blue-600 bg-blue-100';
      case 'not_started':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };
  const getStatusText = status => {
    switch (status) {
      case 'completed':
        return '已完成';
      case 'in_progress':
        return '进行中';
      case 'not_started':
        return '未开始';
      default:
        return '未知';
    }
  };
  const calculateProgress = () => {
    if (tasks.length === 0) return 0;
    const completedTasks = userTaskRecords.filter(record => record.status === 'completed').length;
    return Math.round(completedTasks / tasks.length * 100);
  };
  const handleShare = async () => {
    try {
      const shareData = {
        title: `我正在参与"${activity?.name}"活动！`,
        text: `一起来探索博物馆的奥秘，完成有趣的任务吧！`,
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
      toast({
        title: "分享失败",
        description: error.message,
        variant: "destructive"
      });
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
  const progress = calculateProgress();
  return <div style={style} className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-20">
      {/* 顶部导航 */}
      <div className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white">
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
              <h1 className="text-xl font-bold text-yellow-300">活动地图</h1>
              <p className="text-blue-100 text-sm">{activity?.name || '活动名称'}</p>
            </div>
          </div>
          <button onClick={handleShare} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 活动地图图片 */}
      <div className="relative">
        <img src={activity?.activity_map_img || 'https://picsum.photos/seed/museum-map/800/400.jpg'} alt="活动地图" className="w-full h-64 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        
        {/* 用户位置标记 */}
        {userLocation && <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-4 h-4 bg-blue-500 rounded-full animate-ping"></div>
            </div>
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
              您的位置
            </div>
          </div>}
        
        {/* 任务位置标记 */}
        {tasks.map((task, index) => {
        const status = getTaskStatus(task);
        const top = 20 + index % 3 * 25;
        const left = 15 + Math.floor(index / 3) * 30;
        return <div key={task.task_id} className="absolute" style={{
          top: `${top}%`,
          left: `${left}%`
        }}>
              <button onClick={() => handleTaskClick(task)} className="relative">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${status === 'completed' ? 'bg-green-500' : status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-400'}`}>
                  {status === 'completed' ? <CheckCircle className="w-4 h-4 text-white" /> : status === 'in_progress' ? <Clock className="w-4 h-4 text-white" /> : <Lock className="w-4 h-4 text-white" />}
                </div>
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                  {task.task_name}
                </div>
              </button>
            </div>;
      })}
      </div>

      {/* 活动信息 */}
      <div className="px-4 py-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3">{activity?.name}</h2>
          <p className="text-gray-600 mb-4">{activity?.desc}</p>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {activity?.duration || '60分钟'}
              </span>
              <span className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {activity?.participants || 0}人参与
              </span>
              <span className="flex items-center">
                <Star className="w-4 h-4 mr-1 text-yellow-500" />
                {activity?.rating || 0}
              </span>
            </div>
          </div>
          
          {/* 进度条 */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">完成进度</span>
              <span className="text-sm text-gray-500">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300" style={{
              width: `${progress}%`
            }}></div>
            </div>
          </div>
          
          {/* 标签 */}
          {activity?.tags && activity.tags.length > 0 && <div className="flex flex-wrap gap-2">
              {activity.tags.map((tag, index) => <span key={index} className="px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-full">
                  {tag}
                </span>)}
            </div>}
        </div>

        {/* 任务列表 */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">任务列表</h3>
          <div className="space-y-3">
            {tasks.map((task, index) => {
            const status = getTaskStatus(task);
            return <div key={task.task_id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
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
                            <Star className="w-3 h-3 mr-1 text-yellow-500" />
                            {task.points}分
                          </span>
                          {task.location_name && <span className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {task.location_name}
                            </span>}
                          {task.is_required && <span className="px-2 py-1 bg-red-100 text-red-600 rounded">
                              必做
                            </span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                        {getStatusText(status)}
                      </span>
                      <button onClick={() => handleStartTask(task)} disabled={status === 'completed'} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${status === 'completed' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : status === 'in_progress' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-green-600 text-white hover:bg-green-700'}`}>
                        {status === 'completed' ? '已完成' : status === 'in_progress' ? '继续任务' : '开始任务'}
                      </button>
                    </div>
                  </div>
                </div>;
          })}
          </div>
        </div>
      </div>

      {/* 任务详情弹窗 */}
      {showTaskDetail && selectedTask && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">任务详情</h3>
              <button onClick={() => setShowTaskDetail(false)} className="p-2 rounded-full hover:bg-gray-100">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">{selectedTask.task_name}</h4>
                <p className="text-sm text-gray-600">{selectedTask.task_desc}</p>
              </div>
              
              {selectedTask.target_description && <div>
                  <h5 className="font-medium text-gray-800 mb-2">目标描述</h5>
                  <p className="text-sm text-gray-600">{selectedTask.target_description}</p>
                </div>}
              
              <div className="flex items-center space-x-3 text-sm text-gray-500">
                <span className={`px-2 py-1 rounded ${getTaskTypeColor(selectedTask.task_type)}`}>
                  {getTaskTypeText(selectedTask.task_type)}
                </span>
                <span className="flex items-center">
                  <Star className="w-3 h-3 mr-1 text-yellow-500" />
                  {selectedTask.points}分
                </span>
                {selectedTask.location_name && <span className="flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    {selectedTask.location_name}
                  </span>}
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button onClick={() => {
              setShowTaskDetail(false);
              handleStartTask(selectedTask);
            }} className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
                  开始任务
                </button>
                <button onClick={() => setShowTaskDetail(false)} className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>}

      {/* 底部导航栏 */}
      <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
    </div>;
}