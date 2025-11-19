import HOME from '../pages/home.jsx';
import LOGIN from '../pages/login.jsx';
import ACTIVITY_DETAIL from '../pages/activity-detail.jsx';
import PROFILE from '../pages/profile.jsx';
import MY_ACTIVITIES from '../pages/my-activities.jsx';
import STATISTICS from '../pages/statistics.jsx';
import ACTIVITY_MAP from '../pages/activity-map.jsx';
import QUIZ_TASK from '../pages/quiz-task.jsx';
import PHOTO_TASK from '../pages/photo-task.jsx';
export const routers = [{
  id: "home",
  component: HOME
}, {
  id: "login",
  component: LOGIN
}, {
  id: "activity-detail",
  component: ACTIVITY_DETAIL
}, {
  id: "profile",
  component: PROFILE
}, {
  id: "my-activities",
  component: MY_ACTIVITIES
}, {
  id: "statistics",
  component: STATISTICS
}, {
  id: "activity-map",
  component: ACTIVITY_MAP
}, {
  id: "quiz-task",
  component: QUIZ_TASK
}, {
  id: "photo-task",
  component: PHOTO_TASK
}]