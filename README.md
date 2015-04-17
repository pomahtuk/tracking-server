[![Build Status](https://travis-ci.org/pomahtuk/tracking-server.svg?branch=master)](https://travis-ci.org/pomahtuk/tracking-server)
[![Dependecies Status](https://david-dm.org/pomahtuk/tracking-server.svg)](https://david-dm.org/pomahtuk/tracking-server)
[![Code Climate](https://codeclimate.com/github/pomahtuk/tracking-server/badges/gpa.svg)](https://codeclimate.com/github/pomahtuk/tracking-server)

## Laborant-server

User-facing API for Laborant tracking solution


Just some thoughts about event processing - process every: 5m
First - calculate data for 5 minutes, store to results db
Then summ all 5m calculations done with allready stored total and save it as total
If this metric is not targert metric for experiment and/or project - wipe 5m data 


### Deploy

#### Openshift

  ```
    gem install rhc
    # this will create scalable application with mysql and mongodb
    rhc app create [app_name] nodejs-0.10 mongodb-2.4 mysql-5.4 -s
    cd app_name
    # point new app to our github code
    git remote add upstream -m master git@github.com:pomahtuk/tracking-server.git
    git pull -s recursive -X theirs upstream master
  ```


### To Be Done:

* General
  - ~~Nested routing~~
    - ~~Project - Experimnet~~
    - ~~Project - Goal~~
  - ~~Ensure all roles hidden under auth~~
  - ~~Transition to SQL database~~
  - ~~Update routes for all models~~

* Events tracking
  - ~~Event model~~
  - ~~Save event route~~
  - Events background processing
  - Identification of user
  - Collecting stats
  - Tests

* Clientside script
  - ~~Genereation of resulting js~~
  - Regenaration if template was changed meanwhile
  - Tests

* Auth
  - ~~Do ot expose a password - use hashes~~
  - ~~Use seeeions instead of users~~
  - Delete session from database on logout
  - Reset password and change password
  - ~~Add endpoint returning current user for session~~

* Experiments:
  - ~~Add goals relation~~
  - ~~Assign to Project instead of user~~
  - ~~Write tests for thouse changes~~

* Goals
  - ~~Add relation to Project~~
  - ~~Implement tests for current functionality~~

* Tags
  - Everything

* Projects
  - ~~Evetything~~
  - ~~Update route~~
  - ~~Testing~~

* Sessions
  - ~~Evetything~~
  - Testing

* Users
  - ~~Add relation to projects~~
  - ~~Add relation to session~~
  - Model method trimming password and salt from object
  - ~~Write all tests~~

* Tests
  - ~~Test unauthentificated access to routes~~
  - add more checks, test JOI validations and passing invalid params


To be able to use it - run in browser console first (this will actuallu create a user for you)

```
$.ajax({
  method: 'POST',
  url: 'http://localhost:3000/sign-up',
  xhrFields: {withCredentials: true},
  data: {username: 'pman1', password: '177591', confirm: '177591'}
}).success(function(data) {
  console.log(data)
});

$.ajax({
  method: 'POST',
  url: 'http://localhost:3000/login',
  data: {
    username: 'pman',
    password: '177591'
  },
  xhrFields: {withCredentials: true}
}).success(function(data) {
    console.log(data);
});

```

Will try to use agenda for data processing
* https://github.com/rschmukler/agenda
* https://github.com/moudy/agenda-ui

Switching to SQL databases using Sequilize
* https://github.com/sequelize/cli
* http://sequelize.readthedocs.org/en/latest/docs/
