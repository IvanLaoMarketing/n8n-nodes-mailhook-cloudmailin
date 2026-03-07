"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudMailinApi = void 0;
class CloudMailinApi {
    constructor() {
        this.name = 'cloudMailinApi';
        this.displayName = 'CloudMailin API';
        // eslint-disable-next-line n8n-nodes-base/cred-class-field-documentation-url-miscased
        this.documentationUrl = 'https://docs.cloudmailin.com/features/using_the_cloudmailin_email_api/';
        this.properties = [
            {
                displayName: 'Account ID',
                name: 'accountId',
                type: 'string',
                default: '',
                description: 'Your CloudMailin Account ID. Found on your account page at https://www.cloudmailin.com/account. ' +
                    'Required for Auto-Provision mode.',
            },
            {
                displayName: 'Management API Key',
                name: 'apiKey',
                type: 'string',
                typeOptions: { password: true },
                default: '',
                description: 'API key for CloudMailin Management API. Required only for Auto-Provision mode. ' +
                    'Request API access at https://www.cloudmailin.com/contact_us — ' +
                    'then find your key at https://www.cloudmailin.com/account',
            },
            {
                displayName: 'SMTP Username (Optional)',
                name: 'smtpUsername',
                type: 'string',
                default: '',
                description: 'CloudMailin SMTP username for outbound email features (optional). ' +
                    'Found at https://www.cloudmailin.com/outbound/senders',
            },
            {
                displayName: 'SMTP API Token (Optional)',
                name: 'smtpApiToken',
                type: 'string',
                typeOptions: { password: true },
                default: '',
                description: 'CloudMailin SMTP API Token for outbound email features (optional). ' +
                    'Found at https://www.cloudmailin.com/outbound/senders',
            },
        ];
        this.authenticate = {
            type: 'generic',
            properties: {},
        };
        this.test = {
            request: {
                baseURL: 'https://api.cloudmailin.com',
                url: '=/api/v0.1/{{$credentials.accountId}}/addresses',
                method: 'GET',
                headers: {
                    Authorization: '=Bearer {{$credentials.apiKey}}',
                },
            },
        };
    }
}
exports.CloudMailinApi = CloudMailinApi;
