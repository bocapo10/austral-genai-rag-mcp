import 'dotenv/config';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { ChromaClient, getEmbeddingFunction } from 'chromadb';
import express from 'express';
import { z } from 'zod';

let cart:any[] = [];
let order = {};
let proceedCheckout = false;


// ChromaDB client configuration
const chromaUrl = process.env.CHROMA_URL || 'http://localhost:8000';
const url = new URL(chromaUrl);
const chromaClient = new ChromaClient({ 
    path: chromaUrl
});

console.log('Chroma URL:',chromaUrl)
// MCP HTTP Server Port
const PORT = process.env.PORT || 8001;

console.log('Port:',PORT)
// Create Express app
const app = express();
app.use(express.json());

// Create MCP Server
const mcp = new McpServer({
    name: 'ChromaDBToolServer',
    version: '1.0.0',
    description: 'Provides ChromaDB vector search capabilities',
});


// Register ChromaDB tools using the correct MCP pattern
mcp.registerTool(
    'chroma_query_collection',
    {
        title: 'ChromaDB Query Collection',
        description: 'Search documents in a ChromaDB collection using semantic similarity',
        inputSchema: { 
            collection: z.string().optional(), 
            query: z.string(), 
            n_results: z.number().optional() 
        }
    },
    async ({ collection = 'products', query, n_results = 5 }) => {
        console.error('🔍 Querying ChromaDB:', { collection, query, n_results });
        
        const coll = await chromaClient.getCollection({ 
            name: collection,
            //embeddingFunction: getEmbeddingFunction({collectionName:collection,client:ChromaClient})
        });
        const results = await coll.query({
            queryTexts: [query],
            nResults: n_results
        });
        
        const formattedResults = results.ids[0].map((id, i) => ({
            id,
            distance: results.distances?.[0][i],
            metadata: results.metadatas[0][i],
            document: results.documents[0][i]
        }));
        
        console.error('📥 Query Results:', {
            total: formattedResults.length,
            results: formattedResults.map(r => ({
                id: r.id,
                distance: r.distance,
                name: (r.metadata as any)?.name
            }))
        });

        return {
            content: [{
                type: "text",
                text: JSON.stringify(formattedResults, null, 2),
            }],
        };
    }
);

mcp.registerTool(
    'chroma_list_collections',
    {
        title: 'ChromaDB List Collections',
        description: 'List all collections in ChromaDB',
        inputSchema: {}
    },
    async () => {
        console.error('📚 Listing collections');
        
        const collections = await chromaClient.listCollections();
        const collectionList = collections.map(c => c.name);
        
        console.error('📥 Collections:', { count: collectionList.length, collections: collectionList });

        return {
            content: [{
                type: "text",
                text: JSON.stringify(collectionList, null, 2),
            }],
        };
    }
);

mcp.registerTool(
    'chroma_get_collection_info',
    {
        title: 'ChromaDB Get Collection Info',
        description: 'Get information about a collection',
        inputSchema: { 
            collection: z.string()
        }
    },
    async ({ collection }) => {
        console.error('📊 Getting collection info:', { collection });
        
        const coll = await chromaClient.getCollection({ 
            name: collection,
            //embeddingFunction: new getEmbeddingFunction({collectionName:collection,client:ChromaClient})
        });
        const count = await coll.count();
        
        const info = {
            name: collection,
            count,
        };
        
        console.error('📥 Collection info:', info);

        return {
            content: [{
                type: "text",
                text: JSON.stringify(info, null, 2),
            }],
        };
    }
);


mcp.registerTool(
    'add_to_cart',
    {
        title: 'Add product to cart',
        description: 'Add a product to the cart',
        inputSchema: { 
            productID: z.number(),
            productName: z.string(),
            quantity: z.number(), 
        }
    },
    async ({ productID = 1, productName, quantity = 1}) => {
        //console.error('🔍 Querying ChromaDB:', { collection, query, n_results });
        
        for(let count = 0; count < quantity; count++){
            cart.push({productID, productName, quantity:1});
        }
        
        
        let addedProduct = {productID, productName, quantity};
        
        console.error(`Added ${productName} to cart`);

        return {
            content: [{
                type: "text",
                text: JSON.stringify(addedProduct, null, 2),
            }   ],
        };
    }
);

