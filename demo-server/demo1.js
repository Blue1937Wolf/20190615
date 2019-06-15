let http = require('http');
let url = require('url');
let fs = require('fs');

http.createServer((req,res)=>{
    
   var pathname = url.parse(req.url).pathname.substring(1);
   console.log("pathname:"+pathname);

    fs.readFile(pathname,(err,data)=>{
        if(err){
            res.writeHead(404,{
                'Content-Type':'text/html'
            });
        }else{
            res.writeHead(200,{
                'Content-Type':'text/html'
            });            
            res.write(data.toString());
        }
        res.end();
    });

}).listen(3000,'127.0.0.1',()=>{
    console.log("服务已启动");
});