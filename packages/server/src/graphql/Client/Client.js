import { gql } from 'apollo-server-express';
import * as uuid from 'uuid';

import createRepository from '../../io/Database/createRepository';
import { ListSortmentEnum } from '../List/List';

const clientRepository = createRepository('client');

export const typeDefs = gql`
  type Client implements Node {
    id: ID!
    name: String!
    email: String!
    disabled: Boolean!
  }

  type ClientList implements List {
    items: [Client!]!
    totalItems: Int!
  }

  input ClientListFilter {
    name: String
    email: String
    disabled: Boolean
  }

  input ClientListOptions {
    take: Int
    skip: Int
    sort: ListSort
    filter: ClientListFilter
  }

  extend type Query {
    client(id: ID!): Client
    clients(options: ClientListOptions): ClientList
  }

  input CreateClientInput {
    name: String!
    email: String!
  }

  input UpdateClientInput {
    id: ID!
    name: String!
    email: String!
  }

  extend type Mutation {
    createClient(input: CreateClientInput!): Client!
    updateClient(input: UpdateClientInput!): Client!
    deleteClient(id: ID!): Client!
    enableClient(id: ID!): Client!
    disableClient(id: ID!): Client!
  }
`;

export const resolvers = {
  Query: {
    client: async (_, { id },) => {
      const clients = await clientRepository.read();
      return clients.find((client) => client.id === id);
    },
    clients: async (_, args) => {
      const { take = 10, skip = 0, sort, filter } = args.options || {};

      /**
       * @type {Array.<*>}
       */
      const clients = await clientRepository.read();

      if (sort) {
        clients.sort((clientA, clientB) => {
          if (!['name', 'email', 'disabled'].includes(sort.sorter))
            throw new Error(`Cannot sort by field "${sort.sorter}".`)

          const fieldA = clientA[sort.sorter];
          const fieldB = clientB[sort.sorter];

          if (typeof fieldA === 'string') {
            if (sort.sortment === ListSortmentEnum.ASC)
              return fieldA.localeCompare(fieldB)
            else
              return fieldB.localeCompare(fieldA)
          }

          if (sort.sortment === ListSortmentEnum.ASC)
            return Number(fieldA) - Number(fieldB);
          else
            return Number(fieldB) - Number(fieldA);
        })
      }

      const filteredClients = clients.filter((client) => {
        if (!filter || Object.keys(filter).length === 0)
          return true;

        return Object.entries(filter).every(([field, value]) => {
          if (client[field] === null || client[field] === undefined)
            return false;
          if (typeof value === 'string') {
            if (value.startsWith('%') && value.endsWith('%'))
              return client[field].includes(value.substring(1, value.length - 2));
            if (value.startsWith('%'))
              return client[field].endsWith(value.substring(1));
            if (value.endsWith('%'))
              return client[field].startsWith(value.substring(0, value.length - 1));
            return client[field] === value;
          }
          return client[field] === value;
        })
      })

      return {
        items: filteredClients.slice(skip, skip + take),
        totalItems: filteredClients.length
      }
    }
  },

  Mutation: {
    createClient: async (_, { input }) => {
      const clients = await clientRepository.read();

      const client = {
        id: uuid.v4(),
        name: input.name,
        email: input.email,
        disabled: false
      }

      await clientRepository.write([...clients, client]);

      return client
    },
    updateClient: async (_, { input }) => {
      const clients = await clientRepository.read();

      const currentClient = clients.find((client) => client.id === input.id);

      if (!currentClient)
        throw new Error(`Client with id "${input.id}" does not exist`)

      const updateClient = {
        ...currentClient,
        name: input.name,
        email: input.email
      }

      const updatedClients = clients.map((client) => {
        if (client.id === updateClient.id)
          return updateClient;
        return client;
      })

      await clientRepository.write(updatedClients);

      return updateClient;
    },
    deleteClient: async (_, { id }) => {
      const clients = await clientRepository.read();

      const client = clients.find((client) => client.id === id);

      if (!client)
        throw new Error(`Cannot delete client with id "${id}"`)

      const updatedListClient = clients.filter((client) => client.id !== id)

      await clientRepository.write(updatedListClient);

      return client;
    },
    enableClient: async (_, { id }) => {
      const clients = await clientRepository.read();

      const currentClient = clients.find((client) => client.id === id);

      if (!currentClient)
        throw new Error(`Client with id "${id}" does not exist`)
      if (!currentClient.disabled)
        throw new Error(`Client with id "${id}" is already enabled`)

      const enableClient = {
        ...currentClient,
        disabled: false
      }

      const updatedClients = clients.map((client) => {
        if (client.id === enableClient.id)
          return enableClient;
        return client;
      })

      await clientRepository.write(updatedClients);

      return enableClient;
    },
    disableClient: async (_, { id }) => {
      const clients = await clientRepository.read();

      const currentClient = clients.find((client) => client.id === id);

      if (!currentClient)
        throw new Error(`Client with id "${id}" does not exist`)
      if (currentClient.disabled)
        throw new Error(`Client with id "${id}" is already disabled`)

      const disableClient = {
        ...currentClient,
        disabled: true
      }

      const updatedClients = clients.map((client) => {
        if (client.id === disableClient.id)
          return disableClient;
        return client;
      })

      await clientRepository.write(updatedClients);

      return disableClient;
    },
  }
}
