var keystone = require('keystone');
var async = require('async');

//not using module = module.exports because
//I don't have the C++ BSON extension
//using only pure JS
module.exports = function(req, res) {

  if (req.user) {
    return res.redirect('/gallery');
  }

  var view = new keystone.View(req, res);
  var locals = res.locals;

  locals.section = 'join'; //?
  locals.form = req.body;

  //eventually, you can only see posts that YOU made

  //now the "join" action
	view.on('post', { action: 'join' }, function(next) {

		async.series([

			function(cb) {

				if (!req.body.join_name || !req.body.join_email || !req.body.join_password) {
					req.flash('error', 'Please enter a name, email and password.');
					return cb(true);
				}

				if (req.body.join_password != req.body.join_passwordConfirm) {
					req.flash('error', 'Passwords must match.');
					return cb(true);
				}

				return cb();

			},

			function(cb) {

				keystone.list('User').model.findOne({ email: req.body.join_email }, function(err, user) {

					if (err || user) {
						req.flash('error', 'User already exists with that email address.');
						return cb(true);
					}

					return cb();

				});

			},

			function(cb) {

				var splitName = req.body.join_name.split(' ');
				var firstName = splitName[0];
				var lastName = splitName[1];

				var userData = {
					name: {
						first: firstName,
						last: lastName
					},
					email: req.body.join_email,
					password: req.body.join_password,

				};

console.log(userData);
        var User = keystone.list('User').model;
				var newUser = new User(userData);


        newUser.save(function(err) {
          console.log("word");
          return cb(err);
				});

			}

		], function(err){

			if (err) return next();

			var onSuccess = function() {
        console.log("Success");
        return res.redirect('/gallery'); //CHECK where to redirect to
			}

			var onFail = function(e) {
				req.flash('error', 'There was a problem signing you in, please try again.');
				return next();
			}

			keystone.session.signin({ email: req.body.join_email, password: req.body.join_password }, req, res, onSuccess, onFail);

		});

	});

  view.render('site/join'); //in templates/views/site

}
