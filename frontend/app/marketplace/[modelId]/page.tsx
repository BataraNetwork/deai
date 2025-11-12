'use client';

import { useEffect, useState, useRef } from 'react';

// Define an interface for the model data
interface Model {
  id: string;
  name: string;
  description: string;
  owner: string;
  details: string; // Assuming more details are available
}

export default function ModelDetailPage({ params }: { params: { modelId: string } }) {
  const [model, setModel] = useState<Model | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [inferenceResult, setInferenceResult] = useState('');
  const [isInferring, setIsInferring] = useState(false);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Fetch model details
    async function fetchModel() {
      try {
        const response = await fetch(`/api/gateway/models/${params.modelId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch model details');
        }
        const data = await response.json();
        setModel(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (params.modelId) {
      fetchModel();
    }

    // Establish WebSocket connection
    // Note: Replace with your actual WebSocket gateway URL
    const wsUrl = `ws://${window.location.host}`.replace('http', 'ws');
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => console.log('WebSocket connected');
    ws.current.onclose = () => console.log('WebSocket disconnected');

    ws.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'inference_result') {
            setInferenceResult(message.payload);
            setIsInferring(false);
        } else if (message.type === 'inference_failed') {
            setInferenceResult(`Error: ${message.error}`);
            setIsInferring(false);
        }
    };

    return () => {
      ws.current?.close();
    };
  }, [params.modelId]);

  const handleRunInference = () => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
        alert('WebSocket is not connected.');
        return;
    }
    if (!prompt.trim()) {
        alert('Please enter a prompt.');
        return;
    }

    setIsInferring(true);
    setInferenceResult('');

    const request = {
        type: 'inference_request',
        client_id: 'webapp-user', // Example client ID
        payload: {
            model_id: params.modelId,
            prompt: prompt
        }
    };

    ws.current.send(JSON.stringify(request));
  };


  if (loading) {
    return <div>Loading model details...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!model) {
    return <div>Model not found.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{model.name}</h1>
      <p className="text-gray-600 mb-2">Owner: {model.owner}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Model Info Column */}
        <div>
          <div className="bg-gray-100 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p>{model.description}</p>
          </div>
          <div className="mt-4 bg-gray-100 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Details</h2>
            <p>{model.details}</p>
          </div>
        </div>

        {/* Inference Column */}
        <div className="bg-white p-4 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Run Inference</h2>
          <textarea
            className="w-full p-2 border rounded-md"
            rows={4}
            placeholder={`Enter a prompt for ${model.name}...`}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button
            className="mt-2 w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
            onClick={handleRunInference}
            disabled={isInferring}
          >
            {isInferring ? 'Running...' : 'Run Inference'}
          </button>
          
          {inferenceResult && (
            <div className="mt-4 p-2 bg-gray-50 rounded-md border">
                <h3 className="font-semibold">Result:</h3>
                <p className="mt-1 text-sm">{inferenceResult}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
