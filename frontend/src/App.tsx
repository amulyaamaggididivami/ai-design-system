import './App.css';
import { WorkspacePage } from './pages/workspace/WorkspacePage';
import { ProjectDashboardPage } from './pages/projectDashboard';
import { ChartGalleryPage } from './pages/chartGallery/ChartGalleryPage';
import { InteractiveDemoPage } from './pages/interactiveDemo/InteractiveDemoPage';

const page = new URLSearchParams(window.location.search).get('page');

export default function App() {
  if (page === 'project-dashboard') {
    return <ProjectDashboardPage />;
  }
  if (page === 'chart-gallery') {
    return <ChartGalleryPage />;
  }
  if (page === 'interactive-demo') {
    return <InteractiveDemoPage />;
  }
  return <WorkspacePage />;
}
