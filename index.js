"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
var langchain_1 = require("langchain");
var openai_1 = require("@langchain/openai");
var mcp_adapters_1 = require("@langchain/mcp-adapters");
var readline = require("readline/promises");
var express_1 = require("express");
var state = [];
var app = (0, express_1.default)();
var PORT = process.env.PORT || 3000;
var mcpClient = null;
app.use(express_1.default.json()); // Middleware to parse JSON bodies
/**
 * Case 3: Agent with MCP Interoperability Demo
 *
 * This example demonstrates how the same agent can work with different MCP implementations
 * without any code changes. It proves the interoperability of the MCP protocol.
 *
 * Current Configuration: ChromaDB MCP Server
 * - Connects to: http://localhost:8001/mcp (ChromaDB MCP)
 * - Tools: chroma_query_collection, chroma_list_collections, chroma_get_collection_info
 *
 * Alternative Configuration: Elasticsearch MCP Server
 * - To switch: Change MCP_SERVER_URL to point to Elasticsearch MCP server
 * - Tools: elasticsearch_search, elasticsearch_index_document, elasticsearch_get_indices
 *
 * Prerequisites:
 * 1. Start ChromaDB: yarn chroma:start
 *    OR
 * 2. Start Elasticsearch: yarn elasticsearch:start (Elasticsearch only)
 *    OR
 * 3. Start Elasticsearch + Kibana: yarn elasticsearch:start:full
 * 4. Start corresponding MCP server: yarn mcp:elasticsearch (for Elasticsearch)
 */
// Create readline interface
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
var MCP_SERVER_URL = 'http://localhost:8001/mcp'; // Currently pointing to ChromaDB MCP
// AI model
// const model = new ChatGoogleGenerativeAI({
//     model: "gemini-2.5-flash",
//     temperature: 0,
//     apiKey: process.env.GOOGLE_API_KEY,
// });
//Ai Model
var model = new openai_1.ChatOpenAI({
    modelName: "openai/gpt-oss-20b",
    temperature: 0.7,
    configuration: {
        baseURL: "http://127.0.0.1:1234/v1",
    }
});
// System prompt - just defines agent behavior, tools are auto-discovered
var systemPrompt = "You are a helpful and friendly shopping assistant for an electronics store.\n\nWhen helping customers:\n1. Search for products that match their needs\n2. Recommend the best options and explain why\n3. Always mention price and availability\n4. Be conversational and helpful\n\nUse the search tools to find products in our catalog.";
// Create MCP client that connects to HTTP server
//console.log(`🔌 Connecting to MCP HTTP server at ${MCP_SERVER_URL}...`);
mcpClient = new mcp_adapters_1.MultiServerMCPClient({
    elasticsearch: {
        type: "http",
        url: MCP_SERVER_URL
    }
});
// Initialize and get tools - automatically converted to LangChain format
await mcpClient.initializeConnections();
var tools = await mcpClient.getTools();
//console.log(`✅ Loaded ${tools.length} tools from MCP:\n`);
//tools.forEach(tool => console.log(`   - ${tool.name}: ${tool.description}`));
console.log();
// Create agent with MCP tools
var agent = (0, langchain_1.createAgent)({
    model: model,
    systemPrompt: systemPrompt,
    tools: tools
});
function runAgent(userPrompt) {
    return __awaiter(this, void 0, void 0, function () {
        var response1, _i, _a, res;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    //Run Agent with User Prompt
                    state.push({ role: "user", content: userPrompt });
                    return [4 /*yield*/, agent.invoke({ messages: state })];
                case 1:
                    response1 = _b.sent();
                    for (_i = 0, _a = response1.messages; _i < _a.length; _i++) {
                        res = _a[_i];
                        state.push(res);
                    }
                    return [2 /*return*/, response1.messages[response1.messages.length - 1].content];
            }
        });
    });
}
app.get('/status', function (req, res) {
    res.json({ status: 'Server running', timestamp: new Date().toISOString() });
});
// Endpoint to interact with the AI agent
app.post('/api/agent', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var prompt, result, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                prompt = req.body.prompt;
                if (!prompt) {
                    return [2 /*return*/, res.status(400).json({ error: 'Prompt is required in the request body' })];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, runAgent(prompt)];
            case 2:
                result = _a.sent();
                console.log(result);
                res.json(result);
                return [3 /*break*/, 4];
            case 3:
                error_1 = _a.sent();
                console.error('Error running agent:', error_1);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.listen(PORT, function () {
    console.log("Server listening on port ".concat(PORT));
});
