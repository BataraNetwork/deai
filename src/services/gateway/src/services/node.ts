// @ts-nocheck
const activeNodes = new Map();

export function getActiveNodes() {
  return Array.from(activeNodes.values()).map((node) => ({
    id: node.id,
    score: node.score,
    load: node.load,
    address: node.address,
  }));
}

export function selectBestNode() {
  let bestNode;
  let highestScore = -Infinity;
  let lowestLoad = Infinity;

  activeNodes.forEach((node) => {
    if (node.score !== undefined && node.load !== undefined) {
      if (
        bestNode === undefined ||
        node.score > highestScore ||
        (node.score === highestScore && node.load < lowestLoad)
      ) {
        bestNode = node;
        highestScore = node.score;
        lowestLoad = node.load;
      }
    }
  });

  return bestNode;
}

export function getStatus(call, callback) {
  const reply = new StatusReply();
  reply.setStatus("OK");
  reply.setTimestamp(Date.now());
  callback(null, reply);
}

export function listValidators(call, callback) {
  const reply = new ListValidatorsResponse();
  callback(null, reply);
}
