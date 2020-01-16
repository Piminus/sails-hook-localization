module.exports = function (req, res) {
  req.session.locale = req.param('locale');
  res.redirect(req.param('current_url'));
};
