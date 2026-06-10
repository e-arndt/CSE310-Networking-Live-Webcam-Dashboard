# Live Webcam Dashboard

## Overview

Live Webcam Dashboard is a web-based dashboard for viewing public YouTube livestream camera sources through a local client-server application. I wrote this software to practice building a networked application where a browser client communicates with a Node.js/Express server, receives JSON data, and uses that data to update a graphical user interface.

The dashboard displays four public livestream camera sources in a responsive web interface. The user can select cameras from dropdown lists, request a random camera, save a selected camera as a local default, mute or unmute a stream, and reload an individual stream. Camera information is stored in a local JSON file on the server side.

To use the software, start the Express server with `npm start`, open `http://localhost:3030` in a browser, and interact with the dashboard. The server hosts the webpage files and also provides API routes that the browser client uses to request and update camera data.

The purpose of this project was to improve my understanding of client-server networking, HTTP request/response communication, JSON data exchange, server-side routing, and browser-side GUI updates.

[Software Demo Video](https://youtu.be/aJbX96hptYM)

## Network Communication

This project uses a client-server architecture.

The client is the browser-based dashboard. The server is a Node.js/Express application. The Express server hosts the static webpage files from the `public` folder, including `index.html`, `styles.css`, `app.js`, and the favicon. After the page loads, the browser-side JavaScript sends HTTP requests to the server using `fetch()`.

This project uses TCP. HTTP runs over TCP, so the browser client and Express server communicate using TCP-based HTTP request and response traffic. The server runs locally on port `3030`.

The messages sent between the client and server are HTTP requests and JSON responses. The client sends requests to API routes, and the server responds with JSON camera data or saves updated default-camera data.

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

The main programming language is JavaScript. Node.js and Express.js are used for the server. Browser-side JavaScript is used for the client. HTML and CSS are used for the webpage structure and styling. JSON is used to store the camera data.

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
