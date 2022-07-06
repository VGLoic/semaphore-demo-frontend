import {
  createBrowserHistory,
  ReactLocation,
  Router,
} from '@tanstack/react-location';
import Layout from './components/layout';
import GroupPage from './pages/group';
import Home from './pages/home';
import IdentityPage from './pages/identity';
import ProofPage from './pages/proof';

const routes = [
  { path: '/proof', element: <ProofPage /> },
  { path: '/group', element: <GroupPage /> },
  { path: '/identity', element: <IdentityPage /> },
  { path: '/', element: <Home /> },
];

const history = createBrowserHistory();
const location = new ReactLocation({ history });

function App() {
  return (
    <Layout>
      <Router location={location} routes={routes} />
    </Layout>
  );
}

export default App;
