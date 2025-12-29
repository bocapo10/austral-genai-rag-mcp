# AI Agents Tutorial with RAG & MCP

A comprehensive, hands-on tutorial for building production-ready AI agents using **LangChain**, **Model Context Protocol (MCP)**, and **Retrieval-Augmented Generation (RAG)** with both **Elasticsearch** and **ChromaDB**.

## 🎯 What You'll Learn

This repository demonstrates:

1. **RAG Patterns** - From simple to production-grade retrieval
2. **Vector vs Full-Text Search** - ChromaDB vs Elasticsearch comparison
3. **MCP Integration** - Official protocol for AI tool standardization
4. **Agent Architectures** - When to use agents vs direct retrieval
5. **Production Patterns** - Microservices, debugging, and best practices

## ⚡ Quick Start

### 1. Install Dependencies

```bash
yarn install
```

### 2. Set Up Environment (Required!)

Create a `.env` file:

```bash
# Google API Key (get from https://makersuite.google.com/app/apikey)
GOOGLE_API_KEY=your-actual-api-key-here

# Elasticsearch Configuration
ELASTICSEARCH_URL=http://localhost:9200

# ChromaDB Configuration (optional)
CHROMA_URL=http://localhost:8000
CHROMA_EMBEDDING_FUNCTION=default
```

📖 **See [SETUP.md](SETUP.md) for detailed setup instructions**

### 3. Cursor IDE Integration (Bonus!) ⭐

**MCP servers are pre-configured for Cursor IDE!**

After setup, restart Cursor and you'll have access to:
- **Elasticsearch tools**: Search, index, and manage documents
- **ChromaDB tools**: Vector search and collection management
- **Auto-discovery**: Tools appear automatically in Cursor
- **No additional setup**: Just restart Cursor after running the tutorial

### 4. Choose Your Path

**Path A: Elasticsearch (Full-Text Search)**
```bash
# Terminal 1: Start Elasticsearch + Kibana
yarn elasticsearch:start

# Terminal 2: Run examples
yarn rag:case1    # Simple RAG
yarn rag:case2    # Agent-based
yarn rag:case3    # Production MCP
```

**Path B: ChromaDB (Vector Search)**
```bash
# Terminal 1: Start ChromaDB
yarn chroma:start

# Terminal 2: Run example

# Explore data
yarn chroma:console
```

## 📂 Project Structure

```
.
├── src/
│   ├── mcp/                        # MCP server examples (stdio)
│   ├── rag/                        # RAG with Elasticsearch
│   │   ├── elasticsearch-mcp-http-server.ts # MCP server (HTTP)
│   │   ├── setup-data.ts           # Data initialization
│   │   └── README.md               # 📖 Elasticsearch RAG guide
│   └── chroma/                     # RAG with ChromaDB
│       ├── setup-data.ts           # Data initialization
│       ├── query-console.ts        # Interactive query tool
│       └── README.md               # 📖 ChromaDB RAG guide
│
├── test/
│   └── rag/                        # RAG examples (⭐ START HERE)
│       ├── case1-direct-rag-example.ts        # Direct RAG
│       ├── case2-agent-rag-example.ts        # Agent + ES
│       ├── case3-agent-mcp-example.ts        # Agent + MCP + ES
│       └── README.md               # Examples comparison
│
├── data/
│   └── products.json               # Shared product catalog
│
├── scripts/
│   ├── es-mcp/                     # Elasticsearch Docker setup
│   │   ├── docker-compose.yml      # ES + Kibana + init
│   │   └── Dockerfile
│   └── chroma-mcp/                 # ChromaDB Docker setup
│       ├── docker-compose.yml      # Chroma + init
│       └── Dockerfile
│
├── resources/
│   ├── MCP-Weather-Server.postman_collection.json
│   └── README.md
│
├── .env                            # ⚠️ CREATE THIS (see SETUP.md)
├── .gitignore                      # Excludes .env
├── SETUP.md                        # 📖 Setup guide
└── README.md                       # 👈 You are here
```

