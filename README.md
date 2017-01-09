
# SPA：single-page-application(toy)，一个单页面应用玩具。

**实现了：**
* 简单的路由功能；
* 动画：新页面切入动画与回退到上一页动画；
* AJAX：无刷新动态请求页面；
* 回调异步加载脚本。

**待添加：**
* HTML5 history.pushState + AJAX = PJAX；
* 其它。

**注意：**
* 不同页面的css，js要防止命名冲突；
* css应该是一次全部预先或合并加载，否则可能会闪烁。

**原理：**
* 注册页面的hash，路径以及回调；
* 监听hashchange事件，匹配注册的页面hash，再AJAX请求页面路径，根据responseText动态渲染内容；
* 移除页面是通过setTimeout实现的，也可以监听transitionEnd事件；
* 页面切换稍微有些复杂；
* 其它请直接看代码，注释很多，也很简单；
* 欢迎create an issue，欢迎讨论。

**感谢：**
* 路由注册和异步加载方面，借鉴了[kliuj](https://github.com/kliuj)的[spa-routers](https://github.com/kliuj/spa-routers)做法，之前因为自己弄错了还向他提了Issue，惭愧；
* UI是山寨[Amaze UI TOUCH](http://t.amazeui.org/)的，呵呵。
* Modal是之前山寨[Amaze UI TOUCH](http://t.amazeui.org/kitchen-sink/#/modal)的作品；
* 这只是一个非常简陋的玩具，去掉注释不够两百行，还有很多功能没实现，以后会补充完善！
