'use strict';

var util = require('sails-hook-adminpanel/lib/adminUtil');
var views = require('sails-hook-adminpanel/helper/viewsHelper');
var fieldsHelper = require('sails-hook-adminpanel/helper/fieldsHelper');
var resViewDecorator = require('../lib/resViewDecorator');

var async = require('async');

module.exports = function (req, res) {
  resViewDecorator();
  //Check id
  if (!req.param('id')) {
    return res.notFound();
  }
  var config = sails.config.localization;
  const config_locales_callback = config.locales;
  const default_locale_callback = config.default_locale;
  let instance_name = util.findInstanceName(req);
  var locale;
  let name = util.findInstanceConfig(req, instance_name).model.toLowerCase();
  if (typeof config.default_locale === "function" && typeof config.locales === "function") {
    default_locale_callback(name, default_locale => {
      config_locales_callback(name, all_locales => {
        view(req, res, default_locale, all_locales);
      });
    });
  } else {
    locale = req.session.locale;
    view(req, res, config.default_locale, config.locales, locale);
  }

};

function view(req,res,default_locale, all_locales, locale) {
  var instance = util.findInstanceObject(req);
  if (!instance.config.view) {
    return res.redirect(instance.uri);
  }
  if (!instance.model) {
    return res.notFound();
  }
  var fields = fieldsHelper.getFields(req, instance, 'view');

  if (!sails.adminpanel.havePermission(req, instance.config, __filename))
    return res.redirect('/admin/userap/login');

  var query = instance.model
    .findOne(req.param('id'))
    .populateAll();

  //fieldsHelper.getFieldsToPopulate(fields).forEach(function(val) {
  //    query.populate(val);
  //});
  query.exec(function (err, record) {
    if (err) {
      req._sails.log.error('Admin edit error: ');
      req._sails.log.error(err);
      return res.serverError();
    }
    if (record === undefined) {
      res.redirect(req.url);
    }
    res.viewAdmin({
      instance: instance,
      record: record,
      fields: fields,
      all_locales: all_locales,
      default_locale: default_locale,
      current_url: req.url,
      current_locale: locale
    });
  });
}