## 🎯 RAG Examples - Progressive Learning

### Case 1: Direct RAG ⭐ (Start Here!)

**Best for:** Understanding RAG fundamentals

```bash
yarn elasticsearch:start
yarn rag:case1
```

**Architecture:**
```
User Query → Search ES → Pass results to AI → Generate Answer
```

**Features:**
- ✅ No agents, no complexity
- ✅ Debug logging shows ES queries
- ✅ See relevance scores
- ✅ Linear, predictable flow

**When to use:** Simple Q&A, document lookup, learning RAG

---

### Case 2: Agent + Direct Tools

**Best for:** Smart assistants that need reasoning

```bash
yarn elasticsearch:start
yarn rag:case2
```

**Architecture:**
```
User Query → Agent decides → Search ES → Agent reasons → Answer
```

**Features:**
- ✅ Agent intelligence (when/how to search)
- ✅ Custom LangChain tools
- ✅ Multi-step reasoning
- ✅ Debug logging

**When to use:** Chatbots, assistants, complex queries

---

### Case 3: Agent + MCP + Elasticsearch ⭐⭐ (Production)

**Best for:** Production apps, microservices, scalability

```bash
yarn elasticsearch:start
yarn mcp:elasticsearch-http
yarn rag:case3
```

**Architecture:**
```
User Query → Agent → MCP Adapter → HTTP MCP Server → ES → Response
```

**Features:**
- ✅ Microservices architecture
- ✅ HTTP-based MCP (standard protocol)
- ✅ Process isolation
- ✅ Tool auto-discovery
- ✅ Decoupled components

**When to use:** Production systems, multiple services, team projects

---

### Case 4: Agent + MCP + ChromaDB (Vector Search)

**Best for:** Semantic search, AI-first applications

```bash
yarn chroma:start
```

**Architecture:**
```
User Query → Agent → MCP Adapter → chroma-mcp (Python) → ChromaDB → Response
```

**Features:**
- ✅ Official chroma-mcp Python server (via pip)
- ✅ Semantic similarity search
- ✅ Built-in embeddings (MiniLM-L6-v2)
- ✅ Configurable embedding models
- ✅ stdio-based MCP

**When to use:** Semantic search, embeddings, similarity matching

---

## 🔍 Elasticsearch vs ChromaDB

| Feature | Elasticsearch (Cases 1-3) | ChromaDB (Case 4) |
|---------|--------------------------|-------------------|
| **Search Type** | Full-text + filters | Vector similarity |
| **Embeddings** | Not built-in | Native support |
| **Best For** | Traditional search | AI/semantic search |
| **Query Language** | JSON DSL | Semantic queries |
| **Setup** | Docker + Kibana UI | Docker only |
| **Console** | Kibana Dev Tools | Custom CLI tool |
| **Data Model** | Documents + indexes | Collections + vectors |
| **Use Case** | Search engines, logs | AI apps, recommendations |

## 🛠️ All Commands

### Elasticsearch Stack
```bash
yarn elasticsearch:start     # Start ES + Kibana + auto-load data
yarn elasticsearch:stop      # Stop all services
```

**What you get:**
- ✅ Elasticsearch at http://localhost:9200
- ✅ Kibana UI at http://localhost:5601
- ✅ Sample data auto-loaded (5 products)

### ChromaDB Stack
```bash
yarn chroma:start           # Start ChromaDB + auto-load data
yarn chroma:stop            # Stop service
yarn chroma:console         # Interactive query console ⭐
```

**What you get:**
- ✅ ChromaDB at http://localhost:8000
- ✅ Sample data auto-loaded (same 5 products)
- ✅ Interactive console for queries

### RAG Examples
```bash
yarn rag:case1              # Direct RAG (Elasticsearch)
yarn rag:case2              # Agent + ES tools
yarn rag:case3              # Agent + MCP + ES (production)
              # Agent + MCP + ChromaDB (vectors)
```

