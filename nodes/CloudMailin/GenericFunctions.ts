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

  const options: IHttpRequestOptions = {
    method,
    url: `https://api.cloudmailin.com/api/v0.1${endpoint}`,
    headers: {
      Authorization: `apikey token=${credentials.apiKey as string}`,
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
