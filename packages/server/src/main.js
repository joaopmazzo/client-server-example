import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';

import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8000;
const HOSTNAME = process.env.HOSTNAME || '127.0.0.1';

async function startServer() {
  const server = new ApolloServer({
    plugins: [
      ApolloServerPluginLandingPageGraphQLPlayground(),
    ],
    typeDefs,
    resolvers,
  });

  await server.start();

  server.applyMiddleware({
    app,
    cors: {
      // origin: [
      //   `http://localhost:3000`,
      //   `http://${HOSTNAME}:${PORT}`
      // ]
      origin: '*',
    },
    bodyParserConfig: true,
  });
};

startServer(app);
app.listen(PORT, HOSTNAME, () => {
  console.log(`Server is listening at http://${HOSTNAME}:${PORT}.`);
})
