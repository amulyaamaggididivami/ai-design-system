import './App.css';
import { WorkspacePage } from './pages/workspace/WorkspacePage';
import { ProjectDashboardPage } from './pages/projectDashboard';
import { ChartGalleryPage } from './pages/chartGallery/ChartGalleryPage';

const page = new URLSearchParams(window.location.search).get('page');

export default function App() {
  if (page === 'project-dashboard') {
    return <ProjectDashboardPage />;
  }
  if (page === 'chart-gallery') {
    return <ChartGalleryPage />;
  }
  return <WorkspacePage />;
}
