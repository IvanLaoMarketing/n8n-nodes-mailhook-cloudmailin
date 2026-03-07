"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudMailinTrigger = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const GenericFunctions_1 = require("./GenericFunctions");
class CloudMailinTrigger {
    constructor() {
        this.description = {
            displayName: 'Mailhook CloudMailin Trigger',
            name: 'cloudMailinTrigger',
            icon: 'file:cloudmailin.svg',
            group: ['trigger'],
            version: 1,
            subtitle: 'Receive inbound emails as workflow triggers',
            description: 'Triggers an n8n workflow when an email is received via CloudMailin. ' +
                'Works like Make.com Mailhooks. Supports manual setup (no API key needed) ' +
                'and auto-provisioning via CloudMailin Management API.',
            defaults: { name: 'Mailhook CloudMailin' },
            inputs: [],
            outputs: ['main'],
            credentials: [
                {
                    name: 'cloudMailinApi',
                    required: false,
                    displayOptions: { show: { setupMode: ['autoProvision'] } },
                },
            ],
            webhooks: [
                {
                    name: 'default',
                    httpMethod: 'POST',
                    responseMode: 'onReceived',
                    path: 'cloudmailin',
                },
            ],
            properties: [
                // SETUP MODE
                {
                    displayName: 'Setup Mode',
                    name: 'setupMode',
                    type: 'options',
                    options: [
                        {
                            name: 'Manual Setup',
                            value: 'manual',
                            description: 'Copy the Webhook URL and paste it in your CloudMailin dashboard. ' +
                                'No API key required. Works for all CloudMailin accounts.',
                        },
                        {
                            name: 'Auto-Provision',
                            value: 'autoProvision',
                            description: 'Automatically creates and deletes a CloudMailin email address ' +
                                'when this workflow is activated/deactivated. ' +
                                'Requires CloudMailin Management API (contact CloudMailin support).',
                        },
                    ],
                    default: 'manual',
                },
                // NOTICE — MANUAL MODE
                {
                    displayName: '📋 <strong>Manual Setup — Step by Step:</strong><br/><br/>' +
                        '<strong>Step 1:</strong> Create a free account at <a href="https://www.cloudmailin.com" target="_blank">cloudmailin.com</a> (if you don\'t have one).<br/>' +
                        '<strong>Step 2:</strong> In the <a href="https://www.cloudmailin.com/dashboard" target="_blank">CloudMailin Dashboard</a>, ' +
                        'create or edit an email address.<br/>' +
                        '<strong>Step 3:</strong> Set the <strong>Format</strong> to <strong>JSON (Normalized)</strong>.<br/>' +
                        '<strong>Step 4:</strong> Activate this n8n workflow — a <strong>Webhook URL</strong> will appear ' +
                        'at the top of this node (starts with https://...).<br/>' +
                        '<strong>Step 5:</strong> Copy that Webhook URL and paste it as the <strong>Target URL</strong> ' +
                        'in your CloudMailin address settings.<br/>' +
                        '<strong>Step 6:</strong> Save in CloudMailin. Done! Every email sent to your CloudMailin address ' +
                        'will now trigger this workflow.<br/><br/>' +
                        '💡 <em>No API key or credentials needed for manual mode.</em>',
                    name: 'manualNotice',
                    type: 'notice',
                    default: '',
                    displayOptions: { show: { setupMode: ['manual'] } },
                },
                // NOTICE — AUTO-PROVISION MODE
                {
                    displayName: '⚡ <strong>Auto-Provision Mode — How it Works:</strong><br/><br/>' +
                        'When you <strong>activate</strong> this workflow, a new CloudMailin email address ' +
                        'is automatically created and configured to forward emails to this node.<br/>' +
                        'When you <strong>deactivate</strong> the workflow, the email address is automatically deleted.<br/><br/>' +
                        '<strong>Prerequisites:</strong><br/>' +
                        '1. A CloudMailin account with <strong>Management API access</strong> enabled ' +
                        '(request it at <a href="https://www.cloudmailin.com/contact_us" target="_blank">cloudmailin.com/contact_us</a>).<br/>' +
                        '2. Add your API credentials in the <strong>CloudMailin API</strong> credential above ' +
                        '(Account ID + API Key from your CloudMailin dashboard).<br/><br/>' +
                        '<strong>After activation:</strong><br/>' +
                        '• The created email address will appear in the <strong>execution log</strong> ' +
                        'and in your <a href="https://www.cloudmailin.com/dashboard" target="_blank">CloudMailin Dashboard</a>.<br/>' +
                        '• Send a test email to that address to trigger the workflow.<br/>' +
                        '• The email address format is: <em>random-id@cloudmailin.net</em>',
                    name: 'autoProvisionNotice',
                    type: 'notice',
                    default: '',
                    displayOptions: { show: { setupMode: ['autoProvision'] } },
                },
                // OUTPUT FORMAT
                {
                    displayName: 'Output Format',
                    name: 'outputFormat',
                    type: 'options',
                    options: [
                        {
                            name: 'Simplified (Recommended)',
                            value: 'simplified',
                            description: 'Clean output: from, to, subject, date, bodyText, bodyHtml, attachments array',
                        },
                        {
                            name: 'Full Raw Payload',
                            value: 'full',
                            description: 'Complete CloudMailin JSON payload including envelope, all headers, and raw data',
                        },
                    ],
                    default: 'simplified',
                },
                // FILTER — SENDER
                {
                    displayName: 'Filter by Sender (Optional)',
                    name: 'filterSender',
                    type: 'string',
                    default: '',
                    placeholder: 'e.g. orders@shop.com or @domain.com',
                    description: 'Only trigger if the sender email address contains this string. ' +
                        'Case-insensitive. Leave empty to accept all senders.',
                },
                // FILTER — SUBJECT
                {
                    displayName: 'Filter by Subject Contains (Optional)',
                    name: 'filterSubject',
                    type: 'string',
                    default: '',
                    placeholder: 'e.g. New Order or Invoice',
                    description: 'Only trigger if the email subject contains this string. ' +
                        'Case-insensitive. Leave empty to accept all subjects.',
                },
                // FILTER — ATTACHMENTS
                {
                    displayName: 'Only Trigger if Has Attachments',
                    name: 'requireAttachments',
                    type: 'boolean',
                    default: false,
                    description: 'Whether to only trigger the workflow if the email contains one or more attachments',
                },
            ],
        };
        // ── WEBHOOK LIFECYCLE ──────────────────────────────────────────────────────
        this.webhookMethods = {
            default: {
                async checkExists() {
                    const setupMode = this.getNodeParameter('setupMode');
                    if (setupMode === 'manual')
                        return true; // Always exists in manual mode
                    const webhookData = this.getWorkflowStaticData('node');
                    if (!webhookData.addressId)
                        return false;
                    try {
                        const addresses = await GenericFunctions_1.cloudMailinApiRequest.call(this, 'GET', '/addresses');
                        return (Array.isArray(addresses) &&
                            addresses.some((a) => a.id === webhookData.addressId));
                    }
                    catch {
                        return false;
                    }
                },
                async create() {
                    const setupMode = this.getNodeParameter('setupMode');
                    if (setupMode === 'manual')
                        return true;
                    const webhookUrl = this.getNodeWebhookUrl('default');
                    const webhookData = this.getWorkflowStaticData('node');
                    try {
                        const response = await GenericFunctions_1.cloudMailinApiRequest.call(this, 'POST', '/addresses', {
                            target: webhookUrl,
                            target_format: 'json+n',
                        });
                        webhookData.addressId = response.id;
                        webhookData.emailAddress = response.address;
                        return true;
                    }
                    catch (error) {
                        throw new n8n_workflow_1.NodeOperationError(this.getNode(), `Failed to create CloudMailin address: ${error.message}. ` +
                            'Make sure Management API is enabled on your account ' +
                            '(contact CloudMailin support at https://www.cloudmailin.com/contact_us).');
                    }
                },
                async delete() {
                    const setupMode = this.getNodeParameter('setupMode');
                    if (setupMode === 'manual')
                        return true;
                    const webhookData = this.getWorkflowStaticData('node');
                    if (!webhookData.addressId)
                        return true;
                    try {
                        await GenericFunctions_1.cloudMailinApiRequest.call(this, 'DELETE', `/addresses/${webhookData.addressId}`);
                    }
                    catch {
                        /* ignore deletion errors */
                    }
                    delete webhookData.addressId;
                    delete webhookData.emailAddress;
                    return true;
                },
            },
        };
    }
    // ── WEBHOOK HANDLER ────────────────────────────────────────────────────────
    async webhook() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
        const body = this.getBodyData();
        const filterSender = this.getNodeParameter('filterSender').trim().toLowerCase();
        const filterSubject = this.getNodeParameter('filterSubject')
            .trim()
            .toLowerCase();
        const requireAttachments = this.getNodeParameter('requireAttachments');
        const from = (((_a = body === null || body === void 0 ? void 0 : body.headers) === null || _a === void 0 ? void 0 : _a.from) || ((_b = body === null || body === void 0 ? void 0 : body.envelope) === null || _b === void 0 ? void 0 : _b.from) || '').toLowerCase();
        const subject = (((_c = body === null || body === void 0 ? void 0 : body.headers) === null || _c === void 0 ? void 0 : _c.subject) || '').toLowerCase();
        const attachments = Array.isArray(body === null || body === void 0 ? void 0 : body.attachments) ? body.attachments : [];
        const hasAttachments = attachments.length > 0;
        if (filterSender && !from.includes(filterSender))
            return { workflowData: [[]] };
        if (filterSubject && !subject.includes(filterSubject))
            return { workflowData: [[]] };
        if (requireAttachments && !hasAttachments)
            return { workflowData: [[]] };
        const outputFormat = this.getNodeParameter('outputFormat');
        let outputData;
        if (outputFormat === 'simplified') {
            outputData = {
                from: ((_d = body === null || body === void 0 ? void 0 : body.headers) === null || _d === void 0 ? void 0 : _d.from) || ((_e = body === null || body === void 0 ? void 0 : body.envelope) === null || _e === void 0 ? void 0 : _e.from) || '',
                to: ((_f = body === null || body === void 0 ? void 0 : body.headers) === null || _f === void 0 ? void 0 : _f.to) || ((_g = body === null || body === void 0 ? void 0 : body.envelope) === null || _g === void 0 ? void 0 : _g.to) || '',
                subject: ((_h = body === null || body === void 0 ? void 0 : body.headers) === null || _h === void 0 ? void 0 : _h.subject) || '',
                date: ((_j = body === null || body === void 0 ? void 0 : body.headers) === null || _j === void 0 ? void 0 : _j.date) || '',
                messageId: ((_k = body === null || body === void 0 ? void 0 : body.headers) === null || _k === void 0 ? void 0 : _k.message_id) || '',
                replyTo: ((_l = body === null || body === void 0 ? void 0 : body.headers) === null || _l === void 0 ? void 0 : _l.reply_to) || '',
                bodyText: (body === null || body === void 0 ? void 0 : body.plain) || '',
                bodyHtml: (body === null || body === void 0 ? void 0 : body.html) || '',
                replyText: (body === null || body === void 0 ? void 0 : body.reply_plain) || '',
                attachments: attachments.map((att) => ({
                    fileName: att.file_name || '',
                    contentType: att.content_type || '',
                    size: att.size || 0,
                    disposition: att.disposition || 'attachment',
                    content: att.content || null, // base64 string or null
                    url: att.url || null, // URL or null
                    contentId: att.content_id || null,
                })),
                hasAttachments,
                senderIp: ((_m = body === null || body === void 0 ? void 0 : body.envelope) === null || _m === void 0 ? void 0 : _m.remote_ip) || '',
                spfResult: ((_p = (_o = body === null || body === void 0 ? void 0 : body.envelope) === null || _o === void 0 ? void 0 : _o.spf) === null || _p === void 0 ? void 0 : _p.result) || '',
                tlsUsed: ((_q = body === null || body === void 0 ? void 0 : body.envelope) === null || _q === void 0 ? void 0 : _q.tls) || false,
            };
        }
        else {
            outputData = body;
        }
        return { workflowData: [this.helpers.returnJsonArray([outputData])] };
    }
}
exports.CloudMailinTrigger = CloudMailinTrigger;
