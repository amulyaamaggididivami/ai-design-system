import './App.css';
import { WorkspacePage } from './pages/workspace/WorkspacePage';
import { ProjectDashboardPage } from './pages/projectDashboard';
import { ChartGalleryPage } from './pages/chartGallery/ChartGalleryPage';
import { InteractiveDemoPage } from './pages/interactiveDemo/InteractiveDemoPage';
import { PAGE } from './constants';

const page = new URLSearchParams(window.location.search).get('page');

export default function App() {
  if (page === PAGE.PROJECT_DASHBOARD) {
    return <ProjectDashboardPage />;
  }
  if (page === PAGE.CHART_GALLERY) {
    return <ChartGalleryPage />;
  }
  if (page === PAGE.INTERACTIVE_DEMO) {
    return <InteractiveDemoPage />;
  }
  return <WorkspacePage />;
}
