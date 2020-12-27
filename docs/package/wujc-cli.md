---
title: wujc-cli
sidebarDepth: 5
---


# 项目模版,发布脚手架工具

:::tip 项目地址
- [npm](https://www.npmjs.com/package/wujc-cli)
- [github](https://github.com/actualchao/chao-cli)
:::


# 安装

```sh
# 全局安装
npm i -g wujc-cli
```

# commands
支持的功能

- [init 模版生成器](#init)
- [deploy 资源发布](#deploy)

# 使用

## init
 
运行 init 会交互式的询问需要应用的项目模板，然后根据模版生成对应项目。
### 运行命令
```sh
# 按照模板初始化项目
chao init [app-name]
```


### 目前已支持的 template

- `vw-app` 移动端 `vw` 适配方案下的 h5 项目模版.



--------------------------
## deploy

根据配置文件或者交互式命令行配置连接服务器，发布资源。实现一键本地打包上传到服务端。

打包命令会筛选出项目中 `package.json` 中包含 `build` 字符的所有命令以供选择。

### 运行命令

```sh
# 发布到服务器
chao deploy

# 命令行帮助
chao deploy --help
```


### 配置方式
- `.deploy.json` 配置文件配置
- 命令行参数配置,运行 `chao deploy --help` 查看详细
- 命令行交互询问式配置，在本地配置和命令行参数配置合并后仍然缺少配置的时候启动交互

交互询问配置方式会在最后提示是否需要将配置写入配置文件中。

**密钥文件必须存放到项目中 `project/.deploy.private` ,如果交互配置输入的不是项目中该路径，将会将密钥拷贝到该位置。**

### 配置文件
```json
// project/.deploy.json
{
  "hostname": "10.10.77.175",
  "port": "22",
  "user": "root",
  "identity": ".deploy.private",
  "local": "dist",
  "remote": "/opt/static/testapp",
  "script": "build"
}
```


### options
- [hostname](#hostname)
- [port](#port)
- [user](#user)
- [identity](#identity)
- [local](#local)
- [remote](#remote)
- [script](#script)

#### hostname

服务器主机地址，仅限 `ipv4`
#### port

服务器ssh连接端口，默认 22 ，不支持命令行交互配置
#### user

服务器主机登陆账号，默认 root ，不支持命令行交互配置
#### identity

服务器 ssh 免密登陆密钥文件路径

**密钥文件必须存放到项目中 `project/.deploy.private` ,如果交互配置输入的不是项目中该路径，将会将密钥拷贝到该位置。**
#### local

本地打包生成资源相对项目目录的**相对路径**，例如 `dist`, `./dist`
#### remote

服务端资源放置绝对路径，例如 `/opt/static/testapp`

发布的时候如果已经存在该路径，会把该路径备份到该路径拼接 `.bak` 的新文件夹中

例如：

备份远程仓库  /opt/static/testapp  到 /opt/static/testapp.bak/2020-12-21_10:15:33

#### script


打包命令会筛选出项目中 `package.json` 中包含 `build` 字符的所有命令以供选择。


#### usePassword

是否使用密码登录服务器