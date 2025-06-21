import { Request, Response } from "express";
import { VapiPayload, VapiWebhookEnum } from "../types/vapi.types";
import { toolCallHandler } from "./toolCall";
import { hubspotWebhookHandler } from "./hubspotWebhook";

export const webhookHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    // Check if this is a HubSpot webhook
    if (req.headers['x-hubspot-signature'] || req.body.subscriptionType) {
      return res.status(200).json(await hubspotWebhookHandler(req.body));
    }
    
    // Handle Vapi webhooks
    const payload = req.body.message as VapiPayload;
    switch (payload.type) {
      case VapiWebhookEnum.TOOL_CALL:
        return res.status(201).json(await toolCallHandler(payload));
      default:
        throw new Error(`Unhandled message type`);
    }
  } catch (error) {
    console.error('Webhook handler error:', error);
    return res.status(500).send(error.message);
  }
};
