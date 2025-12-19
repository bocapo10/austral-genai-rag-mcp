import 'dotenv/config';
import { createAgent } from "langchain";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import * as readline from 'readline/promises';
import { any } from 'zod';
import chalk from 'chalk';


const state:any[] = [];
let continueLoop:boolean = true;
const styledPrompt = chalk.hex('#FF4500').bold('Query Shopping Assistant> '); // OrangeRed color, bold text



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




const MCP_SERVER_URL = 'http://localhost:8001/mcp'; // Currently pointing to ChromaDB MCP

// AI model
// const model = new ChatGoogleGenerativeAI({
//     model: "gemini-2.5-flash",
//     temperature: 0,
//     apiKey: process.env.GOOGLE_API_KEY,
// });

//Ai Model
const model = new ChatOpenAI({
  modelName: "openai/gpt-oss-20b",
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

Use the search tools to find products in our catalog.`;





async function main() {
    let mcpClient: MultiServerMCPClient | null = null;
    
    try {
        console.log('═════════════════════════════════════════════');
        console.log('   Welcome to the Electronic Store');
        console.log('   Use the prompt to get help!               ');
        console.log('═══════════════════════════════════════════\n');
        
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

        
        do{
            //Prompt User
            const userPrompt = await rl.question(styledPrompt); 

            if(userPrompt == "exit"){
                continueLoop = false;
                console.log("Thank you very much, come again back soon!");
            }else{
                 //Run Agent with User Prompt
                state.push({ role: "user", content: userPrompt })
                const response1 = await agent.invoke({messages: state});
            
                for(let res of response1.messages){
                    state.push(res);
                }

                console.log();
                console.log('🤖 Assistant:');
                console.log('─'.repeat(50));
                console.log(response1.messages[response1.messages.length - 1].content);
                console.log('═'.repeat(50));
                console.log();   
            }

        }while(continueLoop)
    



    } catch (error) {
        console.error('❌ Error:', error instanceof Error ? error.message : error);
        console.error('\n💡 Make sure to:');
        console.error('   1. Start Elasticsearch: yarn elasticsearch:start');
        console.error('   2. MCP server auto-starts via stdio (no manual step needed!)');
        console.error('   3. Check that .env has GOOGLE_API_KEY set');
        process.exit(1);
    } finally {
        // Clean up: close MCP connections
        if (mcpClient) {
            //console.log('\n🔌 Closing MCP connections...');
            try {
                await mcpClient.close();
            } catch (err) {
                // Ignore close errors
            }
        }
        rl.close()
        // Force exit to ensure child processes are killed
        //process.exit(0);
    }
}

main();

