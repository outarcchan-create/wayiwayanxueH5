// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast, Button } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Clock, Star, CheckCircle, AlertCircle, FileText, RotateCcw, Share2, Download, Trophy } from 'lucide-react';

export default function QuizTaskPage(props) {
  const {
    $w,
    style
  } = props;
  const [task, setTask] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5分钟
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [userTaskRecord, setUserTaskRecord] = useState(null);
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
    if (timeLeft > 0 && !showResult) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      handleSubmitQuiz();
    }
  }, [timeLeft, showResult]);
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
          dataSourceName: 'wyw_task',
          methodName: 'get',
          params: {
            filter: {
              task_id: taskId
            }
          }
        }
      });
      // 获取题目列表
      const questionResult = await $w.cloud.callFunction({
        name: 'callDataSource',
        data: {
          dataSourceName: 'wyw_question',
          methodName: 'list',
          params: {
            filter: {
              task_id: taskId
            },
            sort: {
              question_order: 1
            }
          }
        }
      });
      // 获取用户任务记录
      const userTaskResult = await $w.cloud.callFunction({
        name: 'callDataSource',
        data: {
          dataSourceName: 'wyw_user_task',
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
        setTimeLeft(taskResult.data.time_limit || 300);
      }
      if (questionResult.success && questionResult.data) {
        setQuestions(questionResult.data);
      }
      if (userTaskResult.success && userTaskResult.data) {
        setUserTaskRecord(userTaskResult.data);
        // 如果任务已完成，显示结果
        if (userTaskResult.data.status === 'completed') {
          setShowResult(true);
          setScore(userTaskResult.data.score || 0);
          setAnswers(userTaskResult.data.answers || {});
        } else if (userTaskResult.data.status === 'in_progress') {
          // 恢复答题进度
          setAnswers(userTaskResult.data.answers || {});
          const timeSpent = userTaskResult.data.time_spent || 0;
          const remainingTime = Math.max(0, (taskResult.data?.time_limit || 300) - timeSpent);
          setTimeLeft(remainingTime);
        }
      } else {
        // 创建新的用户任务记录
        const createResult = await $w.cloud.callFunction({
          name: 'callDataSource',
          data: {
            dataSourceName: 'wyw_user_task',
            methodName: 'create',
            data: {
              user_id: userId,
              task_id: taskId,
              activity_id: activityId,
              status: 'in_progress',
              start_time: new Date().toISOString(),
              score: 0,
              points: 0,
              answers: {},
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
      if (!taskResult.success || !questionResult.success) {
        setTask({
          task_id: taskId,
          task_name: '青铜器知识问答',
          task_desc: '测试你对青铜器历史和文化的了解',
          points: 100,
          time_limit: 300
        });
        setQuestions([{
          question_id: 'q1',
          question_text: '青铜器主要流行于哪个朝代？',
          question_type: 'single_choice',
          options: ['夏朝', '商周时期', '秦朝', '汉朝'],
          correct_answer: '商周时期',
          question_order: 1
        }, {
          question_id: 'q2',
          question_text: '以下哪些是青铜器的常见用途？（多选）',
          question_type: 'multiple_choice',
          options: ['礼器', '兵器', '生活用具', '以上都是'],
          correct_answer: ['礼器', '兵器', '生活用具', '以上都是'],
          question_order: 2
        }, {
          question_id: 'q3',
          question_text: '青铜器的主要成分是什么？',
          question_type: 'text',
          correct_answer: '铜锡合金',
          question_order: 3
        }]);
        setTimeLeft(300);
      }
      setStartTime(new Date());
    } catch (error) {
      console.error('加载任务数据失败:', error);
      toast({
        title: "加载失败",
        description: "无法获取题目数据",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
    // 实时保存答案
    saveProgress({
      ...answers,
      [questionId]: value
    });
  };
  const saveProgress = async currentAnswers => {
    try {
      const timeSpent = startTime ? Math.floor((new Date() - startTime) / 1000) : 0;
      await $w.cloud.callFunction({
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
              answers: currentAnswers,
              time_spent: timeSpent
            }
          }
        }
      });
    } catch (error) {
      console.error('保存进度失败:', error);
    }
  };
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSubmitQuiz();
    }
  };
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  const handleSubmitQuiz = async () => {
    if (Object.keys(answers).length < questions.length) {
      toast({
        title: "请完成所有题目",
        variant: "destructive"
      });
      return;
    }
    setSubmitting(true);
    try {
      // 计算得分
      let correctCount = 0;
      const detailedResults = [];
      questions.forEach(question => {
        const userAnswer = answers[question.question_id];
        const correctAnswer = question.correct_answer;
        let isCorrect = false;
        if (question.question_type === 'multiple_choice') {
          if (Array.isArray(userAnswer) && Array.isArray(correctAnswer)) {
            const userSet = new Set(userAnswer);
            const correctSet = new Set(correctAnswer);
            isCorrect = userSet.size === correctSet.size && [...userSet].every(x => correctSet.has(x));
          }
        } else {
          isCorrect = userAnswer === correctAnswer;
        }
        if (isCorrect) {
          correctCount++;
        }
        detailedResults.push({
          questionId: question.question_id,
          userAnswer,
          correctAnswer,
          isCorrect
        });
      });
      const finalScore = Math.round(correctCount / questions.length * 100);
      const timeSpent = startTime ? Math.floor((new Date() - startTime) / 1000) : 0;
      const earnedPoints = Math.round((task?.points || 100) * finalScore / 100);
      setScore(finalScore);
      // 保存答题结果
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
              score: finalScore,
              answers: answers,
              points: earnedPoints,
              time_spent: timeSpent,
              completion_rate: 100,
              attempt_count: (userTaskRecord?.attempt_count || 0) + 1
            }
          }
        }
      });
      if (result.success) {
        setShowResult(true);
        toast({
          title: "答题完成",
          description: `您的得分是${finalScore}分，获得${earnedPoints}积分`
        });
      }
    } catch (error) {
      toast({
        title: "提交失败",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };
  const handleRetakeQuiz = async () => {
    try {
      // 重置任务状态
      await $w.cloud.callFunction({
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
              status: 'in_progress',
              start_time: new Date().toISOString(),
              score: 0,
              points: 0,
              answers: {},
              time_spent: 0,
              attempt_count: (userTaskRecord?.attempt_count || 0) + 1
            }
          }
        }
      });
      // 重置状态
      setCurrentQuestionIndex(0);
      setAnswers({});
      setShowResult(false);
      setScore(0);
      setTimeLeft(task?.time_limit || 300);
      setStartTime(new Date());
      toast({
        title: "重新开始",
        description: "答题已重置"
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
        text: `在博物馆知识问答中获得了${score}分，答对了${Math.round(score / 100 * questions.length)}题，获得${Math.round((task?.points || 100) * score / 100)}积分！快来挑战吧！`,
        url: window.location.href,
        score: score,
        points: Math.round((task?.points || 100) * score / 100),
        correctAnswers: Math.round(score / 100 * questions.length),
        totalQuestions: questions.length
      };

      // 更新分享记录
      await $w.cloud.callFunction({
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
              share_count: (userTaskRecord?.share_count || 0) + 1,
              last_share_time: new Date().toISOString(),
              share_platforms: [...(userTaskRecord?.share_platforms || []), platform]
            }
          }
        }
      });
      if (platform === 'wechat' || platform === 'weibo') {
        // 模拟社交媒体分享
        toast({
          title: "分享成功",
          description: `已分享到${platform === 'wechat' ? '微信' : '微博'}`
        });
      } else if (navigator.share) {
        await navigator.share(shareData);
        toast({
          title: "分享成功",
          description: "答题成绩已分享"
        });
      } else {
        // 复制到剪贴板
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
  const handleDownloadCertificate = async () => {
    try {
      // 模拟生成证书
      const certificateData = {
        userName: $w.auth.currentUser?.nickName || $w.auth.currentUser?.name || '探索者',
        taskName: task?.task_name || '知识问答',
        score: score,
        completedTime: new Date().toLocaleDateString(),
        points: Math.round((task?.points || 100) * score / 100)
      };

      // 这里可以调用生成证书的云函数
      toast({
        title: "证书生成中",
        description: "正在为您生成完成证书..."
      });

      // 模拟下载
      setTimeout(() => {
        toast({
          title: "证书已生成",
          description: "证书已保存到您的相册"
        });
      }, 2000);
    } catch (error) {
      toast({
        title: "生成失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const formatTime = seconds => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };
  const currentQuestion = questions[currentQuestionIndex];
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
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">答题完成！</h2>
          <p className="text-gray-600 mb-6">您的得分是</p>
          <div className="text-5xl font-bold text-blue-600 mb-6">{score}分</div>
          <div className="text-sm text-gray-500 mb-8">
            答对{Math.round(score / 100 * questions.length)}题，共{questions.length}题
          </div>
          <div className="text-lg text-green-600 font-medium mb-8">
            获得{Math.round((task?.points || 100) * score / 100)}积分
          </div>
          
          {/* 分享功能区域 */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">分享成绩</h3>
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
          
          {/* 证书下载 */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">完成证书</h3>
            <button onClick={handleDownloadCertificate} className="w-full py-3 px-4 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center">
              <Download className="w-4 h-4 mr-2" />
              下载证书
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
            <Button onClick={handleRetakeQuiz} variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center">
              <RotateCcw className="w-4 h-4 mr-2" />
              重新答题
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
        
        <div className="relative z-10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => $w.utils.navigateBack()} className="mr-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-yellow-300">答题任务</h1>
              <p className="text-blue-100 text-sm">{task?.task_name || '任务名称'}</p>
            </div>
          </div>
          <div className="flex items-center">
            <Clock className="w-5 h-5 mr-2 text-yellow-300" />
            <span className={`font-mono font-bold ${timeLeft < 60 ? 'text-red-300' : 'text-yellow-300'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </div>

      {/* 进度指示器 */}
      <div className="px-4 py-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">答题进度</span>
            <span className="text-sm text-gray-500">
              {currentQuestionIndex + 1}/{questions.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300" style={{
            width: `${(currentQuestionIndex + 1) / questions.length * 100}%`
          }}></div>
          </div>
        </div>
      </div>

      {/* 题目内容 */}
      {currentQuestion && <div className="px-4 pb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-start mb-4">
              <FileText className="w-6 h-6 text-blue-600 mr-3 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  第{currentQuestionIndex + 1}题
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {currentQuestion.question_text}
                </p>
              </div>
            </div>

            {/* 答题区域 */}
            <div className="mt-6">
              {currentQuestion.question_type === 'single_choice' && <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => <label key={index} className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors">
                      <input type="radio" name={`question-${currentQuestion.question_id}`} value={option} checked={answers[currentQuestion.question_id] === option} onChange={e => handleAnswerChange(currentQuestion.question_id, e.target.value)} className="mr-3" />
                      <span className="text-gray-700">{option}</span>
                    </label>)}
                </div>}

              {currentQuestion.question_type === 'multiple_choice' && <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => <label key={index} className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors">
                      <input type="checkbox" value={option} checked={answers[currentQuestion.question_id]?.includes(option) || false} onChange={e => {
                const currentAnswers = answers[currentQuestion.question_id] || [];
                if (e.target.checked) {
                  handleAnswerChange(currentQuestion.question_id, [...currentAnswers, option]);
                } else {
                  handleAnswerChange(currentQuestion.question_id, currentAnswers.filter(a => a !== option));
                }
              }} className="mr-3" />
                      <span className="text-gray-700">{option}</span>
                    </label>)}
                </div>}

              {currentQuestion.question_type === 'text' && <div>
                  <textarea placeholder="请输入您的答案" value={answers[currentQuestion.question_id] || ''} onChange={e => handleAnswerChange(currentQuestion.question_id, e.target.value)} className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-300 focus:outline-none resize-none" rows={4} />
                </div>}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex space-x-3 mt-6">
            <button onClick={handlePrevQuestion} disabled={currentQuestionIndex === 0} className="flex-1 py-3 px-4 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              上一题
            </button>
            {currentQuestionIndex < questions.length - 1 ? <button onClick={handleNextQuestion} className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                下一题
              </button> : <button onClick={handleSubmitQuiz} disabled={submitting} className="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50">
                {submitting ? '提交中...' : '提交答案'}
              </button>}
          </div>
        </div>}
    </div>;
}