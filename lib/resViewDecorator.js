var viewsHelper = require('sails-hook-adminpanel/helper/viewsHelper');
var path = require('path');

module.exports = function () {
  viewsHelper.BASE_VIEWS_PATH = path.join(__dirname, '../views/');
  sails.config.adminpanel.pathToViews = path.join(__dirname, '../views/jade')
};
