// app.js
//
// Browser-side code for the Live Webcam Dashboard.
// This file demonstrates the client side of the client-server project.
// It requests JSON data from the Express server and uses the responses to
// update the dashboard interface.

let allCameras = [];

/*
  Page startup

  When the HTML document is ready, the client loads default cameras, loads the
  full camera list for the dropdowns, connects button event handlers, and sets
  the footer copyright year.
*/
document.addEventListener("DOMContentLoaded", () => {
  console.log("Live Webcam Dashboard loaded.");

  loadDefaultCameras();
  loadCameraDropdowns();
  setupRandomButtons();
  setupStreamControlButtons();
  setupDefaultButtons();
  setCopyrightYear();
});

/*
  loadDefaultCameras()

  Requests the saved default cameras from the server. These are the cameras
  marked with isDefault: true in cameras.json. The returned JSON is used to fill
  the dashboard cards when the page first loads.
*/
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

/*
  loadCameraDropdowns()

  Requests the full camera list from the server. The client stores this list in
  allCameras so dropdown selections and default-button updates can use the same
  camera data without making extra requests.
*/
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

/*
  displayDefaultCameras(defaultCameras)

  Matches the default camera list to the dashboard cards by index. The first
  default camera fills the first card, the second fills the second card, and so
  on. Empty slots show a no-default placeholder.
*/
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

/*
  populateDropdowns(cameras)

  Fills each camera dropdown with the full camera list. Each option stores a
  camera ID, which lets the client find the selected camera object later.
*/
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

    /*
      Dropdown selection handler

      When the user chooses a camera from the dropdown, the client finds that
      camera in allCameras and updates only the matching dashboard card.
    */
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

/*
  updateCard(card, camera)

  Central dashboard update function. Default loading, dropdown changes, and
  Random button selections all use this function so card behavior stays
  consistent across the app.
*/
function updateCard(card, camera) {
  const title = card.querySelector(".title-left");
  const status = card.querySelector(".status");
  const tag = card.querySelector(".tag");
  const frame = card.querySelector(".camFrame");
  const description = card.querySelector(".camera-description");
  const muteButton = card.querySelector(".mute-button");

  /*
    Store the active camera information on the card. These data attributes are
    used later by Random selection, mute/unmute, reload, and default saving.
  */
  card.dataset.cameraId = camera.id;
  card.dataset.videoId = camera.videoId || "";
  card.dataset.muted = "true";

  updateDefaultButton(card, camera);

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

  /*
    Replace the current stream frame with a new YouTube iframe. Streams start
    muted so autoplay is more likely to work in modern browsers.
  */
  if (frame) {
    frame.innerHTML = "";

    setStatus(status, "status-loading", "● LOADING");

    const iframe = document.createElement("iframe");
    iframe.className = "cam";
    iframe.title = camera.name;
    iframe.allow = "autoplay; encrypted-media; picture-in-picture";
    iframe.allowFullscreen = true;
    iframe.src = buildYouTubeEmbedUrl(camera.videoId, true);

    const loadingOverlay = document.createElement("div");
    loadingOverlay.className = "stream-loading-overlay";
    loadingOverlay.textContent = "Loading stream...";

    frame.appendChild(iframe);
    frame.appendChild(loadingOverlay);

    /*
      Simple loading display

      YouTube iframe load state is not fully controlled by this app. This short
      overlay gives the user visible feedback while the iframe begins loading.
    */
    setTimeout(() => {
      loadingOverlay.remove();
      setStatus(status, "status-live", "● LIVE");
    }, 1500);
  }
}

/*
  showNoDefaultCamera(card)

  Displays a placeholder when a dashboard card does not have a default camera
  assigned. This keeps the UI readable even if fewer than four defaults are
  marked in cameras.json.
*/
function showNoDefaultCamera(card) {
  const title = card.querySelector(".title-left");
  const status = card.querySelector(".status");
  const tag = card.querySelector(".tag");
  const frame = card.querySelector(".camFrame");
  const description = card.querySelector(".camera-description");
  const muteButton = card.querySelector(".mute-button");
  const defaultButton = card.querySelector(".default-button");

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

  if (defaultButton) {
    defaultButton.textContent = "Set Default";
    defaultButton.classList.remove("default-active");
    defaultButton.disabled = true;
  }

  if (frame) {
    frame.innerHTML = `
      <div class="placeholder placeholder-no-default">
        <div class="placeholder-icon">⊘</div>
        <div class="placeholder-content">
          <div class="placeholder-title">No Default Camera</div>
          <div class="placeholder-text">Select a camera or use Random.</div>
        </div>
      </div>
    `;
  }

  setStatus(status, "status-offline", "● OFF AIR");
}

/*
  showNoVideoId(card, camera)

  Displays a missing-source placeholder when a camera entry exists but does not
  have a usable YouTube video ID.
*/
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

