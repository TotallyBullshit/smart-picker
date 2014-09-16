# Smart Picker

> Smart Picker is a general library for pickers, used *primarily* in [Vizabi](https://github.com/Gapminder/vizabi) and other Gapminder projects

## Getting started
You can simply grab a copy of the necessary files in the folder ```dist```. You need to include jQuery, Underscore, the smartPicker's javascript file and the CSS file to your ```<head>``` tag to get it up and running properly:

```html
<!-- CSS -->
<link rel="stylesheet" type="text/css" href="styles/picker.min.css">
<!-- Javascript (may be placed at the bottom, inside the <body> tag) -->
<script type="text/javascript" src="/path/to/jquery.min.js"></script>
<script type="text/javascript" src="/path/to/underscore.min.js"></script>
<script type="text/javascript" src="smart-picker.min.js"></script>
```

*In this repo, jQuery and Underscore are located in the folder 'vendor'*
*You may also use require.js*

### Using pickers

//describe how pickers should be called

## Building the project
This plugin requires, [NPM](https://www.npmjs.org/), [Grunt](http://gruntjs.com/) and [Bower](http://bower.io/)

After you have both installed, install all the dependencies, running the following:

```shell
npm install
bower install
```

After all dependencies are installed, you can build the project running grunt:
```shell
grunt
```

## Usage

###Basic example

```javascript
var my_picker = new smartPicker("regular", "my-picker");
my_picker.show();
```

###Format

```javascript
var picker = new smartPicker(*type*, *id*, [*options*]);
```
####type
Type of smartPicker (string). Supported values: 'regular', 'regularList', 'mult'
#####TO DO:

- input picker
- remove compass dependency

####id
id of the new element to be created (string). Supported values: any string.

####options
Options (object) to be used with the smartPicker to change its default behavior. (see examples)

| option              | description                                                                                                                                                | values                                                                   | default | example                               |
|---------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------|---------|---------------------------------------|
| **top**             | position                                                                                                                                                   | *int* or *css value*                                                     | '50px'  | 120; 'auto'; '300px'                  |
| **left**            | position                                                                                                                                                   | *int* or *css value*                                                     | 'auto'  | 120; 'auto'; '300px'                  |
| **bottom**          | position                                                                                                                                                   | *int* or *css value*                                                     | 'auto'  | 120; 'auto'; '300px'                  |
| **right**           | position                                                                                                                                                   | *int* or *css value*                                                     | 'auto'  | 120; 'auto'; '300px'                  |
| **width**           | size                                                                                                                                                       | *int* or *css value*                                                     | '260px' | 120; 'auto'; '300px'                  |
| **height**          | size                                                                                                                                                       | *int* or *css value*                                                     | 'auto'  | 120; 'auto'; '300px'                  |
| **transition**      | animation when opening picker                                                                                                                              | *'no-transition', 'fade', 'slide', 'slideUp', 'slideRight', 'slideLeft'* | 'slide' | 'fade'                                |
| **container**       | outer container for the picker                                                                                                                             | *css selector*                                                           | 'body'  | '#my-div'                             |
| **closeButton**     | If true, it will display a close button on top right corner                                                                                                | *boolean*                                                                | false   | true                                  |
| **confirmButton**   | If set, it will display a confirmation button to close the picker and set changes. If string is provided, it will be used as text for the button           | *boolean* or *string*                                                    | false   | true, 'Confirm!'                      |
| **modal**           | Determines if picker should be placed in a modal window                                                                                                    | *boolean*                                                                | true    | false                                 |
| **clickOverlay**    | Determines whether modal should close when clicking outside (overlay). *it only makes sense if modal = true*                                               | *boolean*                                                                | true    | false                                 |
| **draggable**       | Determines if user can drag the picker around the screen                                                                                                   | *boolean*                                                                | false   | true                                  |
| **static**          | Determines if picker should be rendered to the current container, without any wrapper                                                                      | *boolean*                                                                | false   | true                                  |
| **allowDuplicates** | Determines if two copies of the same picker instance can be displayed at the same time. (*example: using the show() method twice would create two copies*) | *boolean*                                                                | false   | true                                  |
| **beforeShow**      | Event callback to be executed before the picker is shown (method 'show')                                                                                   | *function*                                                               | null    | function() { alert('Hello World!'); } |
| **afterShow**       | Event callback to be executed after the picker is shown (method 'show')                                                                                    | *function*                                                               | null    | function() { alert('Hello World!'); } |
| **beforeHide**      | Event callback to be executed before the picker is hidden (method 'hide')                                                                                  | *function*                                                               | null    | function() { alert('Hello World!'); } |
| ** afterHide**      | Event callback to be executed after the picker is hidden (method 'hide')                                                                                   | *function*                                                               | null    | function() { alert('Hello World!'); } |
| **onInteraction**   | Event callback to be executed when user interacts with the picker (e.g: changes values or types in a search box)                                           | *function*                                                               | null    | function() { alert('Hello World!'); } |
| **onSet**           | Event callback to be executed when user sets a new value for the picker (e.g: clicks the confirmation button)                                              | *function*                                                               | null    | function() { alert('Hello World!'); } |

### API
There are three useful methods:

| Method  | Description                        |
|---------|------------------------------------|
| show()  | Shows a picker on the screen       |
| hide()  | Hides picker, but keeps element    |
| clear() | Completely removes picker from DOM |

## Other examples

###Changing position and size
```javascript
var picker = new smartPicker("regular", "my-picker", {
			top: 300,
			width: '600px'
		});				
```

###Changing transitions
```javascript
var picker = smartPicker("regular", "my-picker", {
			transition: 'fade'
		});
```

###Close and Confirm buttons 
```javascript
var picker = smartPicker("regular", "my-picker", {
			closeButton: true,
			confirmButton: "Confirmation Picker", //any string or boolean values
		});
```

###Making it draggable
```javascript
var picker = new smartPicker("regular", "my-picker", {
			draggable: true
		});
```

###onInteraction and onSet (most useful cases)
```javascript
var picker = smartPicker("multi", "my-picker", {
			width: 500,
			clickOverlay: false,
			draggable: true,
			confirmButton: "Select these countries",
			onInteraction: function(data) {
				colorSelectedCountries(data.selected, 'grey');
			},
			onSet: function(data) {
				colorSelectedCountries(data.selected, 'blue');
			}
		});
```
