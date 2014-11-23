/*jslint node: true, es5: true, indent: 2, nomen: true*/
/*global describe, beforeEach, it, inject, expect, browser, element, by*/

'use strict';

/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */

describe('PhoneCat App', function () {

  it('should display hello message', function () {
    browser.get('/');
    browser.getLocationAbsUrl().then(function (url) {
      expect(element(by.css('p')).getText()).toBe('hello!');
    });
  });

});
