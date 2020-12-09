const passport = require('passport');
const { authenticate, destroy } = require('../controllers/sessions');

module.exports = router => {
  router.post('/authenticate', authenticate);
  router.post('/logout', passport.authenticate('jwt', { session: false }), destroy);
  return router;
};