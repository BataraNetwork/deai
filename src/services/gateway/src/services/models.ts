// @ts-nocheck
const mockModels = [
  {
    id: "gemma-7b",
    name: "Gemma 7B",
    description: "A lightweight, state-of-the-art open model from Google.",
    owner: "Google",
    cost: 1, // Cost in DeAI tokens
    details:
      "Gemma is a family of lightweight, state-of-the-art open models built from the same research and technology used to create the Gemini models.",
  },
  {
    id: "mistral-7b",
    name: "Mistral 7B",
    description: "A powerful and efficient model by Mistral AI.",
    owner: "Mistral AI",
    cost: 2, // Cost in DeAI tokens
    details:
      "The Mistral 7B model is a large language model (LLM) that outperforms Llama 2 13B on all benchmarks.",
  },
  {
    id: "llama-2-70b",
    name: "Llama 2 70B",
    description: "A large-scale model from Meta.",
    owner: "Meta",
    cost: 5, // Cost in DeAI tokens
    details:
      "Llama 2 is a collection of pretrained and fine-tuned large language models (LLMs) ranging in scale from 7 billion to 70 billion parameters.",
  },
];

export function getModels() {
  return mockModels;
}

export function getModelById(modelId) {
  return mockModels.find((m) => m.id === modelId);
}

export function addModel(modelData) {
  // Create a simple URL-friendly ID from the model name.
  const id = modelData.name.toLowerCase().replace(/\s+/g, '-');

  // Check if a model with this ID already exists.
  if (mockModels.some(m => m.id === id)) {
    throw new Error(`A model with the name '${modelData.name}' already exists.`);
  }

  const newModel = {
    id: id,
    name: modelData.name,
    description: modelData.description,
    owner: modelData.owner, // This comes from the route handler
    cost: 0, // Default cost, can be updated later
    details: "Details for this model have not been added yet.",
  };

  mockModels.push(newModel);
  return newModel;
}
