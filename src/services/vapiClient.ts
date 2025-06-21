import axios from 'axios';

interface VapiConfig {
  apiKey: string;
  baseUrl?: string;
}

interface OutboundCallParams {
  phoneNumber: string;
  assistantId: string;
  customer?: {
    name?: string;
    number: string;
  };
  metadata?: Record<string, any>;
}

interface CallResponse {
  id: string;
  status: string;
  message?: string;
}

export class VapiClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: VapiConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.vapi.ai';
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  async createOutboundCall(params: OutboundCallParams): Promise<CallResponse> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/call`,
        {
          phoneNumberId: params.phoneNumber,
          assistantId: params.assistantId,
          customer: params.customer,
          metadata: params.metadata
        },
        { headers: this.getHeaders() }
      );
      
      return {
        id: response.data.id,
        status: 'initiated',
        message: 'Call created successfully'
      };
    } catch (error) {
      throw new Error(`Failed to create outbound call: ${error.message}`);
    }
  }

  async getCallStatus(callId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/call/${callId}`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get call status: ${error.message}`);
    }
  }
} 