### MCP Servers
```bash
yarn mcp:elasticsearch      # Elasticsearch MCP (stdio)
yarn mcp:elasticsearch-http # Elasticsearch MCP (HTTP) ⭐
```

### Cursor IDE Integration ⭐
```bash
# MCP servers are pre-configured for Cursor IDE!
# Configuration files:
# - ~/.cursor/mcp.json (global)
# - .cursor/mcp.json (project-specific)

# Available MCP servers in Cursor:
# - elasticsearch-mcp: Search and index documents
# - chromadb-mcp: Vector search and collections
```

**What you get in Cursor:**
- ✅ **Auto-discovery**: Tools appear automatically in Cursor
- ✅ **No setup needed**: Just restart Cursor after configuration
- ✅ **Both servers**: Elasticsearch + ChromaDB MCP servers
- ✅ **Relative paths**: Portable configuration
- ✅ **Environment ready**: All env vars pre-configured

### Data Management
```bash
yarn data:setup             # ES data initialization
yarn chroma:data:setup      # Chroma data initialization
```

## 🖥️ Web Interfaces

### Elasticsearch Stack
- **Elasticsearch API:** http://localhost:9200
- **Kibana UI:** http://localhost:5601
- **Kibana Dev Tools:** http://localhost:5601/app/dev_tools#/console

### ChromaDB Stack
- **ChromaDB API:** http://localhost:8000
- **Interactive Console:** `yarn chroma:console`

## 🎓 Learning Path

### Beginner: Start with Simple RAG

```bash
# 1. Create .env with your Google API key
cat > .env << 'EOF'
GOOGLE_API_KEY=your-key-here
ELASTICSEARCH_URL=http://localhost:9200
EOF

# 2. Start Elasticsearch
yarn elasticsearch:start

# 3. Run the simplest example
yarn rag:case1
```

**What to observe:**
- 📤 How queries are structured
- 📥 What data comes back
- 🎯 Relevance scores
- 🤖 How AI uses the context

### Intermediate: Add Agent Intelligence

```bash
# Same Elasticsearch is running
yarn rag:case2
```

**What to observe:**
- 🤖 Agent decides when to search
- 🔧 Tool calling in action
- 💭 Agent reasoning process

### Advanced: Production with MCP

```bash
# Terminal 1: Elasticsearch (already running)

# Terminal 2: Start MCP HTTP server
yarn mcp:elasticsearch-http

# Terminal 3: Run agent
yarn rag:case3
```

**What to observe:**
- 📡 Process isolation
- 🔌 HTTP communication
- 🛠️ Tool auto-discovery
- 🏗️ Microservices architecture

### Expert: Vector Search with ChromaDB

```bash
# Terminal 1: Start ChromaDB
yarn chroma:start

# Terminal 2: Explore data
yarn chroma:console
# Try: list, peek products, query products laptop

# Terminal 3: Run agent
```

**What to observe:**
- 🧮 Semantic similarity
- 📐 Embedding vectors
- 🎯 Distance scores
- 🐍 Python MCP server via pip (chroma-mcp)

## 🌟 Key Features

### 1. Shared Data Source

All examples use the same product catalog from `data/products.json`:
- Consistent across Elasticsearch and ChromaDB
- Easy to modify and experiment
- Real-world product data structure

### 2. Debug Logging

Every RAG example shows:
```
📤 Elasticsearch Query:
{
  "index": "products",
  "query": { "multi_match": { "query": "laptop" } }
}

📥 Results:
   Total: 3, Max Score: 2.45
   1. [2.45] Dell XPS 15 ($1299)
   2. [1.87] MacBook Pro ($1999)
```

### 3. Auto-Discovery with MCP Adapters

