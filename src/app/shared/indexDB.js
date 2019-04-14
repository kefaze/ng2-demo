var isIOS = !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);//判断是否是ios
var isoVersion = navigator.userAgent.match(/(iPhone\sOS)\s([\d_]+)/)[2].replace(/_/g, '.');//取出ios版本号
var DB = {
        dbName:"cmpDB",
        slqVersion:(isIOS && isoVersion.split(".")[0] > 9)?"1.0":"1",//websql的版本号，由于ios的问题，版本号的写法不一样
        dbVersion:1,//indexDB的版本号
        storeName:"cmpStore",//store----即“表”的名字
        indexedDB:window.indexedDB || window.webkitIndexedDB, //监听IndexDB
        db:{}, //缓存数据库，避免同一个页面重复创建和销毁
        store:null,
        errorCode:{   //错误码
            open:91001, //打开数据库失败的错误
            save:91002, //保存数据失败的错误
            get:91003,  //获取数据失败的错误
            delete:91004, //删除数据失败的错误
            deleteAll:91005 //清空数据库失败的错误
        },
        createStore:function(dbName,callback){//创建“表”
            var txn, store;
            if(DB.indexedDB){ //如果是支持IndexDB的
                txn = DB.db[dbName].transaction(DB.storeName, "readwrite"); //IndexDB的读写权限
                store = txn.objectStore(DB.storeName);
            }else {   //如果不支持IndexDB 则使用websql
                store = DB.db[dbName].transaction(function (tx) {
                    tx.executeSql('create table if not exists '+DB.storeName+' (key text, value text null)',[],function(ts,result){
                        callback && callback()
                    });
                });
            }
            return store;
        },
        open:function(callback,dbName){ //打开数据库
            if(DB.indexedDB){ //如果支持IndexDB
                if(!DB.db[dbName]){//如果缓存中没有，则进行数据库的创建或打开，提高效率
                    var request = DB.indexedDB.open(dbName,DB.dbVersion);
                    request.onerror = function(e){
                        callback({code:DB.errorCode.open,error:e});
                    };
                    request.onsuccess = function(e){
                        if(!DB.db[dbName]){
                            DB.db[dbName] = e.target.result;
                        }
                        var store = DB.createStore(dbName);
                        callback(store);
                    };
                    request.onupgradeneeded = function(e){
                        DB.db[dbName] = e.target.result;
                        var store = DB.db[dbName].createObjectStore(DB.storeName, { keyPath: "key"});
                        callback(store);
                    }
                }else {//如果缓存中已经打开了数据库，就直接使用
                    var store = DB.createStore(dbName);
                    callback(store);
                }
            }else{
                if(!DB.db[dbName]){
                    DB.db[dbName] = openDatabase(dbName, DB.slqVersion, 'websqlDBl', 30 * 1024 * 1024);
                }
                DB.createStore(dbName,callback);
            }
        },
        save:function(key,value,callback){//保存数据到数据库  key---数据key  value----数据值  callback----回调函数
            var dbName = DB.dbName;
            if(DB.indexedDB){
                var inData = {
                    key:key,
                    value:value
                };
                DB.open(function(result){
                    var error = result.hasOwnProperty("error");
                    if(error){
                        callback && callback(result);
                    }else {
                        var request =  result.put(inData);
                        request.onsuccess = function(e){
                            callback && callback({success:true});//保存成功有success 字段
                        };
                        request.onerror = function(e){
                            callback && callback({code:DB.errorCode.save,error:e});
                        }
                    }
                },dbName);
            }else {
                value = JSON.stringify(value); //由于websql只能存字符串，所有将数据转成json字符串
                DB._websqldelete(key,function(result){ //存之前，先删除可能存在的key值
                    if(result.hasOwnProperty("error")){
                        callback(result);
                    }else {
                        DB.db[dbName].transaction(function (ts) {
                            ts.executeSql("insert into "+DB.storeName+"(key,value) values(?,?) ", [key,value], function (ts, result) {
                                callback && callback({success:true});
                            }, function (ts, e) {
                                callback && callback({code:DB.errorCode.save,error:e});
                            });
                        });
                    }
                },dbName);

            }
        },
        get:function(key,callback){//根据key获取值
            var dbName = DB.dbName;
            if(DB.indexedDB){
                DB.open(function(result){
                    var error = result.hasOwnProperty("error");//判断返回的数据中是否有error字段
                    if(error){
                        callback(result);
                    }else {
                        var request = result.get(key);
                        request.onsuccess = function(e){
                            var data = e.target.result?e.target.result.value:undefined;
                            callback({data:data,success:true});
                        };
                        request.onerror = function(e){
                            callback({code:DB.errorCode.get,error:e});
                        }
                    }
                },dbName);
            }else {
                DB.open(function(){
                    DB.db[dbName].transaction(function (ts) {
                        ts.executeSql("select * from "+DB.storeName+" where key=? ", [key], function (ts, result) {
                            var data;
                            if (result) {
                                for (var i = 0; i < result.rows.length; i++) {
                                    data = result.rows.item(i)
                                }
                                if(data) {
                                    data = data.value;
                                    try{
                                        data = JSON.parse(data);//由于存的时候是转成json字符串，所以取得时候需要解析json
                                    }catch (e){}
                                }
                            }
                            callback({data:data,success:true});

                        }, function (ts, e) {
                            callback({code:DB.errorCode.get,error:e});
                        });
                    });
                },dbName);

            }

        },
        delete:function(key,callback){  //根据key删除某条数据
            var dbName = DB.dbName;
            if(DB.indexedDB){
                DB.open(function(result){
                    var error = result.hasOwnProperty("error");
                    if(error){
                        callback && callback(result);
                    }else {
                        var request = result.get(key);
                        request.onsuccess = function(e){
                            var recode = e.target.result;
                            if(recode){
                                request = result.delete(key);
                            }
                            callback && callback({success:true});
                        };
                        request.onerror = function (e) {
                            callback && callback({code:DB.errorCode.delete,error:e});
                        };
                    }
                },dbName);
            }else {
                DB._websqldelete(key,callback,dbName);//使用websql的方式删除
            }

        },
        deleteAll:function(callback){//清空数据库
            var dbName = DB.dbName;
            if(DB.indexedDB){
                DB.open(function(result){
                    var error = result.hasOwnProperty("error");
                    if(error){
                        callback && callback(result);
                    }else {
                        result.clear();
                        callback && callback({success:true});
                    }
                },dbName);
            }else {
                DB.open(function(){
                    DB.db[dbName].transaction(function (ts) {
                        ts.executeSql("delete from "+DB.storeName+"",[] ,function (ts, result) {
                            callback && callback({success:true});
                        }, function (ts, e) {
                            callback && callback({code:DB.errorCode.deleteAll,error:e});
                        });
                    });
                },dbName);

            }
        },
        _websqldelete:function(key,callback,dbName){ //私有方法，用于websql的删除
            DB.open(function(){
                DB.db[dbName].transaction(function (ts) {
                    ts.executeSql("delete from "+DB.storeName+" where key = ? ", [key], function (ts, result) {
                        callback && callback({success:true});
                    }, function (ts, e) {
                        callback && callback({code:DB.errorCode.delete,error:e});
                    });
                });
            },dbName);        }
    };


// 调用方式
var data = {"theme":"移动开发","title":"H5数据库封装"}; //将被存的数据，也可以字符串
var key = "oneNewData"; //存数据的key值

// 存数据
DB.save(key,data,function(result){
    if(result.success){
        //保存数据成功
    }else {
       //保存数据失败，根据result.code来判断是什么原因保存失败了
    }

})


// 取数据
DB.get(key,function(result){
        if(result.success){
                var getedData = result.data; //取出数据
                //getedData = {"theme":"移动开发","title":"H5数据库封装"}
        }else {
               //获取数据失败，根据result.code来判断是什么原因获取失败了
        }
    });

// 删除数据
    DB.delete(key,function(result){
        if(result.success){
           //删除数据库成功
        }else {
           //删除数据失败，根据result.code来判断是什么原因删除失败了
        }
    });


    // 清空数据
    DB.deleteAll(function(result){
        if(result.success){
           //清空数据库成功
        }else {
           //清空数据失败，根据result.code来判断是什么原因清空失败了
        }
    });