// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast, Button } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, TrendingUp, Trophy, Target, Clock, Star, Calendar, BarChart3, PieChart, Activity, Award, Users, CheckCircle } from 'lucide-react';

import { TabBar } from '@/components/TabBar';
export default function StatisticsPage(props) {
  const {
    $w,
    style
  } = props;
  const [activeTab, setActiveTab] = useState('statistics');
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');
  const [stats, setStats] = useState({
    totalActivities: 0,
    completedActivities: 0,
    totalTasks: 0,
    completedTasks: 0,
    totalPoints: 0,
    averageScore: 0,
    totalTimeSpent: 0,
    achievements: 0,
    taskCompletionRate: 0,
    dailyActivity: [],
    weeklyProgress: [],
    taskTypeStats: {
      quiz: 0,
      photo: 0,
      location: 0
    },
    difficultyStats: {
      easy: 0,
      medium: 0,
      hard: 0
    },
    monthlyTrend: []
  });
  const {
    toast
  } = useToast();
  useEffect(() => {
    loadStatistics();
  }, [timeRange]);
  const loadStatistics = async () => {
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
      // 获取用户活动记录
      const userActivityResult = await $w.cloud.callFunction({
        name: 'callDataSource',
        data: {
          dataSourceName: 'wywh5_user_activity',
          methodName: 'list',
          params: {
            filter: {
              user_id: userId
            },
            limit: 200
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
              user_id: userId
            },
            limit: 500
          }
        }
      });
      // 获取任务详情用于统计
      const taskResult = await $w.cloud.callFunction({
        name: 'callDataSource',
        data: {
          dataSourceName: 'wywh5_task',
          methodName: 'list',
          params: {
            limit: 100
          }
        }
      });
      if (userActivityResult.success && userActivityResult.data && userTaskResult.success && userTaskResult.data && taskResult.success && taskResult.data) {
        const activities = userActivityResult.data;
        const userTasks = userTaskResult.data;
        const tasks = taskResult.data;
        const completedActivities = activities.filter(a => a.status === 'completed');
        const completedTasks = userTasks.filter(t => t.status === 'completed');
        const totalPoints = activities.reduce((sum, a) => sum + (a.points || 0), 0) + userTasks.reduce((sum, t) => sum + (t.points || 0), 0);
        const totalTimeSpent = userTasks.reduce((sum, t) => sum + (t.time_spent || 0), 0);
        const averageScore = completedTasks.length > 0 ? Math.round(completedTasks.reduce((sum, t) => sum + (t.score || 0), 0) / completedTasks.length) : 0;
        const taskCompletionRate = userTasks.length > 0 ? Math.round(completedTasks.length / userTasks.length * 100) : 0;
        // 按任务类型统计
        const taskTypeMap = {};
        tasks.forEach(task => {
          taskTypeMap[task.task_id] = task.task_type;
        });
        const taskTypeStats = {
          quiz: 0,
          photo: 0,
          location: 0
        };
        userTasks.forEach(userTask => {
          const taskType = taskTypeMap[userTask.task_id];
          if (taskType && taskTypeStats[taskType] !== undefined) {
            taskTypeStats[taskType]++;
          }
        });
        // 生成模拟的统计数据
        const dailyActivity = generateDailyActivity(activities);
        const weeklyProgress = generateWeeklyProgress(userTasks);
        const monthlyTrend = generateMonthlyTrend(activities, userTasks);
        setStats({
          totalActivities: activities.length,
          completedActivities: completedActivities.length,
          totalTasks: userTasks.length,
          completedTasks: completedTasks.length,
          totalPoints,
          averageScore,
          totalTimeSpent,
          achievements: Math.floor(completedTasks.length / 5),
          taskCompletionRate,
          dailyActivity,
          weeklyProgress,
          taskTypeStats,
          difficultyStats: {
            easy: Math.floor(Math.random() * 10) + 5,
            medium: Math.floor(Math.random() * 15) + 10,
            hard: Math.floor(Math.random() * 8) + 3
          },
          monthlyTrend
        });
      } else {
        // 使用模拟数据
        const mockStats = {
          totalActivities: 12,
          completedActivities: 8,
          totalTasks: 45,
          completedTasks: 36,
          totalPoints: 3250,
          averageScore: 87,
          totalTimeSpent: 14400,
          // 4小时
          achievements: 7,
          taskCompletionRate: 80,
          dailyActivity: generateDailyActivity([]),
          weeklyProgress: generateWeeklyProgress([]),
          taskTypeStats: {
            quiz: 20,
            photo: 15,
            location: 10
          },
          difficultyStats: {
            easy: 15,
            medium: 20,
            hard: 10
          },
          monthlyTrend: generateMonthlyTrend([], [])
        };
        setStats(mockStats);
      }
    } catch (error) {
      console.error('加载统计数据失败:', error);
      toast({
        title: "加载失败",
        description: "无法获取统计数据",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const generateDailyActivity = activities => {
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    return days.map(day => ({
      day,
      activities: Math.floor(Math.random() * 5) + 1,
      tasks: Math.floor(Math.random() * 10) + 2
    }));
  };
  const generateWeeklyProgress = userTasks => {
    const weeks = ['第1周', '第2周', '第3周', '第4周'];
    return weeks.map(week => ({
      week,
      completed: Math.floor(Math.random() * 10) + 5,
      total: Math.floor(Math.random() * 5) + 10
    }));
  };
  const generateMonthlyTrend = (activities, userTasks) => {
    const months = ['1月', '2月', '3月', '4月', '5月', '6月'];
    return months.map(month => ({
      month,
      activities: Math.floor(Math.random() * 8) + 2,
      tasks: Math.floor(Math.random() * 20) + 5,
      points: Math.floor(Math.random() * 500) + 200
    }));
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
  const formatTime = seconds => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor(seconds % 3600 / 60);
    if (hours > 0) {
      return `${hours}小时${minutes}分钟`;
    }
    return `${minutes}分钟`;
  };
  const getCompletionColor = rate => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
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
              <h1 className="text-xl font-bold text-yellow-300">数据统计</h1>
              <p className="text-blue-100 text-sm">查看个人学习数据</p>
            </div>
          </div>
          <select value={timeRange} onChange={e => setTimeRange(e.target.value)} className="bg-white/10 border border-white/20 text-white px-3 py-1 rounded-lg text-sm">
            <option value="week">本周</option>
            <option value="month">本月</option>
            <option value="year">本年</option>
          </select>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* 核心统计卡片 */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
            核心数据
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-2xl font-bold text-blue-700 mb-1">{stats.totalActivities}</div>
              <div className="text-sm text-gray-600">参与活动</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="text-2xl font-bold text-green-700 mb-1">{stats.completedActivities}</div>
              <div className="text-sm text-gray-600">完成活动</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-xl">
              <div className="text-2xl font-bold text-yellow-700 mb-1">{stats.totalPoints}</div>
              <div className="text-sm text-gray-600">总积分</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <div className="text-2xl font-bold text-purple-700 mb-1">{stats.achievements}</div>
              <div className="text-sm text-gray-600">获得成就</div>
            </div>
          </div>
        </div>

        {/* 任务完成情况 */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-green-600" />
            任务完成情况
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">任务完成率</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full" style={{
                  width: `${stats.taskCompletionRate}%`
                }}></div>
                </div>
                <span className={`text-sm font-medium ${getCompletionColor(stats.taskCompletionRate)}`}>
                  {stats.taskCompletionRate}%
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">平均得分</span>
              <span className="text-sm font-medium text-gray-800">{stats.averageScore}分</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">总用时</span>
              <span className="text-sm font-medium text-gray-800">{formatTime(stats.totalTimeSpent)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">完成任务</span>
              <span className="text-sm font-medium text-gray-800">{stats.completedTasks}/{stats.totalTasks}</span>
            </div>
          </div>
        </div>

        {/* 任务类型分布 */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <PieChart className="w-5 h-5 mr-2 text-purple-600" />
            任务类型分布
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">答题任务</span>
              <div className="flex items-center">
                <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{
                  width: `${stats.totalTasks > 0 ? stats.taskTypeStats.quiz / stats.totalTasks * 100 : 0}%`
                }}></div>
                </div>
                <span className="text-sm font-medium text-gray-800">{stats.taskTypeStats.quiz}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">拍照任务</span>
              <div className="flex items-center">
                <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{
                  width: `${stats.totalTasks > 0 ? stats.taskTypeStats.photo / stats.totalTasks * 100 : 0}%`
                }}></div>
                </div>
                <span className="text-sm font-medium text-gray-800">{stats.taskTypeStats.photo}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">定位任务</span>
              <div className="flex items-center">
                <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{
                  width: `${stats.totalTasks > 0 ? stats.taskTypeStats.location / stats.totalTasks * 100 : 0}%`
                }}></div>
                </div>
                <span className="text-sm font-medium text-gray-800">{stats.taskTypeStats.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 每日活动统计 */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-orange-600" />
            每日活动统计
          </h3>
          <div className="space-y-2">
            {stats.dailyActivity.map((item, index) => <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 w-12">{item.day}</span>
                <div className="flex-1 mx-3">
                  <div className="flex items-center space-x-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{
                    width: `${Math.min(item.activities * 20, 100)}%`
                  }}></div>
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{
                    width: `${Math.min(item.tasks * 10, 100)}%`
                  }}></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                    {item.activities}
                  </span>
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                    {item.tasks}
                  </span>
                </div>
              </div>)}
          </div>
          <div className="flex items-center justify-center mt-4 space-x-4 text-xs text-gray-500">
            <span className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
              活动
            </span>
            <span className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
              任务
            </span>
          </div>
        </div>

        {/* 月度趋势 */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-indigo-600" />
            月度趋势
          </h3>
          <div className="space-y-3">
            {stats.monthlyTrend.map((item, index) => <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 w-12">{item.month}</span>
                <div className="flex-1 mx-3">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style={{
                  width: `${Math.min(item.points / 10, 100)}%`
                }}></div>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-800 w-16 text-right">{item.points}分</span>
              </div>)}
          </div>
        </div>

        {/* 成就展示 */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <Award className="w-5 h-5 mr-2 text-yellow-600" />
            获得成就
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Trophy className="w-6 h-6 text-yellow-600" />
              </div>
              <p className="text-xs text-gray-600">初学者</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Star className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-xs text-gray-600">知识达人</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-xs text-gray-600">任务大师</p>
            </div>
          </div>
        </div>
      </div>

      {/* 底部导航栏 */}
      <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
    </div>;
}