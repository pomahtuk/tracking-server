"use strict";

var goalRecordId, originalGoal;

module.exports = exports = function (server, Code, lab, sessionCookie) {
  lab.suite('Goals', function () {

    // wait for models to be loaded
    lab.before(function (done) {
      setTimeout(function () { done(); }, 1000);
    });

    lab.test("Create goal endpoint rejects invalid goal", function(done) {
      var options = {
        method: "POST",
        url: "/goals",
        payload: {
          goal: {
            description: 'lab exp descr'
          }
        },
        headers: {
          cookie: 'sid=' + sessionCookie.value
        }
      };

      server.inject(options, function(response) {
        var result = response.result;

        Code.expect(response.statusCode).to.equal(400);
        Code.expect(result).to.be.an.object();
        Code.expect(result.message).to.be.string();

        done();
      });
    });

    lab.test("Create goal endpoint creates valid goal", function(done) {
      var options = {
        method: "POST",
        url: "/goals",
        payload: {
          goal: {
            name: 'lab goal',
            description: 'lab exp descr is pretty much too big',
            tag: 'lab_goal_olo'
          }
        },
        headers: {
          cookie: 'sid=' + sessionCookie.value
        }
      };

      server.inject(options, function(response) {
        var goal,
          result = response.result,
          payload = options.payload;

        Code.expect(response.statusCode).to.equal(201);
        Code.expect(result).to.be.an.object();

        Code.expect(result.goal).to.be.an.object();

        goalRecordId = result.goal.id;

        goal = result.goal;
        originalGoal = payload.goal;

        Code.expect(goal.name).to.equal(originalGoal.name);
        Code.expect(goal.description).to.equal(originalGoal.description);
        Code.expect(goal.tag).to.equal(originalGoal.tag);
        Code.expect(goal.variantCount).to.equal(originalGoal.variantCount);
        Code.expect(goal.trackPercent).to.equal(originalGoal.trackPercent);
        Code.expect(goal.fullOn).to.equal(originalGoal.fullOn);

        done();
      });
    });

    // test index
    lab.test('Goals endpoint lists present goals', function (done) {
      var options = {
        method: 'GET',
        url: '/goals',
        headers: {
          cookie: 'sid=' + sessionCookie.value
        }
      };

      server.inject(options, function(response) {
        var result = response.result;

        Code.expect(response.statusCode).to.equal(200);
        Code.expect(result).to.be.an.object();
        Code.expect(result.goals).to.be.instanceof(Array);
        Code.expect(result.goals.length).to.be.above(0);

        done();
      });
    });

    lab.test('Single goal endpoint return given goal', function (done) {
      var options = {
        method: 'GET',
        url: '/goals/' + goalRecordId,
        headers: {
          cookie: 'sid=' + sessionCookie.value
        }
      };

      server.inject(options, function(response) {
        var result = response.result;

        Code.expect(response.statusCode).to.equal(200);
        Code.expect(result).to.be.an.object();
        Code.expect(result.goal).to.be.an.object();

        Code.expect(result.goal.name).to.equal(originalGoal.name);
        Code.expect(result.goal.description).to.equal(originalGoal.description);
        Code.expect(result.goal.tag).to.equal(originalGoal.tag);
        Code.expect(result.goal.variantCount).to.equal(originalGoal.variantCount);
        Code.expect(result.goal.trackPercent).to.equal(originalGoal.trackPercent);
        Code.expect(result.goal.fullOn).to.equal(originalGoal.fullOn);

        done();
      });
    });

    lab.test('Delete goal endpoint should delete given goal', function (done) {
      var options = {
        method: 'DELETE',
        url: '/goals/' + goalRecordId,
        headers: {
          cookie: 'sid=' + sessionCookie.value
        }
      };

      server.inject(options, function(response) {
        var result = response.result;

        Code.expect(response.statusCode).to.equal(200);
        Code.expect(result).to.be.an.object();
        Code.expect(result.message).to.equal("Goal deleted successfully");

        done();
      });
    });

    lab.test('Delete goal endpoint should return error if goal with given id doesn\'t exists', function (done) {
      var options = {
        method: 'DELETE',
        url: '/goals/0',
        headers: {
          cookie: 'sid=' + sessionCookie.value
        }
      };

      server.inject(options, function(response) {
        Code.expect(response.statusCode).to.equal(404);
        done();
      });
    });

    lab.test('Delete goal endpoint should return 400 error if goal id is wrong', function (done) {
      var options = {
        method: 'DELETE',
        url: '/goals/-1',
        headers: {
          cookie: 'sid=' + sessionCookie.value
        }
      };

      server.inject(options, function(response) {
        Code.expect(response.statusCode).to.equal(400);
        done();
      });
    });

  });
}
