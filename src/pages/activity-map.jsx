// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast, Button } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, MapPin, Navigation, Target, Camera, FileText, CheckCircle, Circle, Play, Lock, Star, Clock, Users } from 'lucide-react';

export default function ActivityMapPage(props) {
  const {
    $w,
    style
  } = props;
  const [activity, setActivity] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [userProgress, setUserProgress] = useState({
    completedTasks: 0,
    totalTasks: 0,
    currentTask: null
  });
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const {
    toast
  } = useToast();
  const activityId = props.$w.page.dataset.params.activityId;
  useEffect(() => {
    if (activityId) {
      loadActivityData();
    }
  }, [activityId]);
  const loadActivityData = async () => {
    try {
      setLoading(true);
      // 获取活动详情
      const activityResult = await $w.cloud.callFunction({
        name: 'callDataSource',
        data: {
          dataSourceName: 'wyw_activity',
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
          dataSourceName: 'wyw_task',
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
      // 获取用户任务进度
      const progressResult = await $w.cloud.callFunction({
        name: 'callDataSource',
        data: {
          dataSourceName: 'wyw_user_task',
          methodName: 'list',
          params: {
            filter: {
              user_id: $w.auth.currentUser?.userId,
              activity_id: activityId
            }
          }
        }
      });
      if (activityResult.success && activityResult.data) {
        setActivity(activityResult.data);
      }
      if (taskResult.success && taskResult.data) {
        const enrichedTasks = taskResult.data.map(task => {
          const userTask = progressResult.data?.find(ut => ut.task_id === task.task_id);
          return {
            ...task,
            status: userTask?.status || 'locked',
            completed_time: userTask?.completed_time,
            points: userTask?.points || task.points || 100
          };
        });
        setTasks(enrichedTasks);
        // 计算进度
        const completed = enrichedTasks.filter(t => t.status === 'completed').length;
        const currentTask = enrichedTasks.find(t => t.status === 'in_progress') || enrichedTasks.find(t => t.status === 'locked');
        setUserProgress({
          completedTasks: completed,
          totalTasks: enrichedTasks.length,
          currentTask: currentTask
        });
      } else {
        // 使用模拟数据
        const mockTasks = [{
          task_id: 'task-1',
          task_name: '青铜器知识问答',
          task_type: 'quiz',
          task_desc: '回答关于青铜器历史和文化的问题',
          task_order: 1,
          location_name: '青铜器展厅',
          points: 100,
          status: 'completed',
          completed_time: '2024-01-15 10:30'
        }, {
          task_id: 'task-2',
          task_name: '寻找镇馆之宝',
          task_type: 'photo',
          task_desc: '找到并拍摄博物馆的镇馆之宝',
          task_order: 2,
          location_name: '中央大厅',
          points: 150,
          status: 'in_progress'
        }, {
          task_id: 'task-3',
          task_name: '文物打卡',
          task_type: 'location',
          task_desc: '到指定文物位置进行打卡验证',
          task_order: 3,
          location_name: '陶瓷展厅',
          points: 80,
          status: 'locked'
        }, {
          task_id: 'task-4',
          task_name: '文化知识测试',
          task_type: 'quiz',
          task_desc: '测试你对博物馆文化的了解程度',
          task_order: 4,
          location_name: '教育区',
          points: 120,
          status: 'locked'
        }];
        setTasks(mockTasks);
        setUserProgress({
          completedTasks: 1,
          totalTasks: 4,
          currentTask: mockTasks.find(t => t.status === 'in_progress')
        });
        setActivity({
          activity_id: activityId,
          name: '青铜器探秘之旅',
          desc: '探索古代青铜器的神秘世界',
          cover_img: 'https://picsum.photos/seed/bronze-activity/800/400.jpg',
          activity_map_img: 'https://picsum.photos/seed/museum-map/800/450.jpg'
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
  const handleTaskClick = task => {
    if (task.status === 'locked') {
      toast({
        title: "任务未解锁",
        description: "请先完成前面的任务",
        variant: "destructive"
      });
      return;
    }
    setSelectedTask(task);
  };
  const handleStartTask = () => {
    if (!selectedTask) return;
    // 根据任务类型跳转到不同页面
    switch (selectedTask.task_type) {
      case 'quiz':
        $w.utils.navigateTo({
          pageId: 'quiz-task',
          params: {
            taskId: selectedTask.task_id,
            activityId: activityId
          }
        });
        break;
      case 'photo':
        $w.utils.navigateTo({
          pageId: 'photo-task',
          params: {
            taskId: selectedTask.task_id,
            activityId: activityId
          }
        });
        break;
      case 'location':
        $w.utils.navigateTo({
          pageId: 'location-task',
          params: {
            taskId: selectedTask.task_id,
            activityId: activityId
          }
        });
        break;
      default:
        toast({
          title: "任务类型不支持",
          variant: "destructive"
        });
    }
  };
  const getTaskIcon = taskType => {
    switch (taskType) {
      case 'quiz':
        return FileText;
      case 'photo':
        return Camera;
      case 'location':
        return MapPin;
      default:
        return Target;
    }
  };
  const getTaskIconColor = taskType => {
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
  const getStatusIcon = status => {
    switch (status) {
      case 'completed':
        return CheckCircle;
      case 'in_progress':
        return Circle;
      case 'locked':
        return Lock;
      default:
        return Circle;
    }
  };
  const getStatusColor = status => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'in_progress':
        return 'text-blue-600';
      case 'locked':
        return 'text-gray-400';
      default:
        return 'text-gray-400';
    }
  };
  const getStatusText = status => {
    switch (status) {
      case 'completed':
        return '已完成';
      case 'in_progress':
        return '进行中';
      case 'locked':
        return '未解锁';
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
  return <div style={style} className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
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
          <div className="text-right">
            <div className="text-sm text-blue-100">任务进度</div>
            <div className="text-lg font-bold text-yellow-300">
              {userProgress.completedTasks}/{userProgress.totalTasks}
            </div>
          </div>
        </div>
      </div>

      {/* 活动地图 */}
      <div className="relative h-64 bg-gray-100">
        <img src={activity?.activity_map_img || 'https://picsum.photos/seed/museum-map/800/450.jpg'} alt="活动地图" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
        
        {/* 任务点标记 */}
        <div className="absolute inset-0">
          {tasks.map((task, index) => {
          const Icon = getTaskIcon(task.task_type);
          const StatusIcon = getStatusIcon(task.status);
          return <div key={task.task_id} className="absolute" style={{
            top: `${20 + index % 2 * 40}%`,
            left: `${15 + index % 3 * 25}%`
          }}>
              <div className="relative">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getTaskIconColor(task.task_type)} border-2 border-white shadow-lg`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${getStatusColor(task.status)} bg-white`}>
                  <StatusIcon className="w-3 h-3" />
                </div>
              </div>
            </div>;
        })}
        </div>

        {/* 地图控制按钮 */}
        <div className="absolute bottom-4 right-4 space-y-2">
          <button className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
            <Navigation className="w-5 h-5 text-blue-600" />
          </button>
        </div>
      </div>

      {/* 进度条 */}
      <div className="px-4 py-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">完成进度</span>
            <span className="text-sm text-gray-500">
              {Math.round(userProgress.completedTasks / userProgress.totalTasks * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300" style={{
            width: `${userProgress.completedTasks / userProgress.totalTasks * 100}%`
          }}></div>
          </div>
        </div>
      </div>

      {/* 任务列表 */}
      <div className="px-4 pb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">任务列表</h3>
        <div className="space-y-3">
          {tasks.map((task, index) => {
          const Icon = getTaskIcon(task.task_type);
          const StatusIcon = getStatusIcon(task.status);
          return <div key={task.task_id} onClick={() => handleTaskClick(task)} className={`bg-white rounded-xl shadow-sm p-4 border-2 transition-all duration-200 ${selectedTask?.task_id === task.task_id ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:border-gray-200'}`}>
              <div className="flex items-center">
                <div className="relative mr-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getTaskIconColor(task.task_type)}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full ${getStatusColor(task.status)} bg-white flex items-center justify-center`}>
                    <StatusIcon className="w-3 h-3" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-gray-800">{task.task_name}</h4>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(task.status)} bg-opacity-10`}>
                      {getStatusText(task.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{task.task_desc}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span>{task.location_name}</span>
                      </div>
                      <div className="flex items-center">
                        <Star className="w-3 h-3 mr-1 text-yellow-500" />
                        <span>{task.points}分</span>
                      </div>
                    </div>
                    {task.completed_time && <span>{task.completed_time}</span>}
                  </div>
                </div>
              </div>
            </div>;
        })}
        </div>
      </div>

      {/* 开始任务按钮 */}
      {selectedTask && selectedTask.status !== 'completed' && <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <Button onClick={handleStartTask} className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2">
            <Play className="w-5 h-5" />
            <span>开始任务</span>
          </Button>
        </div>}
    </div>;
}