class Post_Templates {

	static init(){
		this.PLUGIN_ID = "pd_post_templates";
		this.settings = {};
		this.images = {};
		this.key_id = (yootil.user.logged_in())? ("_" + parseInt(yootil.user.id(), 10)) : "";

		this.saved_templates = this.load_saved_templates();

		this.setup();

		if(yootil.location.posting() || yootil.location.editing()){
			$(this.ready.bind(this));
		}
	}

	static ready(){
		let $wrapper = $("#post-templates");
		let has_wrapper = ($wrapper.length == 1)? true : false;
		let $container = yootil.create.container("Post Templates", this.build_saved_post_templates());

		this.bind_events($container);

		if($container.find(".post-template-item").length > 1){
			$container.find(".post-template-item:not(:last) textarea").off("keyup").on("keyup", function(){
				let $item = $(this).closest(".post-template-item");

				$item.find(".post-template-item-asterisk").addClass("post-template-item-asterisk-unsaved");
			});
		}

		if(!has_wrapper){
			$wrapper = $("<div id='post-templates'></div>");
		}

		$wrapper.append($container);

		if(!has_wrapper){
			$wrapper.insertAfter($(".container.wysiwyg-area"));
		}
	}

	static setup(){
		let plugin = pb.plugin.get(this.PLUGIN_ID);

		if(plugin && plugin.settings){
			this.settings = plugin.settings;
			this.images = plugin.images;
		}
	}

	static load_saved_templates(){
		let tpls = localStorage.getItem("post_templates" + this.key_id);

		if(tpls && tpls.length){
			return JSON.parse(tpls);
		}

		return {};
	}

	static bind_events($elem){
		$elem.find(".post-template-item-insert").click(function(){
			let $item = $(this).closest(".post-template-item");
			let id = $item.attr("data-post-template-id");

			Post_Templates.insert($item.find("textarea").val());
		});

		$elem.find(".post-template-item-content textarea").on("keyup", function(){
			let $area = $(this);

			if($area.val().length){
				$area.off("keyup");

				let $item = $(this).closest(".post-template-item");
				let $parent = $item.parent();

				$item.find(".post-template-item-asterisk").addClass("post-template-item-asterisk-unsaved");
				$item.find(".post-template-item-remove").addClass("post-template-item-bounce-in");

				let $empty_item = $(Post_Templates.create_item({

					i: "",
					t: ""

				}, (+ new Date()))).addClass("post-template-item-bounce-in");

				Post_Templates.bind_events($empty_item);

				$parent.append($empty_item);
			}
		});

		$elem.find(".post-template-item-remove").on("click", function(){
			if($(this).css("opacity") <= 0.4){
				return;
			}

			let $item = $(this).closest(".post-template-item");
			let $parent = $item.parent();
			let id = $item.attr("data-post-template-id");

			$item.addClass("post-template-item-roll-out");

			setTimeout(() => {
				$item.remove();
				Post_Templates.remove_template(id);

				if($parent.find("div").length == 0){
					let $empty_item = $(Post_Templates.create_item({

						i: "",
						t: ""

					}, (+ new Date()))).addClass("post-template-item-bounce-in");

					Post_Templates.bind_events($empty_item);

					$parent.append($empty_item);
				}
			}, 600);

		});

		$elem.find(".post-template-item-save").on("click", function(){
			let $item = $(this).closest(".post-template-item");
			let id = $item.attr("data-post-template-id");

			$item.find(".post-template-item-asterisk").removeClass("post-template-item-asterisk-unsaved");

			let img = $item.find(".post-template-item-image-url input").val();
			let tpl = $item.find(".post-template-item-content textarea").val();

			if(img.length > 10){
				$item.find(".post-template-item-preview-img").attr("src", yootil.html_encode(img));
			}

			$(this).addClass("post-template-item-saved-spin");

			setTimeout(() => {

				$(this).removeClass("post-template-item-saved-spin");

			}, 1100);

			Post_Templates.save_template(id, img, tpl);
		});

		$elem.find(".post-template-item-picture").on("click", function(){
			let $item = $(this).closest(".post-template-item");
			let $url = $item.find(".post-template-item-image-url");

			if($url.hasClass("post-template-item-image-url-show")){
				$url.removeClass("post-template-item-image-url-show");
				$url.addClass("post-template-item-image-url-hide");
			} else {
				$url.removeClass("post-template-item-image-url-hide");
				$url.addClass("post-template-item-image-url-show");
			}
		});

		$elem.find(".post-template-item-image-url input").on("keyup", function(){
			let $item = $(this).closest(".post-template-item");
			let $parent = $item.parent();

			$item.find(".post-template-item-asterisk").addClass("post-template-item-asterisk-unsaved");
		});
	}

	static save_template(id, img = "", tpl = ""){
		let templates = this.load_saved_templates();

		templates[id] = {

			i: img,
			t: tpl

		};

		localStorage.setItem("post_templates" + this.key_id, JSON.stringify(templates));
	}

	static remove_template(id){
		let templates = this.load_saved_templates();

		if(templates[id]){
			delete templates[id];
			localStorage.setItem("post_templates" + this.key_id, JSON.stringify(templates));
		}
	}

	static insert(content = ""){
		let wysiwyg = $(".wysiwyg-textarea").data("wysiwyg");
		let editor = wysiwyg.currentEditorName;

		wysiwyg.editors[editor].replaceSelection((editor == "visual")? document.createTextNode(content) : content);
	}

	static build_saved_post_templates(){
		let templates = "<div class='post-templates-list'>";

		for(let key in this.saved_templates){
			if(this.saved_templates.hasOwnProperty(key)){
				templates += this.create_item(this.saved_templates[key], key, true);
			}
		}

		templates += this.create_item({

			i: "",
			t: ""

		}, (+ new Date()), false);

		templates += "</div>";

		return templates;
	}

	static create_item(item = {}, key = "", can_remove = false){
		let html = "";

		html += "<div class='post-template-item' data-post-template-id='" + key + "'>";

		html += "<div class='post-template-item-preview'>";
		html += "<div class='post-template-item-asterisk'><img src='" + this.images.asterisk + "' /></div>";

		let img_url = "";

		if(item.i.length > 10){
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

		let opacity = (can_remove)? 1 : 0.4;

		html += "<div class='post-template-item-controls'>";
		html += "<div><img class='post-template-item-picture' src='" + this.images.picture + "' title='Edit Picture' /></div>";
		html += "<div><img class='post-template-item-save' src='" + this.images.save + "' title='Save Template' /></div>";
		html += "<div><img class='post-template-item-insert' src='" + this.images.insert + "' title='Insert Template' /></div>";
		html += "<div><img class='post-template-item-remove' style='opacity: " + opacity + "' src='" + this.images.remove + "' title='Remove Template' /></div>";
		html += "</div>";

		html += "</div>";

		return html;
	}

}

Post_Templates.init();