'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

// Define an interface for the model data
interface Model {
  id: string;
  name: string;
  description: string;
  owner: string;
}

export default function ModelList() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchModels() {
      try {
        const response = await fetch('/api/gateway/models');
        if (!response.ok) {
          throw new Error('Failed to fetch models');
        }
        const data = await response.json();
        setModels(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchModels();
  }, []);

  const filteredModels = models.filter(model =>
    model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="text-center p-8">Loading models...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search models by name or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {filteredModels.length === 0 ? (
        <p className="text-center text-gray-500">No models match your search.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModels.map((model) => (
            <div key={model.id} className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-lg transition-shadow duration-200 flex flex-col">
              <div className="flex-grow">
                <h3 className="font-bold text-xl mb-2">{model.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{model.description}</p>
              </div>
              <div className="mt-auto">
                 <p className="text-xs text-gray-500 mb-3">Owner: {model.owner}</p>
                 <Link href={`/marketplace/${model.id}`} className="text-blue-500 hover:underline font-semibold">
                   View Details
                 </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
