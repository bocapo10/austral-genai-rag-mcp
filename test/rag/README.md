TRABAJO FINAL GENAI AUSTRAL - GUIA DE USO

TIENDA DE COMPRAS DE ARTICULOS ELECTRONICOS

Nota: Se ha tomado como base de este proyecto el codigo compartido en clase por Paulo Veiga. Hemos extendido la funcionalidad para generar una experiencia conversacional con un asistente que ayuda al usuario tanto a buscar productos como asi tambien proveer detalles tecnicos y gestionar el posterior proceso de checkout y envio del producto. Finalmente la idea es desplegar la solucion en un ambiente productivo (Railway).


CASO 1

Objetivo: Desarrollar un asistente para guiar a los usuarios en la seleccion de productos y el posterior proceso de checkout (efectuar pago y generar el envio del producto) de manera conversacional. (Trabajo Practico N2)

Esquema:  Usuario -> LLM -> Tool (busqueda de productos en ElasticSearch) -> Finalizacion de Compra y Envio

Tecnologias principales: Se utilizo un LLM de OpenAI como motor de IA del agente y se le asocio una Tool para realizar busquedas de productos en una base de datos ElasticSearch corriendo en un contenedor docker.

Interfase Grafica: Linea de comandos

Observaciones: Este ejemplo se desarollo para entender el funcionamiento del LLM. Unicamente se uso un systemp prompt para establecer el comportamiento esperado. El Agente se encarga de todo el proceso desde busqueda de productos hasta el envio final. 

Archivo: shop-agent-tools.ts

Uso

script para ejecutarlo 
yarn rag:tools



CASO 2

Objetivo: Desarrollar un sistema multiagentico para guiar a los usuarios en la seleccion de productos y el posterior proceso de checkout (efectuar pago y generar el envio del producto) de manera conversacional. Este sistema consiste en 2 agentes, a saber, el agente para asistir en la busqueda y seleccion de productos y el agente para realizar el proceso de checkout (pago y envio del producto).

Esquema:  Usuario -> Agente Compras -> Definicion el Carrito de compras -> Handoff a Checkout
          Usuario -> Agente Checkout -> Realizacion de Pago y envio del producto


Tecnologias principales: Se utilizo un LLM de OpenAI como motor de IA de ambos agentes y se se puso a disposicion un MCP Server para que los agentes autodecten todas las herramientas a disposicion. Base de datos ChromaDB coriendo un contenedor docker. MCP Server corriendo en un servidor desarrollado en Express() en un container docker

Interfase Grafica: Linea de comandos

Observaciones: En este caso, se realizo una evolucion del caso 1 agregando un servidor MCP con una gama de herramientas que son utilizados por ambos agentes, entre ellas, busqueda de productos; agregar, retirar items del carrito o visualizar el estado actual del carrito. 

Archivo: shop-multiagent-mcp-cli.ts

Uso

Iniciar Servicio ChromaDB y MCP server
yarn chroma:start

Ejecutar script
yarn rag:cli



CASO 3

Objetivo: Replicar misma funcionalidad e implementacion del caso 2 pero exponiendo la solucion a traves de un servidor API desarrollado en express para posterior despliegue en produccion. (Plataforma Railway)


Esquema:  Usuario -> Agente Compras -> Definicion el Carrito de compras -> Handoff a Checkout
          Usuario -> Agente Checkout -> Realizacion de Pago y envio del producto


Tecnologias principales: Se utilizo un LLM de OpenAI como motor de IA de ambos agentes y se se puso a disposicion un MCP Server para que los agentes autodecten todas las herramientas a disposicion. Base de datos ChromaDB coriendo un contenedor docker. MCP Server corriendo en un servidor desarrollado en Express() en un container docker. Servidor API para permitir consumo de la aplicacion a traves de un servidor API desplegado en Railway.

Interfase Grafica: Consumo a traves de Servidor API

Observaciones: Al momento de entregar el trabajo final, no fue posible el despliegue en produccion (railway) ya que aun estamos intentando realizar la transpilacion de Typescript a Javascript. Railway, hasta donde pudimos leer la documentacion, precisa de un archivo de entrada en Javascript (index.js). Si bien el archivo corre perfectamente en Typescript usando el comando tsx, al transpilar a Javascript arroja aproximadamente 60 errores por un problema de incompatibilidad entre modulos ES y CommonJS. Aun continuamos buscando posibles soluciones. Por otro lado, para desplegar los servicios de la base de datos, el servidor MCPy el servicio para hacer la carga inicial de los datos, es preciso crear un docker-compose.yml por cada uno de ellos. Hemos utlizado para realizar este trabajo final el repositorio compartido por Paulo en clase como base y en dicho proyecto los 3 servicios estan definidos en un mismo docker-compose.yml. Continuaremos trabajando para completar el despliegue en produccion. 


Archivo: shop-multiagent-mcp-server.ts

Uso

Iniciar Servicio ChromaDB y MCP server
yarn chroma:start

Ejecutar script
yarn rag:server






