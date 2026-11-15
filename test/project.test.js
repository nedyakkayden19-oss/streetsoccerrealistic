const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'public', 'index.html'), 'utf8');
const server = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

test('project includes its server and game entry point', () => {
  assert.ok(fs.existsSync(path.join(root, 'server.js')));
  assert.ok(fs.existsSync(path.join(root, 'public', 'index.html')));
});

test('player folder and project documentation are present', () => {
  assert.ok(fs.existsSync(path.join(root, 'player', 'README.md')));
  assert.ok(fs.existsSync(path.join(root, 'README.md')));
});

test('Regular Field has create and join online lobby controls', () => {
  assert.match(html, /id="regular-create-online"/);
  assert.match(html, /id="regular-join-online"/);
  assert.match(html, /id="p-regular-join"/);
  assert.match(html, /joinLobby\(\$\('regular-jcode'\)\.value/);
});

test('server provides Socket.IO lobby creation, joining, and event relay', () => {
  assert.ok(pkg.dependencies['socket.io']);
  assert.match(server, /create-lobby/);
  assert.match(server, /join-lobby/);
  assert.match(server, /game-event/);
  assert.match(server, /lobby-closed/);
});
