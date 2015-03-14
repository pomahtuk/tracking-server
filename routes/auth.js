var Bcrypt  = require('bcrypt');
var Boom    = require('boom');                // HTTP Errors
var Joi     = require('joi');                 // Validation
var User    = require('../models/user').User; // Mongoose ODM
var _       = require('lodash');

// do a basic registration

/**
 * Formats an error message that is returned from Mongoose.
 *
 * @param err The error object
 * @returns {string} The error message string.
 */
var getErrorMessageFrom = function (err) {
  var errorMessage = '';

  if (err.errors) {
    errorMessage = JSON.stringify(err.errors);
  } else {
    errorMessage = err.message;
  }

  return errorMessage;
}

var deleteAccount = function (request, reply) {
    User.findById(request.auth.credentials._id, function (err, user) {
        if (!err && user) {
            if (user.password === request.payload.password) {
                user.remove(function (err) {
                    if (err) {
                        reply(Boom.badImplementation(err));
                    } else {
                        request.auth.session.clear();
                        reply({ message: "Account deleted successfully"});
                    }
                });
            } else {
                // wrong password provided
                reply(Boom.unauthorized()); // 401 ??
            }
        } else if (!err) {
            // Couldn't find the object.
            eply(Boom.notFound()); //404
        } else {
            console.log(err);
            reply(Boom.badRequest("Could not delete account"));
        }
    });
}

var register = function (request, reply) {
    var ourUser = new User();
    var theirUser = request.payload.user;

    // real data!
    _.assign(ourUser, theirUser);

    ourUser.save(function (err) {
        if (!err) {
            request.auth.session.set(ourUser); // authorize user
            reply({user: ourUser}).created(ourUser._id);  // HTTP 201
        } else {
            reply(Boom.badImplementation(err)); // HTTP 400
        }
    });
}


var login = function (request, reply) {
    if (request.auth.isAuthenticated) {
        return reply({
            user: request.auth.credentials
        }); // 200 status
    }
    // do a better comparsion - we need to hash passwords and store hashes
    User.findOne({username: request.payload.username}, function(err, ourUser) {

        console.log(ourUser);

        if (err) {
            // went wrong - reply 500
            reply(Boom.badImplementation(err)); // 500 error
        } else if (!ourUser) {
            // reply 404
            console.log('user not found');
            reply(Boom.notFound());
        } else if (ourUser.password !== request.payload.password) {
            // again, wrong
            console.log('wrong password');
            reply(Boom.unauthorized()); // 401
        } else {
            // all ok, do magick
            request.auth.session.set(ourUser);
            // reply with propper status
            reply({
                user: {
                    username: ourUser.username
                }
            }); // 200 status
        }
    })
};

var logout = function (request, reply) {
    request.auth.session.clear();
    reply({ status: 'ok' });
};

module.exports = function (server) {
    server.route([
        {
            method: 'DELETE',
            path: '/account',
            config: {
                handler: deleteAccount,
                description: "Creating a single experiment based on POST data",
                validate: {
                    payload: {
                        password: Joi.string().regex(/[a-zA-Z0-9]{3,30}/).required()
                    }
                },
                auth: {
                    mode: 'required',
                    strategy: 'session'
                },
                plugins: {
                    'hapi-auth-cookie': {
                        redirectTo: false
                    }
                }
            }
        }, {
            method: 'POST',
            path: '/sign-up',
            config: {
                handler: register,
                description: "Creating a single experiment based on POST data",
                validate: {
                    payload: {
                        user: Joi.object().keys({
                            username: Joi.string().alphanum().min(3).required(),
                            password: Joi.string().regex(/[a-zA-Z0-9]{3,30}/).required(),
                            confirm: Joi.ref('password') // should be equal
                        })
                    }
                },
                auth: {
                    mode: 'try',
                    strategy: 'session'
                },
                plugins: {
                    'hapi-auth-cookie': {
                        redirectTo: false
                    }
                }
            }
        }, {
            method: 'POST',
            path: '/login',
            config: {
                handler: login,
                description: "Creating a single experiment based on POST data",
                validate: {
                    payload: {
                        username: Joi.string().alphanum().min(3).required(),
                        password: Joi.string().regex(/[a-zA-Z0-9]{3,30}/).required()
                    }
                },
                auth: {
                    mode: 'try',
                    strategy: 'session'
                },
                plugins: {
                    'hapi-auth-cookie': {
                        redirectTo: false
                    }
                }
            }
        },
        {
            method: 'GET',
            path: '/logout',
            config: {
                handler: logout,
                auth: {
                    mode: 'required',
                    strategy: 'session'
                },
            }
        }
    ]);
}
