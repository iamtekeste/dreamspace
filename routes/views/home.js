var keystone = require('keystone');
//might import npm moment for the calendar (stretch goals)
var moment = require('moment');

module.exports = function(req, res) {

var view = new keystone.View(req, res);
var locals = res.locals;

var today = moment().startOf('day');
var tomorrow = moment(today).add(1, 'days');

//we want to be able to fetch, ALSO COMMENT THIS OUT IF THERES AN ERROR, find it out tomorrow
//and see the alert bar
view.query('alert', keystone.list('Alert').model.findOne({
  createdDate: {
//moment methods get dates more easily and precisely
//mongo must find the min and max
      $gte: today.toDate(),
      $lt: tomorrow.toDate()
  }
}));

view.render('home');

};
