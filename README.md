# Street Soccer 3D

Street Soccer 3D is a browser soccer game with solo, local split-screen, and online multiplayer.

## Requirements
- Node.js 18 or newer
- npm

## Run the game and multiplayer server
1. Open a terminal in this project folder.
2. Install dependencies: `npm install`
3. Start the server: `npm start`
4. Open `http://localhost:3000` in your browser.

For friends on other networks to join, host this project on a publicly reachable Node.js server with WebSocket support and share its URL. A local `localhost` server is only reachable from your own computer/network unless you configure network access.

## Regular Field online multiplayer
1. Open **Regular Field** from the main menu.
2. Choose **Create Online Lobby** and share the four-letter room code, or choose **Join Online Lobby** and enter a friend's code.
3. Choose to join the host's team or the opposing team.
4. The host starts the match when everyone has joined.

Online rooms use the same server as the game. The server relays lobby updates, player inputs, and match state between connected players.

## Run tests
Run `npm test` to check the project files and multiplayer lobby setup.

## Project folders
- `public/` — browser game files (`index.html`)
- `player/` — reserved for player-related assets or data
- `test/` — project checks
- `server.js` — Express and Socket.IO multiplayer server
- `package.json` — project scripts and dependencies
- `.gitignore` — files Git should ignore
