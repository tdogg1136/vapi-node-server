import dotenv from 'dotenv';
dotenv.config();

import express, { json } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { webhookHandler } from "./handlers/webhook";
import { outboundCallHandler } from "./handlers/outbound";
import { BackgroundProcessor } from "./services/backgroundProcessor";
import { JobQueue } from "./services/jobQueue";

const host = "localhost";
const port = 8080;

const app = express();

app.use(json());
app.use(cors());
app.use(bodyParser.json());

// Initialize background services
const backgroundProcessor = new BackgroundProcessor();
const jobQueue = new JobQueue();

// Start background processing
backgroundProcessor.start();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down gracefully...');
  backgroundProcessor.stop();
  jobQueue.stop();
  process.exit(0);
});

app.get("/", (req, res) => {
  res.send({ message: "Hello API" });
});

app.post("/webhook", webhookHandler);

app.post("/outbound/call", outboundCallHandler);
app.post("/outbound/schedule", outboundCallHandler);

// Background job management endpoints
app.post("/jobs", (req, res) => {
  const { type, data, scheduledFor } = req.body;
  const jobId = jobQueue.addJob(type, data, scheduledFor);
  res.json({ jobId, message: 'Job scheduled successfully' });
});

app.get("/jobs/:jobId", (req, res) => {
  const job = jobQueue.getJobStatus(req.params.jobId);
  if (job) {
    res.json(job);
  } else {
    res.status(404).json({ error: 'Job not found' });
  }
});

app.get("/jobs", (req, res) => {
  const pendingJobs = jobQueue.getPendingJobs();
  res.json({ pendingJobs });
});

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
  console.log(`[ background processor ] started`);
});
