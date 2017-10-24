/**
 * Created by zhangliqing on 2017/9/26.
 */
var request = require('request')

var removeInstance = function () {
  setTimeout(function () {
    console.log('loop');
    request.get({url:'http://117.50.1.134:8080/v2-beta/projects/1a3504/stacks/1st15/services'},function (err,httpResponse,body) {
      var date = new Date();
      console.log(date);
      body_j = JSON.parse(body)
      var services = body_j.data;
      for(var i = 0; i < services.length; i++){
        if((date-Date.parse(services[i].created)) > 300000){
          //console.log('delete '+services[i].id);
          request.del({url: 'http://117.50.1.134:8080/v2-beta/projects/1a3504/services/'+services[i].id}, function (err, httpResponse, body) {
            if(err){
              console.log('Internal error.');
            }
          })
        }
      }
    })
    request.get({url:'http://117.50.1.134:8080/v2-beta/projects/1a3504/containers/'},function (err,httpResponse,body) {
      var date = new Date();
      body_j = JSON.parse(body)
      var containers = body_j.data;

      for(var i = 0; i < containers.length; i++){
        if((date-Date.parse(containers[i].created)) > 300000 && containers[i].labels.container_type == 'cloudware'){
          //console.log('delete '+containers[i].id);
          request.del({url: 'http://117.50.1.134:8080/v2-beta/projects/1a3504/containers/'+containers[i].id}, function (err, httpResponse, body) {
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
