## Laborant-server

User-facing API for Laborant tracking solution

### To Be Done:

* General
  - Nested routing
  - ~~Ensure all roles hidden under auth~~
  - Transition to SQL database

* Auth
  - ~~Do ot expose a password - use hashes~~
  - ~~Use seeeions instead of users~~
  - Reset password and change password
  - ~~Add endpoint returning current user for session~~

* Experiments:
  - ~~Add goals relation~~
  - Add targets relation
  - ~~Assign to Project instaed of user~~
  - Write tests for thouse changes

* Goals
  - ~~Add relation to Project~~
  - Implement tests for current functionality

* Tags
  - Everything

* Projects
  - ~~Evetything~~
  - Testing

* Sessions
  - ~~Evetything~~
  - Testing

* Users
  - ~~Add relation to projects~~
  - ~~Add relation to session~~
  - Write all tests

* Tests
  - Test unauthentificated access to routes
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

Switching to SQL databases using Sequilize
* https://github.com/sequelize/cli
* http://sequelize.readthedocs.org/en/latest/docs/
