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
			countries: [{value:"", name: "Choose...", selected: true},{name:'Afghanistan',value:'AF'},{name:'ÅlandIslands',value:'AX'},{name:'Albania',value:'AL'},{name:'Algeria',value:'DZ'},{name:'AmericanSamoa',value:'AS'},{name:'AndorrA',value:'AD'},{name:'Angola',value:'AO'},{name:'Anguilla',value:'AI'},{name:'Antarctica',value:'AQ'},{name:'AntiguaandBarbuda',value:'AG'},{name:'Argentina',value:'AR'},{name:'Armenia',value:'AM'},{name:'Aruba',value:'AW'},{name:'Australia',value:'AU'},{name:'Austria',value:'AT'},{name:'Azerbaijan',value:'AZ'},{name:'Bahamas',value:'BS'},{name:'Bahrain',value:'BH'},{name:'Bangladesh',value:'BD'},{name:'Barbados',value:'BB'},{name:'Belarus',value:'BY'},{name:'Belgium',value:'BE'},{name:'Belize',value:'BZ'},{name:'Benin',value:'BJ'},{name:'Bermuda',value:'BM'},{name:'Bhutan',value:'BT'},{name:'Bolivia',value:'BO'},{name:'BosniaandHerzegovina',value:'BA'},{name:'Botswana',value:'BW'},{name:'BouvetIsland',value:'BV'},{name:'Brazil',value:'BR'},{name:'BritishIndianOceanTerritory',value:'IO'},{name:'BruneiDarussalam',value:'BN'},{name:'Bulgaria',value:'BG'},{name:'BurkinaFaso',value:'BF'},{name:'Burundi',value:'BI'},{name:'Cambodia',value:'KH'},{name:'Cameroon',value:'CM'},{name:'Canada',value:'CA'},{name:'CapeVerde',value:'CV'},{name:'CaymanIslands',value:'KY'},{name:'CentralAfricanRepublic',value:'CF'},{name:'Chad',value:'TD'},{name:'Chile',value:'CL'},{name:'China',value:'CN'},{name:'ChristmasIsland',value:'CX'},{name:'Cocos(Keeling)Islands',value:'CC'},{name:'Colombia',value:'CO'},{name:'Comoros',value:'KM'},{name:'Congo',value:'CG'},{name:'Congo,TheDemocraticRepublicofthe',value:'CD'},{name:'CookIslands',value:'CK'},{name:'CostaRica',value:'CR'},{name:'CoteD\'Ivoire',value:'CI'},{name:'Croatia',value:'HR'},{name:'Cuba',value:'CU'},{name:'Cyprus',value:'CY'},{name:'CzechRepublic',value:'CZ'},{name:'Denmark',value:'DK'},{name:'Djibouti',value:'DJ'},{name:'Dominica',value:'DM'},{name:'DominicanRepublic',value:'DO'},{name:'Ecuador',value:'EC'},{name:'Egypt',value:'EG'},{name:'ElSalvador',value:'SV'},{name:'EquatorialGuinea',value:'GQ'},{name:'Eritrea',value:'ER'},{name:'Estonia',value:'EE'},{name:'Ethiopia',value:'ET'},{name:'FalklandIslands(Malvinas)',value:'FK'},{name:'FaroeIslands',value:'FO'},{name:'Fiji',value:'FJ'},{name:'Finland',value:'FI'},{name:'France',value:'FR'},{name:'FrenchGuiana',value:'GF'},{name:'FrenchPolynesia',value:'PF'},{name:'FrenchSouthernTerritories',value:'TF'},{name:'Gabon',value:'GA'},{name:'Gambia',value:'GM'},{name:'Georgia',value:'GE'},{name:'Germany',value:'DE'},{name:'Ghana',value:'GH'},{name:'Gibraltar',value:'GI'},{name:'Greece',value:'GR'},{name:'Greenland',value:'GL'},{name:'Grenada',value:'GD'},{name:'Guadeloupe',value:'GP'},{name:'Guam',value:'GU'},{name:'Guatemala',value:'GT'},{name:'Guernsey',value:'GG'},{name:'Guinea',value:'GN'},{name:'Guinea-Bissau',value:'GW'},{name:'Guyana',value:'GY'},{name:'Haiti',value:'HT'},{name:'HeardIslandandMcdonaldIslands',value:'HM'},{name:'HolySee(VaticanCityState)',value:'VA'},{name:'Honduras',value:'HN'},{name:'HongKong',value:'HK'},{name:'Hungary',value:'HU'},{name:'Iceland',value:'IS'},{name:'India',value:'IN'},{name:'Indonesia',value:'ID'},{name:'Iran,IslamicRepublicOf',value:'IR'},{name:'Iraq',value:'IQ'},{name:'Ireland',value:'IE'},{name:'IsleofMan',value:'IM'},{name:'Israel',value:'IL'},{name:'Italy',value:'IT'},{name:'Jamaica',value:'JM'},{name:'Japan',value:'JP'},{name:'Jersey',value:'JE'},{name:'Jordan',value:'JO'},{name:'Kazakhstan',value:'KZ'},{name:'Kenya',value:'KE'},{name:'Kiribati',value:'KI'},{name:'Korea,DemocraticPeople\'SRepublicof',value:'KP'},{name:'Korea,Republicof',value:'KR'},{name:'Kuwait',value:'KW'},{name:'Kyrgyzstan',value:'KG'},{name:'LaoPeople\'SDemocraticRepublic',value:'LA'},{name:'Latvia',value:'LV'},{name:'Lebanon',value:'LB'},{name:'Lesotho',value:'LS'},{name:'Liberia',value:'LR'},{name:'LibyanArabJamahiriya',value:'LY'},{name:'Liechtenstein',value:'LI'},{name:'Lithuania',value:'LT'},{name:'Luxembourg',value:'LU'},{name:'Macao',value:'MO'},{name:'Macedonia,TheFormerYugoslavRepublicof',value:'MK'},{name:'Madagascar',value:'MG'},{name:'Malawi',value:'MW'},{name:'Malaysia',value:'MY'},{name:'Maldives',value:'MV'},{name:'Mali',value:'ML'},{name:'Malta',value:'MT'},{name:'MarshallIslands',value:'MH'},{name:'Martinique',value:'MQ'},{name:'Mauritania',value:'MR'},{name:'Mauritius',value:'MU'},{name:'Mayotte',value:'YT'},{name:'Mexico',value:'MX'},{name:'Micronesia,FederatedStatesof',value:'FM'},{name:'Moldova,Republicof',value:'MD'},{name:'Monaco',value:'MC'},{name:'Mongolia',value:'MN'},{name:'Montserrat',value:'MS'},{name:'Morocco',value:'MA'},{name:'Mozambique',value:'MZ'},{name:'Myanmar',value:'MM'},{name:'Namibia',value:'NA'},{name:'Nauru',value:'NR'},{name:'Nepal',value:'NP'},{name:'Netherlands',value:'NL'},{name:'NetherlandsAntilles',value:'AN'},{name:'NewCaledonia',value:'NC'},{name:'NewZealand',value:'NZ'},{name:'Nicaragua',value:'NI'},{name:'Niger',value:'NE'},{name:'Nigeria',value:'NG'},{name:'Niue',value:'NU'},{name:'NorfolkIsland',value:'NF'},{name:'NorthernMarianaIslands',value:'MP'},{name:'Norway',value:'NO'},{name:'Oman',value:'OM'},{name:'Pakistan',value:'PK'},{name:'Palau',value:'PW'},{name:'PalestinianTerritory,Occupied',value:'PS'},{name:'Panama',value:'PA'},{name:'PapuaNewGuinea',value:'PG'},{name:'Paraguay',value:'PY'},{name:'Peru',value:'PE'},{name:'Philippines',value:'PH'},{name:'Pitcairn',value:'PN'},{name:'Poland',value:'PL'},{name:'Portugal',value:'PT'},{name:'PuertoRico',value:'PR'},{name:'Qatar',value:'QA'},{name:'Reunion',value:'RE'},{name:'Romania',value:'RO'},{name:'RussianFederation',value:'RU'},{name:'RWANDA',value:'RW'},{name:'SaintHelena',value:'SH'},{name:'SaintKittsandNevis',value:'KN'},{name:'SaintLucia',value:'LC'},{name:'SaintPierreandMiquelon',value:'PM'},{name:'SaintVincentandtheGrenadines',value:'VC'},{name:'Samoa',value:'WS'},{name:'SanMarino',value:'SM'},{name:'SaoTomeandPrincipe',value:'ST'},{name:'SaudiArabia',value:'SA'},{name:'Senegal',value:'SN'},{name:'SerbiaandMontenegro',value:'CS'},{name:'Seychelles',value:'SC'},{name:'SierraLeone',value:'SL'},{name:'Singapore',value:'SG'},{name:'Slovakia',value:'SK'},{name:'Slovenia',value:'SI'},{name:'SolomonIslands',value:'SB'},{name:'Somalia',value:'SO'},{name:'SouthAfrica',value:'ZA'},{name:'SouthGeorgiaandtheSouthSandwichIslands',value:'GS'},{name:'Spain',value:'ES'},{name:'SriLanka',value:'LK'},{name:'Sudan',value:'SD'},{name:'Suriname',value:'SR'},{name:'SvalbardandJanMayen',value:'SJ'},{name:'Swaziland',value:'SZ'},{name:'Sweden',value:'SE'},{name:'Switzerland',value:'CH'},{name:'SyrianArabRepublic',value:'SY'},{name:'Taiwan,ProvinceofChina',value:'TW'},{name:'Tajikistan',value:'TJ'},{name:'Tanzania,UnitedRepublicof',value:'TZ'},{name:'Thailand',value:'TH'},{name:'Timor-Leste',value:'TL'},{name:'Togo',value:'TG'},{name:'Tokelau',value:'TK'},{name:'Tonga',value:'TO'},{name:'TrinidadandTobago',value:'TT'},{name:'Tunisia',value:'TN'},{name:'Turkey',value:'TR'},{name:'Turkmenistan',value:'TM'},{name:'TurksandCaicosIslands',value:'TC'},{name:'Tuvalu',value:'TV'},{name:'Uganda',value:'UG'},{name:'Ukraine',value:'UA'},{name:'UnitedArabEmirates',value:'AE'},{name:'UnitedKingdom',value:'GB'},{name:'UnitedStates',value:'US'},{name:'UnitedStatesMinorOutlyingIslands',value:'UM'},{name:'Uruguay',value:'UY'},{name:'Uzbekistan',value:'UZ'},{name:'Vanuatu',value:'VU'},{name:'Venezuela',value:'VE'},{name:'VietNam',value:'VN'},{name:'VirginIslands,British',value:'VG'},{name:'VirginIslands,U.S.',value:'VI'},{name:'WallisandFutuna',value:'WF'},{name:'WesternSahara',value:'EH'},{name:'Yemen',value:'YE'},{name:'Zambia',value:'ZM'},{name:'Zimbabwe',value:'ZW'}],

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
							text: "Pick your country",
							options: dataMan.countries
						}, data);

						typeTemplate = this.templates['select_one'];
						typePostRender = this.functions['select_one'];
						
						break;

					case "geoMult":
						data = _.extend({
							text: "Pick your countries",
							options: dataMan.countries,
							selected: []
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
							   "<select class='form-control' id='picker_selector'>"+
							   "<% _.each(options, function(opt) { %>"+
							   		"<option value='<%= opt.value %>' "+
							   		"<%= (opt.selected) ? 'selected' : '' %>"+
							   		"><%= opt.name %></option>"+
							   	"<% }); %>"+
							   "</select>"+
							   "<div id='listSelected'>"+
							   "<% _.each(selected, function(opt) { %>"+
							   		"<div class='selected'>"+
							   		"<%= opt.name %></div>"+
							   		"<div class='delete'>&times;</div>"+
							   	"<% }); %>"+
							   "</div>"+
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
						content.find("#picker_selector").on("change",
						function() {
							var value = content.find("#picker_selector").val();
							var state = format_state(value);
							
							content.find("#listSelected").append("<div>"+value+"</div>");
							events.trigger("onInteraction", state);

							/* TO DO 
							if(!_.isArray(_this.state.selected)) _this.state.selected = [];
							_this.state.selected.push(value);
							_this.state.selected = _.uniq(_this.state.selected);


							var d = data;
							d.selected.push({name: value, value: value});
							d.selected = _.uniq(d.selected);

							var temp = template.build(type, d);

							console.log(temp);
							/* TO DO */



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
			console.log("Picker: "+msg);
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

	return Picker;
}));