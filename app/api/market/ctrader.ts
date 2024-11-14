// /pages/api/ctrader.ts
import { NextApiRequest, NextApiResponse } from "next";
import WebSocket from "ws"; // Import WebSocket

let ws: WebSocket | null = null; // WebSocket connection instance

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    // Set headers for Server-Sent Events
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Create WebSocket connection if it doesn't exist
    if (!ws) {
      ws = new WebSocket("wss://demo.ctraderapi.com:5036");

      ws.on("open", () => {
        console.log("Connected to cTrader WebSocket API");
      });

      ws.on("error", (error) => {
        console.error("WebSocket error:", error);
      });

      ws.on("close", () => {
        console.log("WebSocket connection closed");
        ws = null; // Reset connection
      });
    }

    // Listen for messages and send them to the client
    ws.on("message", (data: WebSocket.Data) => {
      const parsedData = JSON.parse(data.toString());
      res.write(`data: ${JSON.stringify(parsedData)}\n\n`); // Send data to the client
    });

    // Handle client disconnect
    res.on("close", () => {
      console.log("Client disconnected from SSE");
      if (ws) ws.close(); // Close WebSocket connection if needed
    });
  } else {
    res.status(405).end("Method Not Allowed"); // Only allow GET requests
  }
}
