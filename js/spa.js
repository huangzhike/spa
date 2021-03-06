(function() {

	// SPA
	function SPA() {
		// 存放注册的页面
		this.routers = {};
		// 监听hash事件
		window.addEventListener("hashchange", this.refresh.bind(this), false);

		// 后退按钮点击
		var spaBack = document.getElementById("spa-back");
		spaBack.addEventListener("click", function() {
			// 改变hash触发后退
			location.hash = prePartial;
		}, false);
	}

	// 是否返回上一页，当前页，上一页
	var goBack, nowPartial, prePartial = "home";

	// 注册分页
	SPA.prototype.route = function(partial, path, req, callback) {
		// 分页hash，每个页面都对应一个对象
		this.routers[partial] = {
			// 分页的请求路径
			path: path,
			// 加载脚本地址
			req: req || [],
			// 加载脚本的状态
			js: [],
			// 回调函数
			callback: callback || function() {},
			// 分页DOM
			temp: null
		}

		return this;
	};

	// hashchange后更新页面，非常简单的路由
	SPA.prototype.refresh = function() {
		// 获得注册的hash
		var partial = location.hash.replace("#", "");

		// 不存在地址重定向到首页
		if (!this.routers[partial]) {
			partial = "home";
			location.hash = "home";
			// 防止在首页重定向时进行两次请求
			if (prePartial) return;
		}

		// 如果点击的是之前的页面或首页就回退
		if (partial == prePartial || partial == "home") {
			this.turnBack(partial);
			return;
		}

		// 更新上一页
		prePartial = nowPartial;
		goBack = false;

		// 从回退的页面请求新页面，回退的旧页面移走
		remove.call(this, "spa-old", "(0, 0, 0)", prePartial);
		// 从非回退的页面请求新页面，原来的页面移走
		remove.call(this, "spa-new", "(-200%, 0, 0)", prePartial);

		// 异步加载js
		if (this.routers[partial].js[this.routers[partial].js.length]) {
			this.require(partial);
		}

		var that = this;
		// 请求新页面
		ajax("GET", this.routers[partial].path, "", function(goBack, page) {
			// ajax完成回调
			that.routers[partial].callback(partial);
			that.callbackAnimation(goBack, page, partial);

			// 更新当前页面
			nowPartial = partial;
		});

		return this;
	};

	// 页面回退，只支持一级回退，逻辑是这样的：
	// 有home和back以及点击之前页面回退三种
	// back是退到上次点击的页面
	// home是退到home页，因为只支持一级的回退，点击home回退后再点击back是无效的，因为已经回退了
	// 最后一种是点击了a，再点击b，再点击a，此时不是打开新页面a，而是回退到a
	// 其它都算打开新页面，动画方向不同
	// 发现浏览器后退键时从缓存加载，动画可能出现bug
	SPA.prototype.turnBack = function(partial) {

		var o = document.getElementById("spa-old");
		// 如果已存回退页并且不是首页，直接return
		if (o && partial !== "home") {
			console.log("invalid URL");
			return;
		}
		// 点击首页回退
		if (partial == "home") prePartial = partial;

		goBack = true;
		console.log("go to previous page");

		// 从回退的页面推到首页，回退的旧页面移走
		remove.call(this, "spa-old", "(200%, 0, 0)", nowPartial);
		// 或者从新页退到旧页面
		remove.call(this, "spa-new", "(100%, 0, 0)", nowPartial);

		// 异步加载js
		if (this.routers[partial].js[this.routers[partial].js.length]) {
			this.require(partial);
		}

		// 请求上一页
		var that = this;

		ajax("GET", this.routers[prePartial].path, "", function(goBack, page) {
			// ajax完成回调
			that.routers[prePartial].callback(prePartial);
			that.callbackAnimation(goBack, page, prePartial);

			// 更新当前页面
			nowPartial = partial;
		});
	};

	// ajax完成后插入新页面
	SPA.prototype.callbackAnimation = function(goBack, page, partial) {
		// 如果是回退，创建回退的页面，否则创建新请求的页面
		goBack ? create.call(this, page, "spa-old", "(100%, 0, 0)", partial) : create.call(this, page, "spa-new", "(-100%, 0, 0)", partial);
		console.log("created");
	};

	// 从别的page再回到原来page时，因为原来的page已经removeChild，DOM绑定的事件也没了
	// 方法1：不移除页面，只是显示隐藏，这样有点low
	// 方法2：移除原来的页面同时移除script，请求页面同时再插入script
	// 方法3：removeChild时保存返回的DOM，请求时再插入
	// 因为移除DOM并没有移除事件监听，因为闭包，保存在内存里，要完全移除还得手动解除监听
	// 另外，把删除的子节点赋值给 x，这个子节点不在DOM树中，但还存在内存中，可通过 x 操作
	// 如果要完全删除对象，要把 x 设为null

	// 本来是在ajax请求的html片段里放script标签的，但innerHTML插入的脚本不会执行
	// 之前回调插入的script无法监听window.onload，此时已经loaded，现在改为直接加载
	SPA.prototype.require = function(partial) {

		var b = document.getElementsByTagName("body")[0];
		var js = this.routers[partial].req;
		var that = this;
		var downloaded = this.routers[partial].js
		// true or false 异步或回调
		for (var i = 0; i < js.length - 1; i++) {
			if (!downloaded[i]) {
				var s = document.createElement("script");
				// 注意是相对主页的路径，不是加载页的路径
				s.src = js[i];
				s.async = true;
				// 闭包，获取i值
				s.onload = (function(i) {
					return function() {
						that.routers[partial].js[i] = true;
					}
				})(i);
				b.appendChild(s);
			}
		}
	};

	var p = document.getElementById("spa-page");

	// loading动画，pp助手上截的，可以在F12 Network里throttling模拟低网速的动画
	var loading = document.getElementById("spa-loading");

	// 创建页面
	function create(page, cls, trans, partial) {

		var a = this.routers[partial].temp || document.createElement("div");
		a.classList.remove("spa-old", "spa-new");
		// reset原来的transform
		a.style.transform = "translate3d(0, 0, 0)";
		a.setAttribute("class", cls);
		a.id = cls;
		if (!this.routers[partial].temp) a.innerHTML = page;
		p.appendChild(a);
		loading.style.display = "none";
		// reflow触发动画
		a.offsetWidth = a.offsetWidth;

		a.style.msTransform = "translate3D" + trans;
		a.style.webkitTransform = "translate3D" + trans;
		a.style.transform = "translate3D" + trans;
		console.log(a);
	}

	// 移除页面

	function remove(cls, trans, partial) {

		var a = document.getElementById(cls);
		if (!a) return;

		a.style.msTransform = "translate3D" + trans;
		a.style.webkitTransform = "translate3D" + trans;
		a.style.transform = "translate3D" + trans;

		loading.style.display = "block";

		var that = this;

		// 因为移除不是即时的，如果超快速点击切换页面可能有bug
		setTimeout(function() {
			that.routers[partial].temp = p.removeChild(a);
		}, 400);

	}

	// ajax请求函数
	function ajax(method, path, data, callback) {

		var XHR = new XMLHttpRequest();
		XHR.open(method, path, true);
		if (method === "POST") {
			// POST请求要定义请求头
			XHR.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		}
		// GET为空
		XHR.send(data);
		XHR.onreadystatechange = function() {
			if (XHR.readyState == 4 && XHR.status == 200) {
				// ajax完成回调
				// console.log("responseText: "+ XHR.responseText);
				callback(goBack, XHR.responseText);
			}
		}
	}

	window.SPA = SPA;

})();