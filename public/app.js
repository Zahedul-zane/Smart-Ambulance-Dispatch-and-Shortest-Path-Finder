const map = L.map('map').setView([23.75, 90.40], 7);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

let nodes = [];
let markers = [];
let routePolyline = null;
let algorithmPolyline = null;
let ambulanceMarker = null;
let animationFrame = null;
const output = document.getElementById('outputBox');
const dispatchButton = document.getElementById('dispatchBtn');

const routeLegend = L.control({ position: 'bottomleft' });
routeLegend.onAdd = function () {
  const container = L.DomUtil.create('div', 'route-legend');
  container.innerHTML =
    '<div><span class="route-legend-line route-legend-road"></span>Ambulance road route</div>' +
    '<div><span class="route-legend-line route-legend-algorithm"></span>Algorithm path</div>';
  L.DomEvent.disableClickPropagation(container);
  return container;
};
routeLegend.addTo(map);

function showMessage(message, isError = false) {
  output.textContent = message;
  output.classList.toggle('error', isError);
}

function clearRoute() {
  if (animationFrame) cancelAnimationFrame(animationFrame);
  animationFrame = null;
  [routePolyline, algorithmPolyline, ambulanceMarker].forEach(layer => {
    if (layer) map.removeLayer(layer);
  });
  routePolyline = null;
  algorithmPolyline = null;
  ambulanceMarker = null;
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('The server returned an invalid response. Please try again.');
  }
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status}).`);
  return data;
}

function animateAmbulance(coordinates, distanceKm) {
  if (animationFrame) cancelAnimationFrame(animationFrame);
  if (ambulanceMarker) map.removeLayer(ambulanceMarker);
  if (!coordinates.length) return;

  const icon = L.divIcon({
    className: 'ambulance-marker',
    html: '<span class="ambulance-icon" aria-label="Ambulance">🚑</span>',
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  });
  ambulanceMarker = L.marker(coordinates[0], { icon, keyboard: false }).addTo(map);

  if (coordinates.length === 1) return;

  const cumulativeDistances = [0];
  for (let index = 1; index < coordinates.length; index++) {
    cumulativeDistances.push(
      cumulativeDistances[index - 1] + map.distance(coordinates[index - 1], coordinates[index])
    );
  }
  const totalDistance = cumulativeDistances[cumulativeDistances.length - 1];
  const duration = Math.min(Math.max(8000, distanceKm * 45), 30000);
  let startTime;

  function move(timestamp) {
    if (startTime === undefined) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    const distance = progress * totalDistance;
    let low = 0;
    let high = cumulativeDistances.length - 1;
    while (low < high) {
      const middle = Math.floor((low + high) / 2);
      if (cumulativeDistances[middle] < distance) low = middle + 1;
      else high = middle;
    }

    const segmentIndex = Math.max(0, low - 1);
    const segmentLength = cumulativeDistances[segmentIndex + 1] - cumulativeDistances[segmentIndex];
    const segmentProgress = segmentLength
      ? (distance - cumulativeDistances[segmentIndex]) / segmentLength
      : 1;
    const start = coordinates[segmentIndex];
    const end = coordinates[segmentIndex + 1];
    ambulanceMarker.setLatLng([
      start[0] + (end[0] - start[0]) * segmentProgress,
      start[1] + (end[1] - start[1]) * segmentProgress
    ]);

    if (progress < 1) animationFrame = requestAnimationFrame(move);
    else animationFrame = null;
  }

  animationFrame = requestAnimationFrame(move);
}

function selectMapLocation(node) {
  const targetId = document.getElementById('mapClickTarget').value;
  document.getElementById(targetId).value = String(node.id);
  const popupContent = document.createElement('div');
  const title = document.createElement('strong');
  title.textContent = targetId === 'startNode' ? 'Start location' : 'Destination location';
  popupContent.append(title, document.createElement('br'), document.createTextNode(node.name));
  L.popup().setLatLng([node.lat, node.lng]).setContent(popupContent).openOn(map);
}

function findNearestNode(latlng) {
  return nodes.reduce((nearest, node) => {
    const distance = map.distance(latlng, [node.lat, node.lng]);
    return !nearest || distance < nearest.distance ? { node, distance } : nearest;
  }, null)?.node;
}

map.on('click', event => {
  const nearestNode = findNearestNode(event.latlng);
  if (nearestNode) selectMapLocation(nearestNode);
});

async function init() {
  try {
    nodes = await fetchJson('/api/nodes');
    if (!Array.isArray(nodes) || nodes.length === 0) {
      throw new Error('The server did not provide any map locations.');
    }

    const startSel = document.getElementById('startNode');
    const endSel = document.getElementById('endLocation');
    startSel.replaceChildren(new Option('Choose an incident location', ''));
    endSel.replaceChildren(new Option('Choose a destination location', ''));

    nodes.forEach(node => {
      const marker = L.marker([node.lat, node.lng]).addTo(map);
      const popupContent = document.createElement('div');
      const name = document.createElement('strong');
      name.textContent = node.name;
      popupContent.append(name, document.createElement('br'), document.createTextNode(
        node.type === 'hospital' ? 'Hospital' : 'Response location'
      ));
      marker.bindPopup(popupContent);
      marker.on('click', () => selectMapLocation(node));
      markers.push(marker);
      startSel.add(new Option(node.name, node.id));
      endSel.add(new Option(node.name, node.id));
    });

    startSel.disabled = false;
    endSel.disabled = false;
    dispatchButton.disabled = false;
    map.fitBounds(L.latLngBounds(nodes.map(node => [node.lat, node.lng])), {
      padding: [30, 30],
      maxZoom: 8
    });
    showMessage(`${nodes.length} Bangladesh locations loaded. Choose any start and destination.`);
  } catch (error) {
    showMessage(`Unable to load locations: ${error.message}`, true);
  }
}

async function dispatch() {
  const fromNode = document.getElementById('startNode').value;
  const toLocation = document.getElementById('endLocation').value;
  const triage = document.getElementById('triageLevel').value;

  if (!fromNode || !toLocation) {
    showMessage('Choose both a start location and a destination location.', true);
    return;
  }

  dispatchButton.disabled = true;
  clearRoute();
  showMessage('Calculating the shortest available route...');
  try {
    const data = await fetchJson('/api/dispatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromNode, toLocation, emergencyLevel: triage })
    });

    if (!Array.isArray(data.coordinates) || data.coordinates.length === 0 ||
        !data.coordinates.every(point =>
          Array.isArray(point) && point.length === 2 &&
          point.every(value => Number.isFinite(value))
        ) ||
        !Number.isFinite(data.totalDistance) || !Array.isArray(data.path) ||
        data.path[0] !== Number(fromNode) ||
        data.path[data.path.length - 1] !== Number(toLocation)) {
      throw new Error('The server returned incomplete route data.');
    }

    const startNode = nodes.find(node => node.id === Number(fromNode));
    const destinationNode = nodes.find(node => node.id === Number(toLocation));
    if (!startNode || !destinationNode) {
      throw new Error('The selected start or destination is no longer available.');
    }

    showMessage(
      `Priority: ${data.emergencyLevel}\n` +
      `From: ${startNode.name}\n` +
      `To: ${destinationNode.name}\n` +
      `Road distance: ${data.totalDistance.toFixed(2)} km\n` +
      `Red: road route | Yellow: Dijkstra algorithm path\n` +
      `Node Sequence: ${data.path.map(id =>
        nodes.find(node => node.id === id)?.name || id
      ).join(' -> ')}`
    );
    const graphCoordinates = data.path.map(id => {
      const node = nodes.find(location => location.id === id);
      if (!node) throw new Error('The server returned a route with an unknown location.');
      return [node.lat, node.lng];
    });
    algorithmPolyline = L.polyline(graphCoordinates, {
      color: '#facc15',
      weight: 5,
      opacity: 0.95,
      dashArray: '10 8',
      lineCap: 'butt'
    }).addTo(map);
    routePolyline = L.polyline(data.coordinates, { color: '#ef4444', weight: 5 }).addTo(map);
    const routeBounds = L.featureGroup([algorithmPolyline, routePolyline]).getBounds();
    if (data.totalDistance === 0) map.setView(data.coordinates[0], 15);
    else map.fitBounds(routeBounds, { padding: [40, 40] });
    animateAmbulance(data.coordinates, data.totalDistance);
  } catch (error) {
    showMessage(`Dispatch failed: ${error.message}`, true);
  } finally {
    dispatchButton.disabled = false;
  }
}

dispatchButton.addEventListener('click', dispatch);

function runSort() {
  const times = [14.2, 5.1, 22.0, 8.4, 3.2];
  // Insertion Sort demonstration
  for (let i = 1; i < times.length; i++) {
    let key = times[i];
    let j = i - 1;
    while (j >= 0 && times[j] > key) {
      times[j + 1] = times[j];
      j--;
    }
    times[j + 1] = key;
  }
  showMessage(`[Insertion Sort Result on Call ETAs]\n${times.join('m, ')}m`);
}

function runSearch() {
  const tokens = [101, 105, 112, 120, 135, 140, 199];
  const target = 120;
  let l = 0, r = tokens.length - 1, foundIdx = -1;
  while (l <= r) {
    let m = Math.floor((l + r) / 2);
    if (tokens[m] === target) { foundIdx = m; break; }
    if (tokens[m] < target) l = m + 1;
    else r = m - 1;
  }
  showMessage(`[Binary Search on ICU Token ID: 120]\nFound at Index: ${foundIdx}`);
}

document.getElementById('sortBtn').addEventListener('click', runSort);
document.getElementById('searchBtn').addEventListener('click', runSearch);
init();