const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Bangladesh Location Graph Database
const NODES = [
  { id: 0, name: "Dhaka Medical College (DMCH)", lat: 23.7258, lng: 90.3975, type: "hospital" },
  { id: 1, name: "BSMMU Hospital (Shahbagh)", lat: 23.7388, lng: 90.3957, type: "hospital" },
  { id: 2, name: "Square Hospital (Panthapath)", lat: 23.7533, lng: 90.3817, type: "hospital" },
  { id: 3, name: "Kurmitola General Hospital", lat: 23.8186, lng: 90.4109, type: "hospital" },
  { id: 4, name: "Evercare Hospital (Bashundhara)", lat: 23.8103, lng: 90.4312, type: "hospital" },
  { id: 5, name: "Farmgate Junction", lat: 23.7561, lng: 90.3872, type: "junction" },
  { id: 6, name: "Mohakhali Flyover", lat: 23.7776, lng: 90.4054, type: "junction" },
  { id: 7, name: "Jatrabari Inter-district Hub", lat: 23.7104, lng: 90.4348, type: "junction" },
  { id: 8, name: "Anwer Khan Modern Hospital", lat: 23.7395, lng: 90.3839, type: "hospital" },
  { id: 9, name: "Bangladesh Specialized Hospital", lat: 23.7786, lng: 90.3637, type: "hospital" },
  { id: 10, name: "Ibn Sina Specialized Hospital (Dhanmondi)", lat: 23.7462, lng: 90.3687, type: "hospital" },
  { id: 11, name: "Mugda Medical College Hospital", lat: 23.7237, lng: 90.4442, type: "hospital" },
  { id: 12, name: "United Hospital (Gulshan, Dhaka)", lat: 23.8048, lng: 90.4153, type: "hospital" },
  { id: 13, name: "Labaid Specialized Hospital (Dhanmondi, Dhaka)", lat: 23.7408, lng: 90.3823, type: "hospital" },
  { id: 14, name: "National Institute of Traumatology (NITOR, Dhaka)", lat: 23.7697, lng: 90.3691, type: "hospital" },
  { id: 15, name: "Holy Family Red Crescent Medical College Hospital (Dhaka)", lat: 23.7485, lng: 90.4114, type: "hospital" },
  { id: 16, name: "Narayanganj 300-Bed Hospital", lat: 23.6239, lng: 90.5012, type: "hospital" },
  { id: 17, name: "Shaheed Tajuddin Ahmad Medical College Hospital (Gazipur)", lat: 23.9946, lng: 90.4180, type: "hospital" },
  { id: 18, name: "Chattogram Medical College Hospital", lat: 22.3596, lng: 91.8340, type: "hospital" },
  { id: 19, name: "Evercare Hospital Chattogram", lat: 22.3908, lng: 91.8237, type: "hospital" },
  { id: 20, name: "Sylhet MAG Osmani Medical College Hospital", lat: 24.8949, lng: 91.8687, type: "hospital" },
  { id: 21, name: "Rajshahi Medical College Hospital", lat: 24.3745, lng: 88.6004, type: "hospital" },
  { id: 22, name: "Khulna Medical College Hospital", lat: 22.8145, lng: 89.5392, type: "hospital" },
  { id: 23, name: "Sher-e-Bangla Medical College Hospital (Barishal)", lat: 22.7032, lng: 90.3535, type: "hospital" },
  { id: 24, name: "Rangpur Medical College Hospital", lat: 25.7466, lng: 89.2507, type: "hospital" },
  { id: 25, name: "Mymensingh Medical College Hospital", lat: 24.7471, lng: 90.4071, type: "hospital" },
  { id: 26, name: "Cumilla Medical College Hospital", lat: 23.4234, lng: 91.1841, type: "hospital" },
  { id: 27, name: "Cox's Bazar District Sadar Hospital", lat: 21.4408, lng: 91.9740, type: "hospital" },
  { id: 28, name: "Chashara Junction (Narayanganj)", lat: 23.6232, lng: 90.4990, type: "junction" },
  { id: 29, name: "Chowrasta Junction (Gazipur)", lat: 23.9994, lng: 90.4201, type: "junction" },
  { id: 30, name: "City Gate (Chattogram)", lat: 22.3820, lng: 91.7860, type: "junction" },
  { id: 31, name: "Kadamtali Bus Terminal (Sylhet)", lat: 24.8920, lng: 91.8690, type: "junction" },
  { id: 32, name: "Rajshahi Bus Terminal", lat: 24.3664, lng: 88.6047, type: "junction" },
  { id: 33, name: "Sonadanga Bus Terminal (Khulna)", lat: 22.8030, lng: 89.5470, type: "junction" },
  { id: 34, name: "Barishal Launch Terminal", lat: 22.7020, lng: 90.3670, type: "junction" },
  { id: 35, name: "Rangpur Central Bus Terminal", lat: 25.7460, lng: 89.2410, type: "junction" },
  { id: 36, name: "Mymensingh Bus Terminal", lat: 24.7530, lng: 90.4070, type: "junction" },
  { id: 37, name: "Kandirpar Junction (Cumilla)", lat: 23.4600, lng: 91.1800, type: "junction" },
  { id: 38, name: "Cox's Bazar Bus Terminal", lat: 21.4420, lng: 91.9790, type: "junction" }
];

