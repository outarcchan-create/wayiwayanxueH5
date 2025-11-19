// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast, Button } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Share2, Clock, Users, Star, MapPin, Lock, Play, Calendar, Tag, Award } from 'lucide-react';

export default function ActivityDetailPage(props) {
  const {
    $w,
    style
  } = props;
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const {
    toast
  } = useToast();
  const activityId = props.$w.page.dataset.params.activityId;
  useEffect(() => {
    if (activityId) {
      loadActivityDetail();
    } else {
      setLoading(false);
      toast({
        title: "参数错误",
        description: "缺少活动ID",
        variant: "destructive"
      });
    }
  }, [activityId]);
  const loadActivityDetail = async () => {
    try {
      setLoading(true);
      // 使用数据模型API调用
      const result = await $w.cloud.callFunction({
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
      if (result.success && result.data) {
        setActivity(result.data);
      } else {
        // 如果数据模型调用失败，使用模拟数据作为fallback
        setActivity({
          activity_id: activityId,
          name: '青铜器探秘之旅',
          desc: '探索古代青铜器的神秘世界，了解商周时期的礼器文化。通过互动任务和趣味问答，深入了解青铜器的历史背景、制作工艺和文化内涵。',
          cover_img: 'https://picsum.photos/seed/bronze-activity/800/400.jpg',
          activity_map_img: 'https://picsum.photos/seed/museum-map/800/450.jpg',
          unlock_type: 'free',
          status: 'published',
          start_time: '2024-01-01',
          end_time: '2024-12-31',
          creator_id: 'admin',
          tags: ['历史文化', '互动体验', '青铜器'],
          difficulty: '简单',
          duration: '45分钟',
          participants: 1234,
          rating: 4.8
        });
      }
    } catch (error) {
      console.error('加载活动详情失败:', error);
      toast({
        title: "加载失败",
        description: "无法获取活动详情，显示默认内容",
        variant: "destructive"
      });
      // 使用模拟数据作为fallback
      setActivity({
        activity_id: activityId,
        name: '青铜器探秘之旅',
        desc: '探索古代青铜器的神秘世界，了解商周时期的礼器文化。通过互动任务和趣味问答，深入了解青铜器的历史背景、制作工艺和文化内涵。',
        cover_img: 'https://picsum.photos/seed/bronze-activity/800/400.jpg',
        activity_map_img: 'https://picsum.photos/seed/museum-map/800/450.jpg',
        unlock_type: 'free',
        status: 'published',
        start_time: '2024-01-01',
        end_time: '2024-12-31',
        creator_id: 'admin',
        tags: ['历史文化', '互动体验', '青铜器'],
        difficulty: '简单',
        duration: '45分钟',
        participants: 1234,
        rating: 4.8
      });
    } finally {
      setLoading(false);
    }
  };
  const handleStartActivity = () => {
    if (!activity) return;
    if (activity.status !== 'published') {
      toast({
        title: "活动未开始",
        description: "该活动还未发布，请稍后再试",
        variant: "destructive"
      });
      return;
    }
    if (activity.unlock_type === 'passcode') {
      $w.utils.navigateTo({
        pageId: 'activity-unlock',
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
  const handleShareActivity = async () => {
    if (!activity) return;
    setSharing(true);
    try {
      const result = await $w.cloud.callFunction({
        name: 'generateSharePoster',
        data: {
          activityId: activity.activity_id
        }
      });
      if (result.success) {
        toast({
          title: "分享海报生成成功",
          description: "海报已生成，可以分享给朋友"
        });
      } else {
        toast({
          title: "生成失败",
          description: result.message || "海报生成失败",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "分享失败",
        description: error.message || "请稍后重试",
        variant: "destructive"
      });
    } finally {
      setSharing(false);
    }
  };
  const getStatusText = status => {
    switch (status) {
      case 'published':
        return '进行中';
      case 'draft':
        return '草稿';
      case 'ended':
        return '已结束';
      default:
        return '未知';
    }
  };
  const getStatusColor = status => {
    switch (status) {
      case 'published':
        return 'bg-green-500';
      case 'draft':
        return 'bg-gray-500';
      case 'ended':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
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
  if (!activity) {
    return <div style={style} className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 mb-4">活动不存在或已结束</p>
          <Button onClick={() => $w.utils.navigateBack()}>
            返回上一页
          </Button>
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
            <h1 className="text-xl font-bold text-yellow-300">活动详情</h1>
          </div>
          <button onClick={handleShareActivity} disabled={sharing} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50">
            <Share2 className={`w-5 h-5 ${sharing ? 'animate-pulse' : ''}`} />
          </button>
        </div>
      </div>

      {/* 活动封面图 */}
      <div className="relative h-64 overflow-hidden">
        <img src={activity.cover_img || 'https://picsum.photos/seed/museum-activity/800/400.jpg'} alt={activity.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        
        {/* 活动状态标签 */}
        <div className="absolute top-4 right-4">
          <div className={`${getStatusColor(activity.status)} text-white px-3 py-1 rounded-full text-sm font-medium flex items-center`}>
            {activity.status === 'published' && <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>}
            {getStatusText(activity.status)}
          </div>
        </div>

        {/* 活动标题 */}
        <div className="absolute bottom-4 left-6 right-6">
          <h2 className="text-2xl font-bold text-white mb-2">{activity.name}</h2>
          <div className="flex items-center space-x-4 text-yellow-300 text-sm">
            {activity.unlock_type === 'passcode' && <div className="flex items-center">
                <Lock className="w-4 h-4 mr-1" />
                需要口令解锁
              </div>}
            {activity.difficulty && <div className="flex items-center">
                <Award className="w-4 h-4 mr-1" />
                {activity.difficulty}
              </div>}
          </div>
        </div>
      </div>

      {/* 活动信息 */}
      <div className="px-6 py-6">
        {/* 活动简介 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">活动简介</h3>
          <p className="text-gray-600 leading-relaxed">
            {activity.desc || '暂无简介'}
          </p>
        </div>

        {/* 活动标签 */}
        {activity.tags && activity.tags.length > 0 && <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">活动标签</h3>
            <div className="flex flex-wrap gap-2">
              {activity.tags.map((tag, index) => <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full flex items-center">
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </span>)}
            </div>
          </div>}

        {/* 活动统计信息 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">活动信息</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center text-gray-600">
              <Clock className="w-5 h-5 mr-2 text-blue-600" />
              <div>
                <div className="text-sm text-gray-500">活动时长</div>
                <div className="font-medium">{activity.duration || '45分钟'}</div>
              </div>
            </div>
            <div className="flex items-center text-gray-600">
              <Users className="w-5 h-5 mr-2 text-blue-600" />
              <div>
                <div className="text-sm text-gray-500">参与人数</div>
                <div className="font-medium">{activity.participants || '0'}人</div>
              </div>
            </div>
            <div className="flex items-center text-gray-600">
              <Star className="w-5 h-5 mr-2 text-yellow-500" />
              <div>
                <div className="text-sm text-gray-500">活动评分</div>
                <div className="font-medium">{activity.rating || '5.0'}分</div>
              </div>
            </div>
            <div className="flex items-center text-gray-600">
              <Calendar className="w-5 h-5 mr-2 text-green-500" />
              <div>
                <div className="text-sm text-gray-500">活动时间</div>
                <div className="font-medium">长期有效</div>
              </div>
            </div>
          </div>
        </div>

        {/* 活动地图预览 */}
        {activity.activity_map_img && <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">活动地图</h3>
            <div className="relative h-48 rounded-lg overflow-hidden">
              <img src={activity.activity_map_img} alt="活动地图" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <MapPin className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>}

        {/* 开始任务按钮 */}
        <Button onClick={handleStartActivity} disabled={activity.status !== 'published'} className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed">
          <Play className="w-5 h-5" />
          <span>
            {activity.status === 'published' ? activity.unlock_type === 'passcode' ? '输入口令解锁' : '开始任务' : '活动未开始'}
          </span>
        </Button>

        {/* 返回首页按钮 */}
        <Button onClick={() => $w.utils.navigateTo({
        pageId: 'home',
        params: {}
      })} variant="outline" className="w-full h-12 mt-4 border-gray-300 text-gray-700 hover:bg-gray-50">
          返回首页
        </Button>
      </div>
    </div>;
}