import { BrowserRouter as Router } from 'react-router-dom';
import { AppRoutes } from './routes/routes';

function App() {
  return (
    <div className='bg-black min-h-screen overflow-x-hidden' >
    <Router>
      <AppRoutes />
    </Router>
    </div>
  );
}

export default App;
