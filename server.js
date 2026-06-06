const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3030;

// Allow Express to read JSON request bodies if needed later.
app.use(express.json());

// Serve the dashboard files from the public folder.
app.use(express.static(path.join(__dirname, "public")));

// Read and parse the local cameras.json file.
function loadCameras() {
  const filePath = path.join(__dirname, "data", "cameras.json");
  const fileData = fs.readFileSync(filePath, "utf8");

  return JSON.parse(fileData);
}

// Load camera data safely. If cameras.json has a problem,
// send a 500 error instead of crashing the route.
function getCamerasOrSendError(res) {
  try {
    return loadCameras();
  } catch (error) {
    console.error("Error reading cameras.json:", error);

    res.status(500).json({
      error: "Unable to load camera data.",
    });

    return null;
  }
}

// Convert the active camera query string into an array of camera IDs.
function getActiveCameraIds(req) {
  const activeQuery = req.query.active;

  if (!activeQuery) {
    return [];
  }

  if (Array.isArray(activeQuery)) {
    return activeQuery;
  }

  return activeQuery
    .split(",")
    .map(id => id.trim())
    .filter(id => id.length > 0);
}

// API route: return all cameras.
app.get("/api/cameras", (req, res) => {
  const cameras = getCamerasOrSendError(res);

  if (!cameras) {
    return;
  }

  res.json(cameras);
});

// API route: return cameras marked as defaults.
app.get("/api/defaults", (req, res) => {
  const cameras = getCamerasOrSendError(res);

  if (!cameras) {
    return;
  }

  const defaults = cameras.filter(camera => camera.isDefault);

  res.json(defaults);
});

// API route: return one camera by id.
app.get("/api/cameras/:id", (req, res) => {
  const cameras = getCamerasOrSendError(res);

  if (!cameras) {
    return;
  }

  const camera = cameras.find(camera => camera.id === req.params.id);

  if (!camera) {
    return res.status(404).json({
      error: "Camera not found.",
    });
  }

  res.json(camera);
});

// API route: return a random fallback camera that is not already active.
app.get("/api/fallback/:currentId", (req, res) => {
  const cameras = getCamerasOrSendError(res);

  if (!cameras) {
    return;
  }

  const currentId = req.params.currentId;
  const activeIds = getActiveCameraIds(req);

  let available = cameras.filter(camera =>
    camera.id !== currentId &&
    !activeIds.includes(camera.id) &&
    camera.videoId
  );

  // If every valid camera is already active, relax the rule and only avoid
  // returning the same camera currently displayed on this card.
  if (available.length === 0) {
    available = cameras.filter(camera =>
      camera.id !== currentId &&
      camera.videoId
    );
  }

  if (available.length === 0) {
    return res.status(404).json({
      error: "No fallback cameras available.",
    });
  }

  const randomIndex = Math.floor(Math.random() * available.length);
  const fallbackCamera = available[randomIndex];

  res.json(fallbackCamera);
});

// Start the server.
app.listen(PORT, () => {
  console.log(`Live Webcam Dashboard server running at http://localhost:${PORT}`);
});