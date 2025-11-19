// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast, Button } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, MapPin, Calendar, Users, Star, Clock, Trophy, Target, Share2, Heart, MessageCircle, BookOpen, Camera, HelpCircle, Navigation } from 'lucide-react';

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
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const {
    toast
  } = useToast();
  const activityId = props.$w.page.dataset.params.activityId;
  useEffect(() => {
    if (activityId) {
      loadActivityDetail();
    }
  }, [activityId]);
  const loadActivityDetail = async () => {
    try {
      setLoading(true);
      const userId = $w.auth.currentUser?.userId;
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
      if (activityResult.success && activityResult.data) {
        setActivity(activityResult.data);
        // 模拟社交数据
        setLikeCount(Math.floor(Math.random() * 100) + 50);
        setCommentCount(Math.floor(Math.random() * 30) + 10);
      }
      if (taskResult.success && taskResult.data) {
        setTasks(taskResult.data);
      }
      // 检查用户是否已报名
      if (userId) {
        const userActivityResult = await $w.cloud.callFunction({
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
        });
        if (userActivityResult.success && userActivityResult.data) {
          setIsRegistered(true);
        }
      }
      // 如果没有数据，使用模拟数据
      if (!activityResult.success || !taskResult.success) {
        setActivity({
          activity_id: activityId,
          name: '青铜器探秘之旅',
          desc: '深入了解中国古代青铜器的历史文化和制作工艺，通过互动任务探索博物馆的珍贵藏品。在这个活动中，您将学习青铜器的发展历程、制作工艺、文化意义，并通过答题、拍照、定位等多种方式完成任务，获得积分奖励。',
          cover_img: 'https://picsum.photos/seed/bronze-activity/800/400.jpg',
          activity_map_img: 'https://picsum.photos/seed/museum-map/800/600.jpg',
          difficulty: 'medium',
          duration: '90分钟',
          participants: 156,
          rating: 4.8,
          tags: ['历史', '文化', '青铜器'],
          status: 'active',
          start_time: '2024-01-20T09:00:00Z',
          end_time: '2024-01-20T18:00:00Z',
          max_participants: 200,
          requirements: ['对历史文化感兴趣', '具备基本的手机操作能力', '能够独立完成户外活动'],
          rewards: ['积分奖励', '成就徽章', '知识证书', '纪念品'],
          organizer: '博物馆教育部',
          contact_info: '010-12345678'
        });
        setTasks([{
          task_id: 'task-001',
          activity_id: activityId,
          task_name: '寻找镇馆之宝',
          task_desc: '找到并拍摄博物馆的镇馆之宝 - 四羊方尊',
          task_type: 'photo',
          points: 150,
          location_name: '中央大厅',
          target_description: '四羊方尊是中国商代晚期青铜礼器，是现存商代青铜方尊中最大的一件',
          task_order: 1,
          is_required: true
        }, {
          task_id: 'task-002',
          activity_id: activityId,
          task_name: '青铜器知识问答',
          task_desc: '测试你对青铜器历史和文化的了解',
          task_type: 'quiz',
          points: 100,
          time_limit: 300,
          task_order: 2,
          is_required: true
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
          is_required: false
        }]);
        setLikeCount(89);
        setCommentCount(23);
      }
    } catch (error) {
      console.error('加载活动详情失败:', error);
      toast({
        title: "加载失败",
        description: "无法获取活动详情",
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
  const handleRegister = async () => {
    const userId = $w.auth.currentUser?.userId;
    if (!userId) {
      toast({
        title: "请先登录",
        variant: "destructive"
      });
      return;
    }
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
        setIsRegistered(true);
        toast({
          title: "报名成功",
          description: "您已成功报名此活动"
        });
      }
    } catch (error) {
      toast({
        title: "报名失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const handleStartActivity = () => {
    $w.utils.navigateTo({
      pageId: 'activity-map',
      params: {
        activityId: activityId
      }
    });
  };
  const handleLike = async () => {
    if (isLiked) return;
    try {
      setIsLiked(true);
      setLikeCount(prev => prev + 1);
      // 这里可以调用点赞API
      toast({
        title: "点赞成功",
        description: "您为这个活动点赞了"
      });
    } catch (error) {
      setIsLiked(false);
      setLikeCount(prev => prev - 1);
      toast({
        title: "点赞失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const handleShare = async () => {
    try {
      const shareData = {
        title: activity?.name || '博物馆活动',
        text: activity?.desc || '一起来探索博物馆的奥秘',
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
      <div className="relative">
        <img src={activity?.cover_img || 'https://picsum.photos/seed/activity-cover/800/400.jpg'} alt={activity?.name} className="w-full h-64 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        
        <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between">
          <button onClick={() => $w.utils.navigateBack()} className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex space-x-2">
            <button onClick={handleShare} className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors">
              <Share2 className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h1 className="text-2xl font-bold text-white mb-2">{activity?.name}</h1>
          <div className="flex items-center space-x-4 text-white/90 text-sm">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(activity?.difficulty)}`}>
              {getDifficultyText(activity?.difficulty)}
            </span>
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {activity?.duration}
            </span>
            <span className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              {activity?.participants}人参与
            </span>
            <span className="flex items-center">
              <Star className="w-4 h-4 mr-1 text-yellow-400" />
              {activity?.rating}
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* 活动描述 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3">活动介绍</h2>
          <p className="text-gray-600 leading-relaxed">{activity?.desc}</p>
        </div>

        {/* 活动信息 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">活动信息</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">活动时间</span>
              <span className="text-gray-800 font-medium">
                {activity?.start_time && new Date(activity.start_time).toLocaleString()} - {activity?.end_time && new Date(activity.end_time).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">活动地点</span>
              <span className="text-gray-800 font-medium">博物馆内</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">参与人数</span>
              <span className="text-gray-800 font-medium">{activity?.participants}/{activity?.max_participants}人</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">组织方</span>
              <span className="text-gray-800 font-medium">{activity?.organizer}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">联系方式</span>
              <span className="text-gray-800 font-medium">{activity?.contact_info}</span>
            </div>
          </div>
        </div>

        {/* 任务列表 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">任务列表</h2>
          <div className="space-y-3">
            {tasks.map((task, index) => <div key={task.task_id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getTaskTypeColor(task.task_type)}`}>
                    {getTaskIcon(task.task_type)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">{task.task_name}</h4>
                    <p className="text-sm text-gray-600">{task.task_desc}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-800">{task.points}分</div>
                  {task.is_required && <div className="text-xs text-red-600">必做</div>}
                </div>
              </div>)}
          </div>
        </div>

        {/* 活动要求 */}
        {activity?.requirements && activity.requirements.length > 0 && <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">参与要求</h2>
            <ul className="space-y-2">
              {activity.requirements.map((requirement, index) => <li key={index} className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                  <span className="text-gray-600">{requirement}</span>
                </li>)}
            </ul>
          </div>}

        {/* 活动奖励 */}
        {activity?.rewards && activity.rewards.length > 0 && <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">活动奖励</h2>
            <div className="grid grid-cols-2 gap-3">
              {activity.rewards.map((reward, index) => <div key={index} className="flex items-center space-x-2 p-3 bg-yellow-50 rounded-lg">
                  <Trophy className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm text-gray-700">{reward}</span>
                </div>)}
            </div>
          </div>}

        {/* 标签 */}
        {activity?.tags && activity.tags.length > 0 && <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">活动标签</h2>
            <div className="flex flex-wrap gap-2">
              {activity.tags.map((tag, index) => <span key={index} className="px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-full">
                  {tag}
                </span>)}
            </div>
          </div>}

        {/* 社交互动 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button onClick={handleLike} className={`flex items-center space-x-2 ${isLiked ? 'text-red-500' : 'text-gray-500'} hover:text-red-500 transition-colors`}>
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                <span className="text-sm font-medium">{likeCount}</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors">
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm font-medium">{commentCount}</span>
              </button>
            </div>
            <div className="text-sm text-gray-500">
              {activity?.participants}人已参与
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="space-y-3">
          {isRegistered ? <Button onClick={handleStartActivity} className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200">
              开始活动
            </Button> : <Button onClick={handleRegister} className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200">
              立即报名
            </Button>}
        </div>
      </div>

      {/* 底部导航栏 */}
      <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
    </div>;
}