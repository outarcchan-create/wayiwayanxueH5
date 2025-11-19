// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast } from '@/components/ui';
// @ts-ignore;
import { TrendingUp, Users, Trophy, Target, Calendar, Award, ChevronRight, ArrowLeft } from 'lucide-react';

// @ts-ignore;
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
// @ts-ignore;

export default function StatisticsPage(props) {
  const {
    $w,
    style
  } = props;
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    totalActivities: 0,
    completedActivities: 0,
    totalPoints: 0,
    rank: 0,
    totalUsers: 0
  });
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [recentAchievements, setRecentAchievements] = useState([]);
  const {
    toast
  } = useToast();
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
  useEffect(() => {
    loadStatisticsData();
  }, []);
  const loadStatisticsData = async () => {
    try {
      setLoading(true);
      // 获取用户统计数据
      const userActivityResult = await $w.cloud.callFunction({
        name: 'callDataSource',
        data: {
          dataSourceName: 'wyw_user_activity',
          methodName: 'list',
          params: {
            filter: {
              user_id: $w.auth.currentUser?.userId
            },
            limit: 100
          }
        }
      });
      if (userActivityResult.success && userActivityResult.data) {
        const activities = userActivityResult.data;
        const completed = activities.filter(a => a.status === 'completed').length;
        const totalPoints = activities.reduce((sum, a) => sum + (a.points || 0), 0);
        setUserStats({
          totalActivities: activities.length,
          completedActivities: completed,
          totalPoints: totalPoints,
          rank: Math.floor(Math.random() * 100) + 1,
          // 模拟排名
          totalUsers: 1234 // 模拟总用户数
        });

        // 生成月度数据
        const monthlyStats = [];
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          monthlyStats.push({
            month: `${date.getMonth() + 1}月`,
            activities: Math.floor(Math.random() * 10) + 1,
            points: Math.floor(Math.random() * 500) + 100
          });
        }
        setMonthlyData(monthlyStats);

        // 生成分类数据
        setCategoryData([{
          name: '历史文化',
          value: 35,
          color: '#3B82F6'
        }, {
          name: '艺术鉴赏',
          value: 25,
          color: '#10B981'
        }, {
          name: '互动体验',
          value: 20,
          color: '#F59E0B'
        }, {
          name: '解谜挑战',
          value: 20,
          color: '#EF4444'
        }]);

        // 生成排行榜数据
        setTopUsers([{
          rank: 1,
          name: '文化探索者',
          points: 5800,
          avatar: 'https://picsum.photos/seed/user1/50/50.jpg'
        }, {
          rank: 2,
          name: '历史爱好者',
          points: 5200,
          avatar: 'https://picsum.photos/seed/user2/50/50.jpg'
        }, {
          rank: 3,
          name: '博物馆达人',
          points: 4800,
          avatar: 'https://picsum.photos/seed/user3/50/50.jpg'
        }, {
          rank: 4,
          name: $w.auth.currentUser?.nickName || '我',
          points: totalPoints,
          avatar: '',
          isCurrentUser: true
        }, {
          rank: 5,
          name: '文物收藏家',
          points: 3200,
          avatar: 'https://picsum.photos/seed/user5/50/50.jpg'
        }]);

        // 生成最近成就
        setRecentAchievements([{
          name: '初探者',
          description: '完成第一个活动',
          icon: '🎯',
          time: '2024-01-15',
          points: 100
        }, {
          name: '文化学者',
          description: '累计获得1000积分',
          icon: '📚',
          time: '2024-01-18',
          points: 500
        }, {
          name: '探索达人',
          description: '完成10个活动',
          icon: '🏆',
          time: '2024-01-20',
          points: 300
        }]);
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
        
        <div className="relative z-10 px-6 py-4 flex items-center">
          <button onClick={() => $w.utils.navigateBack()} className="mr-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-yellow-300">数据统计</h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* 个人统计卡片 */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
            个人统计
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-2xl font-bold text-blue-700 mb-1">
                {userStats.totalActivities}
              </div>
              <div className="text-sm text-gray-600">参与活动</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="text-2xl font-bold text-green-700 mb-1">
                {userStats.completedActivities}
              </div>
              <div className="text-sm text-gray-600">已完成</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-xl">
              <div className="text-2xl font-bold text-yellow-700 mb-1">
                {userStats.totalPoints}
              </div>
              <div className="text-sm text-gray-600">总积分</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <div className="text-2xl font-bold text-purple-700 mb-1">
                #{userStats.rank}
              </div>
              <div className="text-sm text-gray-600">当前排名</div>
            </div>
          </div>
        </div>

        {/* 月度活动趋势 */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
            月度活动趋势
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="activities" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="points" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 活动分类分布 */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-blue-600" />
            活动分类分布
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label>
                {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {categoryData.map((item, index) => <div key={index} className="flex items-center text-sm">
                <div className="w-3 h-3 rounded-full mr-2" style={{
              backgroundColor: item.color
            }}></div>
                <span className="text-gray-600">{item.name}</span>
                <span className="ml-auto font-medium">{item.value}%</span>
              </div>)}
          </div>
        </div>

        {/* 用户排行榜 */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
            用户排行榜
          </h3>
          <div className="space-y-3">
            {topUsers.map((user, index) => <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${user.isCurrentUser ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}>
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mr-3 ${user.rank <= 3 ? 'bg-yellow-400 text-white' : 'bg-gray-300 text-gray-700'}`}>
                    {user.rank}
                  </div>
                  <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                    {user.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>}
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">
                      {user.name}
                      {user.isCurrentUser && <span className="ml-2 text-xs text-blue-600">(我)</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center text-yellow-600">
                  <Trophy className="w-4 h-4 mr-1 fill-current" />
                  <span className="font-bold">{user.points}</span>
                </div>
              </div>)}
          </div>
        </div>

        {/* 最近成就 */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <Award className="w-5 h-5 mr-2 text-yellow-500" />
            最近成就
          </h3>
          <div className="space-y-3">
            {recentAchievements.map((achievement, index) => <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">{achievement.icon}</div>
                  <div>
                    <div className="font-medium text-gray-800">{achievement.name}</div>
                    <div className="text-sm text-gray-500">{achievement.description}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-yellow-600 font-medium">+{achievement.points}</div>
                  <div className="text-xs text-gray-400">{achievement.time}</div>
                </div>
              </div>)}
          </div>
        </div>
      </div>
    </div>;
}