// src/pages/CampaignDetail.jsx

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function CampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [influencers, setInfluencers] = useState([]);
  const [assignedInfluencers, setAssignedInfluencers] = useState([]);

  useEffect(() => {
    fetchCampaign();
    fetchInfluencers();
    fetchAssignedInfluencers();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchCampaign() {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('campaigns_uuid', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching campaign details:', error);
    } else {
      setCampaign(data);
    }
  }

  async function fetchInfluencers() {
    const { data, error } = await supabase
      .from('influencer_data')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching influencers:', error);
    } else {
      setInfluencers(data);
    }
  }

  async function fetchAssignedInfluencers() {
    const { data, error } = await supabase
      .from('campaign_influencers')
      .select('influencer_uuid')
      .eq('campaign_uuid', id);

    if (error) {
      console.error('Error fetching assigned influencers:', error);
    } else {
      const assignedUuids = data.map((row) => row.influencer_uuid);
      setAssignedInfluencers(assignedUuids);
    }
  }

  async function addInfluencerToCampaign(influencerUuid) {
    const { error } = await supabase
      .from('campaign_influencers')
      .insert([
        { campaign_uuid: id, influencer_uuid: influencerUuid },
      ]);

    if (error) {
      console.error('Error adding influencer:', error);
      alert('Failed to add influencer.');
    } else {
      fetchAssignedInfluencers(); // Refresh list
    }
  }

  if (!campaign) {
    return <div className="p-8">Loading campaign details...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="text-blue-600 hover:underline mb-4"
      >
        ← Back
      </button>

      {/* Campaign Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{campaign.name || 'Untitled Campaign'}</h1>
        <button
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          onClick={() => alert('Edit functionality coming soon!')}
        >
          ✏️ Edit Campaign
        </button>
      </div>

      {/* Campaign Info */}
      <div className="bg-white p-6 rounded shadow space-y-2">
        <p><span className="font-semibold">Start Date:</span> {campaign.start_date ? new Date(campaign.start_date).toLocaleDateString() : 'N/A'}</p>
        <p><span className="font-semibold">End Date:</span> {campaign.end_date ? new Date(campaign.end_date).toLocaleDateString() : 'N/A'}</p>
        {campaign.target_niches?.length > 0 && (
          <p><span className="font-semibold">🎯 Target Niches:</span> {campaign.target_niches.join(', ')}</p>
        )}
      </div>

      {/* Assigned Influencers */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">🎯 Assigned Influencers</h2>
        {assignedInfluencers.length === 0 ? (
          <p className="text-gray-500 italic">No influencers assigned yet.</p>
        ) : (
          <ul className="space-y-2">
            {influencers
              .filter((inf) => assignedInfluencers.includes(inf.influencer_uuid))
              .map((inf) => (
                <li key={inf.influencer_uuid} className="flex justify-between items-center">
                  <span>{inf.full_name || inf.tt_username}</span>
                  {/* Future: add remove button */}
                </li>
              ))}
          </ul>
        )}
      </div>

      {/* Available Influencers to Add */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">➕ Available Influencers</h2>
        <ul className="space-y-2">
          {influencers
            .filter((inf) => !assignedInfluencers.includes(inf.influencer_uuid))
            .map((inf) => (
              <li key={inf.influencer_uuid} className="flex justify-between items-center">
                <span>{inf.full_name || inf.tt_username}</span>
                <button
                  onClick={() => addInfluencerToCampaign(inf.influencer_uuid)}
                  className="text-blue-500 hover:underline text-sm"
                >
                  + Add
                </button>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}

export default CampaignDetail;
