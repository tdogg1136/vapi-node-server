export enum HubSpotWebhookEventType {
  TICKET_CREATED = 'ticket.creation',
  TICKET_UPDATED = 'ticket.propertyChange',
  TICKET_DELETED = 'ticket.deletion',
  CONTACT_CREATED = 'contact.creation',
  CONTACT_UPDATED = 'contact.propertyChange',
  CONTACT_DELETED = 'contact.deletion'
}

export interface HubSpotTicket {
  id: string;
  properties: {
    subject?: string;
    content?: string;
    hs_ticket_priority?: string;
    hs_ticket_category?: string;
    hs_ticket_status?: string;
    hs_pipeline?: string;
    hs_pipeline_stage?: string;
    createdate?: string;
    closedate?: string;
    [key: string]: any;
  };
}

export interface HubSpotContact {
  id: string;
  properties: {
    email?: string;
    firstname?: string;
    lastname?: string;
    phone?: string;
    [key: string]: any;
  };
}

export interface HubSpotWebhookPayload {
  subscriptionType: string;
  subscriptionId: number;
  portalId: number;
  appId?: number;
  occurredAt: number;
  objectId: number;
  propertyName?: string;
  propertyValue?: string;
  changeSource: string;
  eventId: number;
  attemptNumber: number;
}

export interface HubSpotTicketWebhook extends HubSpotWebhookPayload {
  subscriptionType: 'ticket.creation' | 'ticket.propertyChange' | 'ticket.deletion';
  objectId: number; // Ticket ID
  propertyName?: string;
  propertyValue?: string;
} 