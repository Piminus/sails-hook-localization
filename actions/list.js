'use strict';

var _ = require('lodash');
var util = require('sails-hook-adminpanel/lib/adminUtil');
var requestProcessor = require('sails-hook-adminpanel/lib/requestProcessor');
var views = require('sails-hook-adminpanel/helper/viewsHelper');
var fieldsHelper = require('sails-hook-adminpanel/helper/fieldsHelper');
var sortingHelper = require('sails-hook-adminpanel/helper/sortingHelper');
var resViewDecorator = require('../lib/resViewDecorator');

var async = require('async');

module.exports = function (req, res) {
  resViewDecorator();
  var config = sails.config.localization;
  let config_locales_callback = config.locales;
  let default_locale_callback = config.default_locale;
  let switcher_flag = true;

  let instance_name = util.findInstanceName(req);
  let name = util.findInstanceConfig(req, instance_name).model.toLowerCase();
  if (typeof config.default_locale === "function" && typeof config.locales === "function") {
    switcher_flag = false;
    default_locale_callback(name, default_locale => {
      config_locales_callback(name, async all_locales => {
        listing(req,res,default_locale, all_locales, switcher_flag);
      });
    });
  }
  else {
    listing(req,res,default_locale_callback, config_locales_callback, switcher_flag);
  }
};

function listing(req,res,default_locale, all_locales, switcher_flag) {
  var locale;
  req.session.locale = "";
  var instance = util.findInstanceObject(req);
  if (!instance.model) {
    return res.notFound();
  }
  //Limit check
  if (!_.isNumber(instance.config.list.limit)) {
    req._sails.log.error('Admin list error: limit option should be number. Reseived: ', instance.config.list.limit);
    instance.config.list.limit = 15;
  }
  //Check page
  var page = req.param('page') || 1;
  if (_.isFinite(page)) {
    page = parseInt(page) || 1;
  }

  // if (!sails.adminpanel.havePermission(req, instance.config, __filename))
  //   return res.redirect('/admin/userap/login');

  var total = 0;
  var records = [];
  var fields = fieldsHelper.getFields(req, instance, 'list');
  var criteria;
  if (switcher_flag) {
    criteria = {locale: req.session.locale};
  }
  else {
    criteria = {locale: default_locale};
  }

  //Processing sorting
  sortingHelper.processRequest(req);

  async.parallel([
    //Fetch total records for page
    function getTotalRecords(done) {
      instance.model.count(criteria)
        .exec(function (err, count) {
          if (err) return done(err);
          total = count;
          done();
        });
    },
    // Loading list of records for page
    function loadRecords(done) {
      var query = instance.model.find(criteria);
      if (req.sort) {
        query.sort(req.sort.key + ' ' + req.sort.order);
      }
      fieldsHelper.getFieldsToPopulate(fields).forEach(function (val) {
        query.populate(val);
      });
      query.paginate({page: page, limit: instance.config.list.limit || 15})
        .exec(function (err, list) {
          if (err) return done(err);
          records = list;
          done();
          // if (list.length === 0 && switcher_flag) {
          //   if (criteria) {
          //     criteria = undefined;
          //     loadRecords(done);
          //   }
          //   else {
          //     done();
          //   }
          // }
          // else {
          //   records = list;
          //   done();
          // }

        });
    }
  ], function (err, result) {
    if (err) {
      req._sails.log.error('Admin list error: ');
      req._sails.log.error(err);
      return res.serverError(err);
    }

    res.viewAdmin({
      requestProcessor: requestProcessor,
      sortingHelper: sortingHelper,
      instance: instance,
      total: total,
      list: records,
      fields: fields,
      config: sails.adminpanel,
      all_locales: all_locales,
      default_locale: default_locale,
      current_url: req.url,
      current_locale: locale,
      switcher_flag: switcher_flag
    });
  });
}
