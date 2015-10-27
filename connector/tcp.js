'use strict'

let request = require('request')

class tcpConnector {

  constructor(options){
    this.options = options
    this.options.uri = this.options.server
      + '/pubapi/v1/report'
  }

  send(data, cb){
    request({
      uri: this.options.uri,
      body: data,
      json: true,
      method: 'post'
    }, function(err, response){
      if(err) return cb(err)
      if(response.statusCode < 200 || response.statusCode >= 300){
        return cb(new Error(
          'Bad status code while sending metric: ' + response.statusCode
        ))
      }
      cb(null)
    })
  }
}

module.exports = function construct(options){
  return new tcpConnector(options)
}
