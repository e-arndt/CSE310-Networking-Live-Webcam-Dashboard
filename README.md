# Live Webcam Dashboard

## Overview

This project is a web-based live webcam dashboard created for CSE 310 Module #3: Networking. The purpose of this software is to demonstrate the client-server networking model using a browser-based client and a Node.js/Express server.

The dashboard displays multiple public live camera or livestream sources in a responsive web interface. The browser client sends HTTP requests to the server to request camera source data. The server responds with JSON data, and the client uses that response to populate the dashboard, update video embeds, fill dropdown lists, and request fallback camera sources when needed.

This project uses HTTP communication over TCP. The browser acts as the client, and the Node.js/Express application acts as the server. Camera information is stored on the server side in a local JSON file, which allows the server to provide structured camera data in response to client requests.

The main goals of this project are:

* Demonstrate client-server networking.
* Send requests from the browser client to the server.
* Return JSON responses from the server to the client.
* Use the server response to update the webpage GUI.
* Load camera source information from a local data file.
* Provide a simple dashboard interface for viewing and selecting live camera sources.
* Include fallback camera logic when a selected source is unavailable or needs to be replaced.

[Software Demo Video](http://youtube.link.goes.here)

## Network Communication

This project uses the client-server model.

The client is the browser-based dashboard. The server is a Node.js/Express application. The client uses the `fetch()` function in JavaScript to send HTTP requests to the server. The server processes those requests and sends JSON responses back to the client.

Example request types planned for this project include:

* `GET /api/cameras`
  Returns the full list of available camera sources.

* `GET /api/defaults`
  Returns the default cameras that should load when the dashboard opens.

* `GET /api/cameras/:id`
  Returns information for one selected camera source.

* `GET /api/fallback/:slot`
  Returns a replacement camera source for a dashboard slot.

The client then uses the JSON response data to update the dashboard cards, dropdown lists, camera titles, status labels, and embedded livestream players.

## Development Environment

This software is being developed using:

* Visual Studio Code
* Node.js
* Express.js
* HTML
* CSS
* JavaScript
* JSON
* Git / GitHub

The project is designed to run locally during development. The Express server serves the client files and provides API routes for camera data.

## Project Structure

text
live-webcam-dashboard/
├─ server.js
├─ package.json
├─ README.md
├─ data/
│  └─ cameras.json
├─ public/
│  ├─ index.html
│  ├─ css/
│  │  └─ styles.css
│  └─ js/
│     ├─ app.js
│     ├─ cam-tune.js
│     └─ cam-status.js
└─ docs/
   └─ time-log.md


## How to Run

These instructions will be updated as the project is completed.

Planned local startup process:

bash
npm install
npm start


Then open the local server address in a browser, such as:

text
http://localhost:3030


## Useful Websites

* [Node.js Documentation](https://nodejs.org/en/docs)
* [Express.js Documentation](https://expressjs.com/)
* [MDN Web Docs - Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
* [MDN Web Docs - JSON](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/JSON)
* [MDN Web Docs - HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP)
* [Wikipedia - Client-server model](https://en.wikipedia.org/wiki/Client%E2%80%93server_model)
* [Wikipedia - Transmission Control Protocol](https://en.wikipedia.org/wiki/Transmission_Control_Protocol)

## Future Work

Possible future improvements include:

* Add more public live camera sources.
* Improve fallback selection by category or location.
* Add better stream status handling.
* Add search or filtering by category.
* Add saved user preferences for selected cameras.
* Add a refresh option for individual dashboard cards.
* Improve mobile layout and accessibility.
* Add better error messages when a livestream cannot be embedded.


## Learning Strategies

During this project, I plan to use several learning strategies:

* Start with a small working version before adding extra features.
* Build and test the client-server connection first.
* Use browser developer tools to inspect network requests and responses.
* Keep the networking requirement clear by showing how the client requests data and how the server responds.
* Use comments to explain the purpose of each function.
* Test each feature in small steps before combining everything into the final dashboard.
* Avoid overcomplicating livestream failure detection so the project stays focused on networking.

## Author

Eric Arndt

CSE 310 - Applied Programming
Module #3 - Networking
