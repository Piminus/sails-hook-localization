'use strict';

module.exports = function toafterhooksloaded(sails) {

  return function afterhooksloaded() {
    //binding all routes.
    require('../lib/bindRoutes')(sails);
  }
};
