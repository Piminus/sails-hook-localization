module.exports.localization = {
  models: ['blabla', 'testmodel'],
  /*default_locale: function (model, cb) {
    switch (model) {
      case 'blabla':
        cb('en');
        break;
      case 'testmodel':
        cb('ru');
        break;
      default:
        break;
    }
  },
  locales: function (model, cb) {
    switch (model) {
      case 'blabla':
        cb(['en', 'uk']);
        break;
      case 'testmodel':
        cb(['ru', 'ua']);
        break;
      default:
        break;
    }
  }*/
  default_locale: 'ru',
  locales: ['en', 'uk', 'ua']
};
