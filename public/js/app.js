// app.js
//
// Purpose:
// Controls the browser side of the Live Webcam Dashboard.
// The client requests camera data from the Express server and uses
// the server response to update dashboard cards, dropdowns, streams,
// descriptions, fallback choices, and stream controls.

let allCameras = [];

document.addEventListener("DOMContentLoaded", () => {
  console.log("Live Webcam Dashboard loaded.");

  loadDefaultCameras();
  loadCameraDropdowns();
  setupFallbackButtons();
  setupStreamControlButtons();
});

// Request the default camera list from the server.
async function loadDefaultCameras() {
  try {
    const response = await fetch("/api/defaults");

    if (!response.ok) {
      throw new Error("Failed to load default cameras.");
    }

    const defaultCameras = await response.json();

    console.log("Default cameras from server:");
    console.log(defaultCameras);

    displayDefaultCameras(defaultCameras);
  } catch (error) {
    console.error("Error loading default cameras:", error);
  }
}

// Request the full camera list from the server and use it to fill dropdowns.
async function loadCameraDropdowns() {
  try {
    const response = await fetch("/api/cameras");

    if (!response.ok) {
      throw new Error("Failed to load camera list.");
    }

    const cameras = await response.json();

    allCameras = cameras;

    console.log("Full camera list from server:");
    console.log(cameras);

    populateDropdowns(cameras);
  } catch (error) {
    console.error("Error loading camera dropdowns:", error);
  }
}

// Match default cameras to dashboard cards by index.
function displayDefaultCameras(defaultCameras) {
  const cards = document.querySelectorAll(".card");

  cards.forEach((card, index) => {
    const camera = defaultCameras[index];

    if (!camera) {
      showNoDefaultCamera(card);
      return;
    }

    updateCard(card, camera);
  });
}

// Fill every camera dropdown with the full list of available cameras.
function populateDropdowns(cameras) {
  const dropdowns = document.querySelectorAll(".camera-select");

  dropdowns.forEach(dropdown => {
    dropdown.innerHTML = "";

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Select a camera...";
    placeholder.disabled = true;
    placeholder.selected = true;

    dropdown.appendChild(placeholder);

    cameras.forEach(camera => {
      const option = document.createElement("option");

      option.value = camera.id;
      option.textContent = `${camera.name} - ${camera.location}`;

      dropdown.appendChild(option);
    });

    const card = dropdown.closest(".card");

    if (card && card.dataset.cameraId) {
      dropdown.value = card.dataset.cameraId;
    }

    dropdown.addEventListener("change", event => {
      const selectedCameraId = event.target.value;
      const selectedCamera = allCameras.find(camera => camera.id === selectedCameraId);

      if (!selectedCamera) {
        return;
      }

      const card = dropdown.closest(".card");

      if (!card) {
        return;
      }

      updateCard(card, selectedCamera);
    });
  });
}

// Update one dashboard card with one camera object.
function updateCard(card, camera) {
  const title = card.querySelector(".title-left");
  const status = card.querySelector(".status");
  const tag = card.querySelector(".tag");
  const frame = card.querySelector(".camFrame");
  const description = card.querySelector(".camera-description");
  const muteButton = card.querySelector(".mute-button");

  card.dataset.cameraId = camera.id;
  card.dataset.videoId = camera.videoId || "";
  card.dataset.muted = "true";

  if (title) {
    title.textContent = camera.name;
  }

  if (tag) {
    tag.textContent = camera.category || "YouTube Live";
  }

  if (description) {
    description.textContent = camera.description || "No description available.";
  }

  if (muteButton) {
    muteButton.textContent = "Unmute";
  }

  updateDropdownSelection(card, camera.id);

  if (!camera.videoId) {
    showNoVideoId(card, camera);
    return;
  }

  if (frame) {
    frame.innerHTML = "";

    const iframe = document.createElement("iframe");
    iframe.className = "cam";
    iframe.title = camera.name;
    iframe.allow = "autoplay; encrypted-media; picture-in-picture";
    iframe.allowFullscreen = true;
    iframe.src = buildYouTubeEmbedUrl(camera.videoId, true);

    frame.appendChild(iframe);
  }

  setStatus(status, "status-live", "● LIVE");
}

// Show a placeholder when there is no camera assigned to a card.
function showNoDefaultCamera(card) {
  const title = card.querySelector(".title-left");
  const status = card.querySelector(".status");
  const tag = card.querySelector(".tag");
  const frame = card.querySelector(".camFrame");
  const description = card.querySelector(".camera-description");
  const muteButton = card.querySelector(".mute-button");

  card.dataset.cameraId = "";
  card.dataset.videoId = "";
  card.dataset.muted = "true";

  if (title) {
    title.textContent = "No Default Camera";
  }

  if (tag) {
    tag.textContent = "Unassigned";
  }

  if (description) {
    description.textContent = "No default stream is assigned to this dashboard slot.";
  }

  if (muteButton) {
    muteButton.textContent = "Unmute";
  }

  if (frame) {
    frame.innerHTML = `
      <div class="placeholder">
        <div class="placeholder-title">No Default Camera</div>
        <div class="placeholder-text">Select a camera or use fallback.</div>
      </div>
    `;
  }

  setStatus(status, "status-offline", "● OFF AIR");
}

