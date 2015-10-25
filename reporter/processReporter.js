'use strict'

let usage = require('usage')
let pid = process.pid

module.exports = {
  'memory.heapUsed': function heapUsed(){
    return process.memoryUsage().heapUsed
  },
  'memory.rss': function heapUsed(){
    return process.memoryUsage().rss
  },
  'memory.heapTotal': function heapUsed(){
    return process.memoryUsage().heapTotal
  },
  'cpu': function cpu(cb){
      usage.lookup(pid, { keepHistory: true }, (err, result) => {        
        if(err) return cb(err)
        cb(null, result.cpu)
      })
  },
  'uptime': function uptime(){
    return process.uptime()
  }
}
