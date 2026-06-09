# Live Webcam Dashboard

## Overview

This project is a web-based live webcam dashboard created for CSE 310 Module #3: Networking. The purpose of this software is to demonstrate a simple client-server networking model using a browser-based client and a Node.js/Express server.

The dashboard displays four public YouTube livestream camera sources in a responsive web interface. The browser client sends HTTP requests to the Express server to request camera data. The server responds with JSON data, and the client uses that response to populate the dashboard, update video embeds, fill dropdown lists, change default cameras, and request random camera sources.

This project uses HTTP communication over TCP. The browser acts as the client, and the Node.js/Express application acts as the server. Camera information is stored on the server side in a local JSON file. The server reads that file and provides structured camera data in response to client requests.

The main goals of this project are:

* Demonstrate client-server networking.
* Send requests from the browser client to the server.
* Return JSON responses from the server to the client.
* Use the server response to update the webpage GUI.
* Load camera source information from a local JSON data file.
* Provide a simple dashboard interface for viewing and selecting public livestream camera sources.
* Allow the user to select a random camera while avoiding duplicate active streams when possible.
* Allow the user to save selected cameras as local dashboard defaults.

[Software Demo Video](http://youtube.link.goes.here)

## Network Communication

This project uses the client-server model.

The client is the browser-based dashboard. The server is a Node.js/Express application. The client uses the `fetch()` function in JavaScript to send HTTP requests to the server. The server processes those requests and sends JSON responses back to the client.

HTTP runs over TCP, so this project satisfies the networking requirement through TCP-based client-server communication.

The application includes several request types:

* `GET /api/cameras`
  Returns the full list of available camera sources.

* `GET /api/defaults`
  Returns the cameras marked as default cameras. These load automatically when the dashboard opens.

* `POST /api/defaults`
  Updates the local `cameras.json` file so the currently selected camera becomes a saved default camera.

* `GET /api/cameras/:id`
  Returns information for one selected camera source.

* `GET /api/random/:currentId?active=...`
  Returns a random camera source. The server avoids returning the camera already displayed on the current card and tries to avoid cameras already active on the dashboard.

The client uses the JSON response data to update dashboard cards, dropdown lists, camera titles, category labels, description text, default button states, status labels, and embedded YouTube livestream players.

## Development Environment

This software was developed using:

* Visual Studio Code
* Node.js
* Express.js
* HTML
* CSS
* JavaScript
* JSON
* Git / GitHub

The project runs locally during development. The Express server serves the client files and provides API routes for camera data.

## Project Structure

live-webcam-dashboard/
├─ data/
│  └─ cameras.json
├─ public/
│  ├─ css/
│  │  └─ styles.css
│  ├─ js/
│  │  └─ app.js
│  ├─ favicon.png
│  └─ index.html
├─ README.md
├─ package.json
└─ server.js

## How to Run

Install the project dependencies:

`npm install`

Start the local Express server:

`npm start`

Then open the local server address in a browser:

`http://localhost:3030`

The server also provides API routes that can be viewed directly in the browser:

`http://localhost:3030/api/cameras`

`http://localhost:3030/api/defaults`

## Features

Current features include:

* Four-card live webcam dashboard.
* Public YouTube livestream embeds.
* Responsive layout for desktop, tablet, and mobile screen sizes.
* Dropdown camera selection for each dashboard card.
* Random camera button for replacing a displayed stream.
* Duplicate avoidance when selecting random cameras when possible.
* Default camera button that saves selected defaults to `cameras.json`.
* Default camera state that persists after page reload.
* Mute and unmute button for each stream.
* Reload stream button for each card.
* Loading overlay while streams are loading.
* Dynamic camera descriptions.
* Dynamic footer copyright year.

## Useful Websites

* [Node.js Documentation](https://nodejs.org/en/docs)
* [Express.js Documentation](https://expressjs.com/)
* [MDN Web Docs - Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
* [MDN Web Docs - JSON](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/JSON)
* [MDN Web Docs - HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP)
* [W3Schools - HTML YouTube Videos](https://www.w3schools.com/html/html_youtube.asp)
* [Wikipedia - Client-server model](https://en.wikipedia.org/wiki/Client%E2%80%93server_model)
* [Wikipedia - Transmission Control Protocol](https://en.wikipedia.org/wiki/Transmission_Control_Protocol)

## Future Work

Possible future improvements include:

* Add more public live camera sources.
* Improve random selection by category or location.
* Add better stream status handling.
* Add search or filtering by category.
* Add a fullscreen viewer option via the dashboard controls.
* Add saved user preferences beyond the local default camera list.
* Add better error messages when a livestream cannot be embedded.
* Add a more advanced YouTube player controller using the YouTube IFrame Player API.
* Continue improving mobile layout and accessibility.

## Learning Strategies

During this project, I used several learning strategies:

* Started with a small working version before adding extra features.
* Built and tested the client-server connection first.
* Used browser developer tools to inspect network requests and responses.
* Kept the networking requirement clear by showing how the client requests data and how the server responds.
* Used comments to explain the purpose of important functions.
* Tested each feature in small steps before combining everything into the final dashboard.
* Avoided overcomplicating livestream failure detection so the project stayed focused on networking.

## Author

Eric Arndt

CSE 310 - Applied Programming
Module #3 - Networking
