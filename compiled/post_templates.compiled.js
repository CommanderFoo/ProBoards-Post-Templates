"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Post_Templates = function () {
	function Post_Templates() {
		_classCallCheck(this, Post_Templates);
	}

	_createClass(Post_Templates, null, [{
		key: "init",
		value: function init() {
			this.PLUGIN_ID = "pd_post_templates";
			this.settings = {};
			this.images = {};
			this.key_id = yootil.user.logged_in() ? "_" + parseInt(yootil.user.id(), 10) : "";

			this.saved_templates = this.load_saved_templates();

			this.setup();

			if (yootil.location.posting() || yootil.location.editing()) {
				$(this.ready.bind(this));
			}
		}
	}, {
		key: "ready",
		value: function ready() {
			var $wrapper = $("#post-templates");
			var has_wrapper = $wrapper.length == 1 ? true : false;
			var $container = yootil.create.container("Post Templates", this.build_saved_post_templates());

			this.bind_events($container);

			if ($container.find(".post-template-item").length > 1) {
				$container.find(".post-template-item:not(:last) textarea").off("keyup").on("keyup", function () {
					var $item = $(this).closest(".post-template-item");

					$item.find(".post-template-item-asterisk").addClass("post-template-item-asterisk-unsaved");
				});
			}

			if (!has_wrapper) {
				$wrapper = $("<div id='post-templates'></div>");
			}

			$wrapper.append($container);

			if (!has_wrapper) {
				$wrapper.insertAfter($(".container.wysiwyg-area"));
			}
		}
	}, {
		key: "setup",
		value: function setup() {
			var plugin = pb.plugin.get(this.PLUGIN_ID);

			if (plugin && plugin.settings) {
				this.settings = plugin.settings;
				this.images = plugin.images;
			}
		}
	}, {
		key: "load_saved_templates",
		value: function load_saved_templates() {
			var tpls = localStorage.getItem("post_templates" + this.key_id);

			if (tpls && tpls.length) {
				return JSON.parse(tpls);
			}

			return {};
		}
	}, {
		key: "bind_events",
		value: function bind_events($elem) {
			$elem.find(".post-template-item-insert").click(function () {
				var $item = $(this).closest(".post-template-item");
				var id = $item.attr("data-post-template-id");

				Post_Templates.insert($item.find("textarea").val());
			});

			$elem.find(".post-template-item-content textarea").on("keyup", function () {
				var $area = $(this);

				if ($area.val().length) {
					$area.off("keyup");

					var $item = $(this).closest(".post-template-item");
					var $parent = $item.parent();

					$item.find(".post-template-item-asterisk").addClass("post-template-item-asterisk-unsaved");
					$item.find(".post-template-item-remove").addClass("post-template-item-bounce-in");

					var $empty_item = $(Post_Templates.create_item({

						i: "",
						t: ""

					}, +new Date())).addClass("post-template-item-bounce-in");

					Post_Templates.bind_events($empty_item);

					$parent.append($empty_item);
				}
			});

			$elem.find(".post-template-item-remove").on("click", function () {
				if ($(this).css("opacity") <= 0.4) {
					return;
				}

				var $item = $(this).closest(".post-template-item");
				var $parent = $item.parent();
				var id = $item.attr("data-post-template-id");

				$item.addClass("post-template-item-roll-out");

				setTimeout(function () {
					$item.remove();
					Post_Templates.remove_template(id);

					if ($parent.find("div").length == 0) {
						var $empty_item = $(Post_Templates.create_item({

							i: "",
							t: ""

						}, +new Date())).addClass("post-template-item-bounce-in");

						Post_Templates.bind_events($empty_item);

						$parent.append($empty_item);
					}
				}, 600);
			});

			$elem.find(".post-template-item-save").on("click", function () {
				var _this = this;

				var $item = $(this).closest(".post-template-item");
				var id = $item.attr("data-post-template-id");

				$item.find(".post-template-item-asterisk").removeClass("post-template-item-asterisk-unsaved");

				var img = $item.find(".post-template-item-image-url input").val();
				var tpl = $item.find(".post-template-item-content textarea").val();

				if (img.length > 10) {
					$item.find(".post-template-item-preview-img").attr("src", yootil.html_encode(img));
				}

				$(this).addClass("post-template-item-saved-spin");

				setTimeout(function () {

					$(_this).removeClass("post-template-item-saved-spin");
				}, 1100);

				Post_Templates.save_template(id, img, tpl);
			});

			$elem.find(".post-template-item-picture").on("click", function () {
				var $item = $(this).closest(".post-template-item");
				var $url = $item.find(".post-template-item-image-url");

				if ($url.hasClass("post-template-item-image-url-show")) {
					$url.removeClass("post-template-item-image-url-show");
					$url.addClass("post-template-item-image-url-hide");
				} else {
					$url.removeClass("post-template-item-image-url-hide");
					$url.addClass("post-template-item-image-url-show");
				}
			});

			$elem.find(".post-template-item-image-url input").on("keyup", function () {
				var $item = $(this).closest(".post-template-item");
				var $parent = $item.parent();

				$item.find(".post-template-item-asterisk").addClass("post-template-item-asterisk-unsaved");
			});
		}
	}, {
		key: "save_template",
		value: function save_template(id) {
			var img = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
			var tpl = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "";

			var templates = this.load_saved_templates();

			templates[id] = {

				i: img,
				t: tpl

			};

			localStorage.setItem("post_templates" + this.key_id, JSON.stringify(templates));
		}
	}, {
		key: "remove_template",
		value: function remove_template(id) {
			var templates = this.load_saved_templates();

			if (templates[id]) {
				delete templates[id];
				localStorage.setItem("post_templates" + this.key_id, JSON.stringify(templates));
			}
		}
	}, {
		key: "insert",
		value: function insert() {
			var content = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";

			var wysiwyg = $(".wysiwyg-textarea").data("wysiwyg");
			var editor = wysiwyg.currentEditorName;

			wysiwyg.editors[editor].replaceSelection(editor == "visual" ? document.createTextNode(content) : content);
		}
	}, {
		key: "build_saved_post_templates",
		value: function build_saved_post_templates() {
			var templates = "<div class='post-templates-list'>";

			for (var key in this.saved_templates) {
				if (this.saved_templates.hasOwnProperty(key)) {
					templates += this.create_item(this.saved_templates[key], key, true);
				}
			}

			templates += this.create_item({

				i: "",
				t: ""

			}, +new Date(), false);

			templates += "</div>";

			return templates;
		}
	}, {
		key: "create_item",
		value: function create_item() {
			var item = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
			var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
			var can_remove = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

			var html = "";

			html += "<div class='post-template-item' data-post-template-id='" + key + "'>";

			html += "<div class='post-template-item-preview'>";
			html += "<div class='post-template-item-asterisk'><img src='" + this.images.asterisk + "' /></div>";

			var img_url = "";

			if (item.i.length > 10) {
				img_url = item.i;
				html += "<img class='post-template-item-preview-img' src='" + yootil.html_encode(item.i) + "' />";
			} else {
				html += "<img class='post-template-item-preview-img' src='" + this.images.nopreview + "' />";
			}

			html += "<div class='post-template-item-image-url'><input placeholder='Preview Image URL...' type='text' value='" + yootil.html_encode(img_url) + "' /></div>";

			html += "</div>";

			html += "<div class='post-template-item-content'>";
			html += "<textarea cols='1' rows='1'>" + item.t + "</textarea>";
			html += "</div>";

			var opacity = can_remove ? 1 : 0.4;

			html += "<div class='post-template-item-controls'>";
			html += "<div><img class='post-template-item-picture' src='" + this.images.picture + "' title='Edit Picture' /></div>";
			html += "<div><img class='post-template-item-save' src='" + this.images.save + "' title='Save Template' /></div>";
			html += "<div><img class='post-template-item-insert' src='" + this.images.insert + "' title='Insert Template' /></div>";
			html += "<div><img class='post-template-item-remove' style='opacity: " + opacity + "' src='" + this.images.remove + "' title='Remove Template' /></div>";
			html += "</div>";

			html += "</div>";

			return html;
		}
	}]);

	return Post_Templates;
}();


Post_Templates.init();