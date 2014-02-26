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
	var picker = new Picker("regularList", "menuPicker", {
		contentData: menu_data,
		closeButton: true,
		transition: 'fade',
		top: 100,
		width: 400,
		draggable: true,
		onInteraction: function(data) {
			location.href = data.selected;
		} 
	});
	picker.show();
});

$("#menu_test").click(function() {
	var picker = new Picker("regularList", "menuPicker", {
		contentData: menu_data,
		closeButton: true,
		transition: 'slideLeft',
		left: -7,
		top: 'auto',
		bottom: 50,
		width: 400,
		onInteraction: function(data) {
			location.href = data.selected;
		} 
	});
	picker.show();
});
