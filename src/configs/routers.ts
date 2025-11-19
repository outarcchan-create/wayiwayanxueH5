import HOME from '../pages/home.jsx';
import LOGIN from '../pages/login.jsx';
import ACTIVITY_DETAIL from '../pages/activity-detail.jsx';
import PROFILE from '../pages/profile.jsx';
import MY_ACTIVITIES from '../pages/my-activities.jsx';
import STATISTICS from '../pages/statistics.jsx';
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
}]