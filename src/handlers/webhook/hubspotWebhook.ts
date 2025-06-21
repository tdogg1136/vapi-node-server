import { HubSpotTicketWebhook, HubSpotWebhookEventType } from '../types/hubspot.types';
import { HubSpotService } from '../../services/hubspot';
import { VapiClient } from '../../services/vapiClient';

const hubspotService = new HubSpotService({
  apiKey: process.env.HUBSPOT_API_KEY!,
});

const vapiClient = new VapiClient({
  apiKey: process.env.VAPI_API_KEY!,
});

export const hubspotWebhookHandler = async (payload: HubSpotTicketWebhook) => {
  try {
    console.log('Processing HubSpot webhook:', payload);

    switch (payload.subscriptionType) {
      case HubSpotWebhookEventType.TICKET_CREATED:
        return await handleTicketCreated(payload);
      
      case HubSpotWebhookEventType.TICKET_UPDATED:
        return await handleTicketUpdated(payload);
      
      case HubSpotWebhookEventType.TICKET_DELETED:
        return await handleTicketDeleted(payload);
      
      default:
        console.log(`Unhandled HubSpot event type: ${payload.subscriptionType}`);
        return { success: true, message: 'Event ignored' };
    }
  } catch (error) {
    console.error('Error processing HubSpot webhook:', error);
    throw error;
  }
};

async function handleTicketCreated(payload: HubSpotTicketWebhook) {
  console.log(`Ticket created: ${payload.objectId}`);
  
  // Get ticket details
  const ticket = await hubspotService.getTicket(payload.objectId.toString());
  
  // Check if this is a high-priority ticket that needs immediate attention
  if (ticket.properties.hs_ticket_priority === 'HIGH') {
    await initiateHighPriorityCall(ticket);
  }
  
  // Log the ticket creation
  console.log(`New ticket created: ${ticket.properties.subject}`);
  
  return {
    success: true,
    action: 'ticket_created',
    ticketId: payload.objectId,
    priority: ticket.properties.hs_ticket_priority
  };
}

async function handleTicketUpdated(payload: HubSpotTicketWebhook) {
  console.log(`Ticket updated: ${payload.objectId}, Property: ${payload.propertyName}`);
  
  const ticket = await hubspotService.getTicket(payload.objectId.toString());
  
  // Handle specific property changes
  switch (payload.propertyName) {
    case 'hs_ticket_status':
      await handleStatusChange(ticket, payload.propertyValue);
      break;
    
    case 'hs_ticket_priority':
      await handlePriorityChange(ticket, payload.propertyValue);
      break;
    
    case 'hs_pipeline_stage':
      await handleStageChange(ticket, payload.propertyValue);
      break;
    
    default:
      console.log(`Property change ignored: ${payload.propertyName}`);
  }
  
  return {
    success: true,
    action: 'ticket_updated',
    ticketId: payload.objectId,
    propertyChanged: payload.propertyName,
    newValue: payload.propertyValue
  };
}

async function handleTicketDeleted(payload: HubSpotTicketWebhook) {
  console.log(`Ticket deleted: ${payload.objectId}`);
  
  // Clean up any scheduled calls for this ticket
  // This would integrate with your job queue system
  
  return {
    success: true,
    action: 'ticket_deleted',
    ticketId: payload.objectId
  };
}

async function initiateHighPriorityCall(ticket: any) {
  try {
    // Get the contact associated with the ticket
    const contact = await hubspotService.getContact(ticket.properties.hs_ticket_owner_id || '');
    
    if (contact && contact.properties.phone) {
      const callResult = await vapiClient.createOutboundCall({
        phoneNumber: process.env.VAPI_PHONE_NUMBER_ID!,
        assistantId: process.env.VAPI_ASSISTANT_ID!,
        customer: {
          name: `${contact.properties.firstname || ''} ${contact.properties.lastname || ''}`.trim(),
          number: contact.properties.phone
        },
        metadata: {
          ticketId: ticket.id,
          ticketSubject: ticket.properties.subject,
          priority: 'HIGH',
          callType: 'high_priority_ticket'
        }
      });
      
      console.log(`High priority call initiated for ticket ${ticket.id}: ${callResult.id}`);
    }
  } catch (error) {
    console.error('Failed to initiate high priority call:', error);
  }
}

