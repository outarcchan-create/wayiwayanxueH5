// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast, Button } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Share2, Clock, Users, Star, MapPin, Lock, Play } from 'lucide-react';

export default function ActivityDetailPage(props) {
  const {
    $w,
    style
  } = props;
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const {
    toast
  } = useToast();
  const activityId = props.$w.page.dataset.params.activityId;
  useEffect(() => {
    loadActivityDetail();
  }, [activityId]);
  const loadActivityDetail = async () => {
    try {
      setLoading(true);
      const result = await $w.cloud.callFunction({
        name: 'getActivityDetail',
        data: {
          activityId
        }
      });
      if (result.success) {
        setActivity(result.data);
      } else {
        toast({
          title: "加载失败",
          description: result.message || "活动信息获取失败",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "加载失败",
        description: error.message || "网络错误，请稍后重试",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleStartActivity = () => {
    if (!activity) return;
    if (activity.unlock_type === 'passcode') {
      // 需要口令解锁，跳转到解锁页面
      $w.utils.navigateTo({
        pageId: 'activity-unlock',
        params: {
          activityId: activity.activity_id
        }
      });
    } else {
      // 直接进入活动
      $w.utils.navigateTo({
        pageId: 'activity-map',
        params: {
          activityId: activity.activity_id
        }
      });
    }
  };
  const handleShareActivity = async () => {
    try {
      const result = await $w.cloud.callFunction({
        name: 'generateSharePoster',
        data: {
          activityId: activity.activity_id
        }
      });
      if (result.success) {
        // 这里可以显示分享弹窗或直接下载海报
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
          <button onClick={handleShareActivity} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 活动封面图 */}
      <div className="relative h-64 overflow-hidden">
        <img src={activity.cover_img || 'https://picsum.photos/seed/museum-activity/800/400.jpg'} alt={activity.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        
        {/* 活动状态标签 */}
        <div className="absolute top-4 right-4">
          {activity.status === 'published' && <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
              <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
              进行中
            </div>}
          {activity.status === 'draft' && <div className="bg-gray-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              草稿
            </div>}
          {activity.status === 'ended' && <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              已结束
            </div>}
        </div>

        {/* 活动标题 */}
        <div className="absolute bottom-4 left-6 right-6">
          <h2 className="text-2xl font-bold text-white mb-2">{activity.name}</h2>
          {activity.unlock_type === 'passcode' && <div className="flex items-center text-yellow-300 text-sm">
              <Lock className="w-4 h-4 mr-1" />
              需要口令解锁
            </div>}
        </div>
      </div>

      {/* 活动信息 */}
      <div className="px-6 py-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">活动简介</h3>
          <p className="text-gray-600 leading-relaxed">
            {activity.desc || '暂无简介'}
          </p>
        </div>

        {/* 活动统计信息 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">活动信息</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center text-gray-600">
              <Clock className="w-5 h-5 mr-2 text-blue-600" />
              <div>
                <div className="text-sm text-gray-500">活动时长</div>
                <div className="font-medium">45分钟</div>
              </div>
            </div>
            <div className="flex items-center text-gray-600">
              <Users className="w-5 h-5 mr-2 text-blue-600" />
              <div>
                <div className="text-sm text-gray-500">参与人数</div>
                <div className="font-medium">1,234人</div>
              </div>
            </div>
            <div className="flex items-center text-gray-600">
              <Star className="w-5 h-5 mr-2 text-yellow-500" />
              <div>
                <div className="text-sm text-gray-500">活动评分</div>
                <div className="font-medium">4.8分</div>
              </div>
            </div>
            <div className="flex items-center text-gray-600">
              <MapPin className="w-5 h-5 mr-2 text-red-500" />
              <div>
                <div className="text-sm text-gray-500">活动地点</div>
                <div className="font-medium">博物馆内</div>
              </div>
            </div>
          </div>
        </div>

        {/* 活动地图预览 */}
        {activity.activity_map_img && <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">活动地图</h3>
            <div className="relative h-48 rounded-lg overflow-hidden">
              <img src={activity.activity_map_img} alt="活动地图" className="w-full h-full object-cover" />
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