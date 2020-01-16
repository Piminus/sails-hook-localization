'use strict';

var util = require('sails-hook-adminpanel/lib/adminUtil');
var views = require('sails-hook-adminpanel/helper/viewsHelper');
var resViewDecorator = require('../lib/resViewDecorator');

module.exports = function(req, res) {
  return res.viewAdmin('dashboard');
};
