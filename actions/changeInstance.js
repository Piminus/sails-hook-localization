//TODO: Обработка случая выбора текущей локали

var util = require('sails-hook-adminpanel/lib/adminUtil');

module.exports = async function (req, res) {
  req.session.locale = req.param('locale');
  let url = req.param('current_url');
  let parsed_url = url.split('/');
  let model = parsed_url[parsed_url.length - 3];
  let model_id = parsed_url[parsed_url.length - 1];
  let parent;
  let resultInstance_id;

  // if (req.param('locale') === req.session.locale) {
  //   res.redirect(url);
  // }

  const instance_config = util.findInstanceConfig(req, model);
  let model_name = util.getModel(instance_config.model);
  const instance = await model_name.findOne({id: model_id}).populate('childs');

  if (instance.childs.length === 0) {
    parent = await model_name.findOne({id: instance.parent}).populate('childs');
    if (parent.locale === req.param('locale')) {
      resultInstance_id = parent.id;
    }
    else {
      for (let child of parent.childs) {
        if (child.locale === req.param('locale')) {
          resultInstance_id = child.id;
        }
      }
    }
  }
  else {
    for (let child of instance.childs) {
      if (child.locale === req.param('locale')) {
        resultInstance_id = child.id;
      }
    }
  }
  parsed_url[parsed_url.length - 1] = resultInstance_id;
  url = parsed_url.join('/');
  sails.log(url);
  res.redirect(url);
};
