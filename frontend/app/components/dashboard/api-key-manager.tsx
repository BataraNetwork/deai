'use client';

import { useState, useEffect } from 'react';

// Define an interface for the API key data
interface ApiKey {
  id: string;
  keyPrefix: string; // e.g., "sk_...1234"
  createdAt: string;
}

// Mock function to generate a new key - in a real app, this would be a backend call
const generateNewKey = (existingKeys: ApiKey[]): ApiKey => {
  const newId = `key_${existingKeys.length + 1}`;
  const randomString = Math.random().toString(36).substring(2, 8);
  return {
    id: newId,
    keyPrefix: `sk_...${randomString}`,
    createdAt: new Date().toISOString(),
  };
};

export default function ApiKeyManager() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newlyGeneratedKey, setNewlyGeneratedKey] = useState<string | null>(null);

  // Fetch existing keys on component mount
  useEffect(() => {
    // TODO: Replace with actual API call
    const fetchKeys = async () => {
      setLoading(true);
      try {
        // Mocking an API call
        await new Promise(resolve => setTimeout(resolve, 500)); 
        const mockKeys: ApiKey[] = [
          { id: 'key_1', keyPrefix: 'sk_...a1b2', createdAt: new Date().toISOString() },
        ];
        setApiKeys(mockKeys);
      } catch (err: any) {
        setError("Failed to fetch API keys.");
      } finally {
        setLoading(false);
      }
    };
    fetchKeys();
  }, []);

  const handleGenerateKey = async () => {
    // TODO: Replace with actual API call to POST a new key
    try {
      const fullKey = "sk_" + Math.random().toString(36).substring(2);
      const newKeyEntry: ApiKey = {
        id: `key_${apiKeys.length + 2}`,
        keyPrefix: `${fullKey.substring(0, 5)}...${fullKey.substring(fullKey.length - 4)}`,
        createdAt: new Date().toISOString(),
      };

      setApiKeys([newKeyEntry, ...apiKeys]);
      setNewlyGeneratedKey(fullKey);
    } catch (err) {
      setError("Failed to generate new key.");
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    // TODO: Replace with actual API call to DELETE a key
    if (confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
        setApiKeys(apiKeys.filter(key => key.id !== keyId));
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Your API Keys</h2>
        <button
          onClick={handleGenerateKey}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Generate New Key
        </button>
      </div>

      {newlyGeneratedKey && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6" role="alert">
            <strong className="font-bold">New API Key Generated!</strong>
            <p>Please copy this key and store it securely. You will not be able to see it again.</p>
            <div className="font-mono bg-gray-100 p-2 mt-2 rounded break-all">{newlyGeneratedKey}</div>
            <button onClick={() => setNewlyGeneratedKey(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3">x</button>
        </div>
      )}

      {error && (
          <p className="text-red-500 mb-4">{error}</p>
      )}

      {loading ? (
        <p>Loading keys...</p>
      ) : (
        <ul className="space-y-4">
          {apiKeys.length === 0 ? (
            <p>No API keys found.</p>
          ) : (
            apiKeys.map(key => (
              <li key={key.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <span className="font-mono text-gray-800">{key.keyPrefix}</span>
                  <p className="text-sm text-gray-500">Created on: {new Date(key.createdAt).toLocaleDateString()}</p>
                </div>
                <button 
                  onClick={() => handleRevokeKey(key.id)}
                  className="text-red-500 hover:text-red-700 font-semibold"
                >
                  Revoke
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