```typescript
import { MultiServerMCPClient } from "@langchain/mcp-adapters";

const mcpClient = new MultiServerMCPClient({
    elasticsearch: {
        type: "http",
        url: "http://localhost:8001/mcp"
    }
});

// Magic! No manual tool definitions needed
const tools = await mcpClient.getTools();
```

### 4. Interactive Query Consoles

**Elasticsearch (Kibana):**
- Full UI at http://localhost:5601
- Dev Tools for query testing
- Visual index management

**ChromaDB (Custom CLI):**
```bash
$ yarn chroma:console

chroma> list
📚 Available Collections:
   📦 products (5 documents)

chroma> query products laptop 2
🔍 Searching "products" for: "laptop"
   1. [0.3421] MacBook Pro 16"
   2. [0.4122] Dell XPS 13
```

### 5. Cursor IDE Integration ⭐

**Pre-configured MCP servers** ready to use in Cursor:

```json
// ~/.cursor/mcp.json (automatically created)
{
  "mcpServers": {
    "elasticsearch-mcp": {
      "command": "node",
      "args": ["--import", "tsx/esm", "./src/rag/elasticsearch-mcp-http-server.ts"],
      "env": { "ELASTICSEARCH_URL": "http://localhost:9200" }
    },
    "chromadb-mcp": {
      "command": "node", 
      "args": ["--import", "tsx/esm", "./src/chroma/chroma-mcp-http-server.ts"],
      "env": { "CHROMA_URL": "http://localhost:8000" }
    }
  }
}
```

**Available tools in Cursor:**
- `elasticsearch_search` - Search documents
- `elasticsearch_index_document` - Index new documents  
- `elasticsearch_get_indices` - List all indices
- `chroma_query_collection` - Semantic search
- `chroma_list_collections` - List collections
- `chroma_get_collection_info` - Collection details

### 6. Embedding Configuration (Educational)

ChromaDB example shows how to configure embeddings:

```bash
# In .env
CHROMA_EMBEDDING_FUNCTION=default  # or openai, cohere, jina

# Default: MiniLM-L6-v2 (free, local, 384 dims)
# OpenAI: text-embedding-ada-002 (paid, 1536 dims)
```

## 🔧 Technologies

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Language** | TypeScript | Type-safe development |
| **AI Framework** | LangChain | Agent orchestration |
| **AI Model** | Google Gemini | Text generation |
| **Search (Text)** | Elasticsearch 8.11 | Full-text search |
| **Search (Vector)** | ChromaDB 0.4.24 | Semantic search |
| **Protocol** | MCP (Model Context Protocol) | Tool standardization |
| **MCP Integration** | @langchain/mcp-adapters | Auto tool discovery |
| **MCP SDK** | @modelcontextprotocol/sdk | Server implementation |
| **Runtime** | tsx | TypeScript execution |
| **Environment** | dotenv | Config management |
| **Validation** | Zod | Schema validation |
| **Containers** | Docker Compose | Service orchestration |

## 📦 Key Dependencies

```json
{
  "langchain": "^1.0.0-alpha.9",
  "@langchain/core": "^1.0.0-alpha.7",
  "@langchain/google-genai": "^1.0.0",
  "@langchain/mcp-adapters": "^1.0.0",
  "@elastic/elasticsearch": "^8.11.0",
  "chromadb": "^3.0.17",
  "@modelcontextprotocol/sdk": "^1.20.1",
  "dotenv": "^17.2.3",
  "tsx": "^4.19.2"
}
```

## 🐛 Common Issues & Solutions

### Missing API Key

```bash
# Error: "Please set an API key for Google GenerativeAI"

# Solution: Create .env file
cat > .env << 'EOF'
GOOGLE_API_KEY=your-actual-key
ELASTICSEARCH_URL=http://localhost:9200
CHROMA_URL=http://localhost:8000
EOF
```

### Elasticsearch Won't Start

```bash
# Check if port is in use
lsof -i :9200

# Clean up and restart
yarn elasticsearch:stop
docker system prune -f
yarn elasticsearch:start
```

