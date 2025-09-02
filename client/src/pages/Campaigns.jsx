// src/pages/Campaigns.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import CreateCampaignModal from '../components/CreateCampaignModal';

function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCampaigns();
  }, []);

  async function fetchCampaigns() {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching campaigns:', error);
    } else {
      setCampaigns(data);
    }
  }

  function handleNavigate(campaignUuid) {
    navigate(`/campaigns/${campaignUuid}`);
  }

  return (
    <div className="p-8">
      <CreateCampaignModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={fetchCampaigns}
      />

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Campaigns</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + New Campaign
        </button>
      </div>

      {campaigns.length === 0 ? (
        <p className="text-gray-500">No campaigns yet. Create one!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <div
              key={campaign.campaigns_uuid}
              onClick={() => handleNavigate(campaign.campaigns_uuid)}
              className="p-6 bg-white rounded shadow hover:shadow-md cursor-pointer"
            >
              <h2 className="text-xl font-semibold mb-2">{campaign.name || 'Untitled Campaign'}</h2>
              <p className="text-sm text-gray-500">
                {campaign.start_date
                  ? `📅 ${new Date(campaign.start_date).toLocaleDateString()} - ${new Date(campaign.end_date).toLocaleDateString()}`
                  : 'No dates set'}
              </p>
              {campaign.target_niches?.length > 0 && (
                <div className="text-xs text-gray-400 mt-2">
                  🎯 Niches: {campaign.target_niches.join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Campaigns;
