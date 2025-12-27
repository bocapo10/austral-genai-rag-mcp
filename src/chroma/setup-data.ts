import 'dotenv/config';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { ChromaClient } from 'chromadb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load shared product data
const productsPath = join(__dirname, '../../data/products.json');
const salesPath = join(__dirname, '../../data/sales.json');
const products = JSON.parse(readFileSync(productsPath, 'utf-8'));
var sales = JSON.parse(readFileSync(salesPath, 'utf-8'));
sales.length = 500;
async function setupChromaData() {
    try {
        console.log('🔌 Connecting to ChromaDB...');
        
        const chromaUrl = process.env.CHROMA_URL || 'http://localhost:8000';
        console.log(`   Trying to connect to: ${chromaUrl}`);
        
        // Parse URL to get host and port
        const url = new URL(chromaUrl);
        console.log(`   Host: ${url.hostname}, Port: ${url.port || 8000}`);
        
        // Use ChromaDB client library
        const client = new ChromaClient({
            path: chromaUrl
        });
        
        console.log('✅ Connected to ChromaDB');
        console.log(`📍 ChromaDB URL: ${chromaUrl}`);
        
        // Delete collection if it exists (for clean setup)
        try {
            await client.deleteCollection({ name: 'products' });
            await client.deleteCollection({ name: 'sales' });
            console.log('🗑️  Deleted existing "products" collection');
            console.log('🗑️  Deleted existing "sales" collection');
        } catch (error) {
            // Collection doesn't exist, that's fine
        }
        
        // Create collection using client library
        console.log('📦 Creating "products" collection...');
        console.log('📦 Creating "sales" collection...');
        console.log(`📄 Loading products from: data/products.json`);
        // console.log(`📄 Loading sales from: data/base_datos.csv`);
        // console.log('🔧 Embedding: Using server-side embedding function');
        
        const collection = await client.createCollection({
            name: 'products',
            metadata: {
                description: 'Product catalog for e-commerce'
            }
        });

        // const salesColl = await client.createCollection({
        //     name: 'sales',
        //     metadata: {
        //         description: 'Sales History'
        //     }
        // });
        
        console.log('✅ Created collection: products');
        // console.log('✅ Created collection: sales');
        
        // Prepare data for ChromaDB
        var ids = products.map((p: any) => p.id);
        // const salesIds = sales.map((s: any) => (s.id).toString());
        var documents = products.map((p: any) => 
            `${p.name}. ${p.description}. Category: ${p.category}. Price: $${p.price}${p.stock ? `. Stock: ${p.stock}` : ''}`
        );
        // const salesDocuments = sales.map((s: any) => 
        //     `${s.fecha}. ${s.anio}. ${s.mes}. ${s.sku_id}. ${s.canal}. ${s.temporada_alta}. ${s.flag_promo}. ${s.precio_lista_minorista}. ${s.descuento_canal_pct}. ${s.descuento_promo_pct}. ${s.precio_final}. ${s.margen_unitario}. ${s.margen_unitario_pct}. ${s.unidades_vendidas}. ${s.trx_diarias}. ${s.monto_total}. ${s.margen_total}.`
        // );

        var metadatas = products.map((p: any) => ({
            name: p.name,
            category: p.category,
            price: p.price,
            description: p.description,
            ...(p.stock && { stock: p.stock })
        }));

        // const salesMetadatas = sales.map((s: any) => ({
        //         fecha: s.fecha,
        //         anio: s.anio,
        //         mes: s.mes, 
        //         sku_id: s.sku_id, 
        //         canal: s.canal, 
        //         temporada_alta: s.temporada_alta, 
        //         flag_promo: s.flag_promo,
        //         precio_lista_minorista: s.precio_lista_minorista,
        //         descuento_canal_pct: s.descuento_canal_pct,
        //         descuento_promo_pct: s.descuento_promo_pct,
        //         precio_final: s.precio_final,
        //         margen_unitario: s.margen_unitario,
        //         margen_unitario_pct: s.margen_unitario_pct,
        //         unidades_vendidas: s.unidades_vendidas,
        //         trx_diarias: s.trx_diarias,
        //         monto_total: s.monto_total,
        //         margen_total: s.margen_total

        // }));
        
        // Add documents to collection using client library
        console.log(`📝 Adding ${products.length} products to collection...`);
        await collection.add({
            ids,
            documents,
            metadatas
        });

        // ids = salesIds
        // documents = salesDocuments
        // metadatas = salesMetadatas

        // console.log(`📝 Adding ${sales.length} sales to collection...`);
        // await salesColl.add({
        //     ids,
        //     documents,
        //     metadatas
        // });
        
        console.log('✅ Data initialization complete!');
        console.log('\n📊 Summary:');
        console.log(`   Collection: products`);
        console.log(`   Documents: ${products.length}`);
        console.log('\n🔍 Sample products:');
        products.slice(0, 3).forEach((p: any) => {
            console.log(`   - ${p.name} ($${p.price}) - ${p.category}`);
        });
        
        // Verify by querying using client library
        console.log('\n🧪 Testing query: "laptop"...');
        const results = await collection.query({
            queryTexts: ['laptop'],
            nResults: 2
        });
        
        console.log(`   Found ${results.ids[0].length} results`);
        
        console.log('\n✨ ChromaDB is ready for queries!');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error setting up ChromaDB:', error);
        process.exit(1);
    }
}

setupChromaData();

