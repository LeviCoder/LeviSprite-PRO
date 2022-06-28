
/**

this script contains 'palettes' and 'colors', creates the editable canvas (can), and sets up undo/redo and saving functions

**/




// setting up tools
// keep pixels from repainting the same color

// flesh out tool functions
// fix palette change changing canvas, m.history, etc


var m, palettes, tempPal, parsePal, cInd, colors, saveInd, saves, tools, can, pushSave, undoSave, redoSave;


function preload() {


// an array of colors to use and edit
palettes = {
  "alpha": {
    a: color(255, 0, 0),
    b: color(0, 255, 0),
    c: color(0, 0, 255),
  },
  "bubble tea": {
    a: color(222, 201, 194),
    b: color(237, 140, 37),
    c: color(35, 92, 153, 153),
    d: color(150, 37, 153),
  },
  "crayon": {
    a: color(164, 40, 40),
    b: color(200, 31, 31),
    c: color(255, 255, 255),
    d: color(255, 255, 255),
    e: color(255, 255, 255),
    f: color(255, 255, 255),
    g: color(255, 255, 255),
    h: color(255, 255, 255),
    i: color(255, 255, 255),
    j: color(255, 255, 255),
    k: color(255, 255, 255),
  },
};
if(Object.keys(palettes).length > 18) {
  alert("Too many palettes. Only 18 will be displayed");
}


// the key for the currently used palette
cInd = Object.keys(palettes)[0];
// easier to manage and reference the current palette when it's stored in a separate variable
colors = palettes[cInd];

saveInd = 0;
saves = [];


// an array of possible tool options
tools = [
  "eyedropper",

  "pixel",
  "diameter",
  "bucket",
  "eraser",

  false,

  "select",
  "magic_select",

  "move",
  //"pan",
  //"crop",
];

can = {
  x: 70,
  y: 55,

  pw: 0,
  ph: 0,

  ps: 0,


  w: 0,
  h: 0,

  backImg: 0,
  canvasImg: 0,

  // art array
  a: [],

  // holds changes until end of m.press for clean saving
  temp: {
    fresh: false,
    coords: [],
    places: {},
  },

  was: false,

  cursors: {
    "eyedropper": "se-resize",

    "pixel": "crosshair",
    "diameter": "crosshair",
    "bucket": "cell",
    "eraser": "not-allowed",

    "select": "arrow",
    "magic_select": "nw-resize",

    "move": "move",
  },
  cursorsExtra: {
    "eyedropper": function() {

    },

    "pixel": function() {
      if(m.context === "canvas") {
        noFill();
        strokeWeight(1);
        stroke(255);
        rect(can.x + m.x*can.ps - 1, can.y + m.y*can.ps - 1, can.ps + 2, can.ps + 2);
        stroke(0);
        rect(can.x + m.x*can.ps, can.y + m.y*can.ps, can.ps, can.ps);
      }
    },
    "diameter": function() {
      if(m.context === "canvas") {
        noFill();
        strokeWeight(1);
        stroke(255);
        ellipse(mouseX, mouseY, m.radius*2 + 2, m.radius*2 + 2);
        stroke(0);
        ellipse(mouseX, mouseY, m.radius*2, m.radius*2);
      }
    },
    "bucket": function() {

    },
    "eraser": function() {

    },

    "select": function() {

    },
    "magic_select": function() {

    },

    "move": function() {

    },
  },

  toolPress: {
    "eyedropper": false,

    "pixel": true,
    "diameter": true,
    "bucket": false,
    "eraser": false,

    "select": true,
    "magic_select": false,

    "move": true,
  },

  toolFunc: {
    "eyedropper": function() {
      m.setColor(can.a[m.y][m.x]);
      m.setTool(m.wasTool, m.tool);
    },

    "pixel": function() {
      can.paintPixel(m.x, m.y);
    },
    "diameter": function() {

      var r = ~~(m.radius/can.ps + 1);
      var px = m.x - r, py = m.y - r;

      for(var y = py; y < py + r*2; y++) {
        for(var x = px; x < px + r*2; x++) {
          if(dist(mouseX - can.x, mouseY - can.y, (x + 0.5)*can.ps, (y + 0.5)*can.ps) < m.radius) {
            can.paintPixel(x, y);
          }
        }
      }
    },
    "bucket": function() {
      can.dripPixel(m.x, m.y);
    },
    "eraser": function() {},

    "select": function() {

    },
    "magic_select": function() {

    },

    "move": function() {

    },
  },

  create: function(w, h) {
    this.a = [];

    var pw = this.pw, ph = this.ph;
    if(typeof w === "number" || w === undefined) {
      this.pw = w || pw;
      this.ph = h || pw;

      for(var y = 0; y < this.ph; y++) {
        this.a.push([]);
        for(var x = 0; x < this.pw; x++) {
          this.a[y].push(".");
        }
      }
    } else {
      this.pw = (w[0] ? w[0].length : 1);
      this.ph = w.length || 1;

      for(var y = 0; y < this.ph; y++) {
        this.a.push([]);
        for(var x = 0; x < this.pw; x++) {
          this.a[y].push(w[y][x]);
        }
      }
    }

    this.w = this.pw*this.ps;
    this.h = this.ph*this.ps;

    if(this.pw !== pw || this.ph !== ph) {
      this.setBackground();
    }
    this.setCanvas();


  },
  setPixSize: function(ps) {
    this.ps = ps;
    this.w = this.pw*this.ps;
    this.h = this.ph*this.ps;
  },

  in: function(x, y) {
    return x >= 0 && y >= 0 && y < this.a.length && x < this.a[y].length;
  },
  paintPixel: function(x, y) {
    if(this.in(x, y) && this.a[y][x] !== m.color) {
      this.savePixel(x, y);
    }
  },
  dripPixel: function(x, y) {
    if(this.in(x, y) && this.temp.places[(x + "," + y)] === undefined && this.a[y][x] === this.was && this.was !== m.color) {
      this.savePixel(x, y);

      this.dripPixel(x - 1, y);
      this.dripPixel(x + 1, y);
      this.dripPixel(x, y + 1);
      this.dripPixel(x, y - 1);
    }
  },

  savePixel: function(x, y) {
    if(this.temp.places[(x + "," + y)] === undefined) {
      this.temp.fresh = m.color;
      this.temp.coords.push([x, y, this.a[y][x]]);
      this.temp.places[(x + "," + y)] = 1;
    }
  },

  checkMouse: function() {
    return m.context === "canvas" && (this.toolPress[m.tool] && m.press || m.click);
  },
  handleMouse: function() {
    if(this.checkMouse()) {
      this.was = this.was || this.a[m.y][m.x];
      this.toolFunc[m.tool]();
    }
  },

  refresh: function() {
    // enter 'temp' into 'a', save
    for(var i = 0; i < this.temp.coords.length; i++) {
      this.a[this.temp.coords[i][1]][this.temp.coords[i][0]] = this.temp.fresh;
    }

    pushSave("edits", this.temp.coords, this.temp.fresh);

    this.temp.coords = [];
    this.temp.places = {};

    this.setCanvas();
    this.was = false;

  }

}

// saves: edits (temp.coords, temp.fresh), canvas (can.a entire), palettes (entire)

parsePal = function() {
  // JSON.parse(JSON.stringify(palettes))
  // for some reason the JSON method throws an error. Probably because it is treated as typed code and doesn't have the history of coming from appropriate color functions

  // so clunky methods will do
  var n = {};
  for(var i in palettes) {
    n[i] = {};
    for(var j in palettes[i]) {
      n[i][j] = color(red(palettes[i][j]), green(palettes[i][j]), blue(palettes[i][j]), alpha(palettes[i][j]));
    }
  }
  return n;
};
pushSave = function() {
  if(saveInd < saves.length - 1) {
    saves = saves.slice(0, saveInd + 1);
  }
  var n = [];
  if(arguments[0] === "palettes") {
    n = ["palettes", parsePal(), tempPal];

  } else if(arguments[0] === "canvas"){
    n = ["canvas", JSON.parse(JSON.stringify(can.a))]
  } else {
    for(var i = 0; i < arguments.length; i++) {
      n.push(arguments[i]);
    }
  }

  saves.push(n);
  saveInd = saves.length - 1;

  console.log(n);
};
undoSave = function() {
  if(saveInd > 0) {
    var n = saves[saveInd];
    //console.log(n)
    if(n[0] === "edits") {
      for(var i = 0; i < n[1].length; i++) {
        //console.log(n[1])
        can.a[n[1][i][1]][n[1][i][0]] = n[1][i][2];
      }

      can.setCanvas();
    } else if(n[0] === "palettes") {

      palettes = n[2];
      colors = palettes[cInd];
      if(!colors[m.color]) {
        m.color = "a";
      }
      can.setCanvas();
    } else if(n[0] === "canvas") {
      can.create(n[1]);
      can.setCanvas();
    }

    saveInd--;
  }
};
redoSave = function() {
  if(saveInd < saves.length - 1) {
    saveInd++;
    var n = saves[saveInd];

    if(n[0] === "edits") {
      for(var i = 0; i < n[1].length; i++) {
        can.a[n[1][i][1]][n[1][i][0]] = n[2];
      }

      can.setCanvas();
    } else if(n[0] === "palettes") {

      palettes = n[1];
      colors = palettes[cInd];
      if(!colors[m.color]) {
        m.color = "a";
      }
      can.setCanvas();
    } else if(n[0] === "canvas") {
      can.create(n[1]);
      can.setCanvas();
    }

  }
};

// end of preload function
};
