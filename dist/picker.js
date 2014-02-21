

(function($) {

	$.extend({

		/*
		 * When calling picker, a type is needed and the id of the new element
		 */

		picker: function(type, id, options) { 

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
				width: 'auto',
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

                //events
                beforeOpen: undefined,
            	afterOpen: undefined,
             	beforeClose: undefined,
             	afterClose: undefined,
             	onInteraction: undefined,
             	onSet: undefined,

             	//personalized content
       			contentData: undefined,
       			contentTemplate: undefined,
       			contentScript: undefined,
			};

			//options
			options = $.extend(defaults, options); 

			//================= OPERATED LOCAL EVENTS =====================

			var events = {
				events: {}, //holds each event, identified by name
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

			//================= BIND EACH USER DEFINED EVENT =================

			var possible_events = [
				'beforeOpen',
				'afterOpen',
				'beforeClose',
				'afterClose',
				'onInteraction',
				'onSet'
			];

			for (var i = possible_events.length - 1; i >= 0; i--) {
				var evt = possible_events[i];
				if($.type(options[evt]) === "function") {
					events.bind(evt, options[evt]);
				}
			};

			//================= BIND PLUGIN EVENTS =================

			events.bind('beforeOpen', bind_actions);
			events.bind('afterClose', unbind_actions);
			events.bind('afterClose', remove_picker);

			//================= CHECKING VALID PROPERTIES ====================

			//if type is not supported
			if(settings.possible_types.indexOf(type) === -1) {
				throw_msg("Type not supported. Switching to '"+settings.default_type+"'");
				type = settings.default_type;
			}
			//if transition is not supported
			if(settings.possible_transitions.indexOf(options.transition) === -1) {
				throw_msg("Transition not supported. Switching to '"+settings.default_transition+"'");
				options.transition = settings.default_transition;
			}
			//check if container exists
			if($(options.container).length < 1) {
				throw_msg("Selected container '"+options.container+"' does not exist. Switching to 'body'");
				options.container = 'body'; 
			}

			//================= CREATE ACTUAL HTML ELEMENTS ==================

			var elements = create_elements();

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

						case "regularList":
							data = _.extend({
								title: "Pick one",
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
								title: "Pick one",
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
					select_one: "<h4><%= title %></h4>"+
							   "<div>"+
								   "<select class='form-control' id='picker_selector'>"+
								   "<% _.each(options, function(opt) { %>"+
								   		"<option value='<%= opt.value %>' "+
								   		"<%= (opt.selected) ? 'selected' : '' %>"+
								   		"><%= opt.name %></option>"+
								   	"<% }); %>"+
								   "</select>"+
							   "</div>",
					one_from_list: "<h4 align='center'><%= title %></h4>"+
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

			}

			//========= ADD SPECIFIC CONTECT ACCORDING TO THE TYPE ===========

			var new_content = template.build(type, options.contentData, options.contentTemplate, options.contentScript);

			//at this point, the picker has a content placeholder
			elements.content.html(new_content.markup);
			//execute the postRender function to this content
			if($.type(new_content.postRender) === "function") {
				new_content.postRender(elements.content);
			}

			//pickerGeo			
			//pickerAge
			//pickerLanguage

			//============= OPEN THE PICKER (MAKE IT VISIBLE) ================
            
			open_picker();



			//===================== HELPFUL FUNCTIONS ======================

			function throw_msg (msg) {
				console.log("Picker: "+msg);
			}

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

			/* Method that actually displays our picker on screem */
			function open_picker() {

				//beforeOpen
				events.trigger('beforeOpen');
				//position it correctly
				elements.picker.css({
					"top": options.top,
					"right": options.right,
					"bottom": options.bottom,
					"left": options.left,
				});

				//center it in case it's a modal
				if(options.modal === true) {
					var picker_width = elements.picker.outerWidth();
					var picker_height = elements.picker.outerWidth();
					//but don't center if left or right are specified
					if(options.left === 'auto' & options.right === 'auto') {
						elements.picker.css({
							"left": "50%",
							"margin-left": -(picker_width / 2) + "px",
						});
					}
				}

				//make it visible
				elements.element.addClass('visible');
				//afterOpen
				events.trigger('afterOpen');

			} 

			/* Method that closes the picker */
			function close_picker() {

				events.trigger('beforeClose');
                //make it invisible
				elements.element.removeClass('visible');


				//trigger event only after a few ms to allow transition

				var wait_time = (options.transition === 'no-transition') ? 0 : 500;

				var i = setInterval(function() {
					events.trigger('afterClose');
					clearInterval(i);
				}, wait_time);
			} 
            
            /* Method that removes DOM elements */
            function remove_picker() {
                //remove each created html
                for(i in elements) {
                	elements[i].remove();
                }
            }

            function bind_actions() {
            	if($.type(elements.overlay) !== 'undefined' && options.clickOverlay) {
            		elements.overlay.click(function() {
            			close_picker();
            		});
            	}

            	//when you click a close button (any)
            	$(elements.picker).find('['+settings.picker_close_attr+']').click(function() {
            		close_picker();
            	});

            	//when you click an OK button (any)
            	$(elements.picker).find('['+settings.picker_ok_attr+']').click(function() {
            		var values = retrieve_values();
            		events.trigger("onSet", values);
            		close_picker();
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
            	elements.content.find("select, input, textarea, ["+settings.selectable_attr+"]").each(function() {

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

		}
	});

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


})(jQuery);