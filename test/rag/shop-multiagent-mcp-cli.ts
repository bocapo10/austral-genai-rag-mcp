import 'dotenv/config';
import { createAgent } from "langchain";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import * as readline from 'readline/promises';
import { registry } from "@langchain/langgraph/zod";
import * as z from 'zod';
import chalk from 'chalk';
import { tool } from "@langchain/core/tools";
import { MessagesAnnotation, StateGraph, Annotation,MessagesZodMeta } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import {
  SystemMessage,
  ToolMessage,
  HumanMessage,
  BaseMessage
} from "@langchain/core/messages";



let mcpClient: MultiServerMCPClient | null = null;


const styledPromptShopping = chalk.hex('#FF4500').bold('Query Shopping Assistant> '); // OrangeRed color, bold text
const styledPromptCheckout = chalk.hex('#0a982eff').bold('Query Shopping Assistant> '); // Green color, bold text



// Create readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

interface GraphState {
  messages: BaseMessage[];
  checkout: boolean;
}

const StateSchema = z.object({
  messages: z.array(z.custom<BaseMessage>()),
  checkout: z.boolean() // Define 'checkout' properly
}) 

type State = z.infer<typeof StateSchema>;



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
const shoppingAssistantPrompt = `You are a helpful and friendly shopping assistant for an electronics store.

When helping customers:
1. Search for products that match their needs
2. Recommend the best options and explain why
3. Always mention price and availability
4. Be conversational and helpful
5. When user wants to proceed to checkout use the tool to set checkout to true

Use the search tools to find products in our catalog and add, view or empty cart`;


const checkoutAssistantPrompt = `You are a helpful and friendly checkout assistant for an electronics store.

When helping customers:
1. Help them checkout their shopping cart
2. Ask for the user to input their shipping address
3. Offer the user payment methods (only offer credit cards Visa or Mastercard)
4. Confirm the user has completed payment
5. Inform the user that their order has been shipped and inform estimated time of arrival

Use the view cart tool to create the shipping order and show order details to customer
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
const toolNodeShopping = new ToolNode(tools);
const toolNodeCheckout = new ToolNode(tools);

const modelWithTools = model.bindTools(tools);


async function shoppingAssistant(state: State) {
  // LLM decides whether to call a tool or not
    const messages = state.messages;
    const lastMessage = messages.at(-1);
    
    if (lastMessage?.name == 'proceed_to_checkout'){
        return {
            messages,
            checkout: true
        }
    }
  

    
    const result = await modelWithTools.invoke([
        {
        role: "system",
        content: shoppingAssistantPrompt
        },
        ...state.messages
    ]);

    return {
        messages: [result]
    };
}



async function checkoutAssistant(state: State) {
  // Agent with checkout system prompt
   
  const result = await modelWithTools.invoke([
        {
        role: "system",
        content: checkoutAssistantPrompt
        },
        ...state.messages
    ]);

    return {
        messages: [result]
    };
}



async function llmResponseShopping(state: State) {
    
    console.log(state.messages[state.messages.length - 1].content);

}

async function llmResponseCheckout(state: State) {
    
    console.log(state.messages[state.messages.length - 1].content);

}

async function queryUserShopping(state: State) {
    
    const userPrompt = await rl.question(styledPromptShopping); 
    state.messages.push(new HumanMessage(userPrompt));

    return {
        messages: state.messages
    };
}


async function queryUserCheckout(state: State) {
    
    const userPrompt = await rl.question(styledPromptCheckout); 
    state.messages.push(new HumanMessage(userPrompt));

    return {
        messages: state.messages
    };
}



// Conditional edge function to route to the tool node or end
function shouldContinue(state: State) {
  const messages = state.messages;
  const lastMessage = messages.at(-1);


  if(state.checkout){
    return "checkoutAssistant"
  }else if (lastMessage?.tool_calls?.length) {
  // If the LLM makes a tool call, then perform an action
    return "toolNodeShopping";
  }
  // Otherwise, we stop (reply to the user)
  return "llmResponseShopping";
}
function shouldContinueCheckout(state: State) {
  const messages = state.messages;
  const lastMessage = messages.at(-1);


  if (lastMessage?.tool_calls?.length) {
  // If the LLM makes a tool call, then perform an action
    return "toolNodeCheckout";
  }
  // Otherwise, we stop (reply to the user)
  return "llmResponseCheckout";
}


const workflow = new StateGraph<GraphState>({
  channels: {
    messages: {
      reducer: (currentState, updateValue) => currentState.concat(updateValue),
      default: () => [],
    },
    checkout: null
  },
})
  .addNode("shoppingAssistant", shoppingAssistant)
  .addNode("checkoutAssistant", checkoutAssistant)
  .addNode("llmResponseShopping", llmResponseShopping)
  .addNode("llmResponseCheckout", llmResponseCheckout)
  .addNode("queryUserShopping", queryUserShopping)
  .addNode("queryUserCheckout", queryUserCheckout)
  .addNode("toolNodeShopping", toolNodeShopping)
  .addNode("toolNodeCheckout", toolNodeCheckout)
  // Add edges to connect nodes
  
  .addEdge("__start__", "queryUserShopping")
  .addEdge("queryUserShopping","shoppingAssistant")
  .addEdge("queryUserCheckout","checkoutAssistant") 
  .addEdge("toolNodeShopping", "shoppingAssistant")
  .addEdge("toolNodeCheckout", "checkoutAssistant")
  .addEdge("llmResponseShopping", "queryUserShopping")
  .addEdge("toolNodeCheckout", "llmResponseCheckout")
  .addEdge("llmResponseCheckout", "queryUserCheckout")
  .addConditionalEdges(
    "shoppingAssistant",
    shouldContinue,
    ["toolNodeShopping", "llmResponseShopping","checkoutAssistant"]
  )
  .addConditionalEdges(
    "checkoutAssistant",
    shouldContinueCheckout,
    ["toolNodeCheckout", "llmResponseCheckout"]
  )
  
  .compile();


// const initialState:State = {
//   messages: [],
//   checkout: false,

// };

const result = await workflow.invoke({},{"recursionLimit":100});
console.log(result?.messages?result.messages:"nothing");



