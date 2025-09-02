/* 
  This is your custom TikTok Influencer Dashboard based on the Tailwind React dashboard layout.
  Built for your TikAPI sync system. Includes full comments for learning and future expansion!
*/

// src/App.jsx

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Campaigns from './pages/Campaigns';
import CampaignDetail from './pages/CampaignDetails';

function App() {
  return (
    <Router>
      <Routes>
        {/* All pages inside Layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/campaigns/:id" element={<CampaignDetail />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
