import { ApolloServer } from 'apollo-server-fastify';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import fastify from 'fastify';

import { fastifyAppClosePlugin } from './plugins/index.js';
import middleware from './middleware.js';

import schema from './typedefs/schema.js';
import { prisma } from './services/db.js';

const startApolloServer = async ({ schema }) => {
  const app = fastify({ logger: true });

  try {
    middleware(app);

    const server = new ApolloServer({
      schema,
      dataSources: () => {
        return { prisma };
      },
      context: async () => {
        // const {} = process.env;

        return {};
      },
      plugins: [
        fastifyAppClosePlugin(app),
        ApolloServerPluginDrainHttpServer({ httpServer: app.server }),
      ],
      debug: false,
      cors: {
        origin: ['*'],
      },
    });

    await server.start();
    app.register(server.createHandler({ path: '/api' }));
    await app.listen(5556); // change to 9200
    console.info(
      `🚀 Server ready at http://localhost:5556${server.graphqlPath}`,
    );
  } catch (e) {
    console.error(e);
  }
};

startApolloServer({ schema });
