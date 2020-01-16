let models = sails.models;
const config = sails.config.localization;
const config_locales_callback = config.locales;
const default_locale_callback = config.default_locale;
const config_models = sails.config.localization.models;

module.exports = function prepareToGenerate() {
  for (let [i,model] of Object.entries(models)) {
    default_locale_callback(i, default_locale => {
      config_locales_callback(i, all_locales => {
        generate(model, i, default_locale, all_locales);
      });
    });
  }
};

function generate(model, model_name, default_locale, all_locales) {
  let index = all_locales.indexOf(default_locale);
  all_locales.splice(index, index + 1);
  if (config_models.includes(model_name) && !model.attributes.locale && !model.attributes.parent) {

    model.attributes.locale = {
      type: 'string',
      defaultsTo: default_locale
    };
    model.attributes.parent = {
      model: model_name
    };
    model.attributes.childs = {
      collection: model_name,
      via: 'parent'
    };
    model.afterCreate = ((previousAfterCreate) =>
      async function (values, cb) {
        if (!values.parent) {
          for (let locale of all_locales) {
            await this.create({locale: locale, parent: values.id});
          }
        }
        if (typeof previousAfterCreate === 'function') {
          previousAfterCreate(values, cb);
        } else {
          cb();
        }
      })(model.afterCreate);
  }
}
