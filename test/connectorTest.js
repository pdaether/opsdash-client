'use strict'

let expect    = require('chai').expect;
let nock      = require('nock')
var Connector = require('../connector/tcp')

describe("The tcp connector", function () {

  it("should set the correct options", function () {
    let connector = Connector({server: 'http://localhost'})
    expect(connector.options.uri).to.be.equals(
      'http://localhost/pubapi/v1/report'
    )
  })

  it("should send the data", function (done) {

    //Mock the response:
    let scope = nock('http://localhost')
      .post('/pubapi/v1/report')
      .reply(200)

    let connector = Connector({server: 'http://localhost'})
    connector.send({test: true}, function (err) {
      expect(err).to.be.null
      done()
    })
  })

  it("should return an error if statusCode is not ok", function (done) {

    //Mock the response:
    let scope = nock('http://localhost')
      .post('/pubapi/v1/report')
      .reply(404);

    let connector = Connector({server: 'http://localhost'})
    connector.send({test: true}, function (err) {
      expect(err).not.to.be.null
      done()
    })
  })

  it("should return an error if sending was failing", function (done) {

    //Mock the response:
    let scope = nock('http://localhost')
      .post('/pubapi/v1/report')
      .replyWithError('AHH!');

    let connector = Connector({server: 'http://localhost'})
    connector.send({test: true}, function (err) {
      expect(err).not.to.be.null
      done()
    })
  })

})
