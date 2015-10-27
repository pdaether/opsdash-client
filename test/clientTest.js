'use strict'

let opsDashClient = require('../index.js')
let pcReporter    = require('../reporter/processReporter')
let expect        = require('chai').expect;
let os            = require('os')
let nock          = require('nock')

describe("Constructor function should return a valid OpsDashReporter", function () {

  it("Constructor with empty options", function () {
    let opsDashReporter = opsDashClient()

    expect(opsDashReporter.options).to.contain.all.keys(
      'server',
      'interval',
      'source',
      'reportProcessMetrics'
    );

    //Check, that the default source is set correctly:
    expect(opsDashReporter.options.source).to.be.equals(
      os.hostname(),
      'Default source is not correct'
    )

    expect(opsDashReporter).to.to.respondTo('addMetric')
    expect(opsDashReporter).to.to.respondTo('startMetric')
    expect(opsDashReporter).to.to.respondTo('stopMetric')
    expect(opsDashReporter).to.to.respondTo('stopMetric')
    expect(opsDashReporter).to.to.respondTo('incMetric')
  })

  it("Constructor should set the correct options", function () {
    let opsDashReporter = opsDashClient({
      server: 'http://yourOpsDashDomain:8080',
      source: 'foo',
      interval: 10,
      reportProcessMetrics: false
    })

    expect(opsDashReporter.options.server).to.be.equals(
      'http://yourOpsDashDomain:8080',
      'Server is not correct'
    )
    expect(opsDashReporter.options.source).to.be.equals(
      'foo',
      'Source is not correct'
    )
    expect(opsDashReporter.options.interval).to.be.equals(
      10,
      'Interval is not correct'
    )
  })

})

describe("Metrics", function () {

  let opsDashReporter

  beforeEach(function () {
    opsDashReporter = opsDashClient({reportProcessMetrics: false})
  })

  afterEach(function () {
    opsDashReporter = undefined
  })

  it("add a metric", function () {
    opsDashReporter.addMetric('testmetric',{type: 'value'})
    expect(opsDashReporter.metrics).to.have.property('testmetric')
    expect(opsDashReporter.metrics.testmetric.value).to.be.equals(0)
  })

  it("start a metric", function () {
    opsDashReporter
      .addMetric('testmetric',{type: 'value'})
      .startMetric('testmetric')
    expect(opsDashReporter.metrics['testmetric'].intervalObj)
      .not.to.be.equals(undefined)
  })

  it("stop a metric", function () {
    opsDashReporter
      .addMetric('testmetric',{type: 'value'})
      .startMetric('testmetric')
      .stopMetric('testmetric')
      expect(opsDashReporter.metrics['testmetric'].intervalObj)
        .to.be.equals(undefined)
  })

  it("increase a metric", function () {
    opsDashReporter
      .addMetric('testmetric',{type: 'value'})
      .incMetric('testmetric')
      .incMetric('testmetric')
      .incMetric('testmetric', 4)

    expect(opsDashReporter.metrics.testmetric.value).to.be.equals(6)
    opsDashReporter.setMetricValue('testmetric',10)
    expect(opsDashReporter.metrics.testmetric.value).to.be.equals(10)
  })

  it("remove a metric", function () {
    opsDashReporter.addMetric('testmetric',{type: 'value'})
    expect(opsDashReporter.metrics).to.have.property('testmetric')
    opsDashReporter.removeMetric('testmetric')
    expect(opsDashReporter.metrics).not.to.have.property('testmetric')
  })

  it("should emmit an error, if sending is failing", function (done) {

    //Mock the response:
    let scope = nock('http://localhost')
      .post('/pubapi/v1/report')
      .replyWithError('AHH!');

    opsDashReporter.on('error', function(err){
      expect(err).not.to.be.null
      done()
    })

    opsDashReporter.addMetric('testmetric',{type: 'value', start: false})
    opsDashReporter._sendMetric('testmetric', '1')

  })

  it("stopProcessReporting should stop all process metrics", function () {
    opsDashReporter.startProcessReporting()

    for (let metric in pcReporter) {
      expect(opsDashReporter.metrics[metric].intervalObj)
        .not.to.be.equals(undefined)
    }

    opsDashReporter.stopProcessReporting()

    for (let metric in pcReporter) {
      expect(opsDashReporter.metrics[metric].intervalObj)
        .to.be.equals(undefined)
    }

  })

})

describe("Helper functions", function () {

  let opsDashReporter

  before(function () {
    opsDashReporter = opsDashClient({reportProcessMetrics: false})
  })

  it("getHostname should return the correct name", function () {
    expect(opsDashReporter.getHostname()).to.be.equals(os.hostname())
  })

  it("getCurrentTimestamp should return a coreect value", function () {
    expect(opsDashReporter.getCurrentTimestamp()).to.be.a('number')
  })

})