const EDGES = [
  { from: 0, to: 1, dist: 2.2 },
  { from: 1, to: 5, dist: 3.1 },
  { from: 5, to: 2, dist: 1.4 },
  { from: 5, to: 6, dist: 2.8 },
  { from: 6, to: 3, dist: 4.6 },
  { from: 3, to: 4, dist: 3.5 },
  { from: 0, to: 7, dist: 4.8 },
  { from: 1, to: 8, dist: 1.4 },
  { from: 2, to: 8, dist: 2.2 },
  { from: 2, to: 9, dist: 3.8 },
  { from: 5, to: 9, dist: 3.5 },
  { from: 2, to: 10, dist: 1.8 },
  { from: 1, to: 10, dist: 3.0 },
  { from: 7, to: 11, dist: 2.0 },
  { from: 0, to: 11, dist: 5.2 },
  { from: 6, to: 12, dist: 3.2 },
  { from: 10, to: 13, dist: 2.0 },
  { from: 9, to: 14, dist: 1.5 },
  { from: 1, to: 15, dist: 2.1 },
  { from: 16, to: 28, dist: 2.0 },
  { from: 17, to: 29, dist: 2.0 },
  { from: 18, to: 30, dist: 5.5 },
  { from: 19, to: 30, dist: 2.5 },
  { from: 20, to: 31, dist: 3.0 },
  { from: 21, to: 32, dist: 2.5 },
  { from: 22, to: 33, dist: 3.2 },
  { from: 23, to: 34, dist: 3.0 },
  { from: 24, to: 35, dist: 3.0 },
  { from: 25, to: 36, dist: 3.5 },
  { from: 26, to: 37, dist: 2.0 },
  { from: 27, to: 38, dist: 2.0 },
  { from: 6, to: 29, dist: 25 },
  { from: 7, to: 28, dist: 8 },
  { from: 7, to: 37, dist: 92 },
  { from: 37, to: 30, dist: 105 },
  { from: 30, to: 38, dist: 148 },
  { from: 6, to: 36, dist: 105 },
  { from: 7, to: 31, dist: 235 },
  { from: 7, to: 32, dist: 255 },
  { from: 7, to: 33, dist: 275 },
  { from: 7, to: 34, dist: 180 },
  { from: 7, to: 35, dist: 300 }
];

const NODE_BY_ID = new Map(NODES.map(node => [node.id, node]));
const ADJACENCY = new Map(NODES.map(node => [node.id, []]));
EDGES.forEach(edge => {
  ADJACENCY.get(edge.from).push({ id: edge.to, distance: edge.dist });
  ADJACENCY.get(edge.to).push({ id: edge.from, distance: edge.dist });
});

