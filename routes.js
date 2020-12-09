module.exports = (router, expressWS) => {
  require('./routes/users')(router);
  require('./routes/sessions')(router);
  require('./routes/games')(router, expressWS);

  return router;
};