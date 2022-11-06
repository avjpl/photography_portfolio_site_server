import { ValidationError } from 'apollo-server-core';
import GraphqlUpload from 'graphql-upload/GraphQLUpload.js';

import { minioUpload, minioDelete } from '../utils/index.js';

const resolvers = {
  Upload: GraphqlUpload,
  Query: {
    getFiles: async (_, __, { dataSources: { prisma } }) => {
      return await prisma.image.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          filename: true,
          variants: {
            where: {
              width: 600
            }
          },
          exif: true,
        },
      });
    },
    getFilesBySize: async (_, { width }, { dataSources: { prisma } }) => {
      return await prisma.image.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          filename: true,
          variants: {
            where: {
              width,
            }
          },
          exif: true,
        },
      });
    },
    getImageByCategory: async (_, { category, width }, { dataSources: { prisma } }) => {
      return (await prisma.image.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          filename: true,
          variants: {
            where: {
              category: {
                not: null,
                equals: category.toUpperCase(),
              },
              width
            }
          },
          exif: true,
        },
      })).filter((i) => i.variants.length);
    },
  },
  Mutation: {
    setCategory: async (_, { category, id }, { dataSources: { prisma } }) => {
      const { count } = await prisma.variant.updateMany({
        where: {
          imageId: id
        },
        data: {
          category: category.toUpperCase(),
        },
      });

      // return await prisma.image.findMany({
      //   orderBy: {
      //     createdAt: 'desc',
      //   },
      //   select: {
      //     id: true,
      //     filename: true,
      //     variants: true,
      //     exif: true,
      //   },
      // });

      return { count };
    },
    deleteFile: async (_, { id, filename }, { dataSources: { prisma } }) => {
      try {
        const dbResult = await prisma.image.delete({
          where: { id }
        });
        const minioResult = dbResult && (await minioDelete({ filename: filename }));
        return {
          success: true,
        };
      } catch (e) {
        console.error(e);
        console.error(e?.message);
      }
    },
    uploadFile: async (_, { files }, { dataSources: { prisma } }) => {
      const settled = await Promise.allSettled(files);
      const fulfilled = settled
        .filter((file) => file.status === 'fulfilled')
        .map(async ({ value }) => {
          const { filename, createReadStream } = value;
          const stream = createReadStream();
          const image = await minioUpload({ filename, stream });

          try {
            await prisma.image.create({
              data: {
                filename: image.filename,
                exif: image.exif,
                variants: {
                  create: image.variants
                },
              }
            })
          } catch (e) {
            return new ValidationError(e.message);
          }

          return {
            src: image.variants[0].src,
            filename: image.filename,
            width: image.variants[0].width,
          }
        });

      return await Promise.all(fulfilled);
    },
  },
};

export default resolvers;
