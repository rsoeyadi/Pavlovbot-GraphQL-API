import 'dotenv/config'
import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from "@apollo/server/standalone"
import { readFileSync } from "fs";
import path from "path";
import { gql } from "graphql-tag";

// readFileSync is just a Node way of reading the contents of the specified file
// I am passing it into the gql tag function so it's understood by Apollo
const typeDefs = gql(
  readFileSync(path.resolve(__dirname, "./schema.graphql"), {
    encoding: "utf-8",
  })
);

// start the server w the schema
async function startApolloServer(): Promise<void> {
  const server = new ApolloServer({ typeDefs });
  const { url } = await startStandaloneServer(server);
  console.log(`
    The server is up running at ${url}
  `)
}

startApolloServer()
