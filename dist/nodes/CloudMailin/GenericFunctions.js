"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudMailinApiRequest = cloudMailinApiRequest;
const n8n_workflow_1 = require("n8n-workflow");
/**
 * Makes an authenticated request to the CloudMailin Management API.
 * Retries up to 3 times on HTTP 429 (Too Many Requests).
 */
async function cloudMailinApiRequest(method, endpoint, body = {}, retries = 3) {
    var _a;
    const credentials = await this.getCredentials('cloudMailinApi');
    const options = {
        method,
        url: `https://api.cloudmailin.com/api/v0.1${endpoint}`,
        headers: {
            Authorization: `apikey token=${credentials.apiKey}`,
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
            const retryAfterHeader = (_a = response.headers) === null || _a === void 0 ? void 0 : _a['retry-after'];
            const waitMs = retryAfterHeader ? parseInt(retryAfterHeader, 10) * 1000 : 1000;
            await new Promise((resolve) => setTimeout(resolve, waitMs));
            return cloudMailinApiRequest.call(this, method, endpoint, body, retries - 1);
        }
        // Handle HTTP errors
        if (response.statusCode >= 400) {
            const errorBody = response.body;
            throw new n8n_workflow_1.NodeApiError(this.getNode(), {
                message: (errorBody === null || errorBody === void 0 ? void 0 : errorBody.message) || (errorBody === null || errorBody === void 0 ? void 0 : errorBody.error) || `HTTP ${response.statusCode}`,
                description: `CloudMailin API error: ${method} ${endpoint} returned ${response.statusCode}`,
                httpCode: String(response.statusCode),
            });
        }
        return response.body;
    }
    catch (error) {
        if (error instanceof n8n_workflow_1.NodeApiError)
            throw error;
        throw new n8n_workflow_1.NodeApiError(this.getNode(), {
            message: error.message,
            description: `Network error calling CloudMailin API: ${method} ${endpoint}`,
        });
    }
}
