//THIS FILE IS ESSENTIALLY 'router.js' FOR A NORMAL MVC APP
var keystone = require('keystone');
var router = require('./router');
var middleware = require('./middleware');
var importRoutes = keystone.importer(__dirname);

// Common Middleware
keystone.pre('routes', middleware.initLocals);
keystone.pre('routes', middleware.lowercaseUrlMiddleware);
keystone.pre('routes', middleware.initErrorHandlers);
keystone.pre('render', middleware.flashMessages);

// Import Route Controllers
// CONTROLLERS
var routes = {
  api: importRoutes('./api'),
	views: importRoutes('./views'),
  auth: importRoutes('./auth')
};

// Setup Route Bindings
module.exports = function(app) {

	// Views
	//app.get('/routeDefine', middleware, routes.api.file.method)
	//Don't forget POST methods:
	//app.post("/login", middleware.requiresSecure, mid.requiresLogout, controllers.Account.login);, AND middleware.requiresUser

  //Website
  app.get('/', routes.views.index);
	app.get('/blog/:category?', routes.views.blog);
	app.get('/blog/post/:post', routes.views.post);
  app.all('/gallery*', middleware.requireUser);
	app.all('/gallery', routes.views.gallery); //used to be a regular get

	//app.get('/firstsign', routes.views.signuppage); //also try firstsign
	//app.get('/newpage', middleware.requiresLogin, routes.views.reference);
	/*app.get('/newpage', middleware.roleAuth, function(req, res) {
		res.render('/newpage');
	});*/

	//other stuff here?

//Session
app.all('/join', routes.views.session.join); //handles all requests to /join
app.all('/signin', routes.views.session.signin);
app.get('/signout', routes.views.session.signout);

//Authentication
//app.all('/auth/confirm', routes.auth.confirm);
app.all('/auth/app', routes.auth.app);

//User? user being able to make posts may be useful

//API for the app
app.all('/api/app/signin-endpoint', routes.api['signin-endpoint']); //check syntax
app.all('/api/app/signup-endpoint', routes.api['signup-endpoint']);

	app.get('/*', router);


};
