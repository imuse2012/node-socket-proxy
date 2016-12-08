var net = require('net'); 

var proxy_json = {};

/**
  启动参数： 代理监听端口，目标服务器地址，目标服务器端口
  示例： node proxy.js 80 127.0.0.1 8080
*/ 
var dhost = process.argv[3];
var dport = process.argv[4];
var dlisten = process.argv[2];
fromargv = '{"items":[{"listen":' +dlisten+ ',"host":"' +dhost+ '","port":' +dport+ '}]}';
console.log(fromargv);

startProxy(JSON.parse(fromargv).items[0]);       

function showError(item,id,e) {
  console.log("listen "+item.listen+"id:"+id+" error:");
  console.log(e)
}

function startProxy(item){
  var connect_count = 0;
  var server = net.createServer(function (socket) {
      var proxySocket = new net.Socket();
      var id = connect_count++;
      proxySocket.connect(item.port, item.host, function () {
        console.log("listen "+item.listen+" new connect id:"+id+" count:"+connect_count);
      });
  
      proxySocket.on("error", function (msg) {
        //..........
        connect_count--;
        try{
          socket.destroy && socket.destroy();
        }catch(e){
          showError(item,id,e);
        }
       });
  
      proxySocket.on("data", function (msg) {
        try{
          socket.write(msg);
        }catch(e){
          showError(item,id,e);
        }
      });
  
      proxySocket.on("end", function (data) {
          connect_count--;
          try{
            socket.destroy && socket.destroy();
          }catch(e){
            showError(item,id,e);
          }
      });
      
      socket.on("error", function (msg) {
        connect_count--;
        console.log("listen "+item.listen+" error id:"+id+" count:"+connect_count);
        try{
          proxySocket.destroy && proxySocket.destroy();
        }catch(e){
          showError(item,id,e);
        }
      });
  
      socket.on('data', function (msg) {
          proxySocket.write(msg); 
      });
  
      socket.on('end', function (msg) {
          connect_count--;
          console.log("listen "+item.listen+" end id:"+id+" count:"+connect_count);
          try{
            proxySocket.destroy && proxySocket.destroy();
          }catch(e){
            showError(item,id,e);
          }
      });
  });
  server.listen(item.listen, function(){
    console.log('start server listen:'+item.listen+" to "+item.host+":"+item.port);
  });
}

/**
 * .......
 */
process.on('uncaughtException', function(error){
  console.error("********** proxy uncaughtException **********\n"+error+"\n********** proxy uncaughtException **********");
  console.error(error.stack);
  console.error("*********************************************");
});
