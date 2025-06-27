
/**
 * Subtity.js 3.1.0
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

var nums = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

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
 *  - `lrc`
 *  - `xml`
 *  - `rt`
 *  - `dfxp`
 *  - `ttml`
 *  - `subti` official
 * 
 * and exporting this file
 *  - `srt`
 *  - `subti`
 *  - `lrc`
 *  - `webvtt`
 *  - `ssa`
 * @author Yousef Neji
 */
function Subtity() {

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
        family: 'Arial',
        size: 19,
        style: 'normal',
        lineSpacing: 5,
        variant: 'normal',
        color: 'rgb(255,255,255)',
        align: 'center',
        direction: 'ltr',
        outlineColor: 'rgb(0,0,0)',
        outlineSize: 1,
        shadowColor: 'rgba(0,0,0,0)',
        opacity: 1,
        shadowBlur: 0,
        shadowX: 0,
        shadowY: 0,
        base: 90,
        left: 50,
        weight: ''
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

    /**
     * Holds the current used subtitle file format or extension
     * @type {String}
     */
    this.currentFileType = null;

    /**
     * This value controls the speed of the subtitles you can change through `Subtity.setSpeed`.
     * @type {number}
     */
    this.speedFactor = 1;
}
Subtity.prototype = {
    /**
     * Reset the system by freeing the currently used subtitle list and ranges..
     * @method Subtity#reset
     */
    reset: function () {
        this.current = 0;
        this.speedFactor = 1;
        this.offset = 0;
        this.style = {
            family: 'Arial',
            size: 19,
            style: 'normal',
            variant: 'normal',
            lineSpacing: 10,
            color: 'rgb(255,255,255)',
            align: 'center',
            direction: 'ltr',
            outlineColor: 'rgb(0,0,0)',
            outlineSize: 1,
            shadowColor: 'rgba(0,0,0,0)',
            shadowBlur: 0,
            opacity: 1,
            shadowX: 0,
            shadowY: 0,
            base: 90,
            left: 50,
            weight: ''
        };
        this.subtitles = [];
        this.ranges = [];
        this.activated = false;
        this.subtitlesCounts = 0;
        this.meta = {};
        this.title = '';
        this.currentFileType = null;
    },
    /**
     * Use certain subtitle file and activate the rendering
     * @method Subtity#use
     * @param {string} title 
     */
    use: function (title) {
        var i = this.subs.findIndex(a => a.title === title);
        if (i === -1) return;

        if (this.title !== '') {
            var j = this.subs.findIndex(a => a.title === this.title);
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
        this.currentFileType = this.subs[i].type;

        this.calcFontHeight();
    },
    /**
     * Parse the given srt file text content, must be called once after starting the video!
     * @method Subtity#parseSRT
     * @param {string} text the file content
     * @param {string} title the subtitle special name to identify and use later
     * @param {string} movie the movie to display subtitles to
     */
    parseSRT: function (text, title, movie) {
        var sections = text.split('\n'),
            sub = {
                movie: movie,
                title: title,
                ranges: [],
                meta: {},
                subtitles: [],
                text: text,
                count: 0,
                type: 'srt'
            },
            // that's all it is
            isNam = false,
            subtitle = [];
        for (let i = 0; i < sections.length; i++) {
            const line = sections[i];

            if ((line.length == 1 || line.length === 0) && subtitle.length !== 0) {
                isNam = false;
                sub.subtitles.push(subtitle);
                subtitle = [];
            }

            if (line.indexOf('-->') !== -1) {
                sub.ranges.push(this.getSeconds(line));
                isNam = true;
            }
            else if (isNam === true && line.length !== 1) {
                subtitle.push(line)
            }
        }

        sub.count = sub.subtitles.length;
        this.subs.push(sub);
    },
    /**
     * Parse the given xml based file formats text content like `.dfxp` and `.ttml`, must be called once after starting the video!
     * 
     * @method Subtity#parseXMLBased
     * @param {string} text the file content
     * @param {string} title the subtitle special name to identify and use later
     * @param {string} movie the movie to display subtitles to
     */
    parseXMLBased: function (text, title, movie) {
        var sections = text.split('<body>')[1].split('</body>')[0].split('</div>'),
            sub = {
                movie: movie,
                title: title,
                meta: {
                    langs: {}
                },
                ranges: [],
                subtitles: [],
                text: text,
                type: 'dfxp'
            }, lang = null,
            rang = null,
            flang = null,
            rangout = null;

        for (let i = 0; i < sections.length; i++) {
            const element = sections[i].split('<div ')[1];
            if (element === undefined) continue;

            var keyword = element.substr(0, element.indexOf('>')).split(' ');

            keyword.forEach((a, i) => {
                keyword[i] = keyword[i].split('=');
                if (keyword[i][0] === 'xml:lang') {
                    lang = keyword[i][1].replaceAll('"', '');
                    if (flang === null) flang = lang;
                    sub.meta.langs[lang] = [];
                }
            });

            var lines = element.split('</p>');
            if (lang === null) {
                lang = 'en';
                if (flang === null) flang = lang;
            }
            for (let j = 0; j < lines.length; j++) {
                var line = lines[j].split('<p ')[1];
                if (line === undefined) continue;
                line = line.substr(line.indexOf('>') + 1, line.length);

                if (i === 0) {
                    rang = line.substr(0, line.indexOf('>')).split(' ');
                    rangout = [];
                    rang.forEach((a, k) => {
                        rang[k] = rang[k].split('=');
                        if (rang[k][0] === 'begin') {
                            rangout[0] = this.convertToTime(rang[k][1].replaceAll('"', ''));
                        }
                        else if (rang[k][0] === 'end') {
                            rangout[1] = this.convertToTime(rang[k][1].replaceAll('"', ''));
                        }
                    })
                }

                sub.ranges.push(rangout);
                sub.meta.langs[lang].push(line.split('<br />'));
            }
        }

        sub.subtitles = sub.meta.langs[flang];
        sub.count = sub.subtitles.length;
        this.subs.push(sub);
    },
    /**
     * Parse the given xml file text content, must be called once after starting the video!
     * @method Subtity#parseXML
     * @param {string} text the file content
     * @param {string} title the subtitle special name to identify and use later
     * @param {string} movie the movie to display subtitles to
     */
    parseXML: function (text, title, movie) {
        var sections = text.split('<video>')[1].split('<video/>')[0].split('</title>'),
            sub = {
                movie: movie,
                title: title,
                meta: {},
                ranges: [],
                subtitles: [],
                text: text,
                type: 'xml'
            };
        sections.pop();

        for (let i = 0; i < sections.length; i++) {
            const section = sections[i].split('<title>')[1];
            rang0 = this.convertToTime(section.split('<start>')[1].split('</start>')[0].replace(';', '.'));
            rang1 = this.convertToTime(section.split('<end>')[1].split('</end>')[0].replace(';', '.'));
            rang = [rang0, rang1];
            sub.ranges.push(rang);
            subtitle = section.split('<text>')[1].split('</text>')[0].split('<br/>');
            sub.subtitles.push(subtitle);
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
    parseWEBVTT: function (text, title, movie) {
        var sections = text.split('\n'), openSection = false,
            sub = {
                movie: movie,
                title: title,
                meta: {},
                ranges: [],
                subtitles: [],
                text: text,
                type: 'webvtt'
            };
        // that's all it is
        var subtitle = [];
        for (let i = 0; i < sections.length; i++) {
            const line = sections[i];

            // ignoring comments
            if (line.indexOf('NOTE ') !== -1 || line[0].indexOf('NOTE\n') !== -1) {
                continue;
            }

            if (openSection && (line.length !== 1 || line.length !== 0)) {
                subtitle.push(line);
            }

            if (line.indexOf('-->') !== -1) {
                var rang = this.getSeconds(line);
                sub.ranges.push(rang);
                openSection = true;
            }
            else if ((line.length === 1 || line.length === 0) && openSection === true) {
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
    parseSBV: function (text, title, movie) {
        var data = text.split('\n'), off = false, two = false, k = -1,
            sub = {
                movie: movie,
                title: title,
                meta: {},
                ranges: [],
                subtitles: [],
                text: text,
                type: 'sbv'
            };

        if (data[0].length === 1 || data[0].length === 0) off = true;
        for (let i = 0; i < data.length; i++) {
            var line = data[i];

            if (two === true && line.length !== 1 && line.length !== 0) {
                sub.subtitles[k].push(line);
            }

            if (off === true) {
                sub.ranges.push(this.getSeconds(line));
                off = false;
                two = true;
                k++;
                sub.subtitles[k] = [];
            }
            if (line.length === 1 || line.length === 0) {
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
    parseSSA: function (text, title, movie) {
        var data = text.split('\n'), syntax = null, section = null,
            sub = {
                movie: movie,
                title: title,
                meta: {},
                ranges: [],
                subtitles: [],
                count: null,
                text: text,
                type: 'ssa'
            };

        for (let i = 0; i < data.length; i++) {
            const line = data[i];


            if (line[0] === '[') {
                // that means we enter a section 
                // and now we will check what does the section contains
                var section = line.substr(1, line.indexOf(']') - 1).toLowerCase();
            }
            else {
                if (section === 'events') {
                    var pieces = line.split(':');
                    if (pieces.length > 2) {
                        for (let j = 2; j < pieces.length; j++) {
                            pieces[1] += ':' + pieces[j];
                        }

                        pieces.splice(2, pieces.length);
                    }
                    var lineSubject = pieces[0].toLowerCase();
                    var lineBody = pieces[1];

                    // line may be a format explain or a dialog
                    if (lineSubject === 'format') {
                        syntax = lineBody.toLowerCase().split(',');
                    }
                    else if (lineSubject === 'dialogue') {
                        // because for dialogs line contains more information then just the text
                        // there is the speaker and some other stuffs and that's ordered according 
                        // to the format line we found above

                        var lineBodySections = lineBody.split(',');

                        // getting the subtitle
                        k = syntax.findIndex(a => a.trim() === 'text');
                        var string = lineBodySections[k];

                        // getting the time rang
                        i0 = syntax.findIndex(a => a.toLowerCase().trim() === 'start');
                        i1 = syntax.findIndex(a => a.toLowerCase().trim() === 'end');

                        t1 = this.convertToTime(lineBodySections[i0]);
                        t2 = this.convertToTime(lineBodySections[i1]);

                        sub.ranges.push([t1, t2]);
                        sub.subtitles.push([string]);
                    }
                }
                else if (section === 'script info') {
                    if (line[0] === ';') continue; // stands for comments lines
                    pieces = line.split(':');
                    lineSubject = pieces[0];
                    sub.meta[lineSubject] = pieces[1];
                }
            }
        }

        sub.count = sub.subtitles.length;
        this.subs.push(sub);
    },
    /**
     * Parse the given .rt file format and subtract all subtitles and their durations.
     * @method Subtity#parseRT
     * @param {string} text the file content
     * @param {string} title the subtitle special name to identify and use later
     * @param {string} movie the movie to display subtitles to
     */
    parseRT: function (text, title, movie) {
        var data = text.split('<br/>'), section = [],
            sub = {
                movie: movie,
                title: title,
                meta: {},
                ranges: [],
                subtitles: [],
                count: null,
                text: text,
                type: 'rt'
            };

        // taking rid of the useless part
        data.shift();
        // fixing some part
        data[data.length - 1] = data[data.length - 1].split('</font>')[0];

        for (let i = 0; i < data.length; i++) {
            section = data[i].split('<clear/>');
            rang = section[0].split('<time ')[1].split('/>')[0].split(' ');
            rangout = [];
            for (let j = 0; j < rang.length; j++) {
                const element = rang[j].split('=');
                prop = element[0].toLowerCase();
                config = element[1].replaceAll('"', '');
                if (prop === 'begin') {
                    rangout[0] = parseFloat(config);
                }
                else if (prop === 'end') {
                    rangout[1] = parseFloat(config);
                }
            }

            // fixing the older rang if missing end property
            if (sub.ranges[sub.ranges.length - 1] !== undefined && sub.ranges[sub.ranges.length - 1].length === 1) {
                sub.ranges[sub.ranges.length - 1].push(rangout[0]);
            }
            sub.ranges.push(rangout);
            sub.subtitles.push(section[1].split('<br>'));
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
    parseITT: function (text, title, movie) {
        var data = text.split('<body>')[1].split('</body>')[0].split('<p '), pos = 0, timeRang = null,
            sub = {
                movie: movie,
                title: title,
                meta: {},
                ranges: [],
                subtitles: [],
                count: null,
                text: text,
                type: 'itt'
            }, raw = null, betterText = null;

        for (let i = 0; i < data.length; i++) {
            if (data[i][0] !== 'b') continue; // empty unrecognised line are ignored

            const sect = data[i].split('>');

            // getting the time rang that exist inside the p element in the format `start="hh:mm:ss.xx" dur="hh:mm:ss.xx"`
            raw = sect[0].split('"');
            // now after we split we have the the array with this content ['start','hh:mm:ss.xx','dur','hh:mm:ss.xx']
            // we now convert each indivual cell time
            timeRang = [this.convertToTime(raw[1]), this.convertToTime(raw[3])];
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
                betterText = string.replaceAll('<br', '\n');

                for (let k = 0; k < betterText.length; k++) {
                    if (betterText[k] + betterText[k + 1] + betterText[k + 2] + betterText[k + 3] + betterText[k + 4] === '<span' || betterText[k] + betterText[k + 1] === '</') {
                        break;
                    }
                    else {
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
    parseUSF: function (text, title, movie) {
        var meta = text.split('<metadata>')[1].split('</metadata>')[0],
            data = text.split('<subtitles>')[1].split('</subtitles>')[0].split('<subtitle '),
            sub = {
                movie: movie,
                title: title,
                ranges: [],
                meta: {},
                subtitles: [],
                count: null,
                text: text,
                type: 'usf'
            }, fline = '', sline = '', ino = false, splitter = [null, null];


        // getting the meta data
        if (meta.indexOf('<title>') !== -1) {
            sub.meta.title = meta.split('<title>')[1].split('</title>')[0];
        }
        if (meta.indexOf('<date>') !== -1) {
            sub.meta.date = meta.split('<date>')[1].split('</date>')[0];
        }
        if (meta.indexOf('<author>') !== -1) {
            var authorData = meta.split('<author>')[1].split('</author>')[0];
            if (authorData.indexOf('<name>') !== -1) {
                sub.meta.authorName = authorData.split('<name>')[1].split('</name>')[0];
            }
            if (authorData.indexOf('<url>') !== -1) {
                sub.meta.authorUrl = authorData.split('<url>')[1].split('</url>')[0];
            }
            if (authorData.indexOf('<email>') !== -1) {
                sub.meta.authorEmail = authorData.split('<email>')[1].split('</email>')[0];
            }
        }
        if (meta.indexOf('<language') !== -1) {
            sub.meta.language = "";
            t = meta.split('<language ')[1].split('</language>')[0];
            sub.meta.language = t.substr(t.indexOf('>') + 1, t.length);
        }

        for (let i = 0; i < data.length; i++) {
            if (data[i][0] !== 's') continue; // empty recognised lines are ignored

            const line = data[i];
            const timeRang = data[i].split('>')[0].split('"');
            var begin = this.convertToTime(timeRang[1]);
            var end = this.convertToTime(timeRang[3]);


            // choosing the right splitter
            if (line.indexOf('<text ') !== -1) {
                splitter[0] = '<text ';
                splitter[1] = '</text>';
            }
            else if (line.indexOf('<karaoke ') !== -1) {
                splitter[0] = '<karaoke ';
                splitter[1] = '</karaoke>';
            }

            // doing the subtraction
            sline = line.split(splitter[0])[1].split(splitter[1])[0];
            fline = '';
            ino = false;
            for (let k = sline.indexOf('>'); k < sline.length; k++) {
                const element = sline[k];

                if (sline[k] === '<' && sline[k + 1] !== ' ') {
                    ino = false;
                }

                if (ino) {
                    fline += element;
                }


                if (element === '>') {
                    ino = true;
                }

            }

            // make sure there is no other subtitle that collides with this one.
            var alr = sub.ranges.findIndex(a => begin >= a[0] && begin <= a[1]);
            if (alr !== -1) {
                sub.subtitles[alr] = sub.subtitles[alr].concat(fline.split('\n'));
            }
            else {
                sub.subtitles.push(fline.split('\n'));
                sub.ranges.push([begin, end]);
            }
        }

        sub.count = sub.subtitles.length;
        this.subs.push(sub);
    },
    /**
     * Parse the given .subti file format and subtract all subtitles and their durations.
     * @method Subtity#parseSUBTI
     * @param {string} text the file content
     * @param {string} title the subtitle special name to identify and use later
     * @param {string} movie the movie to display subtitles to
     */
    parseSUBTI: function (text, title, movie) {
        var data = text.split('=='),
            sub = {
                movie: movie,
                title: title,
                meta: {},
                ranges: [],
                subtitles: [],
                count: null,
                text: text,
                type: 'subti'
            };

        // now data contains at the first section the meta data
        // so let's subtract it
        var meta = data[0].split('\n');
        meta.pop();
        for (let j = 0; j < meta.length; j++) {
            const element = meta[j].split('=');
            sub.meta[element[0]] = element[1];
        }

        sub.meta.names = [];
        // now moving the actual subtitles
        for (let i = 1; i < data.length; i++) {
            const section = data[i].split('\n');
            // doing this will add two empty cells at the begin and
            // the end of the section array
            // we need to delete them
            // getting the time
            // the first empty cell well it's not totally empty some times ou find the talker name in it
            // so let's save any way
            sub.meta.names.push(section[0]);
            section.shift();// this to delete the empty cell
            sub.ranges.push(this.getSeconds(section[0]));
            section.shift();// to delete the cell containing the time rang
            if (section[section.length - 1] === '') section.pop();  // to delete the last empty cell
            // now the subtitle
            sub.subtitles.push(section);
        }

        sub.count = sub.subtitles.length;
        this.subs.push(sub);
    },
    /**
     * Parse the given .lrc file format and subtract all lyric and their durations.
     * @method Subtity#parseLRC
     * @param {string} text the file content
     * @param {string} title the subtitle special name to identify and use later
     * @param {string} movie the movie to display subtitles to
     */
    parseLRC: function (text, title, movie) {
        var data = text.split('\n'),
            sub = {
                movie: movie,
                title: title,
                meta: {},
                ranges: [],
                subtitles: [],
                count: null,
                text: text,
                type: 'lrc'
            };
        // subtracting meta


        // subtracting main
        for (let i = 0; i < data.length; i++) {
            if (data[i].length === 1 || data[i].length === 0) continue;
            const line = data[i].split('[')[1].split(']');
            var descrip = line[0];
            var body = line[1];

            if (nums.indexOf(descrip[0]) === -1) {
                // basically this is means this is a meta data about the file
                subj = descrip.substr(0, descrip.indexOf(':'));
                elm = descrip.substr(descrip.indexOf(':') + 1, descrip.length);
                if (subj === 'au') subj = 'author';
                if (subj === 'ar') subj = 'artist';
                if (subj === 'al') subj = 'album';
                if (subj === 'ti') subj = 'title';
                sub.meta[subj] = elm;
            }
            else {
                // means this is a lyric line
                rang = this.convertToTime(descrip);
                k = sub.ranges.push([rang]);
                sub.subtitles.push([body]);

                if (sub.ranges[k - 2] !== undefined) {
                    sub.ranges[k - 2].push(rang);
                }
            }
        }
        sub.ranges[sub.ranges.length - 1].push(Infinity);

        sub.count = sub.subtitles.length;
        this.subs.push(sub);
    },
    /**
     * Convert a given time in seconds to a proper format to be used in a subtitle file in this way `hh:mm:ss.xx` seperated
     * by the given seperator.
     * @method Subtity#convertToText
     * @param {number} time 
     * @param {string} seperator default is `:`
     * @param {string} fractionSymbol default is `.`
     * @returns {string}
     */
    convertToText: function (time, seperator = ':', fractionSymbol = '.') {
        var hours = Math.floor(time / 3600);
        time = time - (hours * 3600);
        var minutes = Math.floor(time / 60);
        time = time - (minutes * 60);
        var seconds = time.toFixed(2);
        seconds = seconds.replace('.', fractionSymbol);

        return hours + seperator + minutes + seperator + seconds;
    },
    /**
     * Convert the string in time notation `hh:mm:ss` or `hh:mm:ss.xx` to real number represent time 
     * in seconds. used internally by the library!
     * @method Subtity#convertToTime
     * @param {string} time 
     * @returns {number}
     */
    convertToTime: function (time) {
        var dur = 0, begin, end, hours, minutes, seconds;
        var org = time.split(':');


        // now parse the hours minutes and seconds
        if (org.length === 3) {

            // something should be done after using parseFloat function:
            // we should change the `,` to `.` so the function does right parsing
            // this is only in srt file
            org[2] = org[2].replace(',', '.');


            hours = parseFloat(org[0]);
            minutes = parseFloat(org[1]);
            seconds = parseFloat(org[2]);
        }
        else {
            org[1] = org[1].replace(',', '.');


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
     * for `srt` , `subti` , `sbv` and `webvtt` file formats.
     * @method Subtity#getSeconds
     * @param {string} repRang stands for representation rang
     * @returns {Array}
     */
    getSeconds: function (repRang) {
        var rang = [0, 0];
        // first we seperate the rang, usually it's the form beginTime-->endTime in srt and webvtt
        // files and beginTime,endTime in sbv files and beginTime=>endTime in subti files
        // so we need to check the existance of the arrow, if not then we seperate with `,`
        repRang = repRang.indexOf('=>') !== -1 ? repRang.split('=>') : repRang.indexOf('-->') === -1 ? repRang.split(',') : repRang.split('-->');

        // using a local function we subtract time(convert it)
        rang[0] = this.convertToTime(repRang[0]);
        rang[1] = this.convertToTime(repRang[1]);

        return rang;
    },
    /**
     * Must be called as the video time updated or the loop updated, to render or display the subtitles.
     * @method Subtity#update
     */
    update: function () {
        if (this.mode === null) {
            console.warn('Must set up the parser rendering mode first!\`Subtity.setUp2D or Subtity.setUpContainer\`');
            return;
        }

        if (this.ranges.length === 0 || this.subtitles.length === 0 || this.activated === false) return;

        current = this.video.currentTime * this.speedFactor;
        mov = this.video.src;

        for (let i = 0; i < this.ranges.length; i++) {
            const rang = this.ranges[i];
            const text = this.subtitles[i];
            current -= this.offset;

            if (current >= rang[0] && current <= rang[1]) {
                this.current = i;

                if (this.mode === 1) {
                    this.container.innerText = this.subtitles[this.current];
                }
                else {
                    // for rendering mode we should get the options
                    family = this.style.family || 'Arial';
                    style = this.style.style || 'normal';
                    variant = this.style.variant || 'normal';
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
                    this.renderer.font = `${style} ${variant} ${weight} ${size}px ${family}`;
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
                        this.renderer.strokeText(line, x, y);
                        this.renderer.lineWidth = 1;
                        this.renderer.fillText(line, x, y);
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
    setUp2D: function (canvas, video) {

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
    setUpContainer: function (elm, video) {
        this.container = elm;
        this.mode = 1;
        this.video = video;
    },
    /**
     * Set the offset value, pass positive number to progress or negative to delay the subtitle displaying process.
     * @method Subtity#setOffset
     * @param {number} offset 
     */
    setOffset: function (offset) {
        this.offset = typeof offset === 'number' && !isNaN(offset) ? offset : this.offset;
    },
    /**
     * Change the subtitle rendering speed
     * @method Subtity#setSpeed
     * @param {number} speed 
     */
    setSpeed: function (speed) {
        this.speedFactor = typeof speed === 'number' && !isNaN(speed) ? speed : this.speedFactor;
    },
    /**
     * Customize the subtitles style when displaying, this is only applied when rendering
     * to a 2D context, not when using normal DOM element.
     * @method Subtity#set
     * @param {string} style 
     * @param {any} value 
     */
    set: function (style, value) {

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
            case 'style':
                this.style.style = value;
                break;
            case 'variant':
                this.style.variant = value;
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
    calcFontHeight: function () {
        fontSize = parseFloat(this.style.size);
        fontFamily = this.style.family;

        var modal = 'gM';
        var context = this.ctx;
        context.canvas.width = context.canvas.width;

        context.fillRect(0, 0, context.canvas.width, context.canvas.height);
        context.textBaseline = 'top';

        context.font = fontSize + 'px ' + fontFamily;
        context.fillStyle = 'white';

        context.fillText(modal, 0, 0);

        var data = context.getImageData(0, 0, context.canvas.width, context.canvas.height).data;

        var start = -1;
        var end = -1;
        for (var i = 0; i < context.canvas.height; i++) {

            for (var j = 0; j < context.canvas.width; j++) {
                var index = (i * context.canvas.width + j) * 4;

                if (data[index] === 0) {
                    if (j === context.canvas.width - 1 && start !== -1) {
                        end = i;
                        i = context.canvas.height;
                        break
                    }
                    continue
                }
                else {
                    if (start === -1) {
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
    loadDefaultStyle: function () {
        this.style = {
            family: 'Arial',
            size: 19,
            lineSpacing: 10,
            color: 'rgb(255,255,255)',
            align: 'center',
            direction: 'ltr',
            outlineColor: 'rgb(0,0,0)',
            outlineSize: 1,
            shadowColor: 'rgba(0,0,0,0)',
            opacity: 1,
            shadowBlur: 0,
            shadowX: 0,
            shadowY: 0,
            base: 90,
            left: 50,
            weight: '',
            style: 'normal',
            variant: 'normal'
        }
    },
    /**
     * Toggle the activation of the subtitle
     * @method Subtity#toggleActivation
     * @param {boolean} state the state to force applying `false` to disactivate or `true` to activate.
     * @returns {boolean} the new activation state
     */
    toggleActivation: function (state) {
        if (typeof state === 'boolean') {
            this.activated = state;
        }
        else {
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
    remove: function (title) {
        var i = this.subs.findIndex(a => a.title === title);

        if (i !== -1) {
            if (this.subs[i].used === true) {
                this.reset();
            }
            return this.subs.splice(i, 1);
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
    add: function (title, text, ext, movie) {
        if (typeof ext !== 'string' || typeof text !== 'string' || title === '') return;

        var res = this.check(title);
        if (res === false) {
            return;
        }

        ext = ext.toLowerCase();
        if (ext === '.srt' || ext === 'srt') {
            this.parseSRT(text, title, movie);
        }
        else if (ext === '.sbv' || ext === 'sbv') {
            this.parseSBV(text, title, movie);
        }
        else if (ext === '.itt' || ext === 'itt') {
            this.parseITT(text, title, movie);
        }
        else if (ext === '.webvtt' || ext === 'webvtt') {
            this.parseWEBVTT(text, title, movie);
        }
        else if (ext === '.ssa' || ext === 'ssa') {
            this.parseSSA(text, title, movie);
        }
        else if (ext === '.usf' || ext === 'usf') {
            this.parseUSF(text, title, movie);
        }
        else if (ext === '.lrc' || ext === 'lrc') {
            this.parseLRC(text, title, movie);
        }
        else if (ext === '.subti' || ext === 'subti') {
            this.parseSUBTI(text, title, movie);
        }
        else if (ext === '.rt' || ext === 'rt') {
            this.parseRT(text, title, movie);
        }
        else if (ext === '.dfxp' || ext === 'dfxp' || ext === 'ttml' || ext === '.ttml') {
            this.parseXMLBased(text, title, movie);
        }
        else if (ext === '.xml' || ext === 'xml') {
            this.parseXML(text, title, movie);
        }
    },
    /**
     * Export the current system stored subtitles into a file text in certain type
     * @method Subtity#export
     * @param {string} fileFormat 
     * @returns {string} the text content or `false` if cannot export to the given type/fileFormat
     */
    export: function (fileFormat) {
        if (typeof fileFormat !== 'string') return;

        fileFormat = fileFormat.toLowerCase();
        var text = false;

        if (fileFormat === '.srt' || fileFormat === 'srt') {
            text = this.exportToSRT();
        }
        else if (fileFormat === '.sbv' || fileFormat === 'sbv') {
            // to be done
        }
        else if (fileFormat === '.itt' || fileFormat === 'itt') {
            // ti be done
        }
        else if (fileFormat === '.webvtt' || fileFormat === 'webvtt') {
            text = this.exportToWEBVTT();
        }
        else if (fileFormat === '.ssa' || fileFormat === 'ssa') {
            text = this.exportToSSA();
        }
        else if (fileFormat === '.usf' || fileFormat === 'usf') {
            // to be done
        }
        else if (fileFormat === '.lrc' || fileFormat === 'lrc') {
            text = this.exportToLRC();
        }
        else if (fileFormat === '.subti' || fileFormat === 'subti') {
            text = this.exportToSUBTI();
        }

        return text
    },
    /**
     * Check whether a title is under use or not, then warn to console if it's is
     * @method Subtity#check
     * @param {string} title
     * @returns {boolean}
     */
    check: function (title) {
        var index = this.subs.findIndex(a => a.title === title);
        if (index !== -1) {
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
    exportToSRT: function () {
        var text = '';
        for (let i = 0; i < this.subtitles.length; i++) {
            const sub = this.subtitles[i];
            const rang = this.ranges[i];
            var sect = (i + 1) + '\n';
            sect += this.convertToText(rang[0], ':', ',') + ' --> ' + this.convertToText(rang[1], ':', ',') + '\n';

            sect += sub.join('\n');

            text += sect + '\n';
        }

        return text;
    },
    /**
     * Export the current system content of subtitles and ranges to an .webvtt file formats text
     * @method Subtity#exportToWEBVTT
     * @returns {string}
     */
    exportToWEBVTT: function () {
        var text = 'WEBVTT\n';

        for (let i = 0; i < this.subtitles.length; i++) {
            const sub = this.subtitles[i];
            const rang = this.ranges[i];
            var sect = (i + 1) + '\n';
            sect += this.convertToText(rang[0]) + ' --> ' + this.convertToText(rang[1]) + '\n';

            sect += sub.join('\n');

            text += sect + '\n';
        }

        return text;
    },
    /**
     * Export the current system content of subtitles and ranges to an .subti file formats text
     * @method Subtity#exportToSUBTI
     * @returns {string}
     */
    exportToSUBTI: function () {
        var text = '';

        // inserting the meta data first
        for (const key in this.meta) {
            if (this.meta.hasOwnProperty(key)) {
                const element = this.meta[key];
                s = key + ' = ' + element + '\n';
                text += s;
            }
        }
        text += '==';
        var names = this.meta.names !== undefined ? this.meta.names : [];

        // now inserting the subtitles
        for (let i = 0; i < this.subtitles.length; i++) {
            const subtitle = this.subtitles[i];
            const rang = this.ranges[i];
            const name = names[i] !== undefined ? names[i] : '';

            var sect = name + '\n';
            sect += this.convertToText(rang[0]) + '=>' + this.convertToText(rang[1]) + '\n';

            sect += subtitle.join('\n');

            text += sect + '\n==';
        }

        return text
    },
    /**
     * Export the current system content of subtitles and ranges to an .lrc file formats text
     * @method Subtity#exportToLRC
     * @returns {string}
     */
    exportToLRC: function () {
        var text = '';
        // first packaging the meta data
        for (const key in this.meta) {
            if (this.meta.hasOwnProperty(key)) {
                const value = this.meta[key];
                name = key === 'artist' ? 'ar' : key === 'album' ? 'al' : key === 'title' ? 'ti' : key === 'author' ? 'au' : key;
                text += '[' + name + ':' + value + ']\n';
            }
        }

        for (let i = 0; i < this.subtitles.length; i++) {
            const sub = this.subtitles[i][0];
            const rang = this.convertToText(this.ranges[i][0]);
            text += '[' + rang + ']' + sub + '\n';
        }

        return text;
    },
    /**
     * Export the current system content of subtitles and ranges to an .ssa file formats text
     * @method Subtity#exportToSSA
     * @returns {string}
     */
    exportToSSA: function () {
        text = '[Script Info]\n';
        // packaging the meta data
        for (const key in this.meta) {
            if (this.meta.hasOwnProperty(key)) {
                const element = this.meta[key];
                text += key + ': ' + element + '\n';
            }
        }
        text += '\n';

        // now the subtitle
        text += '[Events]\n';
        // declaring the format
        text += 'Format: Start, End, Name, Text\n';
        var names = this.meta.names !== undefined ? this.meta.names : [];

        for (let i = 0; i < this.subtitles.length; i++) {
            const sub = this.subtitles[i];
            const rang1 = this.convertToText(this.ranges[i][0]);
            const rang2 = this.convertToText(this.ranges[i][1]);
            const name = names[i] !== undefined ? names[i] : 'Unknown';

            text += 'Dialogue: ' + rang1 + ',' + rang2 + ',' + name + ',' + sub + '\n';
        }

        return text
    },
    /**
     * Change the current subtitle language if subtitle file provided with multi languages, this is only supported with certain
     * file formats like `.dfxp`.
     * @method Subtity#switchToLang
     * @param {string} lang the first two letter of the language for example for `english` you pass `en` and so on... 
     */
    switchToLang: function (lang) {
        if (this.meta.langs !== undefined) {
            if (this.meta.langs.hasOwnProperty(lang)) {
                this.subtitles = this.meta.langs[lang];
            }
        }
    }
}

export default Subtity;