async function handleStatusChange(ticket: any, newStatus: string) {
  console.log(`Ticket ${ticket.id} status changed to: ${newStatus}`);
  
  // Handle specific status changes
  switch (newStatus) {
    case 'CLOSED':
      await handleTicketClosed(ticket);
      break;
    
    case 'WAITING_ON_CUSTOMER':
      await scheduleFollowUpCall(ticket);
      break;
    
    case 'WAITING_ON_AGENT':
      await notifyAgent(ticket);
      break;
  }
}

async function handlePriorityChange(ticket: any, newPriority: string) {
  console.log(`Ticket ${ticket.id} priority changed to: ${newPriority}`);
  
  if (newPriority === 'HIGH') {
    await initiateHighPriorityCall(ticket);
  }
}

async function handleStageChange(ticket: any, newStage: string) {
  console.log(`Ticket ${ticket.id} stage changed to: ${newStage}`);
  
  // Handle stage-specific actions
  if (newStage === 'escalated') {
    await escalateTicket(ticket);
  }
}

async function handleTicketClosed(ticket: any) {
  console.log(`Ticket ${ticket.id} was closed`);
  
  // Schedule a satisfaction survey call
  setTimeout(async () => {
    try {
      const contact = await hubspotService.getContact(ticket.properties.hs_ticket_owner_id || '');
      
      if (contact && contact.properties.phone) {
        await vapiClient.createOutboundCall({
          phoneNumber: process.env.VAPI_PHONE_NUMBER_ID!,
          assistantId: process.env.VAPI_SATISFACTION_ASSISTANT_ID || process.env.VAPI_ASSISTANT_ID!,
          customer: {
            name: `${contact.properties.firstname || ''} ${contact.properties.lastname || ''}`.trim(),
            number: contact.properties.phone
          },
          metadata: {
            ticketId: ticket.id,
            callType: 'satisfaction_survey'
          }
        });
      }
    } catch (error) {
      console.error('Failed to schedule satisfaction survey:', error);
    }
  }, 24 * 60 * 60 * 1000); // 24 hours later
}

async function scheduleFollowUpCall(ticket: any) {
  console.log(`Scheduling follow-up call for ticket ${ticket.id}`);
  
  // Schedule a follow-up call in 2 hours
  setTimeout(async () => {
    try {
      const contact = await hubspotService.getContact(ticket.properties.hs_ticket_owner_id || '');
      
      if (contact && contact.properties.phone) {
        await vapiClient.createOutboundCall({
          phoneNumber: process.env.VAPI_PHONE_NUMBER_ID!,
          assistantId: process.env.VAPI_ASSISTANT_ID!,
          customer: {
            name: `${contact.properties.firstname || ''} ${contact.properties.lastname || ''}`.trim(),
            number: contact.properties.phone
          },
          metadata: {
            ticketId: ticket.id,
            callType: 'follow_up'
          }
        });
      }
    } catch (error) {
      console.error('Failed to schedule follow-up call:', error);
    }
  }, 2 * 60 * 60 * 1000); // 2 hours
}

async function notifyAgent(ticket: any) {
  console.log(`Notifying agent about ticket ${ticket.id}`);
  
  // This could integrate with your agent notification system
  // For now, just log the notification
  console.log(`Agent notification: Ticket ${ticket.id} is waiting for agent response`);
}

async function escalateTicket(ticket: any) {
  console.log(`Escalating ticket ${ticket.id}`);
  
  // This could trigger additional actions like:
  // - Notifying managers
  // - Creating escalation tickets
  // - Initiating urgent calls
  console.log(`Ticket ${ticket.id} has been escalated`);
} 