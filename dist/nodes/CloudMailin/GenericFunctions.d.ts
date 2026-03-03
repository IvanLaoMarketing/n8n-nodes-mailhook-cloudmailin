import { IExecuteFunctions, IHookFunctions, ILoadOptionsFunctions, IWebhookFunctions } from 'n8n-workflow';
type CloudMailinContext = IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions | IWebhookFunctions;
/**
 * Makes an authenticated request to the CloudMailin Management API.
 * Retries up to 3 times on HTTP 429 (Too Many Requests).
 */
export declare function cloudMailinApiRequest(this: CloudMailinContext, method: 'GET' | 'POST' | 'DELETE' | 'PUT' | 'PATCH', endpoint: string, body?: object, retries?: number): Promise<any>;
export {};
