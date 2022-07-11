import {
  createHashHistory,
  Navigate,
  ReactLocation,
  Router,
} from '@tanstack/react-location';
import Layout from './components/layout';
import GroupPage from './pages/group';
import Home from './pages/home';
import IdentityPage from './pages/identity';
import SignalPage from './pages/signal';

const routes = [
  { path: '/signal', element: <SignalPage /> },
  { path: '/group', element: <GroupPage /> },
  { path: '/identity', element: <IdentityPage /> },
  { path: '/', element: <Home /> },
  {
    element: <Navigate to="/" />,
  },
];

const history = createHashHistory();
const location = new ReactLocation({ history });

function App() {
  return (
    <Layout>
      <Router location={location} routes={routes} />
    </Layout>
  );
}

export default App;
