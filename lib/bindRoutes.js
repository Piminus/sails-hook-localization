'use strict';

var path = require('path');
var bindResView = require('../../node_modules/sails-hook-adminpanel/lib/bindResView');
var _dashboard = require('../actions/dashboard');
var _list = require('../actions/list');
var _edit = require('../actions/edit');
var _view = require('../actions/view');
var _change_lang = require('../actions/changeLang');
var _change_instance = require('../actions/changeInstance');

module.exports = function bindRoutes() {

  //Create a base instance route
  var baseRoute = sails.config.adminpanel.routePrefix;

  sails.router.unbind({
    path: baseRoute,
    method: 'get'
  });

  sails.router.unbind({
    path: baseRoute + '/:instance',
    method: 'get'
  });

  sails.router.unbind({
    path: baseRoute + '/:instance/edit/:id',
    method: 'get'
  });

  sails.router.unbind({
    path: baseRoute + '/:instance/view/:id',
    method: 'get'
  });

  bindResView(sails);
  sails.router.bind(baseRoute, _dashboard);
  // Deploy dashboard
  sails.router.bind(baseRoute + '/:instance', _list);
  // List instances
  sails.router.bind(baseRoute + '/change/lang', _change_lang);
  // Set locale
  sails.router.bind(baseRoute + '/:instance/edit/:id', _edit);
  // Rebind edit
  sails.router.bind(baseRoute + '/change/instance', _change_instance);
  // Change instance depend on locale
  sails.router.bind(baseRoute + '/:instance/view/:id', _view);
};
