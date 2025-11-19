// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast, Button } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Camera, Upload, CheckCircle, AlertCircle, MapPin, Star, RefreshCw } from 'lucide-react';

export default function PhotoTaskPage(props) {
  const {
    $w,
    style
  } = props;
  const [task, setTask] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showResult, setShowResult] = useState(false);
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
  const loadTaskData = async () => {
    try {
      setLoading(true);
      const result = await $w.cloud.callFunction({
        name: 'callDataSource',
        data: {
          dataSourceName: 'wyw_task',
          methodName: 'get',
          params: {
            filter: {
              task_id: taskId
            }
          }
        }
      });
      if (result.success && result.data) {
        setTask(result.data);
      } else {
        // 使用模拟数据
        setTask({
          task_id: taskId,
          task_name: '寻找镇馆之宝',
          task_desc: '找到并拍摄博物馆的镇馆之宝 - 四羊方尊',
          location_name: '中央大厅',
          target_description: '四羊方尊是中国商代晚期青铜礼器，是现存商代青铜方尊中最大的一件',
          points: 150,
          photo_example: 'https://picsum.photos/seed/bronze-vessel/300/200.jpg'
        });
      }
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
  const handleTakePhoto = () => {
    // 模拟拍照功能
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'camera';
    input.onchange = e => {
      const file = e.target.files[0];
      if (file) {
        handlePhotoSelect(file);
      }
    };
    input.click();
  };
  const handlePhotoSelect = file => {
    if (file.size > 10 * 1024 * 1024) {
      // 10MB限制
      toast({
        title: "文件过大",
        description: "请选择小于10MB的图片",
        variant: "destructive"
      });
      return;
    }
    setPhoto(file);
    const reader = new FileReader();
    reader.onload = e => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };
  const handleUploadPhoto = async () => {
    if (!photo) {
      toast({
        title: "请先拍照",
        variant: "destructive"
      });
      return;
    }
    setUploading(true);
    try {
      // 上传图片到云存储
      const tcb = await $w.cloud.getCloudInstance();
      const uploadResult = await tcb.uploadFile({
        cloudPath: `task-photos/${$w.auth.currentUser?.userId}/${taskId}/${Date.now()}.jpg`,
        filePath: photo
      });
      if (uploadResult.fileID) {
        // 获取图片URL
        const urlResult = await tcb.getTempFileURL({
          fileList: [uploadResult.fileID]
        });
        const photoUrl = urlResult.fileList[0].tempFileURL;
        // 保存任务完成记录
        const result = await $w.cloud.callFunction({
          name: 'callDataSource',
          data: {
            dataSourceName: 'wyw_user_task',
            methodName: 'update',
            params: {
              filter: {
                user_id: $w.auth.currentUser?.userId,
                task_id: taskId
              },
              data: {
                status: 'completed',
                completed_time: new Date().toISOString(),
                photo_url: photoUrl,
                points: task.points
              }
            }
          }
        });
        if (result.success) {
          setShowResult(true);
          toast({
            title: "上传成功",
            description: "照片已成功上传"
          });
        }
      }
    } catch (error) {
      toast({
        title: "上传失败",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };
  const handleRetakePhoto = () => {
    setPhoto(null);
    setPreview(null);
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
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">拍照完成！</h2>
          <p className="text-gray-600 mb-6">您已成功完成拍照任务</p>
          <div className="text-lg text-blue-600 font-medium mb-8">
            获得{task?.points || 0}积分
          </div>
          <Button onClick={() => $w.utils.navigateTo({
          pageId: 'activity-map',
          params: {
            activityId: activityId
          }
        })} className="bg-blue-600 hover:bg-blue-700">
            返回活动地图
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
        
        <div className="relative z-10 px-6 py-4 flex items-center">
          <button onClick={() => $w.utils.navigateBack()} className="mr-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-yellow-300">拍照任务</h1>
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
            <span>地点：{task?.location_name || '未知地点'}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 mt-2">
            <Star className="w-4 h-4 mr-2 text-yellow-500" />
            <span>奖励：{task?.points || 0}积分</span>
          </div>
        </div>

        {/* 目标描述 */}
        {task?.target_description && <div className="bg-blue-50 rounded-xl p-6">
            <h4 className="font-bold text-blue-800 mb-2">拍摄目标</h4>
            <p className="text-blue-700 text-sm leading-relaxed">
              {task.target_description}
            </p>
          </div>}

        {/* 示例图片 */}
        {task?.photo_example && <div className="bg-white rounded-xl shadow-lg p-6">
            <h4 className="font-bold text-gray-800 mb-4">参考示例</h4>
            <div className="relative rounded-lg overflow-hidden">
              <img src={task.photo_example} alt="参考示例" className="w-full h-48 object-cover" />
              <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-xs">
                示例图片
              </div>
            </div>
          </div>}

        {/* 拍照区域 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h4 className="font-bold text-gray-800 mb-4">拍摄照片</h4>
          {preview ? <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden">
                <img src={preview} alt="拍摄的照片" className="w-full h-64 object-cover" />
                <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded text-xs flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  已拍摄
                </div>
              </div>
              <div className="flex space-x-3">
                <button onClick={handleRetakePhoto} className="flex-1 py-3 px-4 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  重新拍摄
                </button>
                <button onClick={handleUploadPhoto} disabled={uploading} className="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center">
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? '上传中...' : '上传照片'}
                </button>
              </div>
            </div> : <div className="text-center py-8">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-600 mb-6">请拍摄目标文物的照片</p>
              <button onClick={handleTakePhoto} className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center">
                <Camera className="w-5 h-5 mr-2" />
                开始拍照
              </button>
            </div>}
        </div>

        {/* 拍照提示 */}
        <div className="bg-yellow-50 rounded-xl p-6">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
            <div>
              <h4 className="font-bold text-yellow-800 mb-2">拍照提示</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• 请确保文物清晰可见</li>
                <li>• 避免使用闪光灯</li>
                <li>• 请遵守博物馆拍照规定</li>
                <li>• 照片大小不超过10MB</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>;
}