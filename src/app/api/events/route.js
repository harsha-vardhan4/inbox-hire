import { NextResponse } from 'next/server';

const clients = new Set();

export function sendToAllClients(data) {
  const message = `data: ${JSON.stringify(data)}\n\n`;
  const disconnectedClients = [];

  clients.forEach(client => {
    try {
      if (client.isActive) {
        client.write(message);
      } else {
        disconnectedClients.push(client);
      }
    } catch (error) {
      console.error('Error sending to client:', error);
      client.isActive = false;
      disconnectedClients.push(client);
    }
  });

  // Remove dead clients
  disconnectedClients.forEach(client => {
    clients.delete(client);
    console.log('Removed disconnected client');
  });
}

setInterval(() => {
  sendToAllClients({ type: 'heartbeat', timestamp: Date.now() });
}, 30000);

export async function GET() {
  console.log('New SSE connection request received');

  const encoder = new TextEncoder();

  let client;

  const stream = new ReadableStream({
    start(controller) {
      client = {
        isActive: true,
        write: (data) => {
          try {
            if (!client.isActive) return;
            controller.enqueue(encoder.encode(data));
            console.log('Data written to client stream');
          } catch (error) {
            console.error('Error writing to client:', error);
            client.isActive = false;
            clients.delete(client);
          }
        },
        close: () => {
          if (!client.isActive) return;
          client.isActive = false;
          try {
            controller.close();
            console.log('Closed client stream');
          } catch (err) {
            console.error('Error closing stream:', err);
          }
        },
      };

      // Add only after full initialization
      clients.add(client);
      console.log(`Client connected. Total clients: ${clients.size}`);

      // Initial connection message
      client.write(`data: ${JSON.stringify({ type: 'connected', timestamp: Date.now() })}\n\n`);
    },

    cancel() {
      console.log('ReadableStream cancelled — client likely disconnected');
      if (client) {
        client.isActive = false;
        clients.delete(client);
        console.log(`Client removed. Remaining: ${clients.size}`);
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
