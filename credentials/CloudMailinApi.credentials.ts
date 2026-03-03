import {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class CloudMailinApi implements ICredentialType {
  name = 'cloudMailinApi';
  displayName = 'CloudMailin API';
  // eslint-disable-next-line n8n-nodes-base/cred-class-field-documentation-url-miscased
  documentationUrl = 'https://docs.cloudmailin.com/features/using_the_cloudmailin_email_api/';
  properties: INodeProperties[] = [
    {
      displayName: 'Management API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: { password: true },
      default: '',
      description:
        'API key for CloudMailin Management API. Required only for Auto-Provision mode. ' +
        'Request API access at https://www.cloudmailin.com/contact_us — ' +
        'then find your key at https://www.cloudmailin.com/account',
    },
    {
      displayName: 'SMTP Username (Optional)',
      name: 'smtpUsername',
      type: 'string',
      default: '',
      description:
        'CloudMailin SMTP username for outbound email features (optional). ' +
        'Found at https://www.cloudmailin.com/outbound/senders',
    },
    {
      displayName: 'SMTP API Token (Optional)',
      name: 'smtpApiToken',
      type: 'string',
      typeOptions: { password: true },
      default: '',
      description:
        'CloudMailin SMTP API Token for outbound email features (optional). ' +
        'Found at https://www.cloudmailin.com/outbound/senders',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {},
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: 'https://api.cloudmailin.com',
      url: '/api/v0.1/addresses',
      method: 'GET',
      headers: {
        Authorization: '=apikey token={{$credentials.apiKey}}',
      },
    },
  };
}
