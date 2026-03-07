import {
  IExecuteFunctions,
  IHookFunctions,
  ILoadOptionsFunctions,
  IWebhookFunctions,
  IHttpRequestOptions,
  NodeApiError,
  INode,
} from 'n8n-workflow';

type CloudMailinContext =
  | IExecuteFunctions
  | IHookFunctions
  | ILoadOptionsFunctions
  | IWebhookFunctions;

/**
 * Makes an authenticated request to the CloudMailin Management API.
 * Retries up to 3 times on HTTP 429 (Too Many Requests).
 */
export async function cloudMailinApiRequest(
  this: CloudMailinContext,
  method: 'GET' | 'POST' | 'DELETE' | 'PUT' | 'PATCH',
  endpoint: string,
  body: object = {},
  retries = 3,
): Promise<any> {
  const credentials = await this.getCredentials('cloudMailinApi');

  const accountId = credentials.accountId as string;

  const options: IHttpRequestOptions = {
    method,
    url: `https://api.cloudmailin.com/api/v0.1/${accountId}${endpoint}`,
    headers: {
      Authorization: `Bearer ${credentials.apiKey as string}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: Object.keys(body).length > 0 ? body : undefined,
    returnFullResponse: true,
    ignoreHttpStatusErrors: true,
  };

  try {
    const response = await this.helpers.httpRequest(options);

    // Retry on 429 Too Many Requests
    if (response.statusCode === 429 && retries > 0) {
      const retryAfterHeader = (response.headers as Record<string, string>)?.['retry-after'];
      const waitMs = retryAfterHeader ? parseInt(retryAfterHeader, 10) * 1000 : 1000;
      await new Promise((resolve) => setTimeout(resolve, waitMs));
      return cloudMailinApiRequest.call(this, method, endpoint, body, retries - 1);
    }

    // Handle HTTP errors
    if (response.statusCode >= 400) {
      const errorBody = response.body as Record<string, any>;
      throw new NodeApiError(this.getNode() as INode, {
        message: errorBody?.message || errorBody?.error || `HTTP ${response.statusCode}`,
        description: `CloudMailin API error: ${method} ${endpoint} returned ${response.statusCode}`,
        httpCode: String(response.statusCode),
      });
    }

    return response.body;
  } catch (error) {
    if (error instanceof NodeApiError) throw error;
    throw new NodeApiError(this.getNode() as INode, {
      message: (error as Error).message,
      description: `Network error calling CloudMailin API: ${method} ${endpoint}`,
    });
  }
}

/**
 * Makes an authenticated request to the CloudMailin SMTP/Sending API.
 * Uses the SMTP API Token instead of the Management API Key.
 */
export async function cloudMailinSmtpRequest(
  this: CloudMailinContext,
  method: 'POST',
  endpoint: string,
  body: object = {},
  retries = 3,
): Promise<any> {
  const credentials = await this.getCredentials('cloudMailinApi');

  const accountId = credentials.accountId as string;
  const smtpToken = credentials.smtpApiToken as string;

  if (!smtpToken) {
    throw new NodeApiError(this.getNode() as INode, {
      message: 'SMTP API Token is required for sending emails',
      description:
        'Please add your SMTP API Token in the CloudMailin credentials. ' +
        'Find it at https://www.cloudmailin.com/outbound/senders',
    });
  }

  const options: IHttpRequestOptions = {
    method,
    url: `https://api.cloudmailin.com/api/v0.1/${accountId}${endpoint}`,
    headers: {
      Authorization: `Bearer ${smtpToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: Object.keys(body).length > 0 ? body : undefined,
    returnFullResponse: true,
    ignoreHttpStatusErrors: true,
  };

  try {
    const response = await this.helpers.httpRequest(options);

    if (response.statusCode === 429 && retries > 0) {
      const retryAfterHeader = (response.headers as Record<string, string>)?.['retry-after'];
      const waitMs = retryAfterHeader ? parseInt(retryAfterHeader, 10) * 1000 : 1000;
      await new Promise((resolve) => setTimeout(resolve, waitMs));
      return cloudMailinSmtpRequest.call(this, method, endpoint, body, retries - 1);
    }

    if (response.statusCode >= 400) {
      const errorBody = response.body as Record<string, any>;
      throw new NodeApiError(this.getNode() as INode, {
        message: errorBody?.message || errorBody?.error || `HTTP ${response.statusCode}`,
        description: `CloudMailin SMTP API error: ${method} ${endpoint} returned ${response.statusCode}`,
        httpCode: String(response.statusCode),
      });
    }

    return response.body;
  } catch (error) {
    if (error instanceof NodeApiError) throw error;
    throw new NodeApiError(this.getNode() as INode, {
      message: (error as Error).message,
      description: `Network error calling CloudMailin SMTP API: ${method} ${endpoint}`,
    });
  }
}
