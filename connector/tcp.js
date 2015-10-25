'use strict'

let request = require('request')

class tcpConnector {

  constructor(options){
    this.options = options
    this.options.uri = this.options.server
      + ':' + this.options.tcpPort
      + '/pubapi/v1/report'
  }

  send(data, cb){      
      request({
        uri: this.options.uri,
        body: data,
        json: true,
        method: 'post'
      }, cb)
  }
}

module.exports = function construct(options){
  return new tcpConnector(options)
}
