// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast, Button, Input } from '@/components/ui';
// @ts-ignore;
import { Eye, EyeOff, Phone, Lock, Mail, User, ArrowLeft, Shield } from 'lucide-react';

export default function LoginPage(props) {
  const {
    $w,
    style
  } = props;
  const [loginType, setLoginType] = useState('phone'); // 'phone' | 'password'
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    confirmPassword: '',
    verifyCode: '',
    nickname: ''
  });
  const [countdown, setCountdown] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const {
    toast
  } = useToast();
  useEffect(() => {
    // 检查是否已登录
    const checkLoginStatus = async () => {
      try {
        const result = await $w.cloud.callFunction({
          name: 'checkLoginStatus',
          data: {}
        });
        if (result.success && result.data.isLoggedIn) {
          // 已登录，跳转到首页
          $w.utils.navigateTo({
            pageId: 'home',
            params: {}
          });
        }
      } catch (error) {
        console.log('检查登录状态失败:', error);
      }
    };
    checkLoginStatus();
  }, []);
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const validateForm = () => {
    if (isRegister) {
      if (!formData.phone || !formData.verifyCode || !formData.nickname) {
        toast({
          title: "请填写完整信息",
          variant: "destructive"
        });
        return false;
      }
      if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
        toast({
          title: "请输入正确的手机号",
          variant: "destructive"
        });
        return false;
      }
      if (formData.nickname.length < 2 || formData.nickname.length > 20) {
        toast({
          title: "昵称长度应在2-20个字符之间",
          variant: "destructive"
        });
        return false;
      }
    } else {
      if (loginType === 'phone') {
        if (!formData.phone || !formData.verifyCode) {
          toast({
            title: "请填写手机号和验证码",
            variant: "destructive"
          });
          return false;
        }
      } else {
        if (!formData.phone || !formData.password) {
          toast({
            title: "请填写手机号和密码",
            variant: "destructive"
          });
          return false;
        }
        if (formData.password.length < 6) {
          toast({
            title: "密码长度不能少于6位",
            variant: "destructive"
          });
          return false;
        }
      }
    }
    return true;
  };
  const handleSendVerifyCode = async () => {
    if (!formData.phone) {
      toast({
        title: "请输入手机号",
        variant: "destructive"
      });
      return;
    }
    if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      toast({
        title: "请输入正确的手机号",
        variant: "destructive"
      });
      return;
    }
    try {
      await $w.cloud.callFunction({
        name: 'sendVerifyCode',
        data: {
          phone: formData.phone,
          type: isRegister ? 'register' : 'login'
        }
      });
      toast({
        title: "验证码已发送",
        description: "请查看您的短信"
      });

      // 开始倒计时
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      toast({
        title: "发送失败",
        description: error.message || "请稍后重试",
        variant: "destructive"
      });
    }
  };
  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const apiName = isRegister ? 'register' : loginType === 'phone' ? 'loginByPhone' : 'loginByPassword';
      const result = await $w.cloud.callFunction({
        name: apiName,
        data: formData
      });
      if (result.success) {
        toast({
          title: isRegister ? "注册成功" : "登录成功"
        });

        // 跳转到首页
        $w.utils.navigateTo({
          pageId: 'home',
          params: {}
        });
      } else {
        toast({
          title: result.message || (isRegister ? "注册失败" : "登录失败"),
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "操作失败",
        description: error.message || "请稍后重试",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };
  const handleSwitchMode = () => {
    setIsRegister(!isRegister);
    setFormData({
      phone: '',
      password: '',
      confirmPassword: '',
      verifyCode: '',
      nickname: ''
    });
    setCountdown(0);
  };
  return <div style={style} className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* 顶部装饰区域 */}
      <div className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white overflow-hidden">
        {/* 青铜纹样装饰 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-32 h-32 border-4 border-yellow-400 rounded-full transform -translate-x-16 -translate-y-16"></div>
          <div className="absolute top-10 right-10 w-24 h-24 border-4 border-yellow-400 rounded-lg transform rotate-45"></div>
          <div className="absolute bottom-0 left-20 w-40 h-40 border-4 border-yellow-400 rounded-full transform translate-y-20"></div>
        </div>
        
        <div className="relative z-10 px-6 py-8">
          <div className="flex items-center mb-4">
            <button onClick={() => $w.utils.navigateBack()} className="mr-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-yellow-300">
              {isRegister ? "注册账号" : "登录账号"}
            </h1>
          </div>
          <p className="text-blue-100 text-sm">
            {isRegister ? "加入挖一挖博物馆，开启探索之旅" : "欢迎回来，继续您的文化探索"}
          </p>
        </div>
      </div>

      {/* 登录表单区域 */}
      <div className="px-6 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {!isRegister && <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
              <button onClick={() => setLoginType('phone')} className={`flex-1 py-2 px-4 rounded-md transition-all duration-200 ${loginType === 'phone' ? 'bg-white text-blue-700 shadow-sm font-medium' : 'text-gray-600'}`}>
                验证码登录
              </button>
              <button onClick={() => setLoginType('password')} className={`flex-1 py-2 px-4 rounded-md transition-all duration-200 ${loginType === 'password' ? 'bg-white text-blue-700 shadow-sm font-medium' : 'text-gray-600'}`}>
                密码登录
              </button>
            </div>}

          <div className="space-y-4">
            {/* 手机号输入 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                手机号
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input type="tel" placeholder="请输入手机号" value={formData.phone} onChange={e => handleInputChange('phone', e.target.value)} className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500" maxLength={11} />
              </div>
            </div>

            {/* 注册时的昵称输入 */}
            {isRegister && <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  昵称
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input type="text" placeholder="请输入昵称" value={formData.nickname} onChange={e => handleInputChange('nickname', e.target.value)} className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500" maxLength={20} />
                </div>
              </div>}

            {/* 验证码输入 */}
            {(loginType === 'phone' || isRegister) && <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  验证码
                </label>
                <div className="flex space-x-3">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input type="text" placeholder="请输入验证码" value={formData.verifyCode} onChange={e => handleInputChange('verifyCode', e.target.value)} className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500" maxLength={6} />
                  </div>
                  <Button onClick={handleSendVerifyCode} disabled={countdown > 0 || !formData.phone} variant="outline" className="h-12 px-6 border-blue-500 text-blue-600 hover:bg-blue-50 disabled:opacity-50">
                    {countdown > 0 ? `${countdown}s` : '获取验证码'}
                  </Button>
                </div>
              </div>}

            {/* 密码输入 */}
            {loginType === 'password' && !isRegister && <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  密码
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input type={showPassword ? "text" : "password"} placeholder="请输入密码" value={formData.password} onChange={e => handleInputChange('password', e.target.value)} className="pl-10 pr-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
                  <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>}

            {/* 注册时的确认密码 */}
            {isRegister && <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  确认密码
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input type={showConfirmPassword ? "text" : "password"} placeholder="请再次输入密码" value={formData.confirmPassword} onChange={e => handleInputChange('confirmPassword', e.target.value)} className="pl-10 pr-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
                  <button onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>}
          </div>

          {/* 提交按钮 */}
          <Button onClick={handleSubmit} disabled={submitting} className="w-full h-12 mt-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50">
            {submitting ? '处理中...' : isRegister ? "立即注册" : "登录"}
          </Button>

          {/* 切换注册/登录 */}
          <div className="text-center mt-6">
            <span className="text-gray-600">
              {isRegister ? "已有账号？" : "还没有账号？"}
            </span>
            <button onClick={handleSwitchMode} className="ml-1 text-blue-600 font-medium hover:text-blue-700">
              {isRegister ? "立即登录" : "立即注册"}
            </button>
          </div>

          {/* 安全提示 */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-start">
            <Shield className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-xs text-blue-700">
              您的信息将被严格保密，我们承诺保护您的隐私安全
            </p>
          </div>

          {/* 忘记密码 */}
          {!isRegister && loginType === 'password' && <div className="text-center mt-4">
              <button onClick={() => $w.utils.navigateTo({
            pageId: 'reset-password',
            params: {}
          })} className="text-gray-500 text-sm hover:text-gray-700">
                忘记密码？
              </button>
            </div>}
        </div>
      </div>
    </div>;
}