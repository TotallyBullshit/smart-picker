//simple code for test page

var menu_data = {
	title: "Choose one of the following tests",
	options: [
		{value: "index.html", name: "Index"}
	]
}

var tests = [
	"Simple Picker",
	"Event callbacks",
	"A few options",
	"Size and Position",
	"Drag the picker",
	"Type of picker",
	"Advanced",
];

var curr_page = window.location.href;
for(var i=0, size=tests.length; i<size; i++) {
	var num = i+1,
		title = num + ". "+ tests[i],
		file = "test"+num+".html";

	var new_option = {
		value: file,
		name: title
	}
	if(curr_page.indexOf(file) !== -1) {
		new_option.selected = true
	}
	menu_data.options.push(new_option);
}

$("#menu").click(function() {
	$.picker("regular_list", "menuPicker", {
		contentData: menu_data,
		closeButton: true,
		transition: 'fade',
		top: 100,
		width: 400,
		draggable: true,
		onInteraction: function(value) {
			location.href = value;
		} 
	});
});

$("#menu_test").click(function() {
	$.picker("regular_list", "menuPicker", {
		contentData: menu_data,
		closeButton: true,
		transition: 'slideLeft',
		left: -7,
		top: 'auto',
		bottom: 50,
		width: 400,
		onInteraction: function(value) {
			location.href = value;
		} 
	});
});
