# Subtity.js
A library used to parse and render subtitles for your videos

## Author 
Yousef Neji

## Version
1.0.0


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
        subtity.add('Joker Movie Subtitle',text,'srt','joker movie');

        // later on you can remove the subtitle from the stored subtitle list
        subtity.remove('Joker Movie Subtitle');
    }
})
```
for more control over the subtitles the library provides more couple of functions
```JavaScript
// to change the subtitle style is using the set method
subtity.set(style,value);

// to load default styles
subtity.loadDefaultStyle();

// the offset shift the subtitle display duration forward or backward
// to change it is using
subtity.setOffset(offset);

// toggle between activating and disactivating the subtitle
// if state is passed with a boolean `true` or `false` it will be set
// other wise the activation will be toggled.
subtity.toggleActivation(state);

```

## Copyrights
Reserved under MIT license