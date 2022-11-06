import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';
import { defaultFieldResolver, GraphQLString } from 'graphql';
import { format, isValid } from 'date-fns';

const formattableDateDirective = (directiveName) => {
  return {
    formattableDateDirectiveTypeDefs: `directive @${directiveName}(
        defaultFormat: String = "do MMMM yyyy"
      ) on FIELD_DEFINITION
    `,
    formattableDateDirectiveTransformer: (schema) =>
      mapSchema(schema, {
        [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
          const dateDirective = getDirective(
            schema,
            fieldConfig,
            directiveName,
          )?.[0];

          if (dateDirective) {
            const { resolve = defaultFieldResolver } = fieldConfig;
            const { defaultFormat } = dateDirective;

            if (!fieldConfig.args) {
              throw new Error('Unexpected Error. args should be defined.');
            }

            fieldConfig.args['format'] = {
              type: GraphQLString,
            };

            fieldConfig.type = GraphQLString;
            fieldConfig.resolve = async (
              source,
              { format, ...args },
              context,
              info,
            ) => {
              const newFormat = format || defaultFormat;
              const date = await resolve(source, args, context, info);

              const result = isValid(new Date(date));

              return result ? format(new Date(date), newFormat) : 'n/a';
            };

            return fieldConfig;
          }
        },
      }),
  };
};

export default formattableDateDirective;
