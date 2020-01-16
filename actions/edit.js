'use strict';

var util = require('sails-hook-adminpanel/lib/adminUtil');
var request = require('sails-hook-adminpanel/lib/requestProcessor');
var views = require('sails-hook-adminpanel/helper/viewsHelper');
var fieldsHelper = require('sails-hook-adminpanel/helper/fieldsHelper');
var resViewDecorator = require('../lib/resViewDecorator');

var async = require('async');
var _ = require('lodash');
var path = require('path');

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
  let name = util.findInstanceConfig(req, instance_name).model.toLowerCase();
  default_locale_callback(name, default_locale => {
    config_locales_callback(name, async all_locales => {
      var instance = util.findInstanceObject(req);
      if (!instance.model) {
        return res.notFound();
      }

      if (!instance.config.edit) {
        return res.redirect(instance.uri);
      }

      if (!sails.adminpanel.havePermission(req, instance.config, __filename))
        return res.redirect('/admin/userap/login');

      var locale = req.session.locale;

      instance.model.findOne(req.param('id'))
        .populateAll()
        .exec(function (err, record) {
          if (err) {
            req._sails.log.error('Admin edit error: ');
            req._sails.log.error(err);
            return res.serverError();
          }
          var fields = fieldsHelper.getFields(req, instance, 'edit');
          var reloadNeeded = false;
          async.series([
            function loadAssociations(done) {
              fieldsHelper.loadAssociations(fields, function (err, result) {
                fields = result;
                done();
              });
            },

            function checkPost(done) {
              if (req.method.toUpperCase() !== 'POST') {
                return done();
              }
              var reqData = request.processRequest(req, fields);
              // _.merge(record, reqData); // merging values from request to record
              var params = {};
              params[req._sails.config.adminpanel.identifierField] = req.param('id');
              instance.model.update(params, reqData).exec(function (err, newRecord) {
                if (err) {
                  req._sails.log.error(err);
                  req.flash('adminError', err.details || 'Something went wrong...');
                  return done(err);
                }
                req.flash('adminSuccess', 'Your record was updated !');
                reloadNeeded = true;
                return done();
              });
            },

            function reloadIfNeeded(done) {
              if (!reloadNeeded) {
                return done();
              }
              instance.model.findOne(req.param('id'))
                .populateAll()
                .exec(function (err, reloadedRecord) {
                  if (err) {
                    req._sails.log.error('Admin edit error: ');
                    req._sails.log.error(err);
                    return res.serverError();
                  }
                  record = reloadedRecord;
                  return done();
                });
            }
          ], function (err) {
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
        });
    });
  });


};
