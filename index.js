'use strict';

module.exports = function (sails) {
  sails.log("!!!");
  return {
    /**
     * Creating default settings for hook
     */
    initialize: require('./lib/initialize')(sails)
  };
};
