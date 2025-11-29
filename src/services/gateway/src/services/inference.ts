// @ts-nocheck
import axios from 'axios';

// The address of the node-engine service, accessible from within the Docker network.
const NODE_ENGINE_URL = 'http://node-engine:8080';

/**
 * Submits a generation task to the node-engine service.
 * @param payload - The request payload (prompt, model, etc.).
 * @returns The response from the node-engine service, which includes the task_id.
 */
export async function submitInferenceTask(payload) {
  try {
    const response = await axios.post(`${NODE_ENGINE_URL}/generate`, payload);
    return response.data;
  } catch (error) {
    // Log the error for debugging purposes
    console.error("Error submitting inference task:", error.response ? error.response.data : error.message);
    // Re-throw a more structured error to be handled by the route
    throw new Error(error.response ? error.response.data.detail : 'Failed to connect to the inference service');
  }
}

/**
 * Retrieves the status and result of a specific inference task.
 * @param taskId - The ID of the task to check.
 * @returns The status and result of the task.
 */
export async function getInferenceStatus(taskId) {
  try {
    const response = await axios.get(`${NODE_ENGINE_URL}/result/${taskId}`);
    return response.data;
  } catch (error) {
    console.error(`Error getting status for task ${taskId}:`, error.response ? error.response.data : error.message);
    throw new Error(error.response ? error.response.data.detail : 'Failed to retrieve task status');
  }
}