// Show a placeholder when a camera exists but has no YouTube video ID.
function showNoVideoId(card, camera) {
  const status = card.querySelector(".status");
  const frame = card.querySelector(".camFrame");

  if (frame) {
    frame.innerHTML = `
      <div class="placeholder">
        <div class="placeholder-title">${camera.name}</div>
        <div class="placeholder-text">Video ID needed.</div>
      </div>
    `;
  }

  setStatus(status, "status-offline", "● MISSING SOURCE");
}

// Build the YouTube embed URL from a video ID.
function buildYouTubeEmbedUrl(videoId, muted = true) {
  const muteValue = muted ? "1" : "0";

  return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${muteValue}&controls=1&playsinline=1&rel=0`;
}

// Update the visual status badge on a card.
function setStatus(statusElement, statusClass, statusText) {
  if (!statusElement) {
    return;
  }

  statusElement.className = `status ${statusClass}`;
  statusElement.textContent = statusText;
}

// Set the dropdown value to match the camera currently displayed on the card.
function updateDropdownSelection(card, cameraId) {
  const dropdown = card.querySelector(".camera-select");

  if (!dropdown) {
    return;
  }

  dropdown.value = cameraId;
}

// Get a list of camera IDs that are currently active on the dashboard.
function getActiveCameraIds() {
  const cards = document.querySelectorAll(".card");
  const activeIds = [];

  cards.forEach(card => {
    const cameraId = card.dataset.cameraId;

    if (cameraId) {
      activeIds.push(cameraId);
    }
  });

  return activeIds;
}

// Add click listeners to each fallback button.
function setupFallbackButtons() {
  const fallbackButtons = document.querySelectorAll(".fallback-button");

  fallbackButtons.forEach(button => {
    button.addEventListener("click", async () => {
      const card = button.closest(".card");

      if (!card) {
        return;
      }

      const currentCameraId = card.dataset.cameraId || "none";
      const activeCameraIds = getActiveCameraIds();
      const activeParam = encodeURIComponent(activeCameraIds.join(","));
      const currentParam = encodeURIComponent(currentCameraId);

      try {
        const response = await fetch(`/api/fallback/${currentParam}?active=${activeParam}`);

        if (!response.ok) {
          throw new Error("Failed to load fallback camera.");
        }

        const fallbackCamera = await response.json();

        updateCard(card, fallbackCamera);

        console.log("Fallback camera selected:", fallbackCamera);
      } catch (error) {
        console.error("Error loading fallback camera:", error);

        const status = card.querySelector(".status");
        setStatus(status, "status-offline", "● FALLBACK ERROR");
      }
    });
  });
}

// Add click listeners to the mute and reload stream buttons.
function setupStreamControlButtons() {
  const cards = document.querySelectorAll(".card");

  cards.forEach(card => {
    const muteButton = card.querySelector(".mute-button");
    const reloadButton = card.querySelector(".reload-button");

    if (muteButton) {
      muteButton.addEventListener("click", () => {
        toggleMute(card);
      });
    }

    if (reloadButton) {
      reloadButton.addEventListener("click", () => {
        reloadStream(card);
      });
    }
  });
}

// Toggle a card between muted and unmuted playback.
// This simple version reloads the YouTube iframe with mute=1 or mute=0.
function toggleMute(card) {
  const videoId = card.dataset.videoId;

  if (!videoId) {
    return;
  }

  const currentlyMuted = card.dataset.muted !== "false";
  const newMutedState = !currentlyMuted;

  card.dataset.muted = newMutedState ? "true" : "false";

  const iframe = card.querySelector("iframe.cam");

  if (iframe) {
    iframe.src = buildYouTubeEmbedUrl(videoId, newMutedState);
  }

  const muteButton = card.querySelector(".mute-button");

  if (muteButton) {
    muteButton.textContent = newMutedState ? "Unmute" : "Mute";
  }
}

// Reload the currently displayed stream using the current mute state.
function reloadStream(card) {
  const videoId = card.dataset.videoId;

  if (!videoId) {
    return;
  }

  const muted = card.dataset.muted !== "false";
  const iframe = card.querySelector("iframe.cam");

  if (iframe) {
    iframe.src = buildYouTubeEmbedUrl(videoId, muted);
  }
}