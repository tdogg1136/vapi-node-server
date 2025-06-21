import axios from 'axios';

interface HubSpotConfig {
  apiKey: string;
  baseUrl?: string;
}

interface Contact {
  id: string;
  properties: {
    email?: string;
    firstname?: string;
    lastname?: string;
    phone?: string;
    [key: string]: any;
  };
}

interface Ticket {
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
    hs_ticket_owner_id?: string;
    [key: string]: any;
  };
}

export class HubSpotService {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: HubSpotConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.hubapi.com';
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  async getContact(contactId: string): Promise<Contact> {
    const response = await axios.get(
      `${this.baseUrl}/crm/v3/objects/contacts/${contactId}`,
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  async getTicket(ticketId: string): Promise<Ticket> {
    const response = await axios.get(
      `${this.baseUrl}/crm/v3/objects/tickets/${ticketId}`,
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  async searchContacts(query: string): Promise<Contact[]> {
    const response = await axios.post(
      `${this.baseUrl}/crm/v3/objects/contacts/search`,
      {
        filterGroups: [{
          filters: [{
            propertyName: 'email',
            operator: 'CONTAINS_TOKEN',
            value: query
          }]
        }],
        limit: 10
      },
      { headers: this.getHeaders() }
    );
    return response.data.results;
  }

  async createContact(properties: Record<string, string>): Promise<Contact> {
    const response = await axios.post(
      `${this.baseUrl}/crm/v3/objects/contacts`,
      { properties },
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  async updateContact(contactId: string, properties: Record<string, string>): Promise<Contact> {
    const response = await axios.patch(
      `${this.baseUrl}/crm/v3/objects/contacts/${contactId}`,
      { properties },
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  async getDeals(contactId?: string): Promise<any[]> {
    let url = `${this.baseUrl}/crm/v3/objects/deals`;
    if (contactId) {
      url += `?associations.contact=${contactId}`;
    }
    
    const response = await axios.get(url, { headers: this.getHeaders() });
    return response.data.results;
  }

  async updateTicket(ticketId: string, properties: Record<string, string>): Promise<Ticket> {
    const response = await axios.patch(
      `${this.baseUrl}/crm/v3/objects/tickets/${ticketId}`,
      { properties },
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  async getTicketsByContact(contactId: string): Promise<Ticket[]> {
    const response = await axios.get(
      `${this.baseUrl}/crm/v3/objects/tickets?associations.contact=${contactId}`,
      { headers: this.getHeaders() }
    );
    return response.data.results;
  }
} 