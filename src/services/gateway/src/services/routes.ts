// @ts-nocheck
import { getDeAITokenBalance, deductTokensFromUser, getOperatorAddress } from "./contract";
import { getModels, getModelById, addModel } from "./models";
import { getActiveNodes } from "./node";
import { submitInferenceTask, getInferenceStatus } from "./inference";

const TOKEN_DECIMALS = 18n;

export function setupRoutes(app) {
  app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
  });

  // --- Public API Endpoints ---

  app.get("/api/gateway/models", (req, res) => {
    res.json(getModels());
  });

  app.post("/api/gateway/models", (req, res) => {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({ message: "Model name and description are required." });
    }

    // In a real application, you would get the user's address from an authentication token
    const newModel = {
      name,
      description,
      owner: "0x0000000000000000000000000000000000000000", // Placeholder owner
    };

    try {
      const addedModel = addModel(newModel);
      res.status(201).json(addedModel);
    } catch (error) {
      res.status(500).json({ message: "Failed to register model", error: error.message });
    }
  });

  app.get("/api/gateway/operator-address", (req, res) => {
    const address = getOperatorAddress();
    res.json({ operatorAddress: address });
  });

  app.get("/api/balance/:address", async (req, res) => {
    try {
      const balance = await getDeAITokenBalance(req.params.address);
      res.json({ address: req.params.address, balance: balance.toString() });
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve token balance." });
    }
  });

  app.post("/api/gateway/generate", async (req, res) => {
    const { address, ...inferencePayload } = req.body;
    const { model: modelId } = inferencePayload;

    if (!address) {
      return res.status(400).json({ error: "User address is required." });
    }
    if (!modelId) {
      return res.status(400).json({ error: "Model ID is required." });
    }

    try {
      const model = getModelById(modelId);
      if (!model) {
        return res.status(404).json({ error: `Model '${modelId}' not found.` });
      }

      const balance = await getDeAITokenBalance(address);
      const requiredCostInSmallestUnit = BigInt(model.cost) * (10n ** TOKEN_DECIMALS);

      if (balance < requiredCostInSmallestUnit) {
        const balanceInTokens = balance / (10n ** TOKEN_DECIMALS);
        return res.status(402).json({
          error: "Insufficient token balance.",
          details: `Required: ${model.cost} DeAI tokens, Available: ${balanceInTokens.toString()} DeAI tokens.`
        });
      }

      const taskPayload = {
        ...inferencePayload,
        user_address: address,
        model_cost: model.cost,
      };

      const result = await submitInferenceTask(taskPayload);
      res.status(202).json(result);

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/gateway/result/:taskId", async (req, res) => {
    try {
      const result = await getInferenceStatus(req.params.taskId);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Internal Service Endpoints ---

  app.post("/api/internal/deduct", async (req, res) => {
    const isLocalRequest = req.ip === '127.0.0.1' || req.ip === '::1' || req.ip.endsWith('127.0.0.1') || req.ip.endsWith('::1');
    if (!isLocalRequest && process.env.NODE_ENV !== 'development') {
        return res.status(403).json({ error: "Forbidden: This is an internal-only endpoint." });
    }

    const { userAddress, amount } = req.body;

    if (!userAddress || !amount) {
        return res.status(400).json({ error: "userAddress and amount are required." });
    }

    try {
        console.log(`Internal deduct request: Deducting ${amount} tokens from ${userAddress}`);
        const txHash = await deductTokensFromUser(userAddress, amount);
        res.status(200).json({ success: true, transactionHash: txHash });
    } catch (error) {
        console.error(`Deduction failed for ${userAddress}:`, error);
        res.status(500).json({ success: false, error: `Token deduction failed: ${error.message}` });
    }
  });
}
