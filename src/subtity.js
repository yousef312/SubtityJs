
/**
 * Subtity.js 1.5.0
 *
 * Copyright 2021, yousef neji
 * Licensed under the MIT license.
 */
/**
 * @tutorial
 * How to use this library?
 * First this library is basically created to used through a rendering process, means for exmaple
 * you are rendering a video using a CanvasRenderingContext2d and you want to add subtitles, so you
 * can simplye instantiate the class then init it using setUp2D method passing the canvas element or the 
 * context to render to, then you add the line `Subtity.update()` inside the rendering loop. and that's it
 * you can later on use the method `subtity.add()` to add new subtitle passing the text content of the file
 * and the extension and the title of the subtitle that going to identify it.
 * The system will store any parse subtitle and later on you can switch between using the method `use` passing 
 * the special title of the subtitle.
 */
(function(root,Subtity){
    'uses strict';
    if(typeof define === 'function' && define.amd) {
		define([], build);
	}else if(typeof module === 'object' && module.exports) {
        module.exports = Subtity();
	}else{
        root.Subtity = Subtity();
    }
}(this,function(){
        
        /**
         * A powerfull tool to add subtitles to your movie, it works in two modes, either rendering
         * the subtitles to a CanvasRenderingContext2D or directly to the DOM, the style of the text
         * is fully accessible to be manipulated using the standard methods defined by the library.
         * 
         * The interface support parsing this files formats:
         *  - `webvtt`
         *  - `itt`
         *  - `ssa`
         *  - `srt`
         *  - `sbv`
         *  - `usf`
         * @author Yousef Neji
         */
        function Subtity(){

            /**
             * Holds the different defined subtitles
             * @type {Array}
             */
            this.subs = [];

            /**
             * The currently used subtitle title used it identify it
             * @type {string}
             */
            this.title = '';

            /**
             * The text content of the subtitle file currently under use.
             * @readonly
             * @type {string}
             */
            this.text = '';

            /**
             * Holds the different subtitles strings for file currently under use. 
             * @type {array}
             */
            this.subtitles = [];

            /**
             * Holds the different subtitle ranges of time for file currently under use.
             * @type {array}
             */
            this.ranges = [];

            /**
             * Holds the current displayed subtitle index in the subtitles list.
             * @type {number}
             * @readonly
             */
            this.current = 0;

            /**
             * Holds the subtitles counts for file currently under use.
             * @type {number}
             */
            this.subtitlesCounts = null;

            /**
             * Optional offseting of subtitles ranges, used to synchronous the subtitle with the speech
             * when it's asynchronous.
             * @type {number}
             */
            this.offset = 0;

            /**
             * Holds the different rendering style options, to change those options use `set` method and
             * don't change them manually as there is extra calculation need to be done.
             */
            this.style = {
                family : 'Arial',
                size : 19,
                lineSpacing : 5,
                color : 'rgb(255,255,255)',
                align : 'center',
                direction : 'ltr',
                outlineColor : 'rgb(0,0,0)',
                outlineSize : 1,
                shadowColor : 'rgba(0,0,0,0)',
                opacity : 1,
                shadowBlur : 0,
                shadowX : 0,
                shadowY : 0,
                base : 90,
                left : 50,
                weight : ''
            };

            /**
             * Used to render the subtitle if 2D renderer was chosen, will remain null if html div container was chosen!
             * @type {CanvasRenderingContext2D}
             */
            this.renderer = null;

            /**
             * Used to holds the HTMLElement used to contain the subtitles, will remain null if 2D was chosen!
             * @type {HTMLElement}
             */
            this.container = null;

            /**
             * Holds some meta data if any about the subtitle currently under use.
             * @type {object}
             */
            this.meta = {};

            /**
             * The displaying mode, holds the mode id used in rendering/displaying the subtitles.
             * 
             *  - `1` : for HTMLElement displaying mode
             *  - `2` : for 2DCanvasRendering context mode
             * @readonly
             * @type {number}
             */
            this.mode = null;

            /**
             * The HTMLVideoElement used to show the video with subtitles.
             * @type {HTMLVideoElement}
             */
            this.video = null;

            /**
             * The Parser owned context, used to perform some critical calculations
             * @type {CanvasRenderingContext2D}
             */
            this.ctx = document.createElement('canvas').getContext('2d');

            /**
             * Flag determine whether the subtitle displaying currently activated or not
             * @type {boolean}
             */
            this.activated = false;
        }
        Subtity.prototype = {
            /**
             * Reset the system by freeing the currently used subtitle list and ranges..
             * @method Subtity#reset
             */
            reset : function(){
                this.current = 0;
                this.offset = 0;
                this.style = {
                    family : 'Arial',
                    size : 19,
                    lineSpacing : 10,
                    color : 'rgb(255,255,255)',
                    align : 'center',
                    direction : 'ltr',
                    outlineColor : 'rgb(0,0,0)',
                    outlineSize : 1,
                    shadowColor : 'rgba(0,0,0,0)',
                    shadowBlur : 0,
                    opacity : 1,
                    shadowX : 0,
                    shadowY : 0,
                    base : 90,
                    left : 50,
                    weight : ''
                };
                this.subtitles = [];
                this.ranges = [];
                this.activated = false;
                this.subtitlesCounts = 0;
                this.meta = {};
                this.title = '';
            },
            /**
             * Use certain subtitle file and activate the rendering
             * @method Subtity#use
             * @param {string} title 
             */
            use : function(title){
                var i = this.subs.findIndex(a=> a.title === title);
                if(i === -1) return;

                if( this.title !== '' )
                {
                    var j = this.subs.findIndex(a=> a.title === this.title );
                    this.subs[j].used = false;
                }

                this.current = 0;

                this.reset();
                this.subs[i].used = true;
                this.title = this.subs[i].title;
                this.ranges = this.subs[i].ranges;
                this.subtitles = this.subs[i].subtitles;
                this.text = this.subs[i].text;
                this.subtitlesCounts = this.subs[i].count;
                this.activated = true;
                this.meta = this.subs[i].meta;

                this.calcFontHeight();
            },
            /**
             * Parse the given srt file text content, must be called once after starting the video!
             * @method Subtity#parseSRT
             * @param {string} text the file content
             * @param {string} title the subtitle special name to identify and use later
             * @param {string} movie the movie to display subtitles to
             */
            parseSRT : function(text,title,movie){
                var sections = text.split('\n'),
                sub  = {
                    movie : movie,
                    title : title,
                    ranges : [],
                    meta : {},
                    subtitles : [],
                    text : text,
                    count : 0
                },
                // that's all it is
                isNam = false,
                subtitle = [];
                for (let i = 0; i < sections.length; i++) {
                    const line = sections[i];

                    if(line.length == 1)
                    {
                        isNam = false;
                        sub.subtitles.push(subtitle);
                        subtitle = [];
                    }

                    if (line.indexOf('-->') !== -1)
                    {
                        sub.ranges.push(this.getSeconds(line));
                        isNam = true;
                    }
                    else if(isNam === true && line.length !== 1)
                    {
                        subtitle.push(line)
                    }
                }
                
                sub.count = sub.subtitles.length;
                this.subs.push(sub);
            },
            /**
             * Parse the given webvtt file text content, must be called once after starting the video!
             * @method Subtity#parseWEBVTT
             * @param {string} text the file content
             * @param {string} title the subtitle special name to identify and use later
             * @param {string} movie the movie to display subtitles to
             */
            parseWEBVTT : function(text,title,movie){
                var sections = text.split('\n'),openSection = false,
                sub = {
                    movie : movie,
                    title : title,
                    meta : {},
                    ranges : [],
                    subtitles : []
                };
                // that's all it is
                var subtitle = [];
                for (let i = 0; i < sections.length; i++) {
                    const line = sections[i];
                    
                    // ignoring comments
                    if(line.indexOf('NOTE ') !== -1 || line[0].indexOf('NOTE\n') !== -1)
                    {
                        continue;
                    }

                    if(openSection && line.length !== 1)
                    {
                        subtitle.push(line);
                    }

                    if(line.indexOf('-->') !== -1)
                    {
                        var rang = this.getSeconds(line);
                        sub.ranges.push(rang);
                        openSection = true;
                    }
                    else if(line.length === 1 && openSection === true)
                    {
                        openSection = false;
                        sub.subtitles.push(subtitle);
                        subtitle = [];
                    }

                }

                sub.count = sub.subtitles.length;
                this.subs.push(sub);
            },
            /**
             * Parse the given .sbv file format and subtract all subtitles and their durations.
             * @method Subtity#parseSBV
             * @param {string} text the file content
             * @param {string} title the subtitle special name to identify and use later
             * @param {string} movie the movie to display subtitles to
             */
            parseSBV : function(text,title,movie){
                var data = text.split('\n'), off = false, two = false, k = -1,
                sub = {
                    movie : movie,
                    title : title,
                    meta : {},
                    ranges : [],
                    subtitles : []
                };

                if(data[0].length === 1) off = true;
                for (let i = 0; i < data.length; i++) {
                    var line = data[i];
                    
                    if(two === true && line.length !== 1)
                    {
                        sub.subtitles[k].push(line);
                    }

                    if(off === true)
                    {
                        sub.ranges.push(this.getSeconds(line));
                        off = false;
                        two = true;
                        k++;
                        sub.subtitles[k] = [];
                    }
                    if(line.length === 1)
                    {
                        off = true;
                        two = false;
                    }

                }

                sub.count = sub.subtitles.length;
                this.subs.push(sub);
            },
            /**
             * Parse the given .ssa file format and subtract all subtitles and their durations.
             * @method Subtity#parseSSA
             * @param {string} text the file content
             * @param {string} title the subtitle special name to identify and use later
             * @param {string} movie the movie to display subtitles to
             */
            parseSSA : function (text , title , movie){
                var data = text.split('\n'), syntax = null,section = null,
                sub = {
                    movie : movie,
                    title : title,
                    meta : {},
                    ranges : [],
                    subtitles : [],
                    count : null
                };

                for (let i = 0; i < data.length; i++) {
                    const line = data[i];
                    

                    if(line[0] === '[')
                    {
                        // that means we enter a section 
                        // and now we will check what does the section contains
                        var section = line.substr(1,line.indexOf(']') - 1).toLowerCase();
                    }
                    else
                    {
                        if( section === 'events')
                        {
                            var pieces = line.split(':');
                            if(pieces.length > 2)
                            {
                                for (let j = 2; j < pieces.length; j++) {
                                    pieces[1] += ':' + pieces[j];
                                }

                                pieces.splice(2,pieces.length);
                            }
                            var lineSubject = pieces[0].toLowerCase();
                            var lineBody = pieces[1];

                            // line may be a format explain or a dialog
                            if ( lineSubject === 'format' )
                            {
                                syntax = lineBody.toLowerCase().split(',');
                            }
                            else if( lineSubject === 'dialogue' )
                            {
                                // because for dialogs line contains more information then just the text
                                // there is the speaker and some other stuffs and that's ordered according 
                                // to the format line we found above

                                var lineBodySections = lineBody.split(',');

                                // getting the subtitle
                                k = syntax.findIndex( a => a.trim() === 'text');
                                var string = lineBodySections[k];
                                
                                // getting the time rang
                                i0 = syntax.findIndex(a => a.toLowerCase().trim() === 'start');
                                i1 = syntax.findIndex(a => a.toLowerCase().trim() === 'end');

                                t1 = this.convertToTime(lineBodySections[i0]);
                                t2 = this.convertToTime(lineBodySections[i1]);

                                sub.ranges.push([t1,t2]);
                                sub.subtitles.push([string]);
                            }
                        }
                        else if( section === 'script info')
                        {
                            if( line[0] === ';' ) continue; // stands for comments lines
                            pieces = line.split(':'); 
                            lineSubject = spaceoff(pieces[0]);
                            sub.meta[lineSubject] = pieces[1];
                        }
                    }
                }

                sub.count = sub.subtitles.length;
                this.subs.push(sub);
            },
            /**
             * Parse the given .itt file format and subtract all subtitles and their durations.
             * @method Subtity#parseITT
             * @param {string} text the file content
             * @param {string} title the subtitle special name to identify and use later
             * @param {string} movie the movie to display subtitles to
             */
            parseITT : function( text , title , movie ){
                var data = text.split('<body>')[1].split('</body>')[0].split('<p '),pos = 0, timeRang = null,
                sub = {
                    movie : movie,
                    title : title,
                    meta : {},
                    ranges : [],
                    subtitles : [],
                    count : null
                }, raw = null, betterText = null;

                for (let i = 0; i < data.length; i++) {
                    if(data[i][0] !== 'b') continue; // empty unrecognised line are ignored

                    const sect = data[i].split('>');
                    
                    // getting the time rang that exist inside the p element in the format `start="hh:mm:ss.xx" dur="hh:mm:ss.xx"`
                    raw = sect[0].split('"');
                    // now after we split we have the the array with this content ['start','hh:mm:ss.xx','dur','hh:mm:ss.xx']
                    // we now convert each indivual cell time
                    timeRang = [ this.convertToTime(raw[1]) , this.convertToTime(raw[3])];
                    // because the itt file time definition uses the format `start : dur` 
                    // instead or `start : end` we need to do the incrimentations so our system could work well
                    timeRang[1] += timeRang[0];
                    // after we subtract the data from the first array cell it's good to take rid of it
                    // so it no more bother us
                    sect.shift();
                    
                    var subtitle = '';
                    // this step needs to loop through the string to take rid of the span element inside
                    // of it and only absord the subtitle pure text
                    for (let j = 0; j < sect.length; j++) {
                        const string = sect[j];
                        // why <br instead of the whole string <br> 
                        // simply because we take rid of the > when we split the string using it
                        betterText = string.replace('<br','\n');

                        for (let k = 0; k < betterText.length; k++) {
                            if(betterText[k] + betterText[k+1] + betterText[k+2] + betterText[k+3] + betterText[k+4] === '<span' || betterText[k] + betterText[k+1] === '</')
                            {
                                break;
                            }
                            else
                            {
                                subtitle += betterText[k];
                            }
                        }
                    }
                    subtitle = subtitle.split('\n'); // we split to get the array
                    sub.ranges.push(timeRang);
                    sub.subtitles.push(subtitle);
                }

                sub.count = sub.subtitles.length;
                this.subs.push(sub);
            },
            /**
             * Parse the given .usf file format and subtract all subtitles and their durations.
             * @method Subtity#parseUSF
             * @param {string} text the file content
             * @param {string} title the subtitle special name to identify and use later
             * @param {string} movie the movie to display subtitles to
             */
            parseUSF : function( text , title , movie ){
                var meta = text.split('<metadata>')[1].split('</metadata>')[0],
                data = text.split('<subtitles>')[1].split('</subtitles>')[0].split('<subtitle '),
                sub = {
                    movie : movie,
                    title : title,
                    ranges : [],
                    meta : {},
                    subtitles : [],
                    count : null
                }, fline = '', sline = '', ino = false, splitter = [null,null];

                
                // getting the meta data
                if( meta.indexOf('<title>') !== -1)
                {
                    sub.meta.title = meta.split('<title>')[1].split('</title>')[0];
                }
                if( meta.indexOf('<date>') !== -1)
                {
                    sub.meta.date = meta.split('<date>')[1].split('</date>')[0];
                }
                if( meta.indexOf('<author>') !== -1)
                {
                    var authorData = meta.split('<author>')[1].split('</author>')[0];
                    if( authorData.indexOf('<name>') !== -1)
                    {
                        sub.meta.authorName = authorData.split('<name>')[1].split('</name>')[0];
                    }
                    if( authorData.indexOf('<url>') !== -1)
                    {
                        sub.meta.authorUrl = authorData.split('<url>')[1].split('</url>')[0];
                    }
                    if( authorData.indexOf('<email>') !== -1)
                    {
                        sub.meta.authorEmail = authorData.split('<email>')[1].split('</email>')[0];
                    }
                }
                if( meta.indexOf('<language') !== -1)
                {
                    sub.meta.language = "";
                    t = meta.split('<language ')[1].split('</language>')[0];
                    sub.meta.language = t.substr(t.indexOf('>') + 1 , t.length);
                }

                for (let i = 0; i < data.length; i++) {
                    if(data[i][0] !== 's') continue; // empty recognised lines are ignored

                    const line = data[i];
                    const timeRang = data[i].split('>')[0].split('"');
                    var begin = this.convertToTime(timeRang[1]);
                    var end = this.convertToTime(timeRang[3]);


                    // choosing the right splitter
                    if( line.indexOf('<text ') !== -1)
                    {
                        splitter[0] = '<text ';
                        splitter[1] = '</text>';
                    }
                    else if( line.indexOf('<karaoke ') !== -1)
                    {
                        splitter[0] = '<karaoke ';
                        splitter[1] = '</karaoke>';
                    }
                    
                    // doing the subtraction
                    sline = line.split(splitter[0])[1].split(splitter[1])[0];
                    fline = '';
                    ino = false;
                    for (let k = sline.indexOf('>'); k < sline.length; k++) {
                        const element = sline[k];

                        if( sline[k] === '<' && sline[k+1] !== ' ' )
                        {
                            ino = false;
                        }

                        if( ino )
                        {
                            fline += element;
                        }


                        if(element === '>')
                        {
                            ino = true;
                        }
                        
                    }

                    // make sure there is no other subtitle that collides with this one.
                    var alr = sub.ranges.findIndex(a => begin >= a[0] && begin <= a[1]);
                    if(alr !== -1)
                    {
                        sub.subtitles[alr] = sub.subtitles[alr].concat(fline.split('\n'));
                    }
                    else
                    {
                        sub.subtitles.push(fline.split('\n'));
                        sub.ranges.push([begin,end]);
                    }
                }

                sub.count = sub.subtitles.length;
                this.subs.push(sub);
            },
            /**
             * Convert a given time in seconds to a proper format to be used in a subtitle file in this way `hh:mm:ss.xx` seperated
             * by the given seperator.
             * @method Subtity#convertToText
             * @param {number} time 
             * @returns {string}
             */
            convertToText : function( time , seperator = ':' ){
                var hours = time / 3600;
                time = time - (hours * 3600); 
                var minutes = time / 60;
                time = time - (minutes * 60);
                var seconds = time;

                return hours + seperator + minutes + seperator + seconds;
            },
            /**
             * Convert the string in time notation `hh:mm:ss` or `hh:mm:ss.xx` to real number represent time 
             * in seconds. used internally by the library!
             * @method Subtity#convertToTime
             * @param {string} time 
             * @returns {number}
             */
            convertToTime : function( time ){
                var dur = 0,begin,end,hours,minutes,seconds;
                var org = time.split(':');

                // something should be done after using parseFloat function:
                // we should change the `,` to `.` so the function does right parsing
                // this is only in srt file
                org[2] = org[2].replace(',','.');

                // now parse the hours minutes and seconds
                if( org.length === 3)
                {
                    hours = parseFloat(org[0]);
                    minutes = parseFloat(org[1]);
                    seconds = parseFloat(org[2]);
                }
                else
                {
                    // for mm:ss.xx representation
                    hours = 0;
                    minutes = parseFloat(org[0]);
                    seconds = parseFloat(org[1]);
                }

                // then we convert all to seconds
                dur += (hours * 3600) + (minutes * 60) + seconds;

                return dur
            },
            /**
             * Used internally by the class to parse a rang representation string into seconds count,
             * for `srt` `sbv` and `webvtt` file formats.
             * @method Subtity#getSeconds
             * @param {string} repRang stands for representation rang
             * @returns {Array}
             */
            getSeconds : function( repRang ){
                var rang = [0,0];
                // first we seperate the rang, usually it's the form beginTime-->endTime in srt and webvtt
                // files and beginTime,endTime in sbv files
                // so we need to check the existance of the arrow, if not then we seperate with `,`
                repRang = repRang.indexOf('-->') === -1 ? repRang.split(',') : repRang.split('-->');

                // using a local function we subtract time(convert it)
                rang[0] = this.convertToTime(repRang[0]);
                rang[1] = this.convertToTime(repRang[1]);

                return rang;
            },
            /**
             * Must be called as the video time updated or the loop updated, to render or display the subtitles.
             * @method Subtity#update
             */
            update : function(){
                if(this.mode === null )
                {
                    console.warn('Must set up the parser rendering mode first!\`Subtity.setUp2D or Subtity.setUpContainer\`');
                    return;
                }

                if(this.ranges.length === 0 || this.subtitles.length === 0 || this.activated === false) return;

                current = this.video.currentTime;
                mov = this.video.src;

                for (let i = 0; i < this.ranges.length; i++) {
                    const rang = this.ranges[i];
                    const text = this.subtitles[i];
                    current -= this.offset;
                    
                    if(current >= rang[0] && current <= rang[1])
                    {
                        this.current = i;

                        if(this.mode === 1)
                        {
                            this.container.innerText = this.subtitles[this.current];
                        }
                        else
                        {
                            // for rendering mode we should get the options
                            family = this.style.family || 'Arial';
                            base = this.style.base || 90;
                            left = this.style.left || 50;
                            size = this.style.size || 25;
                            align = this.style.align || 'center';
                            color = this.style.color || 'white';
                            bg = this.style.bg || 'rgba(0,0,0,0)';
                            direction = this.style.direction || 'ltr';
                            opacity = this.style.opacity || 1;
                            weight = this.style.weight || 'bold';
                            marginL = this.style.marginLeft;
                            marginT = this.style.marginTop;
                            outlineColor = this.style.outlineColor || 'black';
                            outlineSize = this.style.outlineSize || 1;
                            shadowColor = this.style.shadowColor || 'rgba(0,0,0,0)';
                            shadowX = this.style.shadowX || 0;
                            shadowY = this.style.shadowY || 0;
                            shadowBlur = this.style.shadowBlur || 0;
                            lineSpacing = this.style.lineSpacing || 0;
                            lineHeight = this.style.lineHeight;

                            this.renderer.beginPath();
                            x = (this.renderer.canvas.width / 100) * left;
                            y = (this.renderer.canvas.height / 100) * base;

                            this.renderer.fillStyle = color;
                            this.renderer.textAlign = align;
                            this.renderer.direction = direction;
                            this.renderer.font = `${weight} ${size}px ${family}`;
                            this.renderer.shadowColor = shadowColor;
                            this.renderer.shadowBlur = shadowBlur;
                            this.renderer.shadowOffsetX = shadowX;
                            this.renderer.shadowOffsetY = shadowY;
                            this.renderer.globalAlpha = opacity;

                            
                            // we loop from end to begin to save the natural order of the subtitles
                            // because we drawing from bottom to top to
                            for (let j = text.length - 1; j > -1; j--) {
                                const line = text[j];

                                this.renderer.strokeStyle = outlineColor;
                                this.renderer.lineWidth = outlineSize * 2;
                                this.renderer.strokeText(line,x,y);
                                this.renderer.lineWidth = 1;
                                this.renderer.fillText(line,x,y);
                                y -= (lineHeight + lineSpacing);
                            }

                            this.renderer.closePath();
                        }
                    }
                }

            },
            /**
             * Set up the parser to render the text to a 2D CanvasRendering context, passing the HTMLCanvasElement
             * to render on, and optional options list of styles to be applied to the text while rendering.
             * @method Subtity#setUp2D
             * @param {HTMLCanvasElement} canvas the canvas element or it context
             * @param {HTMLVideoElement} video 
             */
            setUp2D : function( canvas ,video ){

                this.renderer = canvas instanceof CanvasRenderingContext2D ? canvas : canvas.getContext('2d');
                this.mode = 2;
                this.video = video;
            },
            /**
             * Set up the parser to use an HTMLElement to display the subtitles, passing the HTMLElement!
             * @method Subtity#setUpContainer
             * @param {HTMLElement} elm 
             * @param {HTMLVideoElement} video 
             */
            setUpContainer : function( elm ,video ){
                this.container = elm;
                this.mode = 1;
                this.video = video;
            },
            /**
             * Set the offset value, pass positive number to progress or negative to delay the subtitle displaying process.
             * @method Subtity#setOffset
             * @param {number} offset 
             */
            setOffset : function(offset){
                this.offset = typeof offset === 'number' && !isNaN(offset) ? offset : this.offset;
            },
            /**
             * Customize the subtitles style when displaying, this is only applied when rendering
             * to a 2D context, not when using normal DOM element.
             * @method Subtity#set
             * @param {string} style 
             * @param {any} value 
             */
            set : function(style,value){

                switch (style) {
                    case 'family':
                        this.style.family = value;
                        this.calcFontHeight();
                        break;
                    case 'color':
                        this.style.color = value;
                        break;
                    case 'weight':
                        this.style.weight = value;
                        break;
                    case 'size':
                        this.style.size = parseFloat(value);
                        this.calcFontHeight();
                        break;
                    case 'align':
                        this.style.align = value;
                        break;
                    case 'direction':
                        this.style.direction = value;
                        break;
                    case 'shawX':
                        this.style.shadowX = parseFloat(value);
                        break;
                    case 'shawY':
                        this.style.shadowY = parseFloat(value);
                        break;
                    case 'shawBlur':
                        this.style.shadowBlur = value;
                        break;
                    case 'shawColor':
                        this.style.shadowColor = value;
                        break;
                    case 'bg':
                        this.style.bg = value;
                        break;
                    case 'outlineColor':
                        this.style.outlineColor = value;
                        break;
                    case 'outlineSize':
                        this.style.outlineSize = parseFloat(value);
                        break;
                    case 'lineSpacing':
                        this.style.lineSpacing = parseFloat(value);
                        break;
                    case 'base':
                        this.style.base = parseFloat(value);
                        break;
                    case 'left':
                        this.style.left = parseFloat(value);
                        break;
                    case 'opacity':
                        this.style.opacity = isNaN(parseFloat(value)) ? 1 : parseFloat(value);
                    
                }
            },
            /**
             * Used internally by the engine to calculate the font height currently under use
             * @method Subtity#calcFontHeight
             * @returns {number}
             */
            calcFontHeight : function(){
                fontSize = parseFloat(this.style.size);
                fontFamily = this.style.family;
                
                var modal = 'gM';
                var context = this.ctx;
                context.canvas.width = context.canvas.width;

                context.fillRect(0,0,context.canvas.width,context.canvas.height);
                context.textBaseline = 'top';

                context.font = fontSize+'px '+fontFamily;
                context.fillStyle = 'white';
                
                context.fillText(modal,0,0);

                var data = context.getImageData(0,0,context.canvas.width,context.canvas.height).data;

                var start = -1;
                var end = -1;
                for (var i = 0; i < context.canvas.height; i++) {
                    
                    for (var j = 0; j < context.canvas.width; j++) {
                        var index = (i * context.canvas.width + j) * 4;

                        if(data[index] === 0)
                        {
                            if(j === context.canvas.width -1 && start !== -1)
                            {
                                end = i;
                                i = context.canvas.height;
                                break
                            }
                            continue
                        }
                        else
                        {
                            if(start === -1)
                            {
                                start = i;
                            }
                            break;
                        }
                    }
                }

                this.style.lineHeight = end - start;
            },
            /**
             * Loads the default style applied to the rendering process
             * @method Subtity#loadDefaultStyle
             */
            loadDefaultStyle : function(){
                this.style = {
                    family : 'Arial',
                    size : 19,
                    lineSpacing : 10,
                    color : 'rgb(255,255,255)',
                    align : 'center',
                    direction : 'ltr',
                    outlineColor : 'rgb(0,0,0)',
                    outlineSize : 1,
                    shadowColor : 'rgba(0,0,0,0)',
                    opacity : 1,
                    shadowBlur : 0,
                    shadowX : 0,
                    shadowY : 0,
                    base : 90,
                    left : 50,
                    weight : ''
                }
                this.offset = 0;
            },
            /**
             * Toggle the activation of the subtitle
             * @method Subtity#toggleActivation
             * @param {boolean} state the state to force applying `false` to disactivate or `true` to activate.
             * @returns {boolean} the new activation state
             */
            toggleActivation : function( state ){
                if( typeof state === 'boolean')
                {
                    this.activated = state;
                }
                else
                {
                    this.activated = !this.activated;
                }
                return this.activated;
            },
            /**
             * Remove a subtitle from the list
             * @method Subtity#remove
             * @param {string} title 
             * @returns {object} the removed subtitle or false if it was not found
             */
            remove : function( title ){
                var i = this.subs.findIndex(a => a.title === title );
                
                if( i !== -1 )
                {
                    if( this.subs[i].used === true )
                    {
                        this.reset();
                    }
                    return this.subs.splice(i,1);
                }
                return false
            },
            /**
             * Add a new subtitle to the list
             * @method Subtity#add
             * @param {string} title the subtitle special title to use it later
             * @param {string} text the subtitle file text content
             * @param {string} ext the extension of the subtitle
             * @param {string} movie the name of the movie this subtitle going to be used with
             */
            add : function( title , text , ext , movie )
            {
                if( typeof ext !== 'string' || typeof text !== 'string' || title === '') return;

                var res = this.check(title);
                if(res === false)
                {
                    return;
                }

                ext = ext.toLowerCase();
                if( ext === '.srt' || ext === 'srt' )
                {
                    this.parseSRT(text,title,movie);
                }
                else if( ext === '.sbv' || ext === 'sbv' )
                {
                    this.parseSBV(text,title,movie);
                }
                else if( ext === '.itt' || ext === 'itt' )
                {
                    this.parseITT(text,title,movie);
                }
                else if( ext === '.webvtt' || ext === 'webvtt' )
                {
                    this.parseWEBVTT(text,title,movie);
                }
                else if( ext === '.ssa' || ext === 'ssa' )
                {
                    this.parseSSA(text,title,movie);
                }
                else if( ext === '.usf' || ext === 'usf' )
                {
                    this.parseUSF(text,title,movie);
                }
            },
            /**
             * Check whether a title is under use or not, then warn to console if it's is
             * @method Subtity#check
             * @param {string} title
             * @returns {boolean}
             */
            check : function( title ){
                var index = this.subs.findIndex(a => a.title === title);
                if(index !== -1)
                {
                    console.warn('The given title( ' + title + ') is already under use, please use a new one');
                    return false;
                }
                return true;
            },
            /**
             * Export the current system content of subtitles and ranges to an .srt file formats text
             * @method Subtity#exportToSRT
             * @returns {string}
             */
            exportToSRT : function(){
                var text = '';
                for (let i = 0; i < this.subtitle.length; i++) {
                    const sub = this.subtitle[i];
                    const rang = this.ranges[i];
                    var sect = i + '\n';
                    sect += this.convertToText(rang[0]) + ' --> ' + this.convertToText(rang[1]) + '\n';

                    for (let k = 0; k < sub.length; k++) {
                        sect += sub + '\n';
                    }
                    text += sect + '\n';
                }

                return text;
            },
        }

        return Subtity;
}));
