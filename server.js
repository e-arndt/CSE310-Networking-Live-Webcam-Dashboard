const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3030;

/*
  Express setup

  express.json() allows the server to read JSON data sent in a request body.
  This is needed for the POST /api/defaults route when the browser saves a
  new default camera.
*/
app.use(express.json());

/*
  Static file hosting

  Express serves index.html, app.js, styles.css, and the favicon from the
  public folder. This lets the browser load the dashboard from the same local
  server that also provides the API routes.
*/
app.use(express.static(path.join(__dirname, "public")));

/*
  loadCameras()

  Reads the local camera data file from data/cameras.json and converts it from
  JSON text into a JavaScript array of camera objects.
*/
function loadCameras() {
  const filePath = path.join(__dirname, "data", "cameras.json");
  const fileData = fs.readFileSync(filePath, "utf8");

  return JSON.parse(fileData);
}

/*
  saveCameras(cameras)

  Converts the camera array back into formatted JSON text and saves it to
  data/cameras.json. This is used when the user changes a default camera.
*/
function saveCameras(cameras) {
  const filePath = path.join(__dirname, "data", "cameras.json");
  const fileData = JSON.stringify(cameras, null, 2);

  fs.writeFileSync(filePath, fileData, "utf8");
}

/*
  getCamerasOrSendError(res)

  Safely loads the camera list for API routes. If cameras.json cannot be read
  or parsed, the server sends a 500 error response instead of crashing the app.
*/
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

/*
  getActiveCameraIds(req)

  Reads the active camera IDs from the query string. The browser sends these
  IDs when requesting a random camera so the server can avoid duplicate streams
  when possible.
*/
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

/*
  GET /api/cameras

  Returns the full list of available camera sources. The browser uses this data
  to populate the dropdown lists on each dashboard card.
*/
app.get("/api/cameras", (req, res) => {
  const cameras = getCamerasOrSendError(res);

  if (!cameras) {
    return;
  }

  res.json(cameras);
});

/*
  GET /api/defaults

  Returns only the cameras marked with isDefault: true. The browser uses this
  route when the dashboard first loads to fill the four default camera cards.
*/
app.get("/api/defaults", (req, res) => {
  const cameras = getCamerasOrSendError(res);

  if (!cameras) {
    return;
  }

  const defaults = cameras.filter(camera => camera.isDefault);

  res.json(defaults);
});

/*
  POST /api/defaults

  Replaces one saved default camera with the camera currently displayed on a
  dashboard card. This demonstrates a POST request from the browser to the
  server and a server-side update to the local JSON data file.
*/
app.post("/api/defaults", (req, res) => {
  const cameras = getCamerasOrSendError(res);

  if (!cameras) {
    return;
  }

  const { slotIndex, cameraId } = req.body;

  // Validate the dashboard slot index sent by the browser.
  if (!Number.isInteger(slotIndex) || slotIndex < 0) {
    return res.status(400).json({
      error: "A valid slotIndex is required.",
    });
  }

  // Validate that the browser sent a camera ID.
  if (!cameraId) {
    return res.status(400).json({
      error: "A cameraId is required.",
    });
  }

  const selectedCamera = cameras.find(camera => camera.id === cameraId);

  if (!selectedCamera) {
    return res.status(404).json({
      error: "Selected camera not found.",
    });
  }

  /*
    Safety check

    If the selected camera is already a default, do nothing. The client disables
    this button in the UI, but the server still protects the data in case the
    route is called directly.
  */
  if (selectedCamera.isDefault) {
    return res.json(cameras);
  }

  const defaults = cameras.filter(camera => camera.isDefault);
  const oldDefault = defaults[slotIndex];

  // Remove the old default assigned to this dashboard slot.
  if (oldDefault) {
    oldDefault.isDefault = false;
  }

  // Save the selected camera as the new default.
  selectedCamera.isDefault = true;

  try {
    saveCameras(cameras);
  } catch (error) {
    console.error("Error writing cameras.json:", error);

    return res.status(500).json({
      error: "Unable to save default camera change.",
    });
  }

  res.json(cameras);
});

/*
  GET /api/cameras/:id

  Returns one camera object that matches the requested camera ID. This route is
  useful for testing and demonstrates a route parameter.
*/
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

/*
  GET /api/random/:currentId

  Returns a random camera for one dashboard card. The server avoids returning
  the camera already displayed on that card and tries to avoid cameras already
  active on the rest of the dashboard.
*/
app.get("/api/random/:currentId", (req, res) => {
  const cameras = getCamerasOrSendError(res);

  if (!cameras) {
    return;
  }

  const currentId = req.params.currentId;
  const activeIds = getActiveCameraIds(req);

  /*
    First random selection pass

    Prefer cameras that:
    - are not the current camera
    - are not already active on another card
    - have a valid YouTube videoId
  */
  let available = cameras.filter(camera =>
    camera.id !== currentId &&
    !activeIds.includes(camera.id) &&
    camera.videoId
  );

  /*
    Second random selection pass

    If every valid camera is already active somewhere on the dashboard, relax
    the duplicate rule and only avoid returning the same camera currently shown
    on this card.
  */
  if (available.length === 0) {
    available = cameras.filter(camera =>
      camera.id !== currentId &&
      camera.videoId
    );
  }

  if (available.length === 0) {
    return res.status(404).json({
      error: "No random cameras available.",
    });
  }

  const randomIndex = Math.floor(Math.random() * available.length);
  const randomCamera = available[randomIndex];

  res.json(randomCamera);
});

/*
  Start the local server

  The dashboard and API routes are available at:
  http://localhost:3030
*/
app.listen(PORT, () => {
  console.log(`Live Webcam Dashboard server running at http://localhost:${PORT}`);
});