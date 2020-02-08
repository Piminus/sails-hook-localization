let models = sails.models;
const config = sails.config.localization;
const config_locales_callback = config.locales;
const default_locale_callback = config.default_locale;
const config_models = sails.config.localization.models;

module.exports = function prepareToGenerate() {
  if (typeof config_locales_callback === "function" && typeof default_locale_callback === "function") {
      generateDecorator();
  }
  else {
    for (let [i, model] of Object.entries(models)) {

      generate(model, i, default_locale_callback, config_locales_callback);
    }
  }
};

function generate(model, model_name, default_locale, locales) {
  let all_locales = [...locales];
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
          let attributes = {...values};
          let parentId = attributes.id;
          delete attributes.createdAt;
          delete attributes.updatedAt;
          delete attributes.id;
          for (let locale of all_locales) {
            attributes.locale = locale;
            attributes.parent = parentId;
            await this.create(attributes);
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

function generateDecorator() {
  for (let [i, model] of Object.entries(models)) {
    default_locale_callback(i, default_locale => {
      config_locales_callback(i, all_locales => {
        generate(model, i, default_locale, all_locales);
      });
    });
  }
}
