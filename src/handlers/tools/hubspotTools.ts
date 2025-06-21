import { HubSpotService } from '../../services/hubspot';

const hubspotService = new HubSpotService({
  apiKey: process.env.HUBSPOT_API_KEY!,
});

export const searchHubSpotContact = async ({ toolCallparameters }: { toolCallparameters: any }) => {
  try {
    const { searchQuery } = toolCallparameters;
    const contacts = await hubspotService.searchContacts(searchQuery);
    
    return {
      success: true,
      contacts: contacts.map(contact => ({
        id: contact.id,
        email: contact.properties.email,
        name: `${contact.properties.firstname || ''} ${contact.properties.lastname || ''}`.trim(),
        phone: contact.properties.phone
      }))
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

export const getHubSpotContactDetails = async ({ toolCallparameters }: { toolCallparameters: any }) => {
  try {
    const { contactId } = toolCallparameters;
    const contact = await hubspotService.getContact(contactId);
    
    return {
      success: true,
      contact: {
        id: contact.id,
        email: contact.properties.email,
        name: `${contact.properties.firstname || ''} ${contact.properties.lastname || ''}`.trim(),
        phone: contact.properties.phone,
        properties: contact.properties
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

export const createHubSpotContact = async ({ toolCallparameters }: { toolCallparameters: any }) => {
  try {
    const { email, firstname, lastname, phone } = toolCallparameters;
    const contact = await hubspotService.createContact({
      email,
      firstname,
      lastname,
      phone
    });
    
    return {
      success: true,
      contactId: contact.id,
      message: 'Contact created successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}; 