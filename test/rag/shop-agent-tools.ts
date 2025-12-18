import 'dotenv/config';
import { createAgent, tool } from "langchain";
import { Client } from '@elastic/elasticsearch';
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";
import * as readline from 'readline/promises';
import * as z from "zod";
import chalk from 'chalk';

const state:any[] = [];
let continueLoop:boolean = true;
const styledPrompt = chalk.hex('#FF4500').bold('Query Shopping Assistant> '); // OrangeRed color, bold text


const esClient = new Client({
    node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
});

// Create readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});



// AI model Google Gemini (Prod Env)
// const model = new ChatGoogleGenerativeAI({
//     model: "gemini-2.5-flash",
//     temperature: 0,
//     apiKey: process.env.GOOGLE_API_KEY,
// });

//AI Model OpenAI (Dev Env)
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


const searchProductsTool = tool(
    async (input: { query: string; maxResults?: number }) => {
        const { query, maxResults = 5 } = input;
        
        console.log(`  🔍 Searching for: "${query}"`);
        
        const esQuery = {
            index: 'products',
            query: {
                multi_match: {
                    query,
                    fields: ['name', 'description', 'category']
                }
            },
            size: maxResults
        };
        
        console.log('  📤 Elasticsearch Query:');
        console.log(JSON.stringify(esQuery, null, 2));
        console.log();
        
        try {
            const searchResult = await esClient.search(esQuery);
            
            // Debug: Show raw ES response
            console.log('  📥 Elasticsearch Results:');
            console.log(`     Total hits: ${typeof searchResult.hits.total === 'object' ? searchResult.hits.total.value : searchResult.hits.total}`);
            console.log(`     Max score: ${searchResult.hits.max_score}`);
            searchResult.hits.hits.forEach((hit: any, i: number) => {
                console.log(`     ${i + 1}. [Score: ${hit._score?.toFixed(2)}] ${hit._source.name} ($${hit._source.price})`);
            });
            console.log();
            
            const products = searchResult.hits.hits.map((hit: any) => hit._source);
            
            if (products.length === 0) {
                return "No products found matching that query.";
            }
            
            // Return structured product information
            const result = products.map((p: any) => ({
                name: p.name,
                category: p.category,
                price: p.price,
                description: p.description,
                stock: p.stock
            }));
            
            console.log(`  ✅ Found ${result.length} products\n`);
            
            return JSON.stringify(result, null, 2);
            
        } catch (error) {
            return `Error searching products: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
    },
    {
        name: "search_products",
        description: "Search for products in our catalog. Use this when customers ask about products, prices, or availability. You can search by product name, category, or description.",
        schema: z.object({
            query: z.string().describe("The search query - can be product name, category, or keywords from description"),
            maxResults: z.number().optional().describe("Maximum number of results to return (default: 5)"),
        }),
    }
);



async function main() {
    
    try {
        console.log('═════════════════════════════════════════════');
        console.log('   Welcome to the Electronic Store');
        console.log('   Use the prompt to get help!               ');
        console.log('═══════════════════════════════════════════\n');
        
        // Create MCP client that connects to HTTP server
        //console.log(`🔌 Connecting to MCP HTTP server at ${MCP_SERVER_URL}...`);
        
        
        
        console.log();
        
        // Create agent with search product tool
        const agent = createAgent({
            model,
            systemPrompt,
            tools:[searchProductsTool]
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
        // Close input stream file
        rl.close()

        // Force exit to ensure child processes are killed
        process.exit(0);
    }
}

main();

