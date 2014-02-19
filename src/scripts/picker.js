

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
				close_button_class: 'picker-close-button',
				//types of pickers
				possible_types: ['regular', 'geo'],
				default_type: 'regular',
				//possible transitions
                possible_transitions: ['none', 'fade', 'slide', 'slideUp'],
                default_transition: 'none',
				//useful html attributes
                picker_close_attr: 'data-picker-close',
                picker_okay_attr: 'data-picker-ok',
			}; 

			/* default options */
			var defaults = {
				//position
				top: 'auto',
				left: 'auto',
				bottom: 'auto',
				right: 'auto',

				//sizes
				width: '95%',
				height: 'auto',

				//visual properties
				extraClass: [],
				transition: 'slide',
				//container may only be changed if static = true
				container: 'body',

				//optional features
				closeButton: false,
                closeEsc: true,
                clickOverlay: true, //only makes sense with modal true
                modal: true,
                draggable: false,
                static: false,

                //events
                beforeOpen: null,
            	afterOpen: null,
             	beforeClose: null,
             	afterClose: null,
             	onChange: null
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
					else {
						if($.isFunction(func)) {
							this.events[name].push(func);
						} else {
							throw_msg("Can't bind '"+func+"' to event '"+name+"'. It must be a function!");
						}
					}
				},
				trigger: function(name) {
					for (var i = 0, size=this.events[name].length; i < size; i++) {
						var f = this.events[name][i];
						if($.isFunction(f)) {
							f();
						} else {
							throw_msg("Can't execute '"+func+"' on event '"+name+"'. It must be a function!");
						}
					};
				}
			};

			//================= BIND EACH USER DEFINED EVENT =================

			events.bind('beforeOpen', options.beforeOpen);
			events.bind('afterOpen', options.afterOpen);
			events.bind('beforeClose', options.beforeClose);
			events.bind('afterClose', options.afterClose);
			events.bind('onChange', options.onChange);

			//================= BIND PLUGIN EVENTS =================

			events.bind('beforeOpen', bind_keys);
			events.bind('afterClose', unbind_keys);

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

			//========= ADD SPECIFIC CONTECT ACCORDING TO THE TYPE ===========

			//pickerGeo
			//pickerAge
			//pickerLanguage

			//============= OPEN THE PICKER (MAKE IT VISIBLE) ================
            
			open_picker(elements);



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
				$("#" + id).remove();

				var elements = {};

				/* add necessary html markup */
				var element = $("<div id='" + id + "'></div>").appendTo(options.container);
				//simple markup when it's static
				if (options.modal === true){
					element.addClass(settings.picker_modal_class);
					var picker = $("<div class='" + settings.picker_class + "'></div>").appendTo(element);
					var overlay = $("<div class='" + settings.picker_overlay_class + "'></div>").appendTo(element);

					/* make sure the modal has a fixed wrapper */
		            element.css({
		                "position": "fixed",
		                "z-index": 9998,
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
		                "z-index": 9999,
		                "top": "0px",
		                "left": "0px",
		                "bottom": "0px",
		                "right": "0px",
		                "height": "100%",
		                "width": "100%"
		            });

		            elements.element = element;
		            elements.overlay = overlay;
		            elements.picker = picker;

				} else {
					element.addClass(settings.picker_class);
					element.addClass(settings.picker_static_class);

					elements.element = element;
					elements.picker = element;
				}

				if(options.draggable) {
					element.addClass(picker_draggable_class);
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
					elements.element.addClass(options.transition);
				}

				return elements;
			}

			/* Method that actually displays our picker on screem */
			function open_picker(elements) {

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

				events.trigger('afterClose');
                
			} 
            
            /* Method that removes DOM elements */
            function remove_picker() {
                //remove each created html
                for(i in elements) {
                	elements[i].remove();
                }
                events.trigger('afterClose');
            }

            function bind_keys() {
            	throw_msg("BINDING KEYYYYS");
            }

            function unbind_keys() {
            	throw_msg("UNBINDING KEYYYYS");
            }

			/* Method that handles key events (ESC key only for now) 
			function bind_keys(e) {
				var code = (e.keyCode ? e.keyCode : e.which);
				//Esc keycode = 27
				if (options.closeEsc === true && code == 27) {
					close_modal();
				}
				//ENTER keycode = 13
                if(options.clickEnter !== false && code == 13) {
                    var enterBtn = false;
                    switch(options.clickEnter) {
                        case true:
                            enterBtn = modal.find("button[type='submit']:last");
                            break;
                        case 'first':
                            enterBtn = modal.find("button:first");
                            break;
                        case 'last':
                            enterBtn = modal.find("button:last");
                            break;
                        default:
                            enterBtn = modal.find(options.enterButton);
                            break;
                    }
                    enterBtn.click();
                    //avoid multiple Enter hits
                    options.clickEnter = null;
                }
			} */

			/* Method that determines what to do with close button 
			function close_button() {
				if (options.closeButton === true) {
					modal.prepend("<button type='button' class='" + definitions.close_button + "'>&times;</button>");
					modal.find("." + definitions.close_button).unbind('click');
					modal.find("." + definitions.close_button).bind('click', close_modal);
				}
			}*/
			
		}
	});
})(jQuery);