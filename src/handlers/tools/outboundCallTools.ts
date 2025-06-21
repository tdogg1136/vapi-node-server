import { VapiClient } from '../../services/vapiClient';
import { HubSpotService } from '../../services/hubspot';

const vapiClient = new VapiClient({
  apiKey: process.env.VAPI_API_KEY!,
});

const hubspotService = new HubSpotService({
  apiKey: process.env.HUBSPOT_API_KEY!,
});

export const initiateFollowUpCall = async ({ toolCallparameters }: { toolCallparameters: any }) => {
  try {
    const { contactId, assistantId, phoneNumberId } = toolCallparameters;
    
    // Get contact details from HubSpot
    const contact = await hubspotService.getContact(contactId);
    
    // Create outbound call
    const callResult = await vapiClient.createOutboundCall({
      phoneNumber: phoneNumberId,
      assistantId: assistantId,
      customer: {
        name: `${contact.properties.firstname || ''} ${contact.properties.lastname || ''}`.trim(),
        number: contact.properties.phone || ''
      },
      metadata: {
        contactId: contactId,
        callType: 'follow_up',
        source: 'hubspot_automation'
      }
    });

    return {
      success: true,
      callId: callResult.id,
      contactName: contact.properties.firstname,
      message: 'Follow-up call initiated successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

export const callLeadFromHubSpot = async ({ toolCallparameters }: { toolCallparameters: any }) => {
  try {
    const { leadId, assistantId, phoneNumberId, callReason } = toolCallparameters;
    
    // Get lead details from HubSpot
    const lead = await hubspotService.getContact(leadId);
    
    // Create outbound call
    const callResult = await vapiClient.createOutboundCall({
      phoneNumber: phoneNumberId,
      assistantId: assistantId,
      customer: {
        name: `${lead.properties.firstname || ''} ${lead.properties.lastname || ''}`.trim(),
        number: lead.properties.phone || ''
      },
      metadata: {
        leadId: leadId,
        callType: 'lead_outreach',
        callReason: callReason,
        source: 'hubspot_automation'
      }
    });

    return {
      success: true,
      callId: callResult.id,
      leadName: lead.properties.firstname,
      callReason: callReason,
      message: 'Lead call initiated successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}; 