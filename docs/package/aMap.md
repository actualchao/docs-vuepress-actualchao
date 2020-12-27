---
title: amap-upper
sidebarDepth: 5
---

# 高德地图业务的封装

:::tip 项目地址
- [npm 地址](https://www.npmjs.com/package/amap-upper)
- [github 地址](https://github.com/amap-upper/amap-upper)
:::



## 前言
最近公司项目中，越来越多的用到高德地图开发，为了避免相同的业务需求团队每人都各自开发，就基于业务场景，实现了一些功能抽象封装，旨在简化高德地图开发过程。

- [amap-upper 高德地图插件文档](https://amap-upper.github.io/)
- [amap-upper 项目github地址](https://github.com/amap-upper/amap-upper)

## 目前实现的功能:

### 初始化
- [初始化地图API加载起](https://amap-upper.github.io/guide/#初始化插件)
- [注册 Plugins](https://amap-upper.github.io/guide/#plugins-扩展)
- [初始化地图](https://amap-upper.github.io/guide/#初始化地图)

### 普通点
- [添加一组普通点](https://amap-upper.github.io/guide/mapMarkers.html#mapU.mapMarkers)
- [获取普通点集合](https://amap-upper.github.io/guide/mapMarkers.html#mapU.getMapMarkersByType)
- [显示普通点集合](https://amap-upper.github.io/guide/mapMarkers.html#mapU.showMapMarkersByType)
- [隐藏普通点集合](https://amap-upper.github.io/guide/mapMarkers.html#mapU.hideMapMarkersByType)
- [清除普通点集合](https://amap-upper.github.io/guide/mapMarkers.html#mapU.clearMapMarkersByType)
- [向普通点集合添加点](https://amap-upper.github.io/guide/mapMarkers.html#mapU.addMapMarkersByType)
- [获取普通点集合所有数据](https://amap-upper.github.io/guide/mapMarkers.html#mapU.getMarkerExtDataByType)
- [失活上一个激活的点](https://amap-upper.github.io/guide/mapMarkers.html#mapU.inactiveLastMarker)


### 聚合点

- [添加一组聚合点](https://amap-upper.github.io/guide/mapMarkers.html#mapU.markerClusterer)
- [获取聚合点集合](https://amap-upper.github.io/guide/mapMarkers.html#mapU.getMarkerClustererByType)
- [显示聚合点集合](https://amap-upper.github.io/guide/mapMarkers.html#mapU.showMarkerClustererByType)
- [隐藏聚合点集合](https://amap-upper.github.io/guide/mapMarkers.html#mapU.hideMarkerClustererByType)
- [清除聚合点集合](https://amap-upper.github.io/guide/mapMarkers.html#mapU.clearMarkerClustererByType)
- [向聚合点集合添加点](https://amap-upper.github.io/guide/mapMarkers.html#mapU.addMarkerClustererByType)
- [获取聚合点集合所有数据](https://amap-upper.github.io/guide/mapMarkers.html#mapU.getClusterExtDataByType)
- [失活上一个激活的点](https://amap-upper.github.io/guide/mapMarkers.html#mapU.inactiveLastMarker)



### 海量点

- [添加一组海量点](https://amap-upper.github.io/guide/mapMarkers.html#mapU.massMarks)
- [重绘一组海量点](https://amap-upper.github.io/guide/mapMarkers.html#mapU.renderMassMarksByType)
- [获取海量点集合](https://amap-upper.github.io/guide/mapMarkers.html#mapU.getMassMarksByType)
- [显示海量点集合](https://amap-upper.github.io/guide/mapMarkers.html#mapU.showMassMarksByType)
- [隐藏海量点集合](https://amap-upper.github.io/guide/mapMarkers.html#mapU.hideMassMarksByType)
- [清除海量点集合](https://amap-upper.github.io/guide/mapMarkers.html#mapU.clearMassMarksByType)
- [向海量点集合添加点](https://amap-upper.github.io/guide/mapMarkers.html#mapU.addMassMarksByType)
- [获取海量点集合所有数据](https://amap-upper.github.io/guide/mapMarkers.html#mapU.getMassExtDataByType)
- [失活上一个激活的点](https://amap-upper.github.io/guide/mapMarkers.html#mapU.inactiveLastMassMarks)


### 普通轨迹回放
- [添加轨迹回放](https://amap-upper.github.io/guide/markerMove.html#mapU.markerMove)
- [获取轨迹回放](https://amap-upper.github.io/guide/markerMove.html#mapU.getMarkerMove)
- [重新开始轨迹回放](https://amap-upper.github.io/guide/markerMove.html#mapU.reStartMarkerMove)
- [暂停轨迹回放](https://amap-upper.github.io/guide/markerMove.html#mapU.pauseMarkerMove)
- [继续轨迹回放](https://amap-upper.github.io/guide/markerMove.html#mapU.resumeMarkerMove)
- [停止轨迹回放](https://amap-upper.github.io/guide/markerMove.html#mapU.stopMarkerMove)
- [清除轨迹回放](https://amap-upper.github.io/guide/markerMove.html#mapU.clearMarkerMove)



### 信息窗体
- [添加信息窗体](https://amap-upper.github.io/guide/infoWindow.html#mapU.openInfoWindow)
- [清除信息窗体](https://amap-upper.github.io/guide/infoWindow.html#mapU.clearInfoWindow)



### 绘制编辑工具
- [鼠标绘制工具](https://amap-upper.github.io/guide/drawEditor.html#mapU.mouseToolDraw)
- [折线多边形编辑工具](https://amap-upper.github.io/guide/drawEditor.html#mapU.newPolyEditor)



### 常用地图工具
- [事件触发器](https://amap-upper.github.io/guide/tools.html#mapU.triggerEvent)
- [经纬度转换器](https://amap-upper.github.io/guide/tools.html#mapU.transformCoord)
- [逆地理编码](https://amap-upper.github.io/guide/tools.html#mapU.getAddressByLnglat)
- [正地理编码](https://amap-upper.github.io/guide/tools.html#mapU.getLngLatByAddress)
- [设置地图中心层级](https://amap-upper.github.io/guide/tools.html#mapU.setCenter)
- [设置单一点](https://amap-upper.github.io/guide/tools.html#mapU.setLocation)
- [清除单一点](https://amap-upper.github.io/guide/tools.html#mapU.clearLocation)