function calculateDijkstra(srcId, destId) {
  const distances = new Map(NODES.map(node => [node.id, Infinity]));
  const previous = new Map();
  const unvisited = new Set(NODES.map(node => node.id));
  distances.set(srcId, 0);

  while (unvisited.size > 0) {
    let currentId = null;
    for (const id of unvisited) {
      if (currentId === null || distances.get(id) < distances.get(currentId)) currentId = id;
    }

    if (currentId === null || distances.get(currentId) === Infinity) break;
    unvisited.delete(currentId);
    if (currentId === destId) break;

    ADJACENCY.get(currentId).forEach(neighbor => {
      const candidateDistance = distances.get(currentId) + neighbor.distance;
      if (unvisited.has(neighbor.id) && candidateDistance < distances.get(neighbor.id)) {
        distances.set(neighbor.id, candidateDistance);
        previous.set(neighbor.id, currentId);
      }
    });
  }

  if (!Number.isFinite(distances.get(destId))) return null;

  const path = [destId];
  while (path[0] !== srcId) {
    const predecessor = previous.get(path[0]);
    if (predecessor === undefined) return null;
    path.unshift(predecessor);
  }

  return { path, totalDistance: distances.get(destId) };
}

app.get('/api/nodes', (req, res) => res.json(NODES));
app.get('/api/edges', (req, res) => res.json(EDGES));

async function getRoadRoute(fromNode, toNode) {
  const coordinates = `${fromNode.lng},${fromNode.lat};${toNode.lng},${toNode.lat}`;
  const providers = [
    'https://router.project-osrm.org/route/v1/driving/',
    'https://routing.openstreetmap.de/routed-car/route/v1/driving/'
  ];
  const providerErrors = [];

  for (const provider of providers) {
    const url = `${provider}${coordinates}?overview=full&geometries=geojson&steps=false`;
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (!response.ok) {
        providerErrors.push(`HTTP ${response.status}`);
        continue;
      }

      const data = await response.json();
      const route = data.routes?.[0];
      if (data.code !== 'Ok' || !route || !Number.isFinite(route.distance) ||
          !Array.isArray(route.geometry?.coordinates) ||
          route.geometry.coordinates.length < 2) {
        providerErrors.push(data.message || 'No drivable road route found');
        continue;
      }

      return {
        coordinates: route.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
        totalDistance: route.distance / 1000
      };
    } catch (error) {
      providerErrors.push(
        error.name === 'TimeoutError' || error.name === 'AbortError'
          ? 'request timed out'
          : error.message
      );
    }
  }

  throw new Error(`Road routing failed on both services (${providerErrors.join('; ')}).`);
}

app.post('/api/dispatch', async (req, res) => {
  const {
    fromNode: rawFromNode,
    toLocation: rawDestination = req.body?.toHospital,
    emergencyLevel
  } = req.body || {};
  const isValidNodeId = value =>
    (typeof value === "number" || (typeof value === "string" && value.trim() !== "")) &&
    Number.isInteger(Number(value));
  const fromNode = Number(rawFromNode);
  const toLocation = Number(rawDestination);

  if (!isValidNodeId(rawFromNode) || !NODE_BY_ID.has(fromNode)) {
    return res.status(400).json({ error: "Select a valid start location." });
  }
  if (!isValidNodeId(rawDestination) || !NODE_BY_ID.has(toLocation)) {
    return res.status(400).json({ error: "Select a valid destination location." });
  }
  if (!["CRITICAL", "URGENT", "NORMAL"].includes(emergencyLevel)) {
    return res.status(400).json({ error: "Select a valid triage priority." });
  }

  const start = NODE_BY_ID.get(fromNode);
  const destination = NODE_BY_ID.get(toLocation);
  const result = calculateDijkstra(fromNode, toLocation);
  if (fromNode === toLocation) {
    return res.json({
      success: true,
      emergencyLevel,
      path: [fromNode],
      totalDistance: 0,
      coordinates: [[start.lat, start.lng]]
    });
  }

  try {
    const roadRoute = await getRoadRoute(start, destination);
    return res.json({
      success: true,
      emergencyLevel,
      path: result?.path || [fromNode, toLocation],
      graphPathAvailable: Boolean(result),
      totalDistance: roadRoute.totalDistance,
      coordinates: roadRoute.coordinates
    });
  } catch (error) {
    return res.status(502).json({ error: error.message });
  }
});

const PORT = Number(process.env.PORT) || 3000;
const server = app.listen(PORT, () => {
  console.log(`Smart Ambulance System running on http://localhost:${PORT}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Check http://localhost:${PORT} or stop the running server before starting a new one.`);
    process.exit(1);
  }
  throw error;
});