mcp.registerTool(
    'remove_item_from_cart',
    {
        title: 'Remove an item from cart',
        description: 'Remove an item from cart',
        inputSchema: { 
            productID: z.number(),
            productName: z.string(),
            quantity: z.number(), 
        }
    },
    async ({ productID = 1, productName, quantity = 1}) => {
        //console.error('🔍 Querying ChromaDB:', { collection, query, n_results });
        
        let index = cart.findIndex(item => productName == item.name)
        cart.splice(index,1); 
        
        
        console.error(`Removed ${productName} from cart`);

        return {
            content: [{
                type: "text",
                text: `Deleted ${productName} from cart`,
            }],
        };
    }
);

mcp.registerTool(
    'view_cart',
    {
        title: 'View items in cart',
        description: 'View the items of the cart',
        inputSchema: {}
    },
    async () => {
        //console.error('🔍 Querying ChromaDB:', { collection, query, n_results });
        
        
        let viewCart = {cartItems: cart};
        
        cart.forEach(item => console.log(item));

        return {
            content: [{
                type: "text",
                text: JSON.stringify(viewCart, null, 2),
            }],
        };
    }
);

mcp.registerTool(
    'empty_cart',
    {
        title: 'Empty cart',
        description: 'Delete all the items of the cart',
        inputSchema: {}
    },
    async () => {
        //console.error('🔍 Querying ChromaDB:', { collection, query, n_results });
        
        
        cart.length = 0;
        
        console.error('Cart is empty');

        return {
            content: [{
                type: "text",
                text: JSON.stringify('Cart is empty', null, 2),
            }],
        };
    }
);


mcp.registerTool(
    'proceed_to_checkout',
    {
        title: 'Proceed to checkout',
        description: 'Proceed to checkout. Set checkout variable to true',
        inputSchema: {}
    },
    async () => {
        //console.error('🔍 Querying ChromaDB:', { collection, query, n_results });
        
        proceedCheckout = true

        return {
            content: [{
                type: "text",
                text: JSON.stringify('Proceed to checkout', null, 2),
            }],
        };
    }
);


// Add health check endpoint
app.get('/health', async (req, res) => {
    try {
        const version = await chromaClient.version();
        res.json({
            status: "ok",
            mcp_server: "running",
            chromadb: {
                version,
                url: chromaUrl
            }
        });
    } catch (error) {
        res.status(503).json({ status: "error", chromadb: "disconnected" });
    }
});

// Add MCP endpoint following the correct pattern
app.post('/mcp', async (req, res) => {
    const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true
    });

    // Connect server with transport
    await mcp.connect(transport);

    res.on('close', () => {
        transport.close();
    });

    await transport.handleRequest(req, res, req.body);
});


// Start server
app.listen(PORT, () => {
    console.log('🚀 ChromaDB MCP HTTP Server Started');
    console.log(`Server: http://localhost:${PORT}`);
    console.log(`Endpoint: POST http://localhost:${PORT}/mcp (JSON-RPC)`);
    console.log(`Health: GET http://localhost:${PORT}/health`);
    console.log('');
    console.log('Available tools:');
    console.log('  - chroma_query_collection: Semantic search');
    console.log('  - chroma_list_collections: List all collections');
    console.log('  - chroma_get_collection_info: Get collection info');
    console.log('');
    console.log('💡 Test with:');
    console.log(`   curl -X POST http://localhost:${PORT}/mcp -H "Content-Type: application/json" -H "Accept: application/json, text/event-stream" -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'`);
    console.log('');
    console.log('Ready to accept connections...');
});

