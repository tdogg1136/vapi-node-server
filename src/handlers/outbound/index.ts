import { Request, Response } from "express";
import { OutboundScheduler } from "../../services/outboundScheduler";
import { VapiClient } from "../../services/vapiClient";
import { JobQueue } from "../../services/jobQueue";

// Create JobQueue instance first
const jobQueue = new JobQueue();
const scheduler = new OutboundScheduler(jobQueue);
const vapiClient = new VapiClient({
  apiKey: process.env.VAPI_API_KEY!,
});

export const outboundCallHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { action, ...params } = req.body;

    switch (action) {
      case 'immediate_call':
        const callResult = await vapiClient.createOutboundCall(params);
        return res.status(200).json(callResult);
      
      case 'schedule_call':
        await scheduler.scheduleFollowUpCall(
          params.contactId,
          params.delayMinutes
        );
        return res.status(200).json({ 
          message: 'Call scheduled successfully' 
        });
      
      default:
        return res.status(400).json({ 
          error: 'Invalid action specified' 
        });
    }
  } catch (error) {
    return res.status(500).json({ 
      error: error.message 
    });
  }
}; 