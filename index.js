'use strict'

let EventEmitter    = require('events').EventEmitter
let tcpConnector    = require('./connector/tcp')
let os              = require("os");
let processReporter = require('./reporter/processReporter')


const defaultOptions = {
  server: 'http://localhost',  //opsDash server
  interval: 60,               //defaut interval to send the metrics
  reportProcessMetrics: true, //Report cpu, memory etc.
  source: null                //source name
};

class opsDashReporter {

  constructor(options){

      this.options = options
      this.metrics = {}
      this.eventEmitter = new EventEmitter();
      this.tcpConnector = tcpConnector(this.options)

      if(this.options.reportProcessMetrics){
        this.startProcessReporting()
      }

  }

  on(eventName, cb){
    this.eventEmitter.on(eventName, cb);
    return this;
  }

  addMetric(name, options, cb){
    if(!this.metrics.hasOwnProperty(name)){
      this.metrics[name] = {
        type: options.type,
        value: options.startValue || 0,
        reset: options.reset || false,
        callback: cb,
        interval: options.interval || this.options.interval,
        intervalObj: undefined
      }
    }

    if(options.start){
      this.startMetric(name)
    }

    return this;
  }

  startMetric(name){
    if(!this.metrics.hasOwnProperty(name)) return this;

    if(this.metrics[name].intervalObj === undefined){

      if(this.metrics[name].type === 'value'){

        this.metrics[name].intervalObj = setInterval(() => {
          this._sendMetric(name, this.metrics[name].value)
          if(this.metrics[name].reset === true){
            this.metrics[name].value = 0;
          }
        }, this.metrics[name].interval * 1000)

      } else if(this.metrics[name].callback.length === 1){

        this.metrics[name].intervalObj = setInterval(() => {
          this.metrics[name].callback((err, result) => {
            this._sendMetric(name, result)
          })
        }, this.metrics[name].interval * 1000)

      } else {

        this.metrics[name].intervalObj = setInterval(() => {
          this._sendMetric(name, this.metrics[name].callback())
        }, this.metrics[name].interval * 1000)

      }

    }

    return this;
  }

  stopMetric(name){
    if(!this.metrics.hasOwnProperty(name)) return this;

    if(this.metrics[name].intervalObj !== undefined){
        clearInterval(this.metrics[name].intervalObj)
    }
    return this
  }

  incMetric(name, value){
    if(!this.metrics.hasOwnProperty(name)) return this;
    this.metrics[name].value += value ? value : 1;
    return this
  }

  setMetricValue(name, value) {
    if(!this.metrics.hasOwnProperty(name)) return this;
    this.metrics[name].value = value;
    return this
  }

  removeMetric(name) {
    if(!this.metrics.hasOwnProperty(name)) return this;
    this.stopMetric(name);
    delete this.metrics[name]
    return this
  }

  getCurrentTimestamp(){
    return parseInt(new Date().getTime() / 1000)
  }

  getHostname(){
    return os.hostname()
  }

  startProcessReporting(){
    for(let metric in processReporter){
        this.addMetric(metric, {type: 'callback'}, processReporter[metric])
        this.startMetric(metric)
    }
    return this
  }

  stopProcessReporting() {
    for(let metric in processReporter){
        this.stopMetric(metric)
    }
    return this
  }

  _sendMetric(name, value){
    this.tcpConnector.send({
      source: this.options.source,
      metric: name,
      at: this.getCurrentTimestamp(),
      value: value
    }, (err, httpResponse, body) => {
      if(err) this.eventEmitter.emit('error', err)
    })
  }

}

function opsDashClient(options){

  //Set options
  if(typeof options === 'object' && options !== null){
    options = Object.assign({}, defaultOptions, options)
  } else {
    options = Object.assign({}, defaultOptions)
  }

  //Set default source if not set
  if(!options.source){
    options.source = os.hostname()
  }
  //create new reporter object:
  let reporter = new opsDashReporter(options)

  return reporter
}

opsDashClient.hostname = os.hostname()
opsDashClient.processReporter = processReporter

module.exports = opsDashClient
