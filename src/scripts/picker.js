//	Pickers js 1.0.0
//  (c) 2014 Gapminder Foundation

//encapsulating Pickers
(function(root, picker_factory) {
  //support for AMD modules
  if (typeof define === 'function' && define.amd) {
    define(['underscore', 'jquery'], function(_, $) {
    	//if using AMD module, do not export as global
        var Picker = picker_factory(root, _, $);
        return Picker;
    });
  } 
  else {
  	//if there's no support, export as global
    root.Picker = picker_factory(root, root._, (root.jQuery || root.Zepto || root.$));
  }

}(this, function(root, _, $) {

	//actual picker plugin
	var Picker = function(type, id, options) {

		var _this = this; //save local pointer

		_this.type = type;
		_this.id = id;
		_this.options = options;

		//============= SETTING UP INITIAL AND DEV OPTIONS =============
		/* naming definitions */
		var settings = {
			//classes
			picker_class: 'picker-picker',
			picker_modal_class: 'picker-modal',
			picker_overlay_class: 'picker-overlay',
			picker_draggable_class: 'picker-draggable',
			picker_static_class: 'picker-static',
			picker_footer_class: 'picker-footer',
			close_button_class: 'picker-close-button',
			ok_button_class: 'picker-ok-button',
			content_class: 'picker-content',
			//types of pickers
			possible_types: ['regular', 'regularList', 'geo'],
			default_type: 'regular',
			//possible transitions
            possible_transitions: ['no-transition', 'fade', 'slide', 'slideUp', 'slideRight', 'slideLeft'],
            default_transition: 'slide',
			//useful html attributes
            picker_close_attr: 'data-picker-close',
            picker_ok_attr: 'data-picker-ok',
            selectable_attr: 'data-picker-selectable',
            value_attr: 'data-picker-value',
            //basezindex:
            zindex: 9000
		}; 

		/* default options */
		var defaults = {
			//position
			top: '50px',
			left: 'auto',
			bottom: 'auto',
			right: 'auto',

			//sizes
			width: '260px',
			height: 'auto',

			//visual propert
			extraClass: [],
			transition: settings.default_transition,
			//container may only be changed if static = true
			container: 'body',

			//optional features
			closeButton: false,
			confirmButton: false,
            clickOverlay: true, //only makes sense with modal true
            modal: true,
            draggable: false,
            static: false,
            allowDuplicates: false,
            removeHTML: false,

            //events
            beforeShow: undefined,
        	afterShow: undefined,
         	beforeHide: undefined,
         	afterHide: undefined,
         	onInteraction: undefined,
         	onSet: undefined,

         	//personalized content
   			contentData: undefined,
   			contentTemplate: undefined,
   			contentScript: undefined,
		};

		//options (public)
		options = _this.options = $.extend(defaults, _this.options);

		//================== VALIDATING ARGUMENTS =====================

		//if type is not supported
		if(settings.possible_types.indexOf(_this.type) === -1) {
			throw_msg("Type not supported. Switching to '"+settings.default_type+"'");
			_this.type = settings.default_type;
		}
		//if transition is not supported
		if(settings.possible_transitions.indexOf(_this.options.transition) === -1) {
			throw_msg("Transition not supported. Switching to '"+settings.default_transition+"'");
			_this.options.transition = settings.default_transition;
		}
		//check if container exists
		if($(options.container).length < 1) {
			throw_msg("Selected container '"+_this.options.container+"' does not exist. Switching to 'body'");
			_this.options.container = 'body'; 
		}

		//options (public)
		options = _this.options = $.extend(defaults, _this.options);
		type = _this.type;

		//================= OPERATED LOCAL EVENTS =====================
		// (public)
		var events = _this.events = {
			events: {}, //holds each event, identified by name
			//bind a function to a certain event
			bind: function(name, func) {
				if($.type(this.events[name]) !== 'array') {
					this.events[name] = [];
				}
				if($.isFunction(func)) {
					this.events[name].push(func);
				} else {
					throw_msg("Can't bind '"+func+"' to event '"+name+"'. It must be a function!");
				}
			},
			//trigger a certain event, executing each function
			trigger: function(name, args) {
				if($.type(this.events[name]) === 'undefined') return;
				for (var i = 0, size=this.events[name].length; i < size; i++) {
					var f = this.events[name][i];
					if($.isFunction(f)) {
						if($.type(args) === "undefined") {
							f();
						} else {
							f(args);
						}
					} else {
						throw_msg("Can't execute '"+func+"' on event '"+name+"'. It must be a function!");
					}
				};
			}
		};

		//============== TEMPLATING TOOL (PICKER SPECIFIC) ===============
		var template = {
			//parse a template
			parse: function(string, data) {
				var parsed = _.template(string, data);
				return ($.type(parsed) === "function") ? parsed() : parsed;
			},

			/*
			 * build specific content for each picker
			 * - type is a string (e.g: "geo" )
			 * - data is an object (e.g: { title: "Picker"} )
			 * - template is an underscore template
			 * - apply is a function to be executed after the template
			 *   is parsed
			 */
			build: function(type, data, template, postRender) {
				data = data || {};
				var typeTemplate, typePostRender;

				switch(type) {
					case "geo":
						data = _.extend({
							title: "Pick your country",
							options: [
								{value:"sv", name: "Sverige"},
								{value:"br", name: "Brazil"},
								{value:"us", name: "United States"}
							]
						}, data);

						typeTemplate = this.templates['select_one'];
						typePostRender = this.functions['select_one'];
						
						break;

					case "text":
						data = _.extend({
							title: "Pick your country",
							options: [
								{value:"sv", name: "Sverige"},
								{value:"br", name: "Brazil"},
								{value:"us", name: "United States"}
							]
						}, data);

						typeTemplate = this.templates['select_one'];
						typePostRender = this.functions['select_one'];
						
						break;

					case "regularList":
						data = _.extend({
							text: "Pick one",
							options: [
								{value:"", name: "Choose...", selected: true},
								{value:"1", name: "One"},
								{value:"2", name: "Two"},
								{value:"3", name: "Three"}
							]
						}, data);

						typeTemplate = this.templates['one_from_list'];
						typePostRender = this.functions['one_from_list'];

						break;

					case "regular":
					default:
						data = _.extend({
							text: "Pick one",
							options: [
								{value:"", name: "Choose...", selected: true},
								{value:"1", name: "One"},
								{value:"2", name: "Two"},
								{value:"3", name: "Three"}
							]
						}, data);

						typeTemplate = this.templates['select_one'];
						typePostRender = this.functions['select_one'];

						break;
				}
				//only use the type ones if user hasnt selected another
				if($.type(template) !== "string") {
					template = typeTemplate;
				}
				if($.type(postRender) !== "function") {
					postRender = typePostRender;
				}
				return {
					markup: this.parse(template, data),
					postRender: postRender
				}
			},
			templates: {
				
				html: "<div><%= text %></div>",

				select_one: "<h4><%= text %></h4>"+
						   "<div>"+
							   "<select class='form-control' id='picker_selector'>"+
							   "<% _.each(options, function(opt) { %>"+
							   		"<option value='<%= opt.value %>' "+
							   		"<%= (opt.selected) ? 'selected' : '' %>"+
							   		"><%= opt.name %></option>"+
							   	"<% }); %>"+
							   "</select>"+
						   "</div>",
				one_from_list: "<h4 align='center'><%= text %></h4>"+
						   "<div>"+
							   "<div id='picker_selector' class='btn-group-vertical' "+settings.selectable_attr+">"+
							   "<% _.each(options, function(opt) { %>"+
							   		"<button "+settings.value_attr+"='<%= opt.value %>' class='btn btn-default btn-block "+
							   		"<%= (opt.selected) ? 'active' : '' %>"+
							   		"'><%= opt.name %></button>"+
							   	"<% }); %>"+
							   "</div>"+
						   "</div>"

			},
			functions: {
				select_one: function(content) {
						content.find("#picker_selector").on("change",
						function() {
							var value = content.find("#picker_selector").val();
							events.trigger("onInteraction", value);
						});
					},
				one_from_list: function(content) {
					var list = content.find("#picker_selector");
					var buttons = list.find("button");
					buttons.each(function() {
						var button = $(this);
						button.on("click", function() {
							buttons.removeClass('active');
							button.addClass('active');
							var value = button.attr(settings.value_attr);
							list.attr(settings.selectable_attr, value);
							events.trigger("onInteraction", value);
						});
					});
				}
			}
		};

		//========= ADD SPECIFIC CONTECT ACCORDING TO THE TYPE ===========
		//content (public)
		_this.content = template.build(type, options.contentData, options.contentTemplate, options.contentScript);

		//pickerGeo			
		//pickerAge
		//pickerLanguage

		//================= OPEN PICKER ==================
		/* Method that actually displays our picker on screem */
		_this.show = function() {
			//beforeShow
			events.trigger('beforeShow');

			//create elements if they do not exist
			if(_.isUndefined(_this.elements)) {
				_this.elements = create_elements();

				//bind plugin events after elements are created
				bind_actions();

				//add actual content
				//at this point, the picker has a content placeholder
				var placeholder = _this.elements.content;
				placeholder.html(_this.content.markup);
				//execute the postRender function to this content
				if($.type(_this.content.postRender) === "function") {
					_this.content.postRender(placeholder);
				}
			}

			//display element
			_this.elements.element.css("display", "block");

			//position it correctly
			_this.elements.picker.css({
				"top": options.top,
				"right": options.right,
				"bottom": options.bottom,
				"left": options.left,
			});

			//center it in case it's a modal
			if(options.modal === true) {
				var picker_width = _this.elements.picker.outerWidth();
				var picker_height = _this.elements.picker.outerWidth();
				//but don't center if left or right are specified
				if(options.left === 'auto' & options.right === 'auto') {
					_this.elements.picker.css({
						"left": "50%",
						"margin-left": -(picker_width / 2) + "px",
					});
				}
			}

			//add actual content

			//make it visible
			_this.elements.element.addClass('visible');
			//afterShow
			events.trigger('afterShow');

		};

		/* Method that hides the picker */
		_this.hide = function() {
			if(_.isUndefined(_this.elements)) return;

			events.trigger('beforeHide');
            //make it invisible
			_this.elements.element.removeClass('visible');

			//trigger event only after a few ms to allow transition
			var wait_time = (options.transition === 'no-transition') ? 0 : 500;
			var i = setInterval(function() {
				_this.elements.element.css("display", "none");
				unbind_actions();
				events.trigger('afterHide');
				clearInterval(i);
			}, wait_time);
		} 

		/* Method that removes DOM elements */
        _this.clear = function () {
            //remove each created html
            _.each(_this.elements, function(element) {
            	element.remove();
            });
            _this.remove();
        };

		
		//==================== RENDERING FUNCTIONS ======================
		/*
		 * This creates the HTML markup and returns an object with the
		 * created elements, in the following format:
		 * {
		 * 		element: //points to the actual element created (parent)
		 * 		picker: //points to the picker - may be the same as element
		 * 		overlay: //points to the overlay, if there is one
		 * }
		 */
		function create_elements() {

			//remove if it already exists
			if(!options.allowDuplicates) {
				$("#" + id).remove();
			}

			var elements = {};
			var element, picker, overlay;

			/* add necessary html markup */
			var element = $("<div id='" + id + "'></div>").appendTo(options.container);
			//simple markup when it's static
			if (options.modal === true){
				element.addClass(settings.picker_modal_class);
				var picker = $("<div class='" + settings.picker_class + "'></div>").appendTo(element);
				var overlay = $("<div class='" + settings.picker_overlay_class + "'></div>").appendTo(element);


				/* make sure some CSS rules are met */
	            element.css({
	                "position": "fixed",
	                "z-index": settings.zindex,
	                "top": "0px",
	                "left": "0px",
	                "bottom": "0px",
	                "right": "0px",
	                "height": "100%",
	                "width": "100%",
	                "overflow-y": "auto",
	                "overflow-x" : "hidden"
	            });

	            overlay.css({
	                "position": "fixed",
	                "z-index": settings.zindex + 1,
	                "top": "0px",
	                "left": "0px",
	                "bottom": "0px",
	                "right": "0px",
	                "height": "100%",
	                "width": "100%"
	            });

	            picker.css({
	                "position": "absolute",
	                "z-index": settings.zindex + 2
	            });

	            elements.element = element;
	            elements.overlay = overlay;
	            elements.picker = picker;

			} else {
				element.addClass(settings.picker_class);
				element.addClass(settings.picker_static_class);

				element.css({
	                "position": "absolute",
	                "z-index": settings.zindex + 2
	            });

				elements.element = elements.picker = element;
			}

			if(options.draggable) {
				elements.element.addClass(settings.picker_draggable_class);
			}

			/* handle specific width */
			var css_properties = ['width', 'height', 'top', 'left', 'bottom', 'right']
			for (var i = css_properties.length - 1; i >= 0; i--) {
				var prop = css_properties[i];
				if($.type(options[prop]) !== 'undefined' && $.type(options[prop]) !== 'null' && options[prop] !== 'auto') {
					elements.picker.css(prop, options[prop]);
				}
			};

			/* add extra classes if there are some */
			if($.type(options.extraClass) === 'array') {
				for (var i = options.extraClass.length - 1; i >= 0; i--) {
					var newClass = options.extraClass[i];
					elements.picker.addClass(newClass);
				};
			} else if($.type(options.extraClass) === 'string') {
				elements.picker.addClass(options.extraClass);
			}

			/* adds transitions if there is one */
			if(options.transition) {
				elements.picker.addClass(options.transition);
				elements.element.addClass(options.transition);
			}

			/*adds close button if there is one*/
			if(options.closeButton) {
				var close_button = $("<div class='"+settings.close_button_class+"' "+settings.picker_close_attr+">&times;</div>").appendTo(elements.picker);
				elements.close_button = close_button;
			}

			/*adds content container*/
			var content_placeholder = $("<div class='"+settings.content_class+"'></div>").appendTo(elements.picker);
				elements.content = content_placeholder;

			/*adds confirmation button if there is one*/
			if(options.confirmButton === true || $.type(options.confirmButton) === 'string') {
				var text = ($.type(options.confirmButton) === 'string') ? options.confirmButton : "OK";
				var confirm_button = $("<div class='"+settings.picker_footer_class+"'><button class='btn btn-default "+settings.ok_button_class+"' "+settings.picker_ok_attr+">"+text+"</button></div>").appendTo(elements.picker);
				elements.confirm_button = confirm_button;
			}

			return elements;
		}

		function bind_actions() {

			var elements = _this.elements;
			if(elements === undefined) return;

        	if($.type(elements.overlay) !== 'undefined' && options.clickOverlay) {
        		elements.overlay.click(function() {
        			_this.hide();
        		});
        	}
        	//when you click a close button (any)
        	$(elements.picker).find('['+settings.picker_close_attr+']').click(function() {
        		_this.hide();
        	});
        	//when you click an OK button (any)
        	$(elements.picker).find('['+settings.picker_ok_attr+']').click(function() {
        		var values = retrieve_values();
        		events.trigger("onSet", values);
        		_this.hide();
        	});
        	if(options.draggable === true) {
        		elements.picker.draggable({
        			zindex: settings.zindex + 2
        		});
        	}
        }

        function unbind_actions() {

        }

        function retrieve_values() {
        	var values = {};
        	_this.elements.content.find("select, input, textarea, ["+settings.selectable_attr+"]").each(function() {

        		var value;
        		var selectable = $(this).attr(settings.selectable_attr);
        		if($.type(selectable) !== 'undefined' && selectable !== false) {
        			value = selectable;
        		} else {
        			value = $(this).val();
        		}

        		var name = $(this).attr("name") || $(this).attr("id") || $(this).prop("tagName");
        		values[name] = value;
        	});
        	return values;
        }

		//===================== HELPFUL FUNCTIONS ======================

		function throw_msg (msg) {
			console.log("Picker: "+msg);
		}

		//================= BIND EACH USER DEFINED EVENT =================

		var possible_events = [
			'beforeShow',
			'afterShow',
			'beforeHide',
			'afterHide',
			'onInteraction',
			'onSet'
		];

		for (var i = possible_events.length - 1; i >= 0; i--) {
			var evt = possible_events[i];
			if($.type(options[evt]) === "function") {
				events.bind(evt, options[evt]);
			}
		};

		return _this;
	};

	//drag support
	$.fn.draggable = function(opt) {
        opt = $.extend({
        	handle:"",
        	zindex: 9999
        }, opt);
        if(opt.handle === "") {
            var $el = this;
        } else {
            var $el = this.find(opt.handle);
        }
        return $el.on("mousedown", function(e) {
            if(opt.handle === "") {
                var $drag = $(this).addClass('draggable');
            } else {
                var $drag = $(this).addClass('active-handle').parent().addClass('draggable');
            }
            var z_idx = $drag.css('z-index'),
                drg_h = $drag.outerHeight(),
                drg_w = $drag.outerWidth(),
                pos_y = $drag.offset().top + drg_h - e.pageY,
                pos_x = $drag.offset().left + drg_w - e.pageX;
            $drag.css('z-index', opt.zindex).parents().on("mousemove", function(e) {
                $('.draggable').offset({
                    top:e.pageY + pos_y - drg_h,
                    left:e.pageX + pos_x - drg_w
                }).on("mouseup", function() {
                    $(this).removeClass('draggable').css('z-index', z_idx);
                });
            });
            e.preventDefault(); // disable selection
        }).on("mouseup", function() {
            if(opt.handle === "") {
                $(this).removeClass('draggable');
            } else {
                $(this).removeClass('active-handle').parent().removeClass('draggable');
            }
        });
    };
    //end of drag support

	return Picker;
}));