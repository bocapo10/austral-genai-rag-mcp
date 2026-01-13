import 'dotenv/config';
import { createAgent } from "langchain";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import * as readline from 'readline/promises';
import express from 'express';


const state:any[] = [];

const app = express();
const PORT = process.env.PORT || 4000;

let mcpClient: MultiServerMCPClient | null = null;

app.use(express.json()); // Middleware to parse JSON bodies
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Headers','X-Auth,Access-Control-Allow-Headers,Origin,Accept,Content-Type,Access-Control-Request-Method,Access-Control-Request-Headers');
    next();
});

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
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://localhost:8001/mcp'; // Currently pointing to ChromaDB MCP

// AI model
// const model = new ChatGoogleGenerativeAI({
//     model: "gemini-2.5-flash",
//     temperature: 0,
//     apiKey: process.env.GOOGLE_API_KEY,
// });

//Ai Model
const model = new ChatOpenAI({
  modelName: "openai/gpt-oss-20b",
  streaming:true,
  temperature: 0.7,
  configuration: {
  baseURL: "http://127.0.0.1:1234/v1",

  }
});



// System prompt - just defines agent behavior, tools are auto-discovered
const systemPrompt = `You are a helpful and friendly shopping assistant for an electronics store.

When helping customers:
1. Search for products that match their needs
2. Recommend the best options and explain why
3. Always mention price and availability
4. Be conversational and helpful

Use the search tools to find products in our catalog.

End lines with double spacing.
`;

// Create MCP client that connects to HTTP server
        //console.log(`🔌 Connecting to MCP HTTP server at ${MCP_SERVER_URL}...`);
        mcpClient = new MultiServerMCPClient({
            elasticsearch: {
                type: "http",
                url: MCP_SERVER_URL
            }
        });

// Initialize and get tools - automatically converted to LangChain format
await mcpClient.initializeConnections();
const tools = await mcpClient.getTools();

//console.log(`✅ Loaded ${tools.length} tools from MCP:\n`);
//tools.forEach(tool => console.log(`   - ${tool.name}: ${tool.description}`));


console.log();


// Create agent with MCP tools
const agent = createAgent({
            model,
            systemPrompt,
            tools
        });

// const chain = RunnableSequence.from([
//     agent,
//     new StringOutputParser(),
// ]);

async function runAgent(userPrompt:string,res:any) {
    
        //Run Agent with User Prompt
        state.push({ role: "user", content: userPrompt })
        //const response1 = await chain.stream({messages: state});    
        const response1 = await agent.stream({messages:state},{streamMode:'messages'});
        // res.write(`data: ${JSON.stringify(response1)}\n\n`);
    
        let partialAIresponse = '';
        let htmlSafeString = ''
        
        for await (const chunk of response1) {
            // Write each token chunk as an SSE data event
            if(chunk[0].constructor.name === 'AIMessageChunk' && chunk[0].content){
                    htmlSafeString = chunk[0].content.replace(/\n/g,'<br>');
                    partialAIresponse += htmlSafeString;
                    res.write(`data: ${htmlSafeString}\n\n`);
            }
        }
        
        //End the response when the stream finishes
    
        res.end();

        // Push AI response to state    
        state.push({ role: "assistant", content: partialAIresponse })
        
        console.log(htmlSafeString)
        
        return;
}


app.get('/status', (req, res) => {
    res.json({ status: 'Server running', timestamp: new Date().toISOString() });
});

// Endpoint to interact with the AI agent
app.post('/api/agent', async (req, res) => {
    const { prompt } = req.body; // Expecting a JSON body like { "prompt": "your query" }
    
    res.header("Content-Type", "text/event-stream");
    res.header("Cache-Control", "no-cache");
    res.header("Connection", "keep-alive");
    //res.flushHeaders();

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required in the request body' });
    }

    try {
        await runAgent(prompt,res);
        // console.log(result)
        // res.json(result);
    } catch (error) {
        console.error('Error running agent:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});