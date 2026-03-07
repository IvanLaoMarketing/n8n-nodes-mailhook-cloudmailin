import {
  IExecuteFunctions,
  IDataObject,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';

import { cloudMailinApiRequest, cloudMailinSmtpRequest } from './GenericFunctions';

export class CloudMailin implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'CloudMailin',
    name: 'cloudMailin',
    icon: 'file:cloudmailin.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description:
      'Manage CloudMailin inbound addresses, custom domains, sending domains, ' +
      'send emails, and track message statuses via the CloudMailin API.',
    defaults: { name: 'CloudMailin' },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'cloudMailinApi',
        required: true,
      },
    ],
    properties: [
      // ── RESOURCE ─────────────────────────────────────────────────────────────
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          { name: 'Custom Domain', value: 'customDomain' },
          { name: 'Email', value: 'email' },
          { name: 'Inbound Address', value: 'inboundAddress' },
          { name: 'Inbound Message', value: 'inboundMessage' },
          { name: 'Outbound Message', value: 'outboundMessage' },
          { name: 'Sending Domain', value: 'sendingDomain' },
        ],
        default: 'inboundAddress',
      },

      // ── OPERATIONS ───────────────────────────────────────────────────────────

      // Inbound Address operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['inboundAddress'] } },
        options: [
          { name: 'Create', value: 'create', action: 'Create an inbound address' },
          { name: 'Delete', value: 'delete', action: 'Delete an inbound address' },
          { name: 'Get', value: 'get', action: 'Get an inbound address' },
          { name: 'Get Many', value: 'getAll', action: 'Get many inbound addresses' },
          { name: 'Update', value: 'update', action: 'Update an inbound address' },
        ],
        default: 'getAll',
      },

      // Inbound Message operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['inboundMessage'] } },
        options: [
          { name: 'Get Many', value: 'getAll', action: 'Get many inbound messages' },
        ],
        default: 'getAll',
      },

      // Custom Domain operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['customDomain'] } },
        options: [
          { name: 'Create', value: 'create', action: 'Create a custom domain' },
          { name: 'Delete', value: 'delete', action: 'Delete a custom domain' },
          { name: 'Get Many', value: 'getAll', action: 'Get many custom domains' },
        ],
        default: 'getAll',
      },

      // Email operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['email'] } },
        options: [
          { name: 'Send', value: 'send', action: 'Send an email' },
        ],
        default: 'send',
      },

      // Outbound Message operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['outboundMessage'] } },
        options: [
          { name: 'Get', value: 'get', action: 'Get an outbound message' },
          { name: 'Get Many', value: 'getAll', action: 'Get many outbound messages' },
        ],
        default: 'getAll',
      },

      // Sending Domain operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['sendingDomain'] } },
        options: [
          { name: 'Create', value: 'create', action: 'Create a sending domain' },
          { name: 'Delete', value: 'delete', action: 'Delete a sending domain' },
          { name: 'Get', value: 'get', action: 'Get a sending domain' },
          { name: 'Get Many', value: 'getAll', action: 'Get many sending domains' },
          { name: 'Verify', value: 'verify', action: 'Verify a sending domain' },
        ],
        default: 'getAll',
      },

      // ── FIELDS: INBOUND ADDRESS ──────────────────────────────────────────────

      // Address ID (for get, update, delete)
      {
        displayName: 'Address ID',
        name: 'addressId',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
          show: { resource: ['inboundAddress'], operation: ['get', 'update', 'delete'] },
        },
        description: 'The ID of the inbound address',
      },

      // Target URL (for create)
      {
        displayName: 'Target URL',
        name: 'target',
        type: 'string',
        required: true,
        default: '',
        placeholder: 'https://your-server.com/webhook',
        displayOptions: {
          show: { resource: ['inboundAddress'], operation: ['create'] },
        },
        description: 'The HTTP endpoint where CloudMailin will POST incoming emails',
      },

      // Target Format (for create)
      {
        displayName: 'Target Format',
        name: 'targetFormat',
        type: 'options',
        required: true,
        options: [
          { name: 'JSON Normalized', value: 'json+n' },
          { name: 'Multipart Normalized', value: 'multipart+n' },
        ],
        default: 'json+n',
        displayOptions: {
          show: { resource: ['inboundAddress'], operation: ['create'] },
        },
        description: 'The format CloudMailin uses when POSTing emails to your target',
      },

      // Nickname (optional for create)
      {
        displayName: 'Nickname',
        name: 'nickname',
        type: 'string',
        default: '',
        displayOptions: {
          show: { resource: ['inboundAddress'], operation: ['create'] },
        },
        description: 'A short identifier for this address (optional)',
      },

      // Update fields
      {
        displayName: 'Update Fields',
        name: 'updateFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: {
          show: { resource: ['inboundAddress'], operation: ['update'] },
        },
        options: [
          {
            displayName: 'Target URL',
            name: 'target',
            type: 'string',
            default: '',
            description: 'The HTTP endpoint where CloudMailin will POST incoming emails',
          },
          {
            displayName: 'Target Format',
            name: 'targetFormat',
            type: 'options',
            options: [
              { name: 'JSON Normalized', value: 'json+n' },
              { name: 'Multipart Normalized', value: 'multipart+n' },
            ],
            default: 'json+n',
            description: 'The format CloudMailin uses when POSTing emails',
          },
          {
            displayName: 'Nickname',
            name: 'nickname',
            type: 'string',
            default: '',
            description: 'A short identifier for this address',
          },
        ],
      },

      // ── FIELDS: INBOUND MESSAGE ──────────────────────────────────────────────

      {
        displayName: 'Address ID',
        name: 'addressId',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
          show: { resource: ['inboundMessage'], operation: ['getAll'] },
        },
        description: 'The address ID to retrieve messages for',
      },
      {
        displayName: 'Search Query',
        name: 'query',
        type: 'string',
        default: '',
        displayOptions: {
          show: { resource: ['inboundMessage'], operation: ['getAll'] },
        },
        description: 'Search term to filter messages (optional)',
      },

      // ── FIELDS: CUSTOM DOMAIN ────────────────────────────────────────────────

      // Address ID (for getAll, create)
      {
        displayName: 'Address ID',
        name: 'addressId',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
          show: { resource: ['customDomain'], operation: ['getAll', 'create', 'delete'] },
        },
        description: 'The address ID this custom domain belongs to',
      },

      // Domain (for create)
      {
        displayName: 'Domain',
        name: 'domain',
        type: 'string',
        required: true,
        default: '',
        placeholder: 'mail.example.com',
        displayOptions: {
          show: { resource: ['customDomain'], operation: ['create'] },
        },
        description: 'The domain name to add. MX records must already point to CloudMailin.',
      },

      // Custom Domain ID (for delete)
      {
        displayName: 'Custom Domain ID',
        name: 'customDomainId',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
          show: { resource: ['customDomain'], operation: ['delete'] },
        },
        description: 'The ID of the custom domain to delete',
      },

      // Optional fields for custom domain create
      {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: {
          show: { resource: ['customDomain'], operation: ['create'] },
        },
        options: [
          {
            displayName: 'Auth Regex',
            name: 'authRegex',
            type: 'string',
            default: '',
            description: 'Regex pattern to restrict which email addresses are accepted on this domain',
          },
          {
            displayName: 'Domain Target URL',
            name: 'domainTarget',
            type: 'string',
            default: '',
            description: 'Custom target URL for this domain (overrides address default)',
          },
        ],
      },

      // ── FIELDS: EMAIL (SEND) ─────────────────────────────────────────────────

      {
        displayName: 'From',
        name: 'from',
        type: 'string',
        required: true,
        default: '',
        placeholder: 'sender@yourdomain.com',
        displayOptions: {
          show: { resource: ['email'], operation: ['send'] },
        },
        description: 'Sender email address (must be from a verified sending domain)',
      },
      {
        displayName: 'To',
        name: 'to',
        type: 'string',
        required: true,
        default: '',
        placeholder: 'recipient@example.com',
        displayOptions: {
          show: { resource: ['email'], operation: ['send'] },
        },
        description: 'Recipient email address(es). Separate multiple with commas.',
      },
      {
        displayName: 'Subject',
        name: 'subject',
        type: 'string',
        default: '',
        displayOptions: {
          show: { resource: ['email'], operation: ['send'] },
        },
        description: 'Email subject line',
      },
      {
        displayName: 'Body Type',
        name: 'bodyType',
        type: 'options',
        options: [
          { name: 'Plain Text', value: 'plain' },
          { name: 'HTML', value: 'html' },
          { name: 'Markdown', value: 'markdown' },
        ],
        default: 'plain',
        displayOptions: {
          show: { resource: ['email'], operation: ['send'] },
        },
        description: 'The format of the email body',
      },
      {
        displayName: 'Body',
        name: 'body',
        type: 'string',
        typeOptions: { rows: 5 },
        default: '',
        displayOptions: {
          show: { resource: ['email'], operation: ['send'] },
        },
        description: 'Email body content',
      },
      {
        displayName: 'Additional Fields',
        name: 'emailAdditionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: {
          show: { resource: ['email'], operation: ['send'] },
        },
        options: [
          {
            displayName: 'CC',
            name: 'cc',
            type: 'string',
            default: '',
            description: 'CC recipient(s). Separate multiple with commas.',
          },
          {
            displayName: 'Custom Headers',
            name: 'headers',
            type: 'json',
            default: '{}',
            description: 'Custom email headers as JSON object',
          },
          {
            displayName: 'Priority',
            name: 'priority',
            type: 'options',
            options: [
              { name: 'Standard', value: 'standard' },
              { name: 'Priority', value: 'priority' },
              { name: 'Digest', value: 'digest' },
            ],
            default: 'standard',
            description: 'Message priority level',
          },
          {
            displayName: 'Tags',
            name: 'tags',
            type: 'string',
            default: '',
            description: 'Message tags. Separate multiple with commas.',
          },
          {
            displayName: 'Test Mode',
            name: 'testMode',
            type: 'boolean',
            default: false,
            description: 'Whether to validate the message without actually sending it',
          },
        ],
      },

      // ── FIELDS: OUTBOUND MESSAGE ─────────────────────────────────────────────

      {
        displayName: 'Outbound Account ID',
        name: 'outboundAccountId',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
          show: { resource: ['outboundMessage'], operation: ['getAll'] },
        },
        description: 'The outbound account ID to retrieve messages for',
      },
      {
        displayName: 'Message ID',
        name: 'outboundMessageId',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
          show: { resource: ['outboundMessage'], operation: ['get'] },
        },
        description: 'The ID of the outbound message to retrieve',
      },
      {
        displayName: 'Search Query',
        name: 'query',
        type: 'string',
        default: '',
        displayOptions: {
          show: { resource: ['outboundMessage'], operation: ['getAll'] },
        },
        description: 'Search term to filter outbound messages (optional)',
      },

      // ── FIELDS: SENDING DOMAIN ───────────────────────────────────────────────

      {
        displayName: 'Sending Domain ID',
        name: 'sendingDomainId',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
          show: { resource: ['sendingDomain'], operation: ['get', 'delete', 'verify'] },
        },
        description: 'The ID of the sending domain',
      },
      {
        displayName: 'Domain',
        name: 'sendingDomainName',
        type: 'string',
        required: true,
        default: '',
        placeholder: 'yourdomain.com',
        displayOptions: {
          show: { resource: ['sendingDomain'], operation: ['create'] },
        },
        description: 'The domain name to configure for sending emails',
      },
      {
        displayName: 'Search Query',
        name: 'query',
        type: 'string',
        default: '',
        displayOptions: {
          show: { resource: ['sendingDomain'], operation: ['getAll'] },
        },
        description: 'Search term to filter sending domains (optional)',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: IDataObject[] = [];

    const resource = this.getNodeParameter('resource', 0) as string;
    const operation = this.getNodeParameter('operation', 0) as string;

    for (let i = 0; i < items.length; i++) {
      try {
        let responseData: any;

        // ── INBOUND ADDRESS ──────────────────────────────────────────────────
        if (resource === 'inboundAddress') {
          if (operation === 'getAll') {
            responseData = await cloudMailinApiRequest.call(this, 'GET', '/addresses');
          }

          if (operation === 'get') {
            const addressId = this.getNodeParameter('addressId', i) as string;
            responseData = await cloudMailinApiRequest.call(
              this,
              'GET',
              `/addresses/${addressId}`,
            );
          }

          if (operation === 'create') {
            const target = this.getNodeParameter('target', i) as string;
            const targetFormat = this.getNodeParameter('targetFormat', i) as string;
            const nickname = this.getNodeParameter('nickname', i) as string;

            const body: IDataObject = {
              target,
              target_format: targetFormat,
            };
            if (nickname) body.nickname = nickname;

            responseData = await cloudMailinApiRequest.call(this, 'POST', '/addresses', body);
          }

          if (operation === 'update') {
            const addressId = this.getNodeParameter('addressId', i) as string;
            const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

            const body: IDataObject = {};
            if (updateFields.target) body.target = updateFields.target;
            if (updateFields.targetFormat) body.target_format = updateFields.targetFormat;
            if (updateFields.nickname) body.nickname = updateFields.nickname;

            responseData = await cloudMailinApiRequest.call(
              this,
              'PATCH',
              `/addresses/${addressId}`,
              body,
            );
          }

          if (operation === 'delete') {
            const addressId = this.getNodeParameter('addressId', i) as string;
            responseData = await cloudMailinApiRequest.call(
              this,
              'DELETE',
              `/addresses/${addressId}`,
            );
          }
        }

        // ── INBOUND MESSAGE ──────────────────────────────────────────────────
        if (resource === 'inboundMessage') {
          if (operation === 'getAll') {
            const addressId = this.getNodeParameter('addressId', i) as string;
            const query = this.getNodeParameter('query', i) as string;

            let endpoint = `/incoming_statuses?address_id=${addressId}`;
            if (query) endpoint += `&query=${encodeURIComponent(query)}`;

            responseData = await cloudMailinApiRequest.call(this, 'GET', endpoint);
          }
        }

        // ── CUSTOM DOMAIN ────────────────────────────────────────────────────
        if (resource === 'customDomain') {
          if (operation === 'getAll') {
            const addressId = this.getNodeParameter('addressId', i) as string;
            responseData = await cloudMailinApiRequest.call(
              this,
              'GET',
              `/custom_domains?address_id=${addressId}`,
            );
          }

          if (operation === 'create') {
            const addressId = this.getNodeParameter('addressId', i) as string;
            const domain = this.getNodeParameter('domain', i) as string;
            const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

            const body: IDataObject = { domain };
            if (additionalFields.authRegex) body.auth_regex = additionalFields.authRegex;
            if (additionalFields.domainTarget) body.domain_target = additionalFields.domainTarget;

            responseData = await cloudMailinApiRequest.call(
              this,
              'POST',
              `/custom_domains?address_id=${addressId}`,
              body,
            );
          }

          if (operation === 'delete') {
            const addressId = this.getNodeParameter('addressId', i) as string;
            const customDomainId = this.getNodeParameter('customDomainId', i) as string;
            responseData = await cloudMailinApiRequest.call(
              this,
              'DELETE',
              `/custom_domains/${customDomainId}?address_id=${addressId}`,
            );
          }
        }

        // ── EMAIL (SEND) ─────────────────────────────────────────────────────
        if (resource === 'email') {
          if (operation === 'send') {
            const from = this.getNodeParameter('from', i) as string;
            const to = this.getNodeParameter('to', i) as string;
            const subject = this.getNodeParameter('subject', i) as string;
            const bodyType = this.getNodeParameter('bodyType', i) as string;
            const bodyContent = this.getNodeParameter('body', i) as string;
            const additionalFields = this.getNodeParameter(
              'emailAdditionalFields',
              i,
            ) as IDataObject;

            const emailBody: IDataObject = {
              from,
              to: to.includes(',') ? to.split(',').map((e) => e.trim()) : to,
              subject,
              [bodyType]: bodyContent,
            };

            if (additionalFields.cc) {
              const cc = additionalFields.cc as string;
              emailBody.cc = cc.includes(',') ? cc.split(',').map((e) => e.trim()) : cc;
            }
            if (additionalFields.headers) {
              emailBody.headers =
                typeof additionalFields.headers === 'string'
                  ? JSON.parse(additionalFields.headers)
                  : additionalFields.headers;
            }
            if (additionalFields.priority) emailBody.priority = additionalFields.priority;
            if (additionalFields.tags) {
              const tags = additionalFields.tags as string;
              emailBody.tags = tags.includes(',') ? tags.split(',').map((t) => t.trim()) : tags;
            }
            if (additionalFields.testMode) emailBody.test_mode = additionalFields.testMode;

            responseData = await cloudMailinSmtpRequest.call(this, 'POST', '/messages', emailBody);
          }
        }

        // ── OUTBOUND MESSAGE ─────────────────────────────────────────────────
        if (resource === 'outboundMessage') {
          if (operation === 'getAll') {
            const outboundAccountId = this.getNodeParameter('outboundAccountId', i) as string;
            const query = this.getNodeParameter('query', i) as string;

            let endpoint = `/outbound_messages?outbound_account_id=${outboundAccountId}`;
            if (query) endpoint += `&query=${encodeURIComponent(query)}`;

            responseData = await cloudMailinApiRequest.call(this, 'GET', endpoint);
          }

          if (operation === 'get') {
            const messageId = this.getNodeParameter('outboundMessageId', i) as string;
            responseData = await cloudMailinApiRequest.call(
              this,
              'GET',
              `/outbound_messages/${messageId}`,
            );
          }
        }

        // ── SENDING DOMAIN ───────────────────────────────────────────────────
        if (resource === 'sendingDomain') {
          if (operation === 'getAll') {
            const query = this.getNodeParameter('query', i) as string;

            let endpoint = '/sending_domains';
            if (query) endpoint += `?query=${encodeURIComponent(query)}`;

            responseData = await cloudMailinApiRequest.call(this, 'GET', endpoint);
          }

          if (operation === 'get') {
            const sendingDomainId = this.getNodeParameter('sendingDomainId', i) as string;
            responseData = await cloudMailinApiRequest.call(
              this,
              'GET',
              `/sending_domains/${sendingDomainId}`,
            );
          }

          if (operation === 'create') {
            const domain = this.getNodeParameter('sendingDomainName', i) as string;
            responseData = await cloudMailinApiRequest.call(this, 'POST', '/sending_domains', {
              domain,
            });
          }

          if (operation === 'delete') {
            const sendingDomainId = this.getNodeParameter('sendingDomainId', i) as string;
            responseData = await cloudMailinApiRequest.call(
              this,
              'DELETE',
              `/sending_domains/${sendingDomainId}`,
            );
          }

          if (operation === 'verify') {
            const sendingDomainId = this.getNodeParameter('sendingDomainId', i) as string;
            responseData = await cloudMailinApiRequest.call(
              this,
              'POST',
              `/sending_domains/${sendingDomainId}/verify`,
            );
          }
        }

        // Push response data
        if (Array.isArray(responseData)) {
          returnData.push(...(responseData as IDataObject[]));
        } else if (responseData) {
          returnData.push(responseData as IDataObject);
        }
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({ error: (error as Error).message });
          continue;
        }
        throw error;
      }
    }

    return [this.helpers.returnJsonArray(returnData)];
  }
}
