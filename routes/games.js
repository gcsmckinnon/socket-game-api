const { show } = require('../controllers/games');

module.exports = (router, expressWS) => {
  router.ws('/games/:secret_token', async (ws, req) => await show(ws, req, expressWS));

  return router;
};