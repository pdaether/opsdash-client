'use strict'

let opsDashClient = require('../index.js')
let expect        = require('chai').expect;
let os            = require('os')

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
  })

  it("start a metric", function () {
    opsDashReporter
      .addMetric('testmetric',{type: 'value'})
      .startMetric('testmetric')
    expect(opsDashReporter.metrics['testmetric'].intervalObj)
      .not.to.be.equals(undefined)
  })

})
