'use strict';

module.exports = function (sails) {
  sails.log("!!!");
  let a = 5;

  return {

    /**
     * Creating default settings for hook
     */
    initialize: require('./lib/initialize')(sails)
  };
};
