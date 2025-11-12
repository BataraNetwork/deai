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

  useEffect(() => {
    async function fetchModels() {
      try {
        // I'm assuming an API endpoint on the gateway service.
        // This might need to be adjusted based on the actual API.
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

  if (loading) {
    return <div>Loading models...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Available Models</h2>
      {models.length === 0 ? (
        <p>No models available.</p>
      ) : (
        <ul className="space-y-4">
          {models.map((model) => (
            <li key={model.id} className="border rounded-lg p-4">
              <h3 className="font-semibold text-lg">{model.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{model.description}</p>
              <p className="text-xs text-gray-400 mt-2">Owner: {model.owner}</p>
              <Link href={`/marketplace/${model.id}`} className="text-blue-500 hover:underline mt-2 inline-block">
                View Details
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}