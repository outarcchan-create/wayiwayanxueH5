// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast, Button } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, MapPin, Navigation, CheckCircle, AlertCircle, Clock, Star, RefreshCw, Share2, RotateCcw, Download, Trophy, Compass, Target, Lock } from 'lucide-react';

export default function LocationTaskPage(props) {
  const {
    $w,
    style
  } = props;
  const [task, setTask] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [targetLocation, setTargetLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [userTaskRecord, setUserTaskRecord] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [distance, setDistance] = useState(null);
  const [isWithinRange, setIsWithinRange] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [sharing, setSharing] = useState(false);
  const {
    toast
  } = useToast();
  const taskId = props.$w.page.dataset.params.taskId;
  const activityId = props.$w.page.dataset.params.activityId;
  useEffect(() => {
    if (taskId) {
      loadTaskData();
    }
  }, [taskId]);
  useEffect(() => {
    if (userLocation && targetLocation) {
      calculateDistance();
    }
  }, [userLocation, targetLocation]);
  const loadTaskData = async () => {
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
      // 获取任务详情
      const taskResult = await $w.cloud.callFunction({
        name: 'callDataSource',
        data: {
          dataSourceName: 'wywh5_task',
          methodName: 'get',
          params: {
            filter: {
              task_id: taskId
            }
          }
        }
      });
      // 获取用户任务记录
      const userTaskResult = await $w.cloud.callFunction({
        name: 'callDataSource',
        data: {
          dataSourceName: 'wywh5_user_task',
          methodName: 'get',
          params: {
            filter: {
              user_id: userId,
              task_id: taskId
            }
          }
        }
      });
      if (taskResult.success && taskResult.data) {
        setTask(taskResult.data);
        // 设置目标位置（模拟坐标）
        setTargetLocation({
          lat: 39.9042 + (Math.random() - 0.5) * 0.01,
          lng: 116.4074 + (Math.random() - 0.5) * 0.01,
          name: taskResult.data.location_name || '目标地点'
        });
      }
      if (userTaskResult.success && userTaskResult.data) {
        setUserTaskRecord(userTaskResult.data);
        setAttempts(userTaskResult.data.attempt_count || 0);
        // 如果任务已完成，显示结果
        if (userTaskResult.data.status === 'completed') {
          setShowResult(true);
        }
      } else {
        // 创建新的用户任务记录
        const createResult = await $w.cloud.callFunction({
          name: 'callDataSource',
          data: {
            dataSourceName: 'wywh5_user_task',
            methodName: 'create',
            data: {
              user_id: userId,
              task_id: taskId,
              activity_id: activityId,
              status: 'in_progress',
              start_time: new Date().toISOString(),
              score: 0,
              points: 0,
              time_spent: 0,
              attempt_count: 1,
              share_count: 0,
              share_platforms: [],
              is_public: false
            }
          }
        });
        if (createResult.success) {
          setUserTaskRecord(createResult.data);
        }
      }
      // 如果没有数据，使用模拟数据
      if (!taskResult.success) {
        setTask({
          task_id: taskId,
          task_name: '探索古代工艺',
          task_desc: '前往指定地点了解青铜器制作工艺',
          location_name: '工艺展厅',
          target_description: '找到工艺展厅的青铜器制作工艺展示区',
          points: 80,
          target_coordinates: {
            lat: 39.9042,
            lng: 116.4074
          },
          required_range: 50 // 50米范围内
        });
        setTargetLocation({
          lat: 39.9042,
          lng: 116.4074,
          name: '工艺展厅'
        });
      }
      setStartTime(new Date());
    } catch (error) {
      console.error('加载任务数据失败:', error);
      toast({
        title: "加载失败",
        description: "无法获取任务数据",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const getCurrentLocation = () => {
    setLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        setUserLocation(location);
        setLocating(false);
        toast({
          title: "定位成功",
          description: "已获取您的当前位置"
        });
      }, error => {
        console.error('定位失败:', error);
        // 使用模拟位置
        const mockLocation = {
          lat: 39.9042 + (Math.random() - 0.5) * 0.005,
          lng: 116.4074 + (Math.random() - 0.5) * 0.005,
          accuracy: 10
        };
        setUserLocation(mockLocation);
        setLocating(false);
        toast({
          title: "定位完成",
          description: "已获取模拟位置"
        });
      }, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });
    } else {
      // 浏览器不支持定位，使用模拟位置
      const mockLocation = {
        lat: 39.9042 + (Math.random() - 0.5) * 0.005,
        lng: 116.4074 + (Math.random() - 0.5) * 0.005,
        accuracy: 10
      };
      setUserLocation(mockLocation);
      setLocating(false);
      toast({
        title: "定位完成",
        description: "已获取模拟位置"
      });
    }
  };
  const calculateDistance = () => {
    if (!userLocation || !targetLocation) return;
    const R = 6371; // 地球半径（公里）
    const dLat = (targetLocation.lat - userLocation.lat) * Math.PI / 180;
    const dLng = (targetLocation.lng - userLocation.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(targetLocation.lat * Math.PI / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c * 1000; // 转换为米
    setDistance(distance);
    const requiredRange = task?.required_range || 50; // 默认50米
    setIsWithinRange(distance <= requiredRange);
  };
  const handleVerifyLocation = async () => {
    if (!userLocation) {
      toast({
        title: "请先定位",
        description: "点击定位按钮获取当前位置",
        variant: "destructive"
      });
      return;
    }
    if (!isWithinRange) {
      setAttempts(prev => prev + 1);
      toast({
        title: "距离目标太远",
        description: `您距离目标还有${Math.round(distance)}米，请继续靠近`,
        variant: "destructive"
      });
      return;
    }
    try {
      const timeSpent = startTime ? Math.floor((new Date() - startTime) / 1000) : 0;
      // 保存任务完成记录
      const result = await $w.cloud.callFunction({
        name: 'callDataSource',
        data: {
          dataSourceName: 'wywh5_user_task',
          methodName: 'update',
          params: {
            filter: {
              user_id: $w.auth.currentUser?.userId,
              task_id: taskId
            },
            data: {
              status: 'completed',
              completed_time: new Date().toISOString(),
              location_verified: true,
              verified_location: userLocation,
              points: task?.points || 80,
              time_spent: timeSpent,
              completion_rate: 100,
              attempt_count: attempts + 1
            }
          }
        }
      });
      if (result.success) {
        setShowResult(true);
        toast({
          title: "位置验证成功",
          description: `恭喜您到达目标地点，获得${task?.points || 80}积分`
        });
      }
    } catch (error) {
      toast({
        title: "验证失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const handleRetakeTask = async () => {
    try {
      // 重置任务状态
      await $w.cloud.callFunction({
        name: 'callDataSource',
        data: {
          dataSourceName: 'wywh5_user_task',
          methodName: 'update',
          params: {
            filter: {
              user_id: $w.auth.currentUser?.userId,
              task_id: taskId
            },
            data: {
              status: 'in_progress',
              start_time: new Date().toISOString(),
              location_verified: false,
              points: 0,
              time_spent: 0,
              attempt_count: attempts + 1
            }
          }
        }
      });
      // 重置状态
      setUserLocation(null);
      setDistance(null);
      setIsWithinRange(false);
      setShowResult(false);
      setStartTime(new Date());
      toast({
        title: "重新开始",
        description: "定位任务已重置"
      });
    } catch (error) {
      toast({
        title: "重置失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const handleShareResult = async (platform = 'system') => {
    setSharing(true);
    try {
      const shareData = {
        title: `我完成了"${task?.task_name}"任务！`,
        text: `成功到达${task?.location_name}，完成了定位探索任务，获得${task?.points}积分！快来一起探索博物馆吧！`,
        url: window.location.href
      };

      // 更新分享记录
      await $w.cloud.callFunction({
        name: 'callDataSource',
        data: {
          dataSourceName: 'wywh5_user_task',
          methodName: 'update',
          params: {
            filter: {
              user_id: $w.auth.currentUser?.userId,
              task_id: taskId
            },
            data: {
              share_count: (userTaskRecord?.share_count || 0) + 1,
              last_share_time: new Date().toISOString(),
              share_platforms: [...(userTaskRecord?.share_platforms || []), platform]
            }
          }
        }
      });
      if (platform === 'wechat' || platform === 'weibo') {
        toast({
          title: "分享成功",
          description: `已分享到${platform === 'wechat' ? '微信' : '微博'}`
        });
      } else if (navigator.share) {
        await navigator.share(shareData);
        toast({
          title: "分享成功",
          description: "任务成果已分享"
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
    } finally {
      setSharing(false);
    }
  };
  const formatDistance = meters => {
    if (meters < 1000) {
      return `${Math.round(meters)}米`;
    }
    return `${(meters / 1000).toFixed(1)}公里`;
  };
  if (loading) {
    return <div style={style} className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>;
  }
  if (showResult) {
    return <div style={style} className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center px-6">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <MapPin className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">位置验证成功！</h2>
          <p className="text-gray-600 mb-2">您已成功到达目标地点</p>
          <div className="text-lg text-blue-600 font-medium mb-8">
            获得{task?.points || 0}积分
          </div>
          
          {/* 分享功能 */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">分享成就</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button onClick={() => handleShareResult('wechat')} disabled={sharing} className="py-3 px-4 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center">
                <Share2 className="w-4 h-4 mr-2" />
                微信分享
              </button>
              <button onClick={() => handleShareResult('weibo')} disabled={sharing} className="py-3 px-4 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center">
                <Share2 className="w-4 h-4 mr-2" />
                微博分享
              </button>
            </div>
            <button onClick={() => handleShareResult('system')} disabled={sharing} className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center">
              <Share2 className="w-4 h-4 mr-2" />
              {sharing ? '分享中...' : '更多分享'}
            </button>
          </div>
          
          <div className="space-y-3">
            <Button onClick={() => $w.utils.navigateTo({
            pageId: 'activity-map',
            params: {
              activityId: activityId
            }
          })} className="w-full bg-blue-600 hover:bg-blue-700">
              返回活动地图
            </Button>
            <Button onClick={handleRetakeTask} variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center">
              <RotateCcw className="w-4 h-4 mr-2" />
              重新挑战
            </Button>
          </div>
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
        
        <div className="relative z-10 px-6 py-4 flex items-center">
          <button onClick={() => $w.utils.navigateBack()} className="mr-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-yellow-300">定位任务</h1>
            <p className="text-blue-100 text-sm">{task?.task_name || '任务名称'}</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* 任务说明 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">任务说明</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            {task?.task_desc || '任务描述'}
          </p>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2 text-red-500" />
            <span>目标地点：{task?.location_name || '未知地点'}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 mt-2">
            <Star className="w-4 h-4 mr-2 text-yellow-500" />
            <span>奖励：{task?.points || 0}积分</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 mt-2">
            <Target className="w-4 h-4 mr-2 text-blue-500" />
            <span>要求范围：{task?.required_range || 50}米内</span>
          </div>
        </div>

        {/* 目标描述 */}
        {task?.target_description && <div className="bg-blue-50 rounded-xl p-6">
            <h4 className="font-bold text-blue-800 mb-2">目标描述</h4>
            <p className="text-blue-700 text-sm leading-relaxed">
              {task.target_description}
            </p>
          </div>}

        {/* 地图区域 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h4 className="font-bold text-gray-800 mb-4">探索地图</h4>
          <div className="relative bg-gray-100 rounded-lg h-64 mb-4 overflow-hidden">
            {/* 模拟地图背景 */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50">
              <div className="absolute top-4 left-4 w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="absolute top-8 right-8 w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="absolute bottom-12 left-12 w-2 h-2 bg-yellow-500 rounded-full"></div>
            </div>
            
            {/* 目标位置标记 */}
            {targetLocation && <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                    {targetLocation.name}
                  </div>
                </div>
              </div>}
            
            {/* 用户位置标记 */}
            {userLocation && <div className="absolute" style={{
            top: `${30 + Math.random() * 40}%`,
            left: `${20 + Math.random() * 60}%`
          }}>
                <div className="relative">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <Navigation className="w-3 h-3 text-white" />
                  </div>
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                    您的位置
                  </div>
                </div>
              </div>}
            
            {/* 距离连线 */}
            {userLocation && targetLocation && <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <line x1="50%" y1="50%" x2={`${30 + Math.random() * 40}%`} y2={`${20 + Math.random() * 60}%`} stroke="#3B82F6" strokeWidth="2" strokeDasharray="5,5" />
              </svg>}
          </div>
          
          {/* 距离信息 */}
          {distance !== null && <div className={`p-4 rounded-lg ${isWithinRange ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {isWithinRange ? <CheckCircle className="w-5 h-5 text-green-600 mr-2" /> : <Compass className="w-5 h-5 text-yellow-600 mr-2" />}
                  <span className={`font-medium ${isWithinRange ? 'text-green-800' : 'text-yellow-800'}`}>
                    {isWithinRange ? '已到达目标范围' : `距离目标：${formatDistance(distance)}`}
                  </span>
                </div>
                {userLocation?.accuracy && <span className="text-sm text-gray-500">
                    精度：±{Math.round(userLocation.accuracy)}米
                  </span>}
              </div>
            </div>}
        </div>

        {/* 定位控制 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h4 className="font-bold text-gray-800 mb-4">定位控制</h4>
          <div className="space-y-4">
            <button onClick={getCurrentLocation} disabled={locating} className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center">
              <Navigation className={`w-5 h-5 mr-2 ${locating ? 'animate-spin' : ''}`} />
              {locating ? '定位中...' : '获取当前位置'}
            </button>
            
            {userLocation && <div className="p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">纬度：</span>
                    <span className="text-gray-800 font-mono">{userLocation.lat.toFixed(6)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">经度：</span>
                    <span className="text-gray-800 font-mono">{userLocation.lng.toFixed(6)}</span>
                  </div>
                </div>
                {userLocation.accuracy && <div className="mt-2 text-sm text-gray-600">
                    定位精度：±{Math.round(userLocation.accuracy)}米
                  </div>}
              </div>}
          </div>
        </div>

        {/* 验证按钮 */}
        {userLocation && <div className="bg-white rounded-xl shadow-lg p-6">
            <button onClick={handleVerifyLocation} disabled={!isWithinRange} className={`w-full py-4 rounded-lg font-medium transition-colors flex items-center justify-center ${isWithinRange ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
              {isWithinRange ? <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  验证位置
                </> : <>
                  <Lock className="w-5 h-5 mr-2" />
                  请靠近目标位置
                </>}
            </button>
            {attempts > 0 && <div className="mt-3 text-center text-sm text-gray-500">
                尝试次数：{attempts}
              </div>}
          </div>}

        {/* 提示信息 */}
        <div className="bg-yellow-50 rounded-xl p-6">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
            <div>
              <h4 className="font-bold text-yellow-800 mb-2">定位提示</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• 请确保手机GPS功能已开启</li>
                <li>• 在开阔区域定位效果更佳</li>
                <li>• 需要到达目标位置{task?.required_range || 50}米范围内</li>
                <li>• 定位精度会影响验证结果</li>
                <li>• 完成后可分享到社交媒体</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>;
}