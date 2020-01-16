'use strict';

var _ = require('lodash');
var fs = require('fs');

module.exports = function ToInitialize(sails) {

  /**
   * List of hooks that required for adminpanel to work
   */
  var requiredHooks = [
    'adminpanel'
  ];

  return function initialize(cb) {

    // Set up listener to bind shadow routes when the time is right.
    //
    // Always wait until after router has bound static routes.
    // If policies hook is enabled, also wait until policies are bound.
    // If orm hook is enabled, also wait until models are known.
    // If controllers hook is enabled, also wait until controllers are known.
    var eventsToWaitFor = [];
    eventsToWaitFor.push('router:after');
    try {
      /**
       * Check hooks availability
       */
      _.forEach(requiredHooks, function (hook) {
        if (!sails.hooks[hook]) {
          throw new Error('Cannot use `adminpanel` hook without the `' + hook + '` hook.');
        }
        eventsToWaitFor.push('hook:' + hook + ':loaded');
      });
    } catch(err) {
      if (err) {
        return cb(err);
      }
    }

    require('./generateLocales')();
    sails.after('hook:orm:loaded', require('./patchModel'));
    sails.after(eventsToWaitFor, require('./afterHooksLoaded')(sails));
    cb();
    // // Bind assets
    // require('./bindAssets')(sails, function(err, result) {
    //   if (err) {
    //     sails.log.error(err);
    //     return cb(err);
    //   }
    //   cb();
    // });
  }
};