### ChromaDB API Version Error

```bash
# Error: "The v1 API is deprecated. Please use /v2 apis"

# Solution: The docker-compose.yml pins to compatible version
yarn chroma:stop
yarn chroma:start
```

### MCP Server Not Responding

```bash
# Test HTTP server directly
curl http://localhost:8001/health

# Should return: {"status":"ok","mcp_server":"running"}
```

### chroma-mcp Not Found (for Case 4)

```bash
# Install chroma-mcp Python package
pip3 install chroma-mcp

# Verify installation
python3 -m chroma_mcp --help
```

## 💡 Best Practices

### 1. Environment Management
- ✅ Always use `.env` for API keys
- ✅ Never commit `.env` to git
- ✅ Use `dotenv/config` at import time

### 2. RAG Pattern Selection
- **Simple Q&A?** → Case 1 (direct RAG)
- **Need reasoning?** → Case 2 (agent + tools)
- **Production system?** → Case 3/4 (agent + MCP)
- **Semantic search?** → Case 4 (ChromaDB)

### 3. Search Technology Choice
- **Structured data + filters** → Elasticsearch
- **Semantic similarity** → ChromaDB
- **Complex queries** → Elasticsearch
- **AI-first apps** → ChromaDB

### 4. Debugging
- ✅ Enable debug logging (already done!)
- ✅ Use web consoles (Kibana/chroma:console)
- ✅ Check MCP server health endpoints
- ✅ View Docker logs when needed

### 5. Production Deployment
- ✅ Use MCP for service decoupling
- ✅ Implement proper error handling
- ✅ Add authentication to MCP servers
- ✅ Monitor with proper logging
- ✅ Use environment-specific configs

## 📖 Documentation

### Primary Guides
- **[SETUP.md](SETUP.md)** - Environment setup and API keys
- **[Elasticsearch RAG](src/rag/README.md)** - Elasticsearch integration guide
- **[ChromaDB RAG](src/chroma/README.md)** - ChromaDB integration guide
- **[RAG Examples](test/rag/README.md)** - All examples comparison
- **[Postman Resources](resources/README.md)** - API testing

### External Resources
- [LangChain Documentation](https://js.langchain.com/)
- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [Elasticsearch Guide](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)
- [ChromaDB Docs](https://docs.trychroma.com/)
- [Google AI Studio](https://makersuite.google.com/app/apikey) - Get API key

## 🔒 Security

- ✅ `.env` in `.gitignore` - never committed
- ✅ No API keys in source code
- ✅ `dotenv` auto-loads from `.env`
- ✅ Docker services isolated in networks
- ⚠️ Add authentication for production MCP servers
- ⚠️ Use HTTPS in production
- ⚠️ Rotate API keys regularly

## 🚀 What's Automated

When you run `yarn elasticsearch:start` or `yarn chroma:start`:

1. **Service starts** and waits until healthy
2. **Data initialization** runs automatically
3. **Sample data loaded** (products from `data/products.json`)
4. **Ready to use** - no manual steps!

All initialization is in Docker Compose - zero configuration needed! 🎉

## 📝 License

MIT

## 🤝 Contributing

This is a tutorial project for learning. Feel free to:
- Fork and experiment
- Submit improvements
- Share with others
- Use in your projects

---

## 🎉 Ready to Start?

### Quickest Path (Elasticsearch):
```bash
echo "GOOGLE_API_KEY=your-key" > .env
yarn elasticsearch:start
yarn rag:case1  # Watch the magic happen! ✨
```

### Alternative Path (ChromaDB):
```bash
echo "GOOGLE_API_KEY=your-key" > .env
yarn chroma:start
  # Explore vector search! 🚀
```

### Explore & Learn:
```bash
# Elasticsearch console
open http://localhost:5601/app/dev_tools#/console

# ChromaDB console
yarn chroma:console
```

**Happy learning!** 🎓
