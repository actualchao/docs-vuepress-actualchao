---
title: nginx 配置
---


## installtion

#### 1. Mac

mac 通过包管理工具 homebrew 安装
```
brew install nginx
```

## command

```sh
# start
brew services start nginx

nginx

# help
nginx -h

# 重启nginx
brew services reload nginx
nginx -s reload

# 停止
brew services stop nginx
nginx -s stop

# nginx command options
Options:
  -t            : test configuration and exit # 测试config 文件
  -T            : test configuration, dump it and exit # 测试config 文件，并退出
  -q            : suppress non-error messages during configuration testing 
  -s signal     : send signal to a master process: stop, quit, reopen, reload # 操作进程
  -p prefix     : set prefix path (default: /usr/local/Cellar/nginx/1.17.3_1/) # 设置根目录
  -c filename   : set configuration file (default: /usr/local/etc/nginx/nginx.conf) # 设置根配置文件
  -g directives : set global directives out of configuration file # 为配置文件配置全局指令
```


## config


#### 配置文件路径

#### mac
 > 安装目录/配置文件目录：  `/usr/local/etc/nginx`
 > 默认的`prefix`目录：   `/usr/local/Cellar/nginx`


 ### 配置

 ```sh


#user  nobody;
worker_processes  1;


events {
    worker_connections  1024;
}


http {
    # ip池 用于负载均衡配置
    upstream tomcatserver1 {
        ip_hash; 
        server 10.10.71.50:10086 weight=2;
        server 127.0.0.1:8888;
    }
    include       mime.types;
    default_type  application/octet-stream;

    sendfile        on;
    keepalive_timeout  65;


    server {
        listen       8080;
        server_name  localhost;

        location / {
            root   html;
            index  index.html index.htm;
        }
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }
    }


    server {
        # 监听端口
        listen       8989;
        # 监听的服务
        server_name localhost;

        # 设置日志
        error_log       logs/error.log notice;
        # 开启rewrite 日志
        rewrite_log on;

        # 匹配路径 /file/
        location /file/ {
            rewrite_log on;
            add_header Cache-Control no-cache;
            proxy_set_header   Host local.baidu.com;
            proxy_set_header   X-Forwarded-For  $proxy_add_x_forwarded_for;
            proxy_set_header   X-Real-IP        $remote_addr;

            # 改写 aa/bb.xml 等带后缀路径 转换为 aa/bb
            rewrite (.+)(?=\.([^\.]+)(?!\.)\b) $1 break;
            
            # 重定向服务器
            proxy_pass http://61.164.53.62:8728;
            proxy_connect_timeout 30s;

            # rewrite "\.([^\.]+)(?!\.)\b" "" break;
            # rewrite ^/ "http://baidu.com" break;

        }    

    }

    # 注入子配置文件
    include servers/*;
}


 ```

