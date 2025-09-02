// src/components/CreateCampaignModal.jsx

import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const nicheOptions = [
  'Beauty',
  'Fitness',
  'Fashion',
  'Gaming',
  'Food',
  'Skincare',
  'Tech',
  'Parenting',
  'Lifestyle',
  'Travel',
  'Education',
  'Entertainment',
  'Sports',
  'Other'
];

function CreateCampaignModal({ isOpen, onClose }) {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedNiches, setSelectedNiches] = useState([]);
  const navigate = useNavigate();

  async function handleCreate() {
    if (!name) {
      alert('Please enter a campaign name!');
      return;
    }

    const { data, error } = await supabase.from('campaigns').insert([
      {
        name,
        start_date: startDate || null,
        end_date: endDate || null,
        target_niches: selectedNiches || [],
      },
    ]).select('*').single(); // returning the created row

    if (error) {
      console.error('Error creating campaign:', error);
      alert('Failed to create campaign.');
    } else {
      onClose(); // Close modal
      navigate(`/campaigns/${data.campaigns_uuid}`); // 🚀 Redirect into new campaign
    }
  }

  function toggleNiche(niche) {
    if (selectedNiches.includes(niche)) {
      setSelectedNiches(selectedNiches.filter((n) => n !== niche));
    } else {
      setSelectedNiches([...selectedNiches, niche]);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md shadow-lg relative">
        <h2 className="text-xl font-bold mb-4">Create New Campaign</h2>

        <div className="space-y-4">
          {/* Campaign Name */}
          <input
            type="text"
            className="w-full border p-2 rounded"
            placeholder="Campaign Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {/* Start Date */}
          <input
            type="date"
            className="w-full border p-2 rounded"
            placeholder="Start Date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          {/* End Date */}
          <input
            type="date"
            className="w-full border p-2 rounded"
            placeholder="End Date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />

          {/* Multiselect Niches */}
          <div>
            <label className="block mb-1 font-semibold">🎯 Target Niches:</label>
            <div className="flex flex-wrap gap-2">
              {nicheOptions.map((niche) => (
                <button
                  key={niche}
                  onClick={() => toggleNiche(niche)}
                  className={`px-3 py-1 rounded-full border ${
                    selectedNiches.includes(niche)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  } text-sm hover:bg-blue-500 hover:text-white`}
                  type="button"
                >
                  {niche}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateCampaignModal;
