var Bcrypt  = require('bcrypt');              // for future password comparison
var Boom    = require('boom');                // HTTP Errors
var Joi     = require('joi');                 // Validation
var sqlUser = require('../models').User;      // Sequilize ORM


var deleteAccount = function (request, reply) {
    sqlUser.findOne(request.auth.credentials.id).then(function (user) {
        if (user) {
            if (user.password === request.payload.password) {
                sqlUser.destroy({
                    where: {
                      id: user.id
                    },
                    limit: 1
                }).then(function (deleted) {
                    if (deleted) {
                      reply({ message: "User deleted successfully"});
                    } else {
                      reply(Boom.notFound("Could not delete user"));
                    }
                }, function (err) {
                    reply(Boom.badRequest(err));
                });
            } else {
                reply(Boom.unauthorized("Wrong password"));
            } 
        } else {
            reply(Boom.notFound()); //404
        }
    }, function (err) {
        // console.log(err);
        reply(Boom.badRequest("Could not delete account"));
    });
}

var register = function (request, reply) {
    var theirUser = request.payload;

    sqlUser.create(theirUser).then(function(newUser, created) {
        request.auth.session.set(newUser); // authorize user
        reply({
            user: {
                username: newUser.username
            }
        }).created(newUser.id);    // HTTP 201
    }, function (err) {
        // console.log(err);
        reply(Boom.badRequest(err)); // HTTP 400
    });
}


var login = function (request, reply) {

    if (request.auth.isAuthenticated) {
        console.log('auth');
        return reply({
            user: request.auth.credentials
        }); // 200 status
    }

    // do a better comparsion - we need to hash passwords and store hashes
    sqlUser.findOne({username: request.payload.username}).then(function (ourUser) {
        console.log(ourUser.username, request.payload.username);
        if (ourUser) {
            if (ourUser.password !== request.payload.password) {
                // again, wrong
                console.log('wrong password');
                reply(Boom.unauthorized()); // 403
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
        } else {
            reply(Boom.unauthorized()); //403
        }
    }, function (err) {
        // went wrong - reply 500
        reply(Boom.badImplementation(err)); // 500 error
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
                        username: Joi.string().alphanum().min(3).required(),
                        password: Joi.string().regex(/[a-zA-Z0-9]{3,30}/).required(),
                        confirm: Joi.ref('password') // should be equal
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
