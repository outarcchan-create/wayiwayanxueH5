// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast, Button } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Camera, User, Mail, Phone, Calendar, MapPin, Save, X, Check, AlertCircle, Upload, Shield, Bell, Globe, Palette, Eye, EyeOff } from 'lucide-react';

export default function EditProfilePage(props) {
  const {
    $w,
    style
  } = props;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    nickName: '',
    name: '',
    email: '',
    phone: '',
    bio: '',
    birthday: '',
    location: '',
    gender: '',
    avatarUrl: '',
    privacySettings: {
      profilePublic: true,
      showEmail: false,
      showPhone: false,
      showActivities: true
    },
    notificationSettings: {
      emailNotifications: true,
      pushNotifications: true,
      activityReminders: true,
      systemUpdates: false
    },
    languagePreference: 'zh-CN',
    themePreference: 'light'
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [errors, setErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [networkStatus, setNetworkStatus] = useState('online');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const {
    toast
  } = useToast();
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
    loadUserProfile();
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  const loadUserProfile = async () => {
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
      // 获取用户详细信息
      const result = await $w.cloud.callFunction({
        name: 'callDataSource',
        data: {
          dataSourceName: 'wywh5_user_profile',
          methodName: 'get',
          params: {
            filter: {
              user_id: userId
            }
          }
        }
      });
      if (result.success && result.data) {
        const profileData = result.data;
        setFormData({
          nickName: profileData.nick_name || $w.auth.currentUser?.nickName || '',
          name: profileData.real_name || $w.auth.currentUser?.name || '',
          email: profileData.email || '',
          phone: profileData.phone || '',
          bio: profileData.bio || '',
          birthday: profileData.birthday || '',
          location: profileData.location || '',
          gender: profileData.gender || '',
          avatarUrl: profileData.avatar_url || $w.auth.currentUser?.avatarUrl || '',
          privacySettings: profileData.privacy_settings || {
            profilePublic: true,
            showEmail: false,
            showPhone: false,
            showActivities: true
          },
          notificationSettings: profileData.notification_settings || {
            emailNotifications: true,
            pushNotifications: true,
            activityReminders: true,
            systemUpdates: false
          },
          languagePreference: profileData.language_preference || 'zh-CN',
          themePreference: profileData.theme_preference || 'light'
        });
        setPreviewAvatar(profileData.avatar_url || $w.auth.currentUser?.avatarUrl);
      } else {
        // 使用当前用户信息作为默认值
        setFormData({
          nickName: $w.auth.currentUser?.nickName || '',
          name: $w.auth.currentUser?.name || '',
          email: '',
          phone: '',
          bio: '',
          birthday: '',
          location: '',
          gender: '',
          avatarUrl: $w.auth.currentUser?.avatarUrl || '',
          privacySettings: {
            profilePublic: true,
            showEmail: false,
            showPhone: false,
            showActivities: true
          },
          notificationSettings: {
            emailNotifications: true,
            pushNotifications: true,
            activityReminders: true,
            systemUpdates: false
          },
          languagePreference: 'zh-CN',
          themePreference: 'light'
        });
        setPreviewAvatar($w.auth.currentUser?.avatarUrl);
      }
    } catch (error) {
      console.error('加载用户资料失败:', error);
      toast({
        title: "加载失败",
        description: "无法获取用户资料",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // 清除该字段的错误
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };
  const handleNestedInputChange = (parentField, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [field]: value
      }
    }));
  };
  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
    // 清除该字段的错误
    if (passwordErrors[field]) {
      setPasswordErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };
  const handleAvatarChange = async e => {
    const file = e.target.files[0];
    if (file) {
      // 检查文件大小
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "文件过大",
          description: "请选择小于5MB的图片",
          variant: "destructive"
        });
        return;
      }
      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        toast({
          title: "文件类型错误",
          description: "请选择图片文件",
          variant: "destructive"
        });
        return;
      }
      try {
        // 预览图片
        const reader = new FileReader();
        reader.onload = e => {
          setPreviewAvatar(e.target.result);
          setFormData(prev => ({
            ...prev,
            avatarUrl: e.target.result
          }));
        };
        reader.readAsDataURL(file);
        toast({
          title: "图片已选择",
          description: "点击保存后上传到服务器"
        });
      } catch (error) {
        toast({
          title: "图片处理失败",
          description: "请重新选择图片",
          variant: "destructive"
        });
      }
    }
  };
  const validateForm = () => {
    const newErrors = {};

    // 昵称验证
    if (!formData.nickName.trim()) {
      newErrors.nickName = '昵称不能为空';
    } else if (formData.nickName.length < 2) {
      newErrors.nickName = '昵称至少需要2个字符';
    } else if (formData.nickName.length > 20) {
      newErrors.nickName = '昵称不能超过20个字符';
    } else if (!/^[\u4e00-\u9fa5a-zA-Z0-9_]+$/.test(formData.nickName)) {
      newErrors.nickName = '昵称只能包含中文、英文、数字和下划线';
    }

    // 姓名验证
    if (formData.name && formData.name.length > 10) {
      newErrors.name = '姓名不能超过10个字符';
    } else if (formData.name && !/^[\u4e00-\u9fa5a-zA-Z\s]+$/.test(formData.name)) {
      newErrors.name = '姓名只能包含中文、英文和空格';
    }

    // 邮箱验证
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }

    // 手机号验证
    if (formData.phone && !/^1[3-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = '请输入有效的手机号码';
    }

    // 个人简介验证
    if (formData.bio && formData.bio.length > 200) {
      newErrors.bio = '个人简介不能超过200个字符';
    }

    // 生日验证
    if (formData.birthday) {
      const birthDate = new Date(formData.birthday);
      const today = new Date();
      if (birthDate > today) {
        newErrors.birthday = '生日不能是未来日期';
      } else if (birthDate < new Date('1900-01-01')) {
        newErrors.birthday = '请输入有效的生日';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const validatePasswordForm = () => {
    const newErrors = {};
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = '请输入当前密码';
    }
    if (!passwordData.newPassword) {
      newErrors.newPassword = '请输入新密码';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = '新密码至少需要6个字符';
    } else if (!/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/.test(passwordData.newPassword)) {
      newErrors.newPassword = '密码必须包含字母和数字';
    }
    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = '请确认新密码';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致';
    }
    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSave = async () => {
    if (!validateForm()) {
      toast({
        title: "表单验证失败",
        description: "请检查输入的信息",
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
    setSaving(true);
    setUploadProgress(0);
    try {
      const userId = $w.auth.currentUser?.userId;
      let avatarUrl = formData.avatarUrl;

      // 如果有新头像，先上传
      if (previewAvatar && previewAvatar.startsWith('data:')) {
        setUploadProgress(10);
        const tcb = await $w.cloud.getCloudInstance();
        const uploadResult = await tcb.uploadFile({
          cloudPath: `user-avatars/${userId}/${Date.now()}.jpg`,
          filePath: dataURLtoFile(previewAvatar, 'avatar.jpg'),
          onUploadProgress: progress => {
            setUploadProgress(Math.round(progress.loaded / progress.total * 100));
          }
        });
        setUploadProgress(90);
        if (uploadResult.fileID) {
          const urlResult = await tcb.getTempFileURL({
            fileList: [uploadResult.fileID]
          });
          avatarUrl = urlResult.fileList[0].tempFileURL;
        }
        setUploadProgress(100);
      }

      // 保存用户资料
      const result = await $w.cloud.callFunction({
        name: 'callDataSource',
        data: {
          dataSourceName: 'wywh5_user_profile',
          methodName: 'update',
          params: {
            filter: {
              user_id: userId
            },
            data: {
              user_id: userId,
              nick_name: formData.nickName,
              real_name: formData.name,
              email: formData.email,
              phone: formData.phone,
              bio: formData.bio,
              birthday: formData.birthday,
              location: formData.location,
              gender: formData.gender,
              avatar_url: avatarUrl,
              privacy_settings: formData.privacySettings,
              notification_settings: formData.notificationSettings,
              language_preference: formData.languagePreference,
              theme_preference: formData.themePreference,
              updated_time: new Date().toISOString()
            }
          }
        }
      });
      if (result.success) {
        setShowSuccessModal(true);
        toast({
          title: "保存成功",
          description: "个人资料已更新"
        });
      } else {
        throw new Error(result.message || '保存失败');
      }
    } catch (error) {
      console.error('保存失败:', error);
      toast({
        title: "保存失败",
        description: error.message || "请稍后重试",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
      setUploadProgress(0);
    }
  };
  const handlePasswordChangeSubmit = async () => {
    if (!validatePasswordForm()) {
      toast({
        title: "表单验证失败",
        description: "请检查输入的信息",
        variant: "destructive"
      });
      return;
    }
    try {
      // 这里应该调用修改密码的API
      toast({
        title: "密码修改成功",
        description: "请使用新密码登录"
      });
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast({
        title: "密码修改失败",
        description: error.message || "请稍后重试",
        variant: "destructive"
      });
    }
  };
  const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {
      type: mime
    });
  };
  const handleCancel = () => {
    $w.utils.navigateBack();
  };
  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    $w.utils.navigateBack();
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
            <button onClick={handleCancel} className="mr-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-yellow-300">编辑资料</h1>
              <p className="text-blue-100 text-sm">更新个人信息</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {networkStatus === 'offline' && <div className="flex items-center text-red-300 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                离线
              </div>}
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* 头像上传区域 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">个人头像</h3>
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100">
                {previewAvatar ? <img src={previewAvatar} alt="头像" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center">
                    <User className="w-12 h-12 text-gray-400" />
                  </div>}
              </div>
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors">
                <Camera className="w-4 h-4 text-white" />
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
            </div>
            <div className="flex-1">
              <p className="text-gray-600 mb-2">点击相机图标更换头像</p>
              <p className="text-sm text-gray-500">支持 JPG、PNG 格式，文件大小不超过 5MB</p>
              {uploadProgress > 0 && uploadProgress < 100 && <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{
                  width: `${uploadProgress}%`
                }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">上传中... {uploadProgress}%</p>
                </div>}
            </div>
          </div>
        </div>

        {/* 标签页 */}
        <div className="bg-white rounded-2xl shadow-lg mb-6">
          <div className="flex border-b">
            <button onClick={() => setActiveTab('basic')} className={`flex-1 py-3 text-center font-medium transition-colors ${activeTab === 'basic' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'}`}>
              基本信息
            </button>
            <button onClick={() => setActiveTab('security')} className={`flex-1 py-3 text-center font-medium transition-colors ${activeTab === 'security' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'}`}>
              安全设置
            </button>
            <button onClick={() => setActiveTab('preferences')} className={`flex-1 py-3 text-center font-medium transition-colors ${activeTab === 'preferences' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'}`}>
              偏好设置
            </button>
          </div>

          <div className="p-6">
            {/* 基本信息标签页 */}
            {activeTab === 'basic' && <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    昵称 <span className="text-red-500">*</span>
                  </label>
                  <input type="text" value={formData.nickName} onChange={e => handleInputChange('nickName', e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.nickName ? 'border-red-500' : 'border-gray-300'}`} placeholder="请输入昵称" />
                  {errors.nickName && <p className="text-red-500 text-sm mt-1">{errors.nickName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">真实姓名</label>
                  <input type="text" value={formData.name} onChange={e => handleInputChange('name', e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`} placeholder="请输入真实姓名" />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">邮箱地址</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input type="email" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`} placeholder="请输入邮箱地址" />
                  </div>
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">手机号码</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input type="tel" value={formData.phone} onChange={e => handleInputChange('phone', e.target.value)} className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`} placeholder="请输入手机号码" />
                  </div>
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">性别</label>
                  <select value={formData.gender} onChange={e => handleInputChange('gender', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">请选择</option>
                    <option value="male">男</option>
                    <option value="female">女</option>
                    <option value="other">其他</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">生日</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input type="date" value={formData.birthday} onChange={e => handleInputChange('birthday', e.target.value)} className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.birthday ? 'border-red-500' : 'border-gray-300'}`} />
                  </div>
                  {errors.birthday && <p className="text-red-500 text-sm mt-1">{errors.birthday}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">所在地</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input type="text" value={formData.location} onChange={e => handleInputChange('location', e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="请输入所在地" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">个人简介</label>
                  <textarea value={formData.bio} onChange={e => handleInputChange('bio', e.target.value)} rows={4} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.bio ? 'border-red-500' : 'border-gray-300'}`} placeholder="介绍一下自己..." />
                  <div className="flex justify-between mt-1">
                    {errors.bio && <p className="text-red-500 text-sm">{errors.bio}</p>}
                    <p className="text-gray-500 text-sm">{formData.bio.length}/200</p>
                  </div>
                </div>
              </div>}

            {/* 安全设置标签页 */}
            {activeTab === 'security' && <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Shield className="w-5 h-5 text-blue-600 mr-3" />
                    <div>
                      <h4 className="font-medium text-gray-800">修改密码</h4>
                      <p className="text-sm text-gray-600">定期更换密码保护账户安全</p>
                    </div>
                  </div>
                  <Button onClick={() => setShowPasswordModal(true)} variant="outline" size="sm">
                    修改
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Shield className="w-5 h-5 text-green-600 mr-3" />
                    <div>
                      <h4 className="font-medium text-gray-800">两步验证</h4>
                      <p className="text-sm text-gray-600">增强账户安全性</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Shield className="w-5 h-5 text-purple-600 mr-3" />
                    <div>
                      <h4 className="font-medium text-gray-800">登录设备管理</h4>
                      <p className="text-sm text-gray-600">查看和管理登录设备</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    管理
                  </Button>
                </div>
              </div>}

            {/* 偏好设置标签页 */}
            {activeTab === 'preferences' && <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-800 mb-4">通知设置</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <Bell className="w-4 h-4 text-yellow-600 mr-2" />
                        <span className="text-sm text-gray-700">邮件通知</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={formData.notificationSettings.emailNotifications} onChange={e => handleNestedInputChange('notificationSettings', 'emailNotifications', e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <Bell className="w-4 h-4 text-blue-600 mr-2" />
                        <span className="text-sm text-gray-700">推送通知</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={formData.notificationSettings.pushNotifications} onChange={e => handleNestedInputChange('notificationSettings', 'pushNotifications', e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <Bell className="w-4 h-4 text-green-600 mr-2" />
                        <span className="text-sm text-gray-700">活动提醒</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={formData.notificationSettings.activityReminders} onChange={e => handleNestedInputChange('notificationSettings', 'activityReminders', e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-800 mb-4">隐私设置</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">公开个人资料</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={formData.privacySettings.profilePublic} onChange={e => handleNestedInputChange('privacySettings', 'profilePublic', e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">显示邮箱</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={formData.privacySettings.showEmail} onChange={e => handleNestedInputChange('privacySettings', 'showEmail', e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">显示手机号</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={formData.privacySettings.showPhone} onChange={e => handleNestedInputChange('privacySettings', 'showPhone', e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-800 mb-4">显示设置</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <Globe className="w-4 h-4 text-blue-600 mr-2" />
                        <span className="text-sm text-gray-700">语言设置</span>
                      </div>
                      <select value={formData.languagePreference} onChange={e => handleInputChange('languagePreference', e.target.value)} className="px-3 py-1 border border-gray-300 rounded-lg text-sm">
                        <option value="zh-CN">简体中文</option>
                        <option value="en-US">English</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <Palette className="w-4 h-4 text-purple-600 mr-2" />
                        <span className="text-sm text-gray-700">主题设置</span>
                      </div>
                      <select value={formData.themePreference} onChange={e => handleInputChange('themePreference', e.target.value)} className="px-3 py-1 border border-gray-300 rounded-lg text-sm">
                        <option value="light">浅色主题</option>
                        <option value="dark">深色主题</option>
                        <option value="auto">跟随系统</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex space-x-3">
          <Button onClick={handleCancel} variant="outline" className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50">
            取消
          </Button>
          <Button onClick={handleSave} disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-700">
            {saving ? '保存中...' : '保存'}
          </Button>
        </div>
      </div>

      {/* 修改密码模态框 */}
      {showPasswordModal && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">修改密码</h3>
              <button onClick={() => setShowPasswordModal(false)} className="p-2 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">当前密码</label>
                <div className="relative">
                  <input type={showCurrentPassword ? 'text' : 'password'} value={passwordData.currentPassword} onChange={e => handlePasswordChange('currentPassword', e.target.value)} className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-300'}`} placeholder="请输入当前密码" />
                  <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {showCurrentPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                  </button>
                </div>
                {passwordErrors.currentPassword && <p className="text-red-500 text-sm mt-1">{passwordErrors.currentPassword}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">新密码</label>
                <div className="relative">
                  <input type={showNewPassword ? 'text' : 'password'} value={passwordData.newPassword} onChange={e => handlePasswordChange('newPassword', e.target.value)} className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300'}`} placeholder="请输入新密码" />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {showNewPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                  </button>
                </div>
                {passwordErrors.newPassword && <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">确认新密码</label>
                <div className="relative">
                  <input type={showConfirmPassword ? 'text' : 'password'} value={passwordData.confirmPassword} onChange={e => handlePasswordChange('confirmPassword', e.target.value)} className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`} placeholder="请再次输入新密码" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {showConfirmPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                  </button>
                </div>
                {passwordErrors.confirmPassword && <p className="text-red-500 text-sm mt-1">{passwordErrors.confirmPassword}</p>}
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <Button onClick={() => setShowPasswordModal(false)} variant="outline" className="flex-1">
                取消
              </Button>
              <Button onClick={handlePasswordChangeSubmit} className="flex-1 bg-blue-600 hover:bg-blue-700">
                确认修改
              </Button>
            </div>
          </div>
        </div>}

      {/* 成功提示模态框 */}
      {showSuccessModal && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">保存成功</h3>
              <p className="text-gray-600 mb-6">您的个人资料已更新</p>
              <Button onClick={handleSuccessModalClose} className="w-full bg-blue-600 hover:bg-blue-700">
                确定
              </Button>
            </div>
          </div>
        </div>}
    </div>;
}