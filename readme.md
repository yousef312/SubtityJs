# Subtity.js
![Logo](src/assets/subtity-.png)
A library used to parse and render subtitles for your videos

## Author 
Yousef Neji

## Version
3.0.0


## Tutorial
Some concept to discuss!!

the library suppose you have some knowledge about using the canvas rendering context, or `CanvasRenderingContext2D` as named in JavaScript. And used mainly to render subtitles for a video using this technologie, although it can also render subtitles using normal DOM element by directly changing the text content of a DOMElement.
Maybe you should learn a bit about it to start using this library!!

also the library, suppose that you are going to use the node `fs` module to fetch/bring the subtitle file.

The library does only subtract the subtitles and ignore the style, instead it provides a way for you to apply your own style.

The library uses the video element to check the time and display the right subtitle.

How to use this library?
This library created basically to render the subtitle content of a subtitle file inside a CanvasRenderingContext2D, created with a Canvas DOM Element,
Beside rendering subtitles the library is able to parse this subtitle files formats:
 - `SRT` or `.srt` file
 - `SSA` or `.ssa` file
 - `SBV` or `.sbv` file
 - `WEBVTT` or `.webvtt` file
 - `ITT` or `.itt` file
 - `USF` or `.usf` file
 - `LRC` or `.lrc` file
 - `XML` or `.xml` file
 - `RT` or `.rt` file
 - `dfxp` or `.dfxp` file
 - `TTML` or `.ttml` file
 - `SUBTI` or `.subti` file

 And exporting to this files formats
  - `SUBTI` or `.subti` 
  - `SRT` or `.srt` 
  - `LRC` or `.lrc` 
  - `WEBVTT` or `.webvtt` 
  - `SSA` or `.ssa` 

To start using the library you start by initializing it.
```JavaScript
// this step only when using node.js
var Subtity = require('subtity');

// initializing the class
var subtity = new Subtity();
```

Then you have the option either to render the subtitles to DOM element or to CanvasRenderingContext2D using one of this methods:
```JavaScript
// to render to DOMElement
subtity.setUpContainer(DOMElement,video);

// or canvasRendringContext
subtity.setUp2D(canvas,video);
```

Then you include this line inside the video loop, either inside the event `onupdate` emited by the video or inside the rendering loop.
```JavaScript
// you can do this
videoElement.onupdate = function(){
    // rendering the video
    ctx.drawImage(videoElement,0,0);

    // rendering the subtitle
    subtity.update();
}

// or this, inside the rendering loop of the video
function loop(){
    // rendering the video
    ctx.drawImage(videoElement,0,0);

    // rendering the subtitle using our library
    subtity.update();
}
```

Now how can I parse and use a subtitle file?
```JavaScript
// at your own code section
// you bring the file text content using the fs module or an other way 
// of your own
fs.readFile('F:\\subtitles\\subtitle.srt','utf8',function( err , text){
    if( !err )
    {
        // now as we have the text of the file we need to parse it
        // The class provides the main method to do that which is `subtity.add`
        // and takes those parameters - 'title' - 'text' - 'ext' - 'movie'
        // where 
        // - title is a special name to identify and use this subtitle later
        // - text is the text content of the subtitle file
        // - ext or extension is the file extension which can be easily subtracted from the path using
        // the node.js path library `path.extname`()
        // - movie is optional identification for the movie this subtitle is belongs to. optional
        subtity.add('joker-movie-subtitle',text,'srt','joker movie');

        // later on you can remove the subtitle from the stored subtitle list
        subtity.remove('joker-movie-subtitle');
    }
})
```
now all need to be done is to use this subtitles
```JavaScript
var button = document.getElementById('useSubtitle');
button.onclick = function(){
    subtity.use('joker-movie-subtitle');
}
```
for more control over the subtitles the library provides more couple of functions
```JavaScript
// to change the subtitle style use set method
subtity.set(style,value);

// to load default styles
subtity.loadDefaultStyle();

// the offset shift the subtitle display duration forward or backward
// to change it is using
subtity.setOffset(offset);

// to change the subtitle rendering speed
subtity.setSpeed(speedMultiplier);

// to change the language of the subtitle if provided within the subtitle text file
subtity.switchToLang(lang);
// the `lang` must a two-chiffre representation of the language for example to say english you pass `en` so on with france `fr` so on...

// toggle between activating and disactivating the subtitle
// if state is passed with a boolean `true` or `false` it will be set
// other wise the activation will be toggled.
subtity.toggleActivation(state);

```

Also you can export to a couple of file formats
```JavaScript
var SRT_TEXT = subtity.export('srt');
var SUBTI_TEXT = subtity.export('subti');
var LRC_TEXT = subtity.export('lrc');
var WEBVTT_TEXT = subtity.export('webvtt');
var SSA_TEXT = subtity.export('ssa');

```
the method will grab the system content of subtitles and export it to a text file of type srt of subti, this allows to create your own subtitle file from within the system itself.

## Copyrights
Reserved under MIT license
