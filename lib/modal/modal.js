
(function (){

	var Modal = function(props) {
			// 配置对象
			var title = props.title || "标题";
			var content = props.content || "内容";
			// action与其它类型不同
			if (props.type == "action") {

				this.html = '<div class="modal-action"><div class="modal-action-group"><ul>';
				var len = props.items.length;
				
				for (var i = 0; i < len; i++) {
					this.html += '<li><div>' + props.items[i] + '</div></li>'
				}

				this.html += '</ul></div><div class="modal-action-group"><button id="btn-cancel">取消</button></div></div>';

			} else {
				// 非action
				this.html = '<div class="modal-others"><div class="modal-inner">' + '<div class="modal-title">' + title + '</div>' + '<div class="modal-content">' + content + '</div>';

				switch (props.type) {

				case "normal":

					this.html += '<div id="btn-cancel" class="modal-close"></div></div></div>';
					break;

				case "alert":

					this.html += '<div class="modal-btns"><button id="btn-ok">确定</button></div></div></div>';
					break;
				case "confirm":

					this.html += '<div class="modal-btns"><button id="btn-cancel">取消</button><button id="btn-ok">确定</button></div></div></div>';
					break;
				case "prompt":

					this.html += '<div class="form-set"><input type="text" placeholder="Name."><input type="text" placeholder="Password."></div><div class="modal-btns"><button id="btn-cancel">取消</button><button id="btn-ok">确定</button></div></div></div>';
					break;

					defaut: break;

				}

			}
			// 回调
			this.callback = props.callback || function() {};
			this.open = false;
			this.create();

		};

	// 新建modal
	Modal.prototype.create = function() {
		if (this.open) return;

		var modal = document.createElement("div");

		modal.innerHTML = this.html;
		modal.className = "modal-back"
		document.body.appendChild(modal);
		modal.addEventListener("click", this, false);
		// 移除时使用
		this.modal = modal;
		// reflow
		modal.offsetWidth = modal.offsetWidth;
		// 添加动画
		modal.classList.add("modal-active");
		this.open = true;

	};

	// 移除
	Modal.prototype.close = function() {
		if (!this.open) return;

		this.modal.classList.remove("modal-active");
		var that = this;
		setTimeout(function() {
			console.log(that.modal + "remove");
			document.body.removeChild(that.modal);
		}, 300);
		this.open = false;

	};

	// 监听的用法，新学刚好用上，具体可见我的博客
	Modal.prototype.handleEvent = function(e) {

		e.preventDefault();
		var eleID = e.target.id;

		console.log(this.modal + "click");
		if (eleID === "btn-cancel" || eleID === "btn-ok") {
			this.close();
			eleID === "btn-cancel" ? "" : this.callback();
			return false;
		}
	};

	window.Modal = Modal;

})();

// 不需要load事件
var createIntance = (function() {
			var instance;
			return function() {
				// instance不存在则实例化Modal，存在则直接返回，确保只有一个实例
				return instance || (instance = new Modal({
					type: "normal"
				}))
			}
		})();

document.getElementById("normal").addEventListener("click", createIntance, false);

document.getElementById("alert").addEventListener("click", function() {
	new Modal({
		type: "alert",
		title: "警告",
		content: "你的电脑已中病毒，请及时下载360保护你的电脑，呵呵"
	})
}, false);

document.getElementById("confirm").addEventListener("click", function() {
	new Modal({
		type: "confirm",
		title: "FBI WARNING",
		content: "禁网2017"
	})
}, false);

document.getElementById("prompt").addEventListener("click", function() {
	new Modal({
		type: "prompt",
		title: "LOGIN",
		content: "INPUT YOUR NAME & PASSWORD",
		callback: function() {
			var name = document.getElementsByTagName("input")[0];
			console.log("YOUR NAME IS " + name.value);
			var password = document.getElementsByTagName("input")[1];
			console.log("YOUR PASSWORD IS " + password.value);
		}
	})
}, false);

document.getElementById("action").addEventListener("click", function() {
	new Modal({
		type: "action",
		items: ["分享到Twitter", "分享到Facebook", "分享到Linkedin", "分享到Google+"]
	})
}, false);
