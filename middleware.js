import processRequest from 'graphql-upload/processRequest.js';

const augmentServer = (app) => {
  // Handle all requests that have the `Content-Type` header set as multipart
  app.addContentTypeParser('multipart', (req, payload, done) => {
    req.isMultipart = true;
    done();
  });

  // Format the request body to follow graphql-upload's
  app.addHook('preValidation', async function (req, res) {
    if (!req.isMultipart) {
      return;
    }

    req.body = await processRequest(req.raw, res.raw);
  });
};

export default augmentServer;
