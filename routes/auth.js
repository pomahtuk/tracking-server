/*jslint node: true, nomen: true, indent: 2, vars: true, regexp: true */

'use strict';

var Bcrypt     = require('bcrypt');              // for future password comparison
var Boom       = require('boom');                // HTTP Errors
var Joi        = require('joi');                 // Validation
var sqlUser    = require('../models').User;      // Sequilize ORM
var sqlSession = require('../models').Session;   // Sequilize ORM
var uuid       = require('node-uuid');           // generate RFC UUID

var deleteAccount = function (request, reply) {
  var user = request.auth.credentials;
  if (Bcrypt.compareSync(request.payload.password, user.password)) {
    sqlUser.destroy({
      where: {
        id: user.id
      },
      limit: 1
    }).then(function (deleted) {
      if (deleted) {
        reply({ message: 'User deleted successfully'});
      } else {
        reply(Boom.notFound('Could not delete user'));
      }
    }, function (err) {
      reply(Boom.badRequest(err));
    });
  } else {
    reply(Boom.unauthorized('Wrong password'));
  }
};


var register = function (request, reply) {
  var theirUser = request.payload;

  theirUser.salt = Bcrypt.genSaltSync(10);
  theirUser.password = Bcrypt.hashSync(theirUser.password, theirUser.salt);

  sqlUser.create(theirUser).then(function (newUser) {
    newUser.createSession({
      hash: uuid.v4()
    }).then(function (session) {
      // all ok, do magick
      request.auth.session.set(session);
      // reply with propper status
      reply({
        user: {
          username: newUser.username
        }
      }).created(newUser.id);    // HTTP 201
    }, function (err) {
      reply(Boom.badImplementation(err)); // 500 error
    });
  }, function (err) {
    // console.log(err);
    reply(Boom.badRequest(err)); // HTTP 400
  });
};


var login = function (request, reply) {

  sqlUser.findOne({where: {username: request.payload.username}}).then(function (ourUser) {
    if (ourUser) {
      if (!Bcrypt.compareSync(request.payload.password, ourUser.password)) {
        // again, wrong
        reply(Boom.unauthorized()); // 403
      } else {
        ourUser.createSession({
          hash: uuid.v4()
        }).then(function (session) {
          // all ok, do magick
          request.auth.session.set(session);
          // reply with propper status
          reply({
            user: {
              username: ourUser.username
            }
          }); // 200 status
        }, function (err) {
          reply(Boom.badImplementation(err)); // 500 error
        });
      }
    } else {
      reply(Boom.unauthorized()); //403
    }
  }, function (err) {
    // went wrong - reply 500
    reply(Boom.badImplementation(err)); // 500 error
  });

};


var logout = function (request, reply) {
  // delete users's session
  sqlSession.destroy({
    where: {
      hash: request.auth.artifacts.hash
    }
  }).then(function (done) {
    if (done) {
      request.auth.session.clear();
      reply({ status: 'ok' });
    } else {
      reply(Boom.badImplementation());
    }
  }, function (err) {
    reply(Boom.badImplementation(err));
  });
};


var changePassword = function (request, reply) {
  var currentUser = request.auth.credentials;
  if (Bcrypt.compareSync(request.payload.oldPassword, currentUser.password)) {
    // all ok, password correct
    var salt = Bcrypt.genSaltSync(10);
    var newPassword = request.payload.newPassword;
    currentUser.updateAttributes({
      salt: Bcrypt.genSaltSync(10),
      password: Bcrypt.hashSync(newPassword, salt)
    }).then(function () {
      reply({ message: 'User password updated successfully'});
    }, function (err) {
      reply(Boom.badImplementation(err));
    });
  } else {
    // password incorrect
    reply(Boom.unauthorized('Wrong password'));
  }
};


// // TBD!!!!
// var resetPasswordStart = function (request, reply) {

// };


// var resetPasswordCnange = function (request, reply) {

// };


var getCurrentUser = function (request, reply) {
  reply({
    user: request.auth.credentials
  }); // add sefe implementation
};

module.exports = function (server) {
  server.route([
    // delete
    {
      method: 'DELETE',
      path: '/account',
      config: {
        handler: deleteAccount,
        description: 'Creating a single experiment based on POST data',
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
    },
    // register
    {
      method: 'POST',
      path: '/sign-up',
      config: {
        handler: register,
        description: 'Creating a single experiment based on POST data',
        validate: {
          payload: {
            username: Joi.string().min(3).required(),
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
    },
    // login
    {
      method: 'POST',
      path: '/login',
      config: {
        handler: login,
        description: 'Creating a single experiment based on POST data',
        validate: {
          payload: {
            username: Joi.string().min(3).required(),
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
    // logout
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
    },
    // details
    {
      method: 'GET',
      path: '/me',
      config: {
        handler: getCurrentUser,
        auth: {
          mode: 'required',
          strategy: 'session'
        },
      }
    },
    // change password
    {
      method: 'POST',
      path: '/change-password',
      config: {
        handler: changePassword,
        description: 'Changing user password',
        validate: {
          payload: {
            oldPassword: Joi.string().regex(/[a-zA-Z0-9]{3,30}/).required(),
            newPassword: Joi.string().regex(/[a-zA-Z0-9]{3,30}/).required(),
            confifm: Joi.ref('newPassword') // should be equal
          }
        }
      }
    },
  ]);
};
