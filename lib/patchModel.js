var util = require('sails-hook-adminpanel/lib/adminUtil');
let models = sails.models;
const config = sails.config.localization;
const config_locales_callback = config.locales;
const default_locale_callback = config.default_locale;
const config_models = sails.config.localization.models;


async function prepareToPatch() {
  for (let [name,model] of Object.entries(models)) {
    default_locale_callback(name, default_locale => {
      config_locales_callback(name, async all_locales => {
        await patch(model, name, default_locale, all_locales);
      });
    });
  }
}

async function patch(model, name, default_locale, all_locales) {
  let index = all_locales.indexOf(default_locale);
  all_locales.splice(index, index + 1);
  if (config_models.includes(name)) {
    let all_instances = await model.find().populate('childs');
    for (let instance of all_instances) {
      if (instance.parent === undefined && instance.childs.length === 0) {
        instance.locale = default_locale;
        for (let locale of all_locales) {
          await model.create({locale: locale, parent: instance.id});
        }
        instance.save();
      }
    }
  }
}

module.exports = prepareToPatch;
