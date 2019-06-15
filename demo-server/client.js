let http = require('http');

http.get("http://www.baidu.com",(res)=>{
    let rowData = '';

    res.on('data',(chunk)=>{
        rowData += chunk;
    });

    res.on('end',()=>{
        console.log(rowData);
    });
})