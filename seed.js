/* global process */
/*jslint node: true, nomen: true, indent: 2, vars: true, regexp: true */

'use strict';

var models        = require('./models');
var Project       = require('./models').Project;
var Experiment    = require('./models').Experiment;
var User          = require('./models').User;
var uuid          = require('node-uuid');           // generate RFC UUID
var Bcrypt        = require('bcrypt');              // for future password comparison

var newUser = {
  username: 'pman',
  password: '177591'
};

var validProject = {
  name: 'lab project',
  description: 'lab project descr is pretty much too big',
  domain: 'http://ya.ru',
  apiKey: uuid.v4()
};


newUser.salt      = Bcrypt.genSaltSync(10);
newUser.password  = Bcrypt.hashSync(newUser.password, newUser.salt);

models.sequelize.sync().then(function () {

  function userExistsCallback(next) {
    User.findOne({
      where: {
        username: 'pman'
      }
    }).then(function (userFound) {
      if (userFound) {
        return next(userFound);
      }
      process.exit(-1);
    }, function () {
      process.exit(-1);
    });
  }

  function projectExistsCallback(next) {
    Project.findOne({
      where: {
        apiKey: validProject.apiKey
      }
    }).then(function (projectFound) {
      if (projectFound) {
        return next(projectFound);
      }
      process.exit(-1);
    }, function () {
      process.exit(-1);
    });
  }

  function createExperiments(project) {
    console.log('your api key is:', project.apiKey);
    // create few experiments
    // TBD!

    project.getExperiments().then(function (experiments) {
      var newExperiments = [];
      var exp, i;
      if (experiments && experiments.length >= 5) {
        console.log('allreadyy got 5 exps');
        return process.exit(0);
      } else {
        for (i =0; i < 5; i += 1) {
          exp = {
            name: 'lab experiment' + i,
            description: 'lab exp descr is pretty much too big',
            tag: 'lab_exp_olo' + i,
            variantCount: 2,
            trackPercent: 100,
            fullOn: false
          };
          newExperiments.push(exp);
        }

        Experiment.bulkCreate(newExperiments).then(function (createdExps) {
          project.setExperiments(createdExps).then(function () {
            process.exit(0);
          }, function (err) {
            console.log(err);
            process.exit(-1);
          });
        }, function () {
          console.log('bulk creation failed');
          process.exit(-1);
        });
      }
    }, function () {
      process.exit(-1);
    });

  }

  function createProject(user) {
    user.getProjects({limit: 1}).then(function (projects) {
      if (projects && projects.length > 0) {
        createExperiments(projects[0]);
      } else {
        user.createProject(validProject).then(function (project) {
          createExperiments(project);
        }, function () {
          projectExistsCallback(createExperiments);
        });
      }
    }, function () {
      process.exit(-1);
    });
  }

  User.create(newUser).then(function (createdUser) {
    createProject(createdUser);
  }, function () {
    userExistsCallback(createProject);
  });

});
