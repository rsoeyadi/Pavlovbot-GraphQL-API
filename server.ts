import 'dotenv/config'
import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from "@apollo/server/standalone"
import { readFileSync } from "fs";
import path from "path";
import { gql } from "graphql-tag";
import pg from 'pg';
import graphqlFields from 'graphql-fields'; // so this is what allows us to retrieve the selection fields from the info arg

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

export type Prompt = {
  id: number,
  prompt_text: string,
  created_at: string,
  is_active: boolean,
  likes_counter: number,
}

const resolvers = {
  Query: {
    getMostRecentPrompt: async (root: any, args: any, context: any, info: any): Promise<Prompt> => {
      try { // pool deals with connecting/releasing implicitly
        const selectionFields = Object.keys(graphqlFields(info))
        const formattedSelectionFields = selectionFields.join(',')
        const result = await pool.query(`SELECT ${formattedSelectionFields} FROM prompts ORDER BY created_at DESC LIMIT 1;`)
        return result.rows[0];
      } catch (err) {
        throw err;
      }
    },
    getAllPrompts: async (parents: any, args: any, context: any, info: any): Promise<Prompt[]> => {
      try {
        const selectionFields = Object.keys(graphqlFields(info)); // retrieve the selection fields from the client's query
        const formattedSelectionFields = selectionFields.join(',');
        const result = await pool.query<Prompt>(`SELECT ${formattedSelectionFields} from prompts`);
        return result.rows
      } catch {
        return []
      }
    },
    getPrompt: async (root: any, args: any, context: any, info: any): Promise<Prompt> => {
      try {
        const selectionFields = Object.keys(graphqlFields(info))
        const formattedSelectionFields = selectionFields.join(',')
        const result = await pool.query(`SELECT ${formattedSelectionFields} FROM prompts WHERE id = $1`, [args.id])
        return result.rows[0];
      } catch (err) {
        throw err;
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
