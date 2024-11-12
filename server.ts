import 'dotenv/config'
import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from "@apollo/server/standalone"
import { readFileSync } from "fs";
import path from "path";
import { gql } from "graphql-tag";
import pg from 'pg';

// create a connection pool for users
const { Pool } = pg;
const config = {
  connectionString: process.env.DATABASE_STRING,
}

const pool = new Pool(config);

// readFileSync is just a Node way of reading the contents of the specified file
// I am passing it into the gql tag function so it's understood by Apollo
const typeDefs = gql(
  readFileSync(path.resolve(__dirname, "./schema.graphql"), {
    encoding: "utf-8",
  })
);

const resolvers = {
  Query: {
    getMostRecentPrompt: async (): Promise<string> => {
      try { // pool deals with connecting/releasing implicitly
        const result = await pool.query('SELECT * from prompts')
        return result.rows[0].prompt_text;
      } catch {
        return "Failed to query database"
      }
    }
  }
}
// start the server w the schema
async function startApolloServer(): Promise<void> {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
  });
  console.log(`
    The server is up running at ${url}
  `)
}


startApolloServer()