/*
  buildYouTubeEmbedUrl(videoId, muted)

  Builds the YouTube iframe embed URL used by the dashboard. The muted value is
  passed in so the same function can support first load, mute/unmute, and reload.
*/
function buildYouTubeEmbedUrl(videoId, muted = true) {
  const muteValue = muted ? "1" : "0";

  return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${muteValue}&controls=0&playsinline=1&rel=0`;
}

/*
  setStatus(statusElement, statusClass, statusText)

  Updates a card status badge by replacing its CSS class and visible label.
*/
function setStatus(statusElement, statusClass, statusText) {
  if (!statusElement) {
    return;
  }

  statusElement.className = `status ${statusClass}`;
  statusElement.textContent = statusText;
}

/*
  updateDropdownSelection(card, cameraId)

  Keeps the dropdown value synchronized with the camera currently displayed on
  the card. This is used after default loading, dropdown changes, and Random
  camera updates.
*/
function updateDropdownSelection(card, cameraId) {
  const dropdown = card.querySelector(".camera-select");

  if (!dropdown) {
    return;
  }

  dropdown.value = cameraId;
}

/*
  getActiveCameraIds()

  Collects the camera IDs currently displayed on the dashboard. The Random
  button sends this list to the server so the server can avoid duplicate active
  streams when possible.
*/
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

/*
  setupRandomButtons()

  Connects each Random button to the server's /api/random route. The request
  includes the current card's camera and the list of active dashboard cameras.
*/
function setupRandomButtons() {
  const randomButtons = document.querySelectorAll(".random-button");

  randomButtons.forEach(button => {
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
        const response = await fetch(`/api/random/${currentParam}?active=${activeParam}`);

        if (!response.ok) {
          throw new Error("Failed to load random camera.");
        }

        const randomCamera = await response.json();

        updateCard(card, randomCamera);

        console.log("Random camera selected:", randomCamera);
      } catch (error) {
        console.error("Error loading random camera:", error);

        const status = card.querySelector(".status");
        setStatus(status, "status-offline", "● RANDOM ERROR");
      }
    });
  });
}

/*
  setupStreamControlButtons()

  Connects the mute/unmute and reload buttons for each dashboard card.
*/
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

/*
  setupDefaultButtons()

  Connects each Set Default button to the server's POST /api/defaults route.
  This lets the user save the currently displayed camera as a local default in
  cameras.json.
*/
function setupDefaultButtons() {
  const defaultButtons = document.querySelectorAll(".default-button");

  defaultButtons.forEach(button => {
    button.addEventListener("click", async () => {
      const card = button.closest(".card");

      if (!card) {
        return;
      }

      const cameraId = card.dataset.cameraId;

      if (!cameraId) {
        return;
      }

      /*
        Default cameras are shown as disabled buttons, so this should only run
        for non-default cameras. This client-side guard matches the server-side
        safety check in POST /api/defaults.
      */
      if (button.disabled) {
        return;
      }

      const slotNumber = Number(card.dataset.slot);
      const slotIndex = slotNumber - 1;

      if (Number.isNaN(slotIndex) || slotIndex < 0) {
        console.error("Unable to determine dashboard slot for default update.");
        return;
      }

      try {
        button.disabled = true;
        button.textContent = "Saving...";

        const response = await fetch("/api/defaults", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            slotIndex,
            cameraId,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update default camera.");
        }

        const updatedCameras = await response.json();

        allCameras = updatedCameras;

        const updatedCamera = allCameras.find(camera => camera.id === cameraId);

        if (updatedCamera) {
          updateDefaultButton(card, updatedCamera);
        }

        refreshDefaultButtonsFromCameraList();

        console.log("Default camera updated:", {
          slotIndex,
          cameraId,
        });
      } catch (error) {
        console.error("Error updating default camera:", error);

        button.textContent = "Set Default";
        button.disabled = false;
      }
    });
  });
}

/*
  refreshDefaultButtonsFromCameraList()

  After the server saves a new default camera, this function refreshes the
  visible Default/Set Default button states on all currently displayed cards.
*/
function refreshDefaultButtonsFromCameraList() {
  const cards = document.querySelectorAll(".card");

  cards.forEach(card => {
    const cameraId = card.dataset.cameraId;

    if (!cameraId) {
      return;
    }

    const camera = allCameras.find(camera => camera.id === cameraId);

    if (camera) {
      updateDefaultButton(card, camera);
    }
  });
}

/*
  updateDefaultButton(card, camera)

  Updates the default button for one card. Cameras already saved as defaults
  display as disabled "Default Cam" buttons. Other cameras display as clickable
  "Set Default" buttons.
*/
function updateDefaultButton(card, camera) {
  const defaultButton = card.querySelector(".default-button");

  if (!defaultButton) {
    return;
  }

  if (camera.isDefault) {
    defaultButton.textContent = "Default Cam";
    defaultButton.classList.add("default-active");
    defaultButton.disabled = true;
  } else {
    defaultButton.textContent = "Set Default";
    defaultButton.classList.remove("default-active");
    defaultButton.disabled = false;
  }
}

/*
  setCopyrightYear()

  Sets the footer year automatically so the page does not need to be edited
  each calendar year.
*/
function setCopyrightYear() {
  const yearElement = document.getElementById("copyright-year");

  if (!yearElement) {
    return;
  }

  yearElement.textContent = new Date().getFullYear();
}

/*
  toggleMute(card)

  Switches one card between muted and unmuted playback. This simple approach
  reloads the YouTube iframe with mute=1 or mute=0 instead of using the more
  complex YouTube IFrame Player API.
*/
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

/*
  reloadStream(card)

  Reloads the currently displayed YouTube iframe while keeping the card's current
  mute state.
*/
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