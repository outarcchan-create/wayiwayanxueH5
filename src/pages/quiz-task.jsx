// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast, Button } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Clock, Star, CheckCircle, AlertCircle, FileText } from 'lucide-react';

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
      if (taskResult.success && taskResult.data) {
        setTask(taskResult.data);
      }
      if (questionResult.success && questionResult.data) {
        setQuestions(questionResult.data);
      } else {
        // 使用模拟数据
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
      questions.forEach(question => {
        const userAnswer = answers[question.question_id];
        const correctAnswer = question.correct_answer;
        if (question.question_type === 'multiple_choice') {
          if (Array.isArray(userAnswer) && Array.isArray(correctAnswer)) {
            const userSet = new Set(userAnswer);
            const correctSet = new Set(correctAnswer);
            if (userSet.size === correctSet.size && [...userSet].every(x => correctSet.has(x))) {
              correctCount++;
            }
          }
        } else {
          if (userAnswer === correctAnswer) {
            correctCount++;
          }
        }
      });
      const finalScore = Math.round(correctCount / questions.length * 100);
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
              points: Math.round(task.points * finalScore / 100)
            }
          }
        }
      });
      if (result.success) {
        setShowResult(true);
        toast({
          title: "答题完成",
          description: `您的得分是${finalScore}分`
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
            <Star className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">答题完成！</h2>
          <p className="text-gray-600 mb-6">您的得分是</p>
          <div className="text-5xl font-bold text-blue-600 mb-6">{score}分</div>
          <div className="text-sm text-gray-500 mb-8">
            答对{Math.round(score / 100 * questions.length)}题，共{questions.length}题
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