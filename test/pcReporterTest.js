'use strict'

let pcReporter = require('../reporter/processReporter')
let expect        = require('chai').expect;

describe('The process reporter', function () {

  it('should return the correct uptime metric', function () {
    expect(pcReporter).to.have.property('uptime')
    expect(pcReporter['uptime']).to.be.a('function')
    expect(pcReporter['uptime']()).to.be.at.most(process.uptime())
  })

  it('should return the correct memory.heapUsed metric', function () {
    expect(pcReporter).to.have.property('memory.heapUsed')
    expect(pcReporter['memory.heapUsed']).to.be.a('function')
    expect(pcReporter['memory.heapUsed']()).to.be.a('number')
  })

  it('should return the correct memory.rss metric', function () {
    expect(pcReporter).to.have.property('memory.rss')
    expect(pcReporter['memory.rss']).to.be.a('function')
    expect(pcReporter['memory.rss']()).to.be.a('number')
  })

  it('should return the correct memory.heapTotal metric', function () {
    expect(pcReporter).to.have.property('memory.heapTotal')
    expect(pcReporter['memory.heapTotal']).to.be.a('function')
    expect(pcReporter['memory.heapTotal']()).to.be.a('number')
  })

  it('should return the correct cpu metric', function (done) {
    expect(pcReporter).to.have.property('cpu')
    expect(pcReporter['cpu']).to.be.a('function')

    pcReporter['cpu'](function(err, result){
        expect(result).to.be.a('number')
        expect(err).to.be.null
        done()
    })


  })

})
