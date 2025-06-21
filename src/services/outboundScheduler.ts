import { HubSpotService } from './hubspot';
import { VapiClient } from './vapiClient';
import { JobQueue } from './jobQueue';

interface ScheduledCall {
  contactId: string;
  assistantId: string;
  phoneNumberId: string;
  scheduledTime: Date;
  callType: 'follow_up' | 'lead_outreach' | 'reminder';
  metadata?: Record<string, any>;
}

export class OutboundScheduler {
  private hubspotService: HubSpotService;
  private vapiClient: VapiClient;
  private jobQueue: JobQueue;

  constructor(jobQueue: JobQueue) {
    this.hubspotService = new HubSpotService({
      apiKey: process.env.HUBSPOT_API_KEY!,
    });
    this.vapiClient = new VapiClient({
      apiKey: process.env.VAPI_API_KEY!,
    });
    this.jobQueue = jobQueue;
  }

  async scheduleFollowUpCall(contactId: string, delayMinutes: number = 30): Promise<string> {
    const scheduledTime = new Date(Date.now() + delayMinutes * 60 * 1000);
    
    const jobId = this.jobQueue.addJob('follow_up_call', {
      contactId,
      assistantId: process.env.VAPI_ASSISTANT_ID!,
      phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID!,
      callType: 'follow_up'
    }, scheduledTime);

    console.log(`Follow-up call scheduled for contact ${contactId} at ${scheduledTime}`);
    return jobId;
  }

  async scheduleLeadOutreach(leadId: string, delayMinutes: number = 15): Promise<string> {
    const scheduledTime = new Date(Date.now() + delayMinutes * 60 * 1000);
    
    const jobId = this.jobQueue.addJob('outbound_call', {
      leadId,
      assistantId: process.env.VAPI_ASSISTANT_ID!,
      phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID!,
      callType: 'lead_outreach'
    }, scheduledTime);

    console.log(`Lead outreach call scheduled for lead ${leadId} at ${scheduledTime}`);
    return jobId;
  }

  async processScheduledCalls(): Promise<void> {
    // Get calls that are due
    const dueCalls = await this.getDueCalls();
    
    for (const call of dueCalls) {
      try {
        await this.executeScheduledCall(call);
      } catch (error) {
        console.error(`Failed to execute scheduled call: ${error.message}`);
      }
    }
  }

  private async executeScheduledCall(scheduledCall: ScheduledCall): Promise<void> {
    const contact = await this.hubspotService.getContact(scheduledCall.contactId);
    
    await this.vapiClient.createOutboundCall({
      phoneNumber: scheduledCall.phoneNumberId,
      assistantId: scheduledCall.assistantId,
      customer: {
        name: `${contact.properties.firstname || ''} ${contact.properties.lastname || ''}`.trim(),
        number: contact.properties.phone || ''
      },
      metadata: {
        ...scheduledCall.metadata,
        scheduledCallId: scheduledCall.contactId,
        callType: scheduledCall.callType
      }
    });
  }

  private async storeScheduledCall(call: ScheduledCall): Promise<void> {
    // Implement storage logic (database, Redis, etc.)
    console.log('Storing scheduled call:', call);
  }

  private async getDueCalls(): Promise<ScheduledCall[]> {
    // Implement retrieval logic
    return [];
  }
} 