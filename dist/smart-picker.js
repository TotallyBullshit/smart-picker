//	Smart Picker 1.0.0
//  (c) 2014 Gapminder Foundation

//encapsulating smartPickers
(function(root, factory) {
  //support for AMD modules
  if (typeof define === 'function' && define.amd) {
    define(['underscore', 'jquery'], function(_, $) {
    	//if using AMD module, do not export as global
        var smartPicker = factory(root, _, $);
        return smartPicker;
    });
  } 
  else {
  	//if there's no support, export as global
    root.smartPicker = factory(root, root._, (root.jQuery || root.Zepto || root.$));
  }

}(this, function(root, _, $) {

	//actual picker plugin
	var smartPicker = function(type, id, options) {

		var _this = this; //save local pointer

		_this.type = type;
		_this.id = id;
		_this.options = options;
		_this.state = {};

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
			possible_types: ['regular', 'regularList', 'geo', 'geoMult'],
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
            beforeShow: undefined,
        	afterShow: undefined,
         	beforeHide: undefined,
         	afterHide: undefined,
         	onInteraction: undefined,
         	onSet: undefined,

         	//personalized content
         	initialValue: undefined,
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

		var dataMan = {
			countries: [
		        {value: "AFG", name: "Afghanistan"},
		        {value: "ALB", name: "Albania"},
		        {value: "DZA", name: "Algeria"},
		        {value: "AGO", name: "Angola"},
		        {value: "ARG", name: "Argentina"},
		        {value: "ARM", name: "Armenia"},
		        {value: "AUS", name: "Australia"},
		        {value: "AUT", name: "Austria"},
		        {value: "AZE", name: "Azerbaijan"},
		        {value: "BHS", name: "Bahamas"},
		        {value: "BGD", name: "Bangladesh"},
		        {value: "BRB", name: "Barbados"},
		        {value: "BLR", name: "Belarus"},
		        {value: "BEL", name: "Belgium"},
		        {value: "BEN", name: "Benin"},
		        {value: "BOL", name: "Bolivia"},
		        {value: "BWA", name: "Botswana"},
		        {value: "BRA", name: "Brazil"},
		        {value: "BGR", name: "Bulgaria"},
		        {value: "BFA", name: "Burkina Faso"},
		        {value: "BDI", name: "Burundi"},
		        {value: "KHM", name: "Cambodia"},
		        {value: "CMR", name: "Cameroon"},
		        {value: "CAN", name: "Canada"},
		        {value: "CAF", name: "Central African Republic"},
		        {value: "TCD", name: "Chad"},
		        {value: "CHL", name: "Chile"},
		        {value: "CHN", name: "China"},
		        {value: "COL", name: "Colombia"},
		        {value: "COM", name: "Comoros"},
		        {value: "COD", name: "Congo [DRC]"},
		        {value: "COG", name: "Congo [Republic]"},
		        {value: "CRI", name: "Costa Rica"},
		        {value: "HRV", name: "Croatia"},
		        {value: "CUB", name: "Cuba"},
		        {value: "CZE", name: "Czech Republic"},
		        {value: "DNK", name: "Denmark"},
		        {value: "DJI", name: "Djibouti"},
		        {value: "DOM", name: "Dominican Republic"},
		        {value: "ECU", name: "Ecuador"},
		        {value: "EGY", name: "Egypt"},
		        {value: "SLV", name: "El Salvador"},
		        {value: "EST", name: "Estonia"},
		        {value: "ETH", name: "Ethiopia"},
		        {value: "FJI", name: "Fiji"},
		        {value: "FIN", name: "Finland"},
		        {value: "FRA", name: "France"},
		        {value: "GAB", name: "Gabon"},
		        {value: "GMB", name: "Gambia"},
		        {value: "GEO", name: "Georgia"},
		        {value: "DEU", name: "Germany"},
		        {value: "GHA", name: "Ghana"},
		        {value: "GRC", name: "Greece"},
		        {value: "GTM", name: "Guatemala"},
		        {value: "GIN", name: "Guinea"},
		        {value: "GNB", name: "Guinea-Bissau"},
		        {value: "GUY", name: "Guyana"},
		        {value: "HTI", name: "Haiti"},
		        {value: "HND", name: "Honduras"},
		        {value: "HKG", name: "Hong Kong"},
		        {value: "HUN", name: "Hungary"},
		        {value: "IND", name: "India"},
		        {value: "IDN", name: "Indonesia"},
		        {value: "IRN", name: "Iran"},
		        {value: "IRQ", name: "Iraq"},
		        {value: "IRL", name: "Ireland"},
		        {value: "ISR", name: "Israel"},
		        {value: "ITA", name: "Italy"},
		        {value: "CIV", name: "Ivory Coast"},
		        {value: "JAM", name: "Jamaica"},
		        {value: "JPN", name: "Japan"},
		        {value: "JOR", name: "Jordan"},
		        {value: "KAZ", name: "Kazakhstan"},
		        {value: "KEN", name: "Kenya"},
		        {value: "KGZ", name: "Kyrgyzstan"},
		        {value: "LAO", name: "Laos"},
		        {value: "LVA", name: "Latvia"},
		        {value: "LBN", name: "Lebanon"},
		        {value: "LSO", name: "Lesotho"},
		        {value: "LTU", name: "Lithuania"},
		        {value: "LUX", name: "Luxembourg"},
		        {value: "MKD", name: "Macedonia [FYROM]"},
		        {value: "MDG", name: "Madagascar"},
		        {value: "MWI", name: "Malawi"},
		        {value: "MYS", name: "Malaysia"},
		        {value: "MLI", name: "Mali"},
		        {value: "MRT", name: "Mauritania"},
		        {value: "MUS", name: "Mauritius"},
		        {value: "MEX", name: "Mexico"},
		        {value: "MDA", name: "Moldova"},
		        {value: "MNG", name: "Mongolia"},
		        {value: "MAR", name: "Morocco"},
		        {value: "MOZ", name: "Mozambique"},
		        {value: "MMR", name: "Myanmar [Burma]"},
		        {value: "NAM", name: "Namibia"},
		        {value: "NPL", name: "Nepal"},
		        {value: "NLD", name: "Netherlands"},
		        {value: "NZL", name: "New Zealand"},
		        {value: "NIC", name: "Nicaragua"},
		        {value: "NER", name: "Niger"},
		        {value: "NGA", name: "Nigeria"},
		        {value: "NOR", name: "Norway"},
		        {value: "PAK", name: "Pakistan"},
		        {value: "PAN", name: "Panama"},
		        {value: "PNG", name: "Papua New Guinea"},
		        {value: "PRY", name: "Paraguay"},
		        {value: "PER", name: "Peru"},
		        {value: "PHL", name: "Philippines"},
		        {value: "POL", name: "Poland"},
		        {value: "PRT", name: "Portugal"},
		        {value: "PRI", name: "Puerto Rico"},
		        {value: "ROU", name: "Romania"},
		        {value: "RUS", name: "Russia"},
		        {value: "RWA", name: "Rwanda"},
		        {value: "SEN", name: "Senegal"},
		        {value: "SRB", name: "Serbia"},
		        {value: "SYC", name: "Seychelles"},
		        {value: "SLE", name: "Sierra Leone"},
		        {value: "SGP", name: "Singapore"},
		        {value: "SVK", name: "Slovakia"},
		        {value: "SVN", name: "Slovenia"},
		        {value: "SOM", name: "Somalia"},
		        {value: "ZAF", name: "South Africa"},
		        {value: "KOR", name: "South Korea"},
		        {value: "ESP", name: "Spain"},
		        {value: "LKA", name: "Sri Lanka"},
		        {value: "SDN", name: "Sudan"},
		        {value: "SUR", name: "Suriname"},
		        {value: "SWE", name: "Sweden"},
		        {value: "CHE", name: "Switzerland"},
		        {value: "SYR", name: "Syria"},
		        {value: "TWN", name: "Taiwan"},
		        {value: "TJK", name: "Tajikistan"},
		        {value: "TZA", name: "Tanzania"},
		        {value: "THA", name: "Thailand"},
		        {value: "TGO", name: "Togo"},
		        {value: "TTO", name: "Trinidad and Tobago"},
		        {value: "TUN", name: "Tunisia"},
		        {value: "TUR", name: "Turkey"},
		        {value: "TKM", name: "Turkmenistan"},
		        {value: "UGA", name: "Uganda"},
		        {value: "UKR", name: "Ukraine"},
		        {value: "GBR", name: "United Kingdom"},
		        {value: "USA", name: "United States"},
		        {value: "URY", name: "Uruguay"},
		        {value: "UZB", name: "Uzbekistan"},
		        {value: "VEN", name: "Venezuela"},
		        {value: "VNM", name: "Vietnam"},
		        {value: "YEM", name: "Yemen"},
		        {value: "ZMB", name: "Zambia"},
		        {value: "ZWE", name: "Zimbabwe"}
		    ]

		}

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
			 * - data is an object (e.g: { title: "smartPicker"} )
			 * - template is an underscore template
			 * - apply is a function to be executed after the template
			 *   is parsed
			 */
			build: function(type, data, template, postRender, initialValue) {
				data = data || {};
				var typeTemplate, typePostRender;

				switch(type) {
					case "geo":
						data = _.extend({
							text: "Pick your country",
							options: dataMan.countries
						}, data);

						typeTemplate = this.templates['select_one'];
						typePostRender = this.functions['select_one'];
						
						break;

					case "geoMult":

						var opts = dataMan.countries;
						if(initialValue && _.isArray(initialValue)) {
							var initial = initialValue;
							var selected = [];
							_.each(opts, function(country) {
								if(_.indexOf(initial, country.value) !== -1) {
									country.selected = true;
									selected.push(country);
								} else {
									//unselect if it's not in the initial state
									country.selected = false;
								}
							});
							set_state(selected);
						}

						data = _.extend({
							text: "Pick your countries",
							options: opts
						}, data);

						typeTemplate = this.templates['select_mult'];
						typePostRender = this.functions['select_mult'];
						
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
				select_mult: "<h4><%= text %></h4>"+
						   "<div>"+
							   "<select id='picker_selector' class='form-control' multiple='multiple'>"+
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
						set_state(value);
						events.trigger("onInteraction", get_state());
					});
				},
				select_mult: function(content) {
					var selectEl = content.find("#picker_selector");
					selectMult(selectEl, {
						onChange: function(selected) {
							set_state(selected);
							events.trigger("onInteraction", get_state());
						},
						onOpen: function() {
							unbind_overlay_click();
						},
						onClose: function() {
							bind_overlay_click();
						}
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
							set_state(value);
							events.trigger("onInteraction", get_state());
						});
					});
				}
			}
		};

		//========= ADD SPECIFIC CONTECT ACCORDING TO THE TYPE ===========
		//content (public)
		_this.content = template.build(type, options.contentData, options.contentTemplate, options.contentScript, options.initialValue);

		//pickerGeo			
		//pickerAge
		//pickerLanguage

		//================= OPEN PICKER ==================
		/* Method that actually displays our picker on screem */
		_this.show = function() {
			//beforeShow
			events.trigger('beforeShow');

			_this.bindElements();

			//display element
			_this.elements.element.css("display", "block");

			//position it correctly
			var minTop, maxTop, minLeft, maxLeft, minBottom, maxBottom, minRight, maxRight;
			if(options.modal === true) {
				minTop = minBottom = 0;
				minLeft = minRight = _this.elements.picker.outerWidth() / 2;
				maxTop = maxBottom = $(window).outerHeight() - _this.elements.picker.outerHeight();
				maxLeft = maxRight = $(window).outerWidth() - _this.elements.picker.outerWidth() + minLeft;

			} else {
				minTop = minLeft = minBottom = minRight = 0;
				maxTop = maxBottom = $(document).outerHeight() - _this.elements.picker.outerHeight();
				maxLeft = maxRight = $(document).outerWidth() - _this.elements.picker.outerWidth();
			}

			var posTop = (options.top === "auto") ? options.top : ((options.top > maxTop) ? maxTop : ((options.top < minTop) ? minTop : options.top));
			var posLeft = (options.left === "auto") ? options.left : ((options.left > maxLeft) ? maxLeft : ((options.left < minLeft) ? minLeft : options.left));
			var posRight = (options.right === "auto") ? options.right : ((options.right > maxRight) ? maxRight : ((options.right < minRight) ? minRight : options.right));
			var posBottom = (options.bottom === "auto") ? options.bottom : ((options.bottom > maxBottom) ? maxBottom : ((options.bottom < minBottom) ? minBottom : options.bottom));

			_this.elements.picker.css({
				"top": posTop,
				"right": posRight,
				"bottom": posBottom,
				"left": posLeft,
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

		_this.bindElements = function() {
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
		}

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
            $("#" + _this.id).remove();
            _.each(_this.elements, function(element) {
            	element.remove();
            });
            _this.elements = undefined;
        };

        /* reset initial value */
        _this.resetValue = function(newValue) {
        	_this.clear();
        	options.initialValue = newValue;
        	_this.content = template.template(type, options.contentData, options.contentTemplate, options.contentScript, options.initialValue);
        };

        _this.onSet = function() {
        	var values = get_state();
        	events.trigger("onSet", values);
        };

        _this.onInteraction = function() {
        	var values = get_state();
        	events.trigger("onInteraction", values);
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
	                "z-index": Math.round(settings.zindex/2)
	            });

				elements.element = elements.picker = element;
			}

			if(options.draggable) {
				elements.element.addClass(settings.picker_draggable_class);
			}

			/* handle specific width */
			var css_properties = ['width', 'height']; //, 'top', 'left', 'bottom', 'right'
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

		function unbind_overlay_click() {
			var elements = _this.elements;
			if(elements === undefined) return;

			if($.type(elements.overlay) !== 'undefined' && options.clickOverlay) {
        		elements.overlay.unbind('click');
        	}
		}

		function bind_overlay_click() {
			var elements = _this.elements;
			if(elements === undefined) return;
			if($.type(elements.overlay) !== 'undefined' && options.clickOverlay) {
        		elements.overlay.bind('click', function() {
        			_this.hide();
        		});
        	}
		}

		function bind_actions() {

			var elements = _this.elements;
			if(elements === undefined) return;

			//bind overlay clicking
        	bind_overlay_click();

        	//when you click a close button (any)
        	$(elements.picker).find('['+settings.picker_close_attr+']').click(function() {
        		_this.hide();
        	});
        	//when you click an OK button (any)
        	$(elements.picker).find('['+settings.picker_ok_attr+']').click(function() {
        		var values = get_state();
        		events.trigger("onSet", values);
        		_this.hide();
        	});
        	if(options.draggable === true) {
        		turn_draggable(elements.picker);
        	}
        }

        function unbind_actions() {

        }

        function format_state(state) {
        	return { selected: state };
        }

        function set_state(state) {
        	_this.state = { selected: state };
        }

        function get_state(state) {
        	return _this.state;
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
			console.log("smartPicker: "+msg);
		}

		function turn_draggable(element) {
			var offset = null;
			//start dragging
			var startDrag = function(event) {
				var orig = event.originalEvent;
			    var pos = element.position();

			    if(orig.changedTouches) {
				    offset = {
				      x: orig.changedTouches[0].pageX - pos.left,
				      y: orig.changedTouches[0].pageY - pos.top
				    };
				} else {
					offset = {
				      x: orig.pageX - pos.left,
				      y: orig.pageY - pos.top
				    };
				}
				$(document).bind("touchmove mousemove", moveDrag);
				$(document).bind("touchend touchcancel mouseup", endDrag);
				element.children().bind("touchend touchcancel mouseup change", endDrag);
			};
			//start moving
			var moveDrag = function(event) {
			    event.preventDefault();
			    var orig = event.originalEvent;
			    var newTop, newLeft;
			    if(orig.changedTouches) {
				   newTop = orig.changedTouches[0].pageY - offset.y;
				   newLeft = orig.changedTouches[0].pageX - offset.x;
			    } else {
					newTop = orig.pageY - offset.y;
				    newLeft = orig.pageX - offset.x;
				}
				//adjust max positions
				if(!element.hasClass(settings.picker_static_class)) {
					var maxTop = $(window).outerHeight() - element.outerHeight(),
						maxLeft = $(window).outerWidth() - element.outerWidth() + element.outerWidth() / 2,
						minTop = 0,
						minLeft = element.outerWidth() / 2;
				} else {
					var maxTop = $(document).outerHeight() - element.outerHeight(),
						maxLeft = $(document).outerWidth() - element.outerWidth(),
						minTop = 0,
						minLeft = 0;
				}
				newTop = (newTop > maxTop) ? maxTop : newTop;
				newLeft = (newLeft > maxLeft) ? maxLeft : newLeft;
				newTop = (newTop < minTop) ? minTop : newTop;
				newLeft = (newLeft < minLeft) ? minLeft : newLeft;
				//apply positions
				element.css({
			      top: newTop,
			      left: newLeft
			    });

			    options.top = newTop;
			    options.left = newLeft;
			    options.bottom = 'auto';
			    options.right = 'auto';
		  	};
		  	//stop listening to mouse move
		  	var endDrag = function(event) {
		  		$(document).unbind("touchmove mousemove");
				$(document).unbind("touchend touchcancel mouseup");
				element.children().unbind("touchend touchcancel mouseup");
		  	}

			element.bind("touchstart mousedown", startDrag);
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

	return smartPicker;

	//================= HELPER FUNCTIONS =================

	// selectMult
	// This could even be a separate jQuery plugin, if we want to (possibly 
	// useful for developers as a different project)

	function selectMult(target, options) {   
        var selectMultOrig = $(target);
        //check if its a valid select
        if(selectMultOrig.prop("tagName").toLowerCase() !== "select") {
            return;
        }
        
        //settings
        var main_class = "select-mult";
        var prefix = main_class + "-";
        var settings = {
            class_selected: prefix + "selected",
            class_popup: prefix + "popup",
            class_popup_visible: prefix + "open",
            class_search_wrapper: prefix + "search-wrapper",
            class_search: prefix + "search",
            class_options_wrapper: prefix + "options-wrapper",
            class_option: prefix + "option",
            class_option_checked: prefix + "option-checked",
            class_wrap_selected: prefix + "wrap",
            class_mobile: prefix + "mobile",
        };
        
        //options
        var defaults = {
            maxDisplay: 3,
            onChange: null,
            onOpen: null,
            onClose: null
        };
        
        options = $.extend(defaults, options);
        
        var model = modelFromSelect();
        
        var orig_id = selectMultOrig.attr("id"),
            orig_class = selectMultOrig.attr("class"),
            search_text = "Search...";
        
        //template for new element that replaces the picker
        var newDiv = $("<div id='"+orig_id+"' class='"+orig_class+" "+main_class+"'>"+
                           "<div class='"+settings.class_selected+"'>"+
                               "<span class='"+settings.class_wrap_selected+"'>"+
                                   search_text +
                               "</span>"+
                           "</div>"+
                           "<div class='"+settings.class_popup+"'>"+
                               "<div class='"+settings.class_search_wrapper+"'>"+
                                   "<input type='text' class='"+settings.class_search+"' placeholder=''/>"+
                               "</div>"+
                               "<div class='"+settings.class_options_wrapper+"'></div>"+
                           "</div>"+
                       "</div>");
        
        selectMultOrig.after(newDiv);
        var selectMult = newDiv;
        
        var select_placeholder = selectMult.find("."+settings.class_selected);
        var select_placeholder_text = selectMult.find("."+settings.class_wrap_selected);
        var select_popup = selectMult.find("."+settings.class_popup);
        var select_popup_search = selectMult.find("."+settings.class_search);
        var select_popup_options = selectMult.find("."+settings.class_options_wrapper);
        
        selectMultOrig.addClass(main_class);
        selectMultOrig.addClass(settings.class_mobile);
        selectMult.removeClass('form-control');
        
        selectMultOrig.on('change', function() {
            model = modelFromValues(selectMultOrig.val());
            reset();
            
            //onChangeCallback
            if($.isFunction(options.onChange)) {
                options.onChange(getValues());
            }
        });
        
        reset();
        
        $('html').click(function() {
            closeSelect();
        });
        
        selectMult.click(function(e){
            event.stopPropagation();
        });
        
        select_placeholder.click(function() {
            openSelect();   
        });
        
        select_popup_search.keyup(function() {
            filterSelect();
        });

        //reset all options and placeholder based on model        
        function reset() {
            setOptions(model);
            updatePlaceholder();
        }
        
        //extract model from select element
        function modelFromSelect() {
            var new_model = [];
            selectMultOrig.find("option").each(function() {
                var opt = $(this);
                    var option_text = opt.text(),
                        option_value = opt.attr('value'),
                        option_selected = (opt.attr('selected') == "selected") ? true : false;
                var opt_obj = {
                    text: option_text,
                    value: option_value,
                    selected: option_selected
                };
                new_model.push(opt_obj);
            });
            return new_model;
        }
        
        //extract model from values
        function modelFromValues(values) {
            var new_model = [];
            for(var i=0, size=model.length; i<size; i++){
                var option = model[i];
                option.selected = (values.indexOf(model[i].value) === -1) ? false : true;
                new_model.push(option);
            }
            return new_model;
        }
        
        //opens the fake select
        function openSelect() {
            select_popup_search.val('');
            filterSelect();
            updatePlaceholder();
            select_popup.addClass(settings.class_popup_visible);
            select_popup_search.focus();
            
            //onOpen Callback
            if($.isFunction(options.onOpen)) {
                options.onOpen(getValues());
            }
        }
        
        //closes the fake select
        function closeSelect() {
            select_popup_search.blur();
            select_popup.removeClass(settings.class_popup_visible);
            updatePlaceholder();
            
            //onClose Callback
            if($.isFunction(options.onClose)) {
                options.onClose(getValues());
            }
        }
        
        //apply model a certain model
        function setOptions(options) {
            select_popup_options.html('');
            for(var i=0, size=options.length; i<size; i++){
                var option_text = options[i].text,
                    option_value = options[i].value,
                    option_selected = options[i].selected;
                var newOption = $("<div class='"+settings.class_option+"'></div>")
                                    .text(option_text)
                                    .attr('data-value', option_value);
                if(option_selected !== false) {
                    newOption.addClass(settings.class_option_checked);
                }
                
                newOption.click(function() {
                    checkOption($(this));
                });
                
                select_popup_options.append(newOption);
            }
        }
        
        //checks an option, marking it visually and changing the model
        function checkOption(el, value) {
            el.toggleClass(settings.class_option_checked);
            //toggle value in model
            var val = value || el.attr('data-value');
            for(var i=0, size=model.length; i<size; i++){
                if(model[i].value == val) {
                    model[i].selected = !model[i].selected;
                    break;
                }
            }
            //update search box
            select_popup_search.val('');
            filterSelect();
            updatePlaceholder();
            //update original select
            var values = getValues(true);
            updateOriginal(values);
            //onChangeCallback
            if($.isFunction(options.onChange)) {
                options.onChange(getValues());
            }
        }
        
        //get only selected values. if val_only equals true, only the value attr is passed
        function getValues(val_only) {
            var values = [];
            for(var i=0, size=model.length; i<size; i++){
                var option = model[i];
                if(model[i].selected === true) {
                    if(val_only) values.push(option.value);
                    else values.push(option);
                }
            }
            return values;
        } 
        
        //updates the original select element
        function updateOriginal(vals) {
            selectMultOrig.val(vals);
        }
        
        //updates text in the search box and place holder
        function updatePlaceholder() {
            var values = getValues();
            var text = search_text;
            if(values.length === 0) {
                select_popup_search.attr('placeholder', '');
                select_placeholder_text.html(text);
            } else {
                var maxDisplay = options.maxDisplay;
                text = values.length;
                text += (values.length > 1) ? " countries selected" : " country selected";
                
                if(values.length > maxDisplay) {
                    select_placeholder_text.html(text);
                }
                else if(values.length === 1) {
                    text = values.length + " country selected";
                    select_placeholder_text.html(values[0].text);
                }
                else {
                    var placeholder_text = "";
                    for(var i=0, size=values.length; i<size; i++){
                        placeholder_text += values[i].text;
                        if(i < size - 1) placeholder_text += ", ";
                    }
                    select_placeholder_text.html(placeholder_text);
                }
                select_popup_search.attr('placeholder', text + " (total of "+model.length+")");
            }
        }
        
        //filters based on search box
        function filterSelect() {
            var val = select_popup_search.val();
            filterOptions(val);
        }
        
        //shows only options that match a substring
        function filterOptions(substring) {
            substring = substring.toLowerCase();
            var new_model = [];
            for(var i=0, size=model.length; i<size; i++){
                var option = model[i];
                var text = option.text.toLowerCase();
                if(text.indexOf(substring)!==-1) {
                    //found
                    new_model.push(option);
                }
            }
            setOptions(new_model);
        };
        
    };
}));