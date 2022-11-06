import { gql } from 'apollo-server-fastify';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { readFileSync } from 'fs';

import { formattableDateDirective } from '../directives/index.js';
import resolvers from './fileUpload.js';
import { __dirname } from '../utils/index.js';

const {
  formattableDateDirectiveTypeDefs,
  formattableDateDirectiveTransformer,
} = formattableDateDirective('date');

const typeDefs = gql(`
  scalar Upload

  ${formattableDateDirectiveTypeDefs},
  ${readFileSync(`${__dirname}/../schema/fileUpload.graphql`, {
    encoding: 'utf-8',
  })}
`);

let schema = buildSubgraphSchema({ typeDefs, resolvers });
schema = formattableDateDirectiveTransformer(schema);

export default schema;
