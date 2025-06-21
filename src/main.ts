import dotenv from 'dotenv';
dotenv.config();

import express, { json } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { webhookHandler } from "./handlers/webhook";
import { hubspotWebhookHandler } from "./handlers/webhook/hubspotWebhook";

const host = "localhost";
const port = 8080;

const app = express();

app.use(json());
app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send({ message: "Hello API" });
});

// Combined webhook endpoint for both Vapi and HubSpot
app.post("/webhook", webhookHandler);

// Dedicated HubSpot webhook endpoint (optional)
app.post("/webhook/hubspot", async (req, res) => {
  try {
    const result = await hubspotWebhookHandler(req.body);
    res.status(200).json(result);
  } catch (error) {
    console.error('HubSpot webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
  console.log(`[ webhooks ] Vapi and HubSpot webhooks enabled`);
});
