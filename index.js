/**
 * Created by zhangliqing on 2017/9/26.
 */
var request = require('request')

const ENDPOINT = 'http://10.2.253.121:8080/v2-beta'
const ENV = '1a51'
const LBID = '1s16'
const WSPREFIX = 'ws://10.2.253.122:83'
const STACKID = '1st16'

var removeInstance = function () {
  setTimeout(function () {
    console.log('loop');
    request.get({url:ENDPOINT + '/projects/' + ENV +'/stacks/'+ STACKID +'/services'},function (err,httpResponse,body) {
      var date = new Date();
      console.log(date);
      var body_j = JSON.parse(body)
      var services = body_j.data;
      request.get({url: ENDPOINT + '/projects/' + ENV + '/loadbalancerservices/' + LBID},function (err,httpResponse,body1) {
        var proxyData = JSON.parse(body1)
        for(var i = 0; i < services.length; i++){
          if((date-Date.parse(services[i].created)) > 300000){
            request.del({url: ENDPOINT + '/projects/' + ENV + '/services/'+services[i].id}, function (err, httpResponse, body) {
              if(err){
                console.log('Internal error.');
              }
            })
            for(var j = 0; j<proxyData.lbConfig.portRules.length; j++){
              if(proxyData.lbConfig.portRules[j].path!=null && proxyData.lbConfig.portRules[j].path.indexOf(services[i].name)!=-1){
                proxyData.lbConfig.portRules.splice(j,1)
                break
              }
            }
          }
        }
        request.put({
          url: ENDPOINT + '/projects/' + ENV + '/loadbalancerservices/' + LBID,
          json: proxyData
        })
      })
    })
    request.get({url:ENDPOINT + '/projects/' + ENV + '/containers/'},function (err,httpResponse,body) {
      var date = new Date();
      var body_j = JSON.parse(body)
      var containers = body_j.data;

      for(var i = 0; i < containers.length; i++){
        if((date-Date.parse(containers[i].created)) > 300000 && containers[i].labels.container_type == 'cloudware'){
          request.del({url: ENDPOINT + '/projects/' + ENV + '/containers/'+containers[i].id}, function (err, httpResponse, body) {
            if(err){
              console.log('Internal error.');
            }
          })
        }
      }
    })
    removeInstance()
  },100000)
}
removeInstance()
