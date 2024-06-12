import { WebSocketServer } from 'ws'; // Import the WebSocketServer class from the 'ws' library

const wss = new WebSocketServer({ port: 8080 }); // Create a new WebSocket server on port 8080

wss.on('connection', function connection(ws) {
  console.log('A new client connected');

  // Listen for messages from the client
  ws.on('message', function incoming(message) {
    console.log('received:', message);

    // Broadcast the received message to all connected clients
    wss.clients.forEach(function each(client) {
      if (client.readyState === ws.OPEN) { // Use the ws instance to check for OPEN state
        client.send(message);
      }
    });
  });

  // Send a welcome message to the new client
  ws.send(JSON.stringify({ type: 'welcome', message: 'Connected to the WebSocket server!' }));
});

console.log('WebSocket server running on ws://localhost:8080');
