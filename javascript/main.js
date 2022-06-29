

/**

// TODO:

left align menu text
comment and sort through code
fix palette renaming to actually rename

fix Enter HEX
upload palette or art code
rename swatch function :)


confirm(), alert(), prompt()
**/

// predefined in the global scope
var frame;

// everything else is within the setup function
setup = function() {

// remember the parent element
var parentElement = document.getElementById("canvas");

// make the p5.js canvas a child of the given element
let myCanvas = createCanvas(600, 600);
myCanvas.parent('canvas');

// basic setup
frameRate(60);
popupSetup();
textFont("Andale Mono");


// stores keypresses as keycode and letter values
var keys = {};

// an array that will hold keys of all sub-windows for closing
var popups = [];
var windowOpen = false;

// palette picker or swatch selector?
var colorMenu = "palettes";

// 18 letters to use as keys for color values in 'palettes'
var lets = "abcdefghijklmnopqr";


// mouse object, deals with (most) things mouse-related
m = {

  // obvious
  click: false,
  press: false,

  // the current tool, the key for the current color
  tool: "pixel",
  color: "a",

  // previously used tool
  wasTool: "pixel",
  // size of the 'diameter' tool
  radius: 70,

  // tells which window the mouse is inside
  context: "",
  setContext: function() {

    this.context = "";

    // first check all the windows in the 'window' object
    for(var i = windowInd.length - 1; i >= 0; i--) {

      // if it's active and the mouse is inside...
      if(windows[windowInd[i]].active && m.in(windows[windowInd[i]].x, windows[windowInd[i]].y, windows[windowInd[i]].w, windows[windowInd[i]].h)) {

        // set the context and exit the loop.
        // this means the order matters for overlapping windows.
        m.context = windowInd[i];
        i = 0;

      }
    }

    // if no context was found but the mouse is in the canvas...
    if(m.context === "" && m.in(can.x, can.y, can.w, can.h)) {
      m.context = "canvas";
      // the canvas is not a 'window'
    }

    // end of m.setContext()
  },

  // used by sliders etc. instead of m.context
  // multiple sliders might be in the same context, but only one should be active, depending on where the mousedrag event started. this works well
  startX: 0,
  startY: 0,

  // mouse x and y from the top left corner of the canvas (measured in pixels that are 'can.ps' wide)
  x: 0,
  y: 0,

  // color keys the user has recently used go here
  history: [],
  // makes sure a key doesn't appear twice
  filterHistory: function() {

    // stores approved keys
    var h = [];

    // loops through the history
    for(var i = 0; i < this.history.length && h.length < 4; i++) {
      // if 'h' does not already include this key, and the key does not relate to the current color, and is not the '.' key (blank), and is in the palette...
      if(!h.includes(this.history[i]) && m.color !== this.history[i] && this.history[i] !== "." && colors[this.history[i]]) {
        // approve and store
        h.push(this.history[i]);
      }
    }

    // new refined history :)
    this.history = h;

    // end of m.filterHistory()
  },

  // basic check for if [mouseX, mouseY] is within the given box. returns Bool
  in: function(x, y, w, h) {
    return mouseX >= x && mouseX < x + w && mouseY >= y && mouseY < y + h;
  },

  // sets m.color
  // input is a color key
  setColor: function(c) {
    c = (colors[c] || c === ".") ? c : "a";
    // makes history
    this.history.unshift(this.color);
    // sets color
    this.color = c;
    // filters history
    this.filterHistory();
  },

  setTool: function(t, w) {
    this.wasTool = w || this.tool;
    this.tool = t;
  }

  // end of 'm' (mouse) object
};

var cMode = "dark";
var cOptions = {
  dark: {
    light: color(120),
    panel: color(50),
    background: color(30),
    highlight: color(236, 163, 28),
    hover: color(255, 10),
    tColors: [color(230), color(240)],
    clear: color(255, 0),
  },
  light: {
    light: color(190),
    panel: color(240),
    background: color(225),
    highlight: color(236, 163, 28),
    hover: color(0, 6),
    tColors: [color(230), color(240)],
    clear: color(255, 0),
  }
}
var c = cOptions[cMode];


can.setCanvas = function() {
  clear(255, 0);
  noStroke();
  for(var y = 0; y < this.a.length; y++) {
    for(var x = 0; x < this.a[y].length; x++) {
      if(this.a[y][x] !== "." && colors[this.a[y][x]]) {
        //console.log(this.a[y][x]);
        fill(colors[this.a[y][x]]);
        rect(can.x + x*can.ps, can.y + y*can.ps, can.ps, can.ps);
      } else if(this.a[y][x] !== ".") {
        console.log("can.setCanvas() says: colors[can.a[" + y + "][" + x + "]] === " + colors[this.a[y][x]]);
      }
    }
  }
  can.canvasImg = get(can.x, can.y, can.w || 1, can.h || 1);
};
can.setBackground = function() {
  noStroke();
  fill(c.tColors[0]);
  rect(can.x, can.y, can.w, can.h);

  fill(c.tColors[1]);
  for(var y = 0; y < this.ph; y++) {
    for(var x = 0; x < this.pw; x++) {
      if((x + y) % 2) {
        rect(can.x + x*can.ps, can.y + y*can.ps, can.ps, can.ps);
      }
    }
  }
  can.backImg = get(can.x, can.y, can.w || 1, can.h || 1);
}
can.drawTemp = function() {
  noStroke();
  if(this.temp.fresh === ".") {
    for (var i = 0; i < this.temp.coords.length; i++) {
      fill(c.tColors[(this.temp.coords[i][0] + this.temp.coords[i][1]) % 2]);
      rect(can.x + this.temp.coords[i][0]*can.ps, can.y + this.temp.coords[i][1]*can.ps, can.ps, can.ps);
    }
  } else {
    for (var i = 0; i < this.temp.coords.length; i++) {
      fill(colors[this.temp.fresh] || c.highlight);
      rect(can.x + this.temp.coords[i][0]*can.ps, can.y + this.temp.coords[i][1]*can.ps, can.ps, can.ps);
    }
  }
};
can.draw = function() {
  image(this.backImg, can.x, can.y);
  image(this.canvasImg, can.x, can.y);
}

can.setPixSize(20);
can.create(3, 3);

/*
following two functions taken from (here)[https://www.30secondsofcode.org/js/] and adapted to JS by WalkWorthy (@powercoder on Khan Academy)
*/
function HSBtoRGB (h, s, b, a) {
    h = map(h, 0, 360, 0, 360);
    s /= 255;
    b /= 255;
    var k = function(n) { return (n + h / 60) % 6; };
    var f = function(n) { return b * (1 - s * Math.max(0, Math.min(k(n), 4 - k(n), 1))); };
    return color(round(255 * f(5)), round(255 * f(3)), round(255 * f(1)), a === undefined? 255 : a);
}
function RGBtoHSB(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  var v = Math.max(r, g, b), n = v - Math.min(r, g, b);
  var h = n === 0 ? 0 : n && v === r ? (g - b) / n : v === g ? 2 + (b - r) / n : 4 + (r - g) / n;
  var hsb = [60 * (h < 0 ? h + 6 : h), v && (n / v) * 100, v * 100];

  hsb[0] = map(hsb[0], 0, 360, 0, 360);
  hsb[1] = map(hsb[1], 0, 100, 0, 255);
  hsb[2] = map(hsb[2], 0, 100, 0, 255);

  return hsb;
}
function hexToDec(str) {

}
function HEXtoRGB(str) {
  if(str[0] === "#") {
    str = str.slice(1, 10);
  }
  console.log(str);

  var r, g, b, a;

  if(str.length === 8) {

  } else if(str.length === 6) {

  } else if(str.length === 4) {

  } else if(str.length === 3) {

  } else {
    console.log("'HEXtoRGB' funnction says: wacky input, couldn't parse.")
  }
}

var cPicker = {

  h: 0,
  s: 0,
  b: 0,

  o: 0,


  setPicker: function(clr) {

    var cl = RGBtoHSB(red(clr), green(clr), blue(clr));

    this.h = cl[0];
    this.s = cl[1];
    this.b = cl[2];
    this.o = alpha(clr);

  },

  grad: (function() {

    background(255, 0);
    var n = 255/70;
    strokeWeight(1);

    for(var x = 0; x <= 70; x++) {
      for(var y = 0; y <= 70; y++) {
        stroke(255, 255 - x*n);
        point(x, y);
        stroke(0, y*n);
        point(x, y);
      }
    }

    return get(0, 0, 70, 70);
  }()),
  hue: (function() {

    background(255, 0);
    var n = 360/70;
    strokeWeight(1);
    colorMode(HSB);

    for(var y = 0; y <= 70; y++) {
      stroke(y*n, 255, 255);
      line(0, y, 3, y);
    }

    colorMode(RGB);

    strokeWeight(8);
    stroke(c.panel);
    noFill();
    rect(-4, -4, 11, 78, 6)
    noStroke();

    return get(0, 0, 3, 70);

  }())
}

var tooltip = "";
function setTooltip() {
  tooltip = m.context !== "toolbar" ? m.context: "";

  if(m.context === "canvas") {
    tooltip = (m.x + 1) + ", " + (m.y + 1) + "  " + m.tool;
  } else if(m.in(0, 0, 150, 30)) {
    tooltip = "epic :)";
  } else {
    for(var i in buttons) {
      if(buttons[i].hovering) {
        tooltip = i;
      }
    }
  }
};

function closeWindows() {
  for(var i = 0; i < popups.length; i++) {
    windows[popups[i]].active = false;
  }
  windowOpen = false;
}
function openWindow(w, inp) {
  closeWindows();
  windows[w].active = true;
  windows[w].justOpened = true;
  windows[w].inp = inp || "";
  if(w === "picker") {
    cPicker.setPicker(colors[m.color] || colors["a"]);
  }
  windowOpen = true;
}

function within(px, py, x, y, w, h) {
  return px >= x && px < x + w && py >= y && py < y + h;
}
function colorSquare(x, y, s, c, h) {

  h = h || s;
  fill(255);
  rect(x, y, s, h);

  noStroke();
  fill(0);
  triangle(x, y + h, x + s, y + h, x + s, y);

  fill(c || color(0, 0));
  rect(x, y, s, h);

}
function paletteButton(x, y, s, p) {

  noStroke();
  fill(c.light);
  rect(x - 1, y - 1, 32, 32);

  fill(c.background);
  rect(x, y, 30, 30);

  var j = 0;
  for(var i in palettes[p]) {

    fill(palettes[p][i]);
    rect(x + (j % 3)*10, y + (~~(j/3))*10, 10, 10);

    j++;
    if(j >= 9) {
      break;
    }
  }

  if(m.in(x, y, 30, 30) && !windowOpen) {
    tooltip = p;
    cursor("pointer");
    if(m.click && m.context === "main") {
      if(mouseButton === RIGHT) {
        openWindow("palette options", p);
        windows["palette options"].y = constrain(y, 40, 470 - windows["palette options"].h);
      } else if(Object.keys(palettes[p]).length >= Object.keys(colors).length || confirm("Fewer colors in this palette than the last one. This may mean that some areas will appear transparent, but will reappear when new swatches are added. Continue?")) {
        palettes[cInd] = colors;
        cInd = p;
        colors = palettes[cInd];
        colorMenu = "swatches";
        m.history = [];
        can.setCanvas();
      }
    }

    var py = constrain(y, 40, 375)

    fill(c.panel);
    rect(365, py, 135, 95, 5);

    fill(c.light);
    noStroke();
    textAlign(RIGHT, BOTTOM);
    text(p, 490, py + 25);


    var j = 0;
    for(var i in palettes[p]) {
      colorSquare(475 - (j % 6)*20, py + 30 + floor(j/6)*20, 15, palettes[p][i]);

      j++;
    }


  }

}
function colorButton(x, y, s, c) {
  colorSquare(x, y, s, colors[c]);
  if(m.in(x, y, s, s)) {
    cursor("pointer");
    if(m.click) {
      if(mouseButton === LEFT) {
        m.setColor(c);
      } else {
        openWindow("swatch options", c);
        windows["swatch options"].y = constrain(y, 40, 470 - windows["swatch options"].h);
      }
    }
  }
}

function slider(x, y, vertical, l, val, s, context, diam) {

  stroke(255);
  strokeWeight(1);
  noFill();

  if(vertical) {

    var big = m.in(x - s, y - s, s*2, s*2 + l);

    if(m.press && m.context === context && within(m.startX, m.startY, x - s, y - s, s*2, s*2 + l)) {
      val = constrain((mouseY - y)/l, 0, 1);
      big = true;
    }


    if(diam === undefined || !big) {
      ellipse(x, y + val*l, big? 8: 5);
      stroke(0);
      ellipse(x, y + val*l, big? 7: 4);
    } else {
      ellipse(x, y + val*l, diam + 2);
      stroke(0);
      ellipse(x, y + val*l, diam);
      noStroke();
      fill(200);
      ellipse(x, y + val*l, 6);
    }

  } else {

    var big = m.in(x - s, y - s, s*2 + l, s*2);

    if(m.press && m.context === context && within(m.startX, m.startY, x - s, y - s, s*2 + l, s*2)) {
      val = constrain((mouseX - x)/l, 0, 1);
      big = true;
    }

    if(diam === undefined || !big) {
      ellipse(x + val*l, y, big? 8: 5);
      stroke(0);
      ellipse(x + val*l, y, big? 7: 4);
    } else {
      ellipse(x + val*l, y, diam + 2);
      stroke(0);
      ellipse(x + val*l, y, diam);
      noStroke();
      fill(200);
      ellipse(x + val*l, y, 6);
    }

  }

  noStroke();

  // between 0 and 1;
  return val;

}
function warning(txt, x, y, w) {
  fill(255, 30, 60, 100);
  rect(x, y, w, 30, 2);


  fill(255, 0, 30);
  textAlign(LEFT, CENTER);
  textSize(12);
  text(txt, x + 10, y + 15);
}



var Button = function(x, y, type, txt, action, context, w, h) {
  this.x = x;
  this.y = y;

  this.w = 25;
  this.h = 25;


  this.action = action || function() { console.log("no action"); };

  this.type = type;
  this.txt = txt;

  this.context = context || "none";

  this.hovering = false;


  if(type === "text") {

    this.draw = function() {
      noStroke();
      fill(c.hover);
      //rect(this.x, this.y, this.w, this.h);

      fill(c.light);
      textAlign(CENTER, CENTER);
      textSize(16);
      text(this.txt, this.cx, this.cy);
    };

    this.w = w || 0;
    this.h = h || 20;

  } else if(type === "char") {

    this.draw = function() {
      fill(c.light);
      textAlign(CENTER, CENTER);
      textSize(16);
      text(this.txt, this.x, this.y);
    };


  } else if(type === "icon"){

    clear();
    translate(25, 25);
    scale(2);
    noFill();
    strokeWeight(2);
    stroke(c.light);
    this.txt();
    resetMatrix();
    this.img = get(0, 0, 50, 50);

    this.draw = function() {
      image(this.img, this.x - this.w*0.5, this.y - this.h*0.5, 25, 25);
    };

  }

  this.cx = this.x + this.w/2;
  this.cy = this.y + this.h/2;

};
Button.prototype.hover = function() {

  this.hovering = false;
  if(this.type === "text") {
    if(m.in(this.x, this.y, this.w, this.h)) {

      this.hovering = true;
      cursor("pointer");

      noStroke();
      fill(c.hover);
      rect(this.x - 1, this.y - 1, this.w + 2, this.h + 2);

      if(m.click && m.context === this.context) {
        this.action();
        this.hovering = false;
      }
    }

  } else if(dist(this.x, this.y, mouseX, mouseY) < this.w*0.5) {

    this.hovering = true;
    cursor("pointer");

    noStroke();
    fill(c.hover);
    ellipse(this.x, this.y, this.w, this.h);

    if(m.click && (m.context === this.context || this.context === "any")) {
      this.action();
      this.hovering = false;
    }

  }

};
Button.prototype.all = function(x, y, ctx) {
  if(x) {
    this.x = x;
    this.y = y;
    this.cx = x + this.w/2;
    this.cy = y + this.h/2;
  }
  if(ctx) {
    this.context = ctx;
  }
  this.draw();
  this.hover();
};

var Window = function(x, y, w, h, name, rounded, panel, main) {
  this.x = x;
  this.y = y;

  this.w = w;
  this.h = h;

  this.name = name;
  this.active = main || false;
  this.main = main;

  if(!main) {
    popups.push(name);
  }

  this.justOpened = false;

  this.inp = "";


  this.borderRadius = rounded? 5: 0;

  this.panel = panel || function() {};

  this.draw = function() {
    noStroke();
    fill(c.panel);
    rect(this.x, this.y, this.w, this.h, this.borderRadius);
    this.panel();

    if(m.click && !this.main && !this.justOpened && m.context !== this.name) {
      closeWindows();
    }
    this.justOpened = false;
  }
};

var Menu = function(x, y, w, name, buttons) {
  this.x = x;
  this.y = y;

  this.w = w;
  this.h = buttons.length*25 + 5;

  this.name = name;
  this.active = false;

  this.inp = "";

  this.buttons = [];
  for (var i = 0; i < buttons.length; i++) {
    this.buttons.push(new Button(x, y + 5 + i*25, "text", buttons[i].txt, buttons[i].action, name, w));
  }


  popups.push(name);
  this.justOpened = false;
  this.borderRadius = 5;

};
Menu.prototype.draw = function() {
  noStroke();
  fill(c.panel);
  rect(this.x, this.y, this.w, this.h, this.borderRadius);

  if(m.click && !this.justOpened) {
    closeWindows();
  }
  for (var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].all(this.x, this.y + 5 + i*25);
  }

  this.justOpened = false;
}




var buttons = {

  add_swatch: new Button(575, 147, "icon", function() {

    line(-5, 0, 5, 0);
    line(0, -5, 0, 5);
  }, function() {
    pushSave("palettes", palettes);
    colors[lets[Object.keys(colors).length]] = color(255);
    m.setColor(lets[Object.keys(colors).length - 1]);
    openWindow("picker");
  }, "main"),

  swatch_back: new Button(535, 147, "icon", function() {

    line(-7, 0, 7, 0);
    line(-7, 0, -3, -4);
    line(-7, 0, -3, 4);
  }, function() {
    colorMenu = "palettes";
  }, "main"),

  add_palette: new Button(575, 147, "icon", function() {

    line(-5, 0, 5, 0);
    line(0, -5, 0, 5);
  }, function() {
    createPopup("name palette");
  }, "main"),



  enter_hex: new Button(390, 150, "text", "enter hex", function() {
    var answer = prompt("enter hex code in format: #000000");
    console.log(answer);

    if(answer !== null) {

    }
  }, "picker", 100),


  save: new Button(555, 15, "icon", function() {

    beginShape();
    vertex(-6, -7);
    vertex(2, -7);
    vertex(7, -2);
    vertex(7, 7);
    vertex(-6, 7);
    endShape(CLOSE);

    line(-3, -4, -3, 0);
    line(0, -4, 0, 0);
    line(3, -2, 3, 0);

  }, function() {
    openWindow("save menu");
  }, "top"),
  settings: new Button(585, 15, "icon", function() {
    var n = PI/16;

    noStroke();
    fill(c.light);
    beginShape();
    for(var i = 0; i < TAU; i += TAU*0.125) {
      vertex(sin(i - n)*7, cos(i - n)*7);
      vertex(sin(i)*7, cos(i)*7);
      vertex(sin(i + n)*9, cos(i + n)*9);
      vertex(sin(i + n*2)*9, cos(i + n*2)*9);
    }
    endShape(CLOSE);

    fill(c.panel);
    ellipse(0, 0, 7, 7);

  }, function() {
    openWindow("settings menu");
  }, "top"),
  edit_canvas: new Button(525, 15, "icon", function() {

    rect(-6, -6, 10, 10);

    //line(-7, -7, -7, -2);
    //line(-7, -7, -2, -7);

    line(7, 7, 7, 2);
    line(7, 7, 2, 7);

  }, false, "top"),


  undo: new Button(460, 15, "icon", function() {

    arc(3, 8, 20, 20, 3.6, 5.2);
    line(-7, 4, -7, -3);
    line(-6, 4, 0, 4);

  }, undoSave, "top"),
  redo: new Button(490, 15, "icon", function() {

    arc(-3, 8, 20, 20, PI - 5.2, PI - 3.6);
    line(7, 4, 7, -3);
    line(6, 4, 0, 4);

  }, redoSave, "top"),


  erase: new Button(520, 110, "text", "erase", function() {
    if(buttons.erase.txt === "erase") {
      buttons.erase.txt = "color";
      m.setColor(".");
    } else {
      buttons.erase.txt = "erase";
      m.setColor(m.history[0]);
    }
  }, "main", 70),


  eyedropper: new Button(0, 0, "icon", function() {

    scale(-1, 1);

    beginShape();
    vertex(-5, 5);
    vertex(-5, 3);
    vertex(3, -5);
    vertex(5, -3);
    vertex(-3, 5);
    endShape(CLOSE);

    line(-1, -4, 4, 1);

    fill(c.panel)
    ellipse(3, -3, 5, 5);

    resetMatrix();

  }, function() {
    m.setTool("eyedropper");
  }, "any"),

  pixel: new Button(0, 0, "icon", function() {

    rect(-5, -5, 10, 10);

  }, function() {
    m.setTool("pixel");
  }, "any"),

  diameter: new Button(0, 0, "icon", function() {

    ellipse(0, 0, 12, 12);

  }, function() {
    m.setTool("diameter");
  }, "any"),

  bucket: new Button(0, 0, "icon", function() {

    beginShape();
    vertex(-1, -7);
    vertex(7, 0);
    vertex(1, 7);
    vertex(-7, 0);
    endShape(CLOSE);

    rotate(PI/4);
    arc(-2, -1, 4, 14, PI*1.4, TAU);
    resetMatrix();

  }, function() {
    m.setTool("bucket");
  }, "any"),

  eraser: new Button(0, 0, "icon", function() {

    beginShape();
    vertex(-7, -3);
    vertex(5, -3);
    vertex(7, 3);
    vertex(-5, 3);
    endShape(CLOSE);

  }, function() {
    m.setColor(".");
    if(m.tool !== "pixel" || m.tool !== "diameter" || m.tool !== "bucket") {
      m.setTool("pixel");
    }
  }, "any"),

  select: new Button(0, 0, "icon", function() {

    beginShape();
    vertex(-4, -5);
    vertex(5, -1);
    vertex(2, 1);
    vertex(4, 4.5);
    vertex(2, 6);
    vertex(-1, 3);
    vertex(-4, 5);
    endShape(CLOSE);

  }, function() {
    m.setTool("select");
  }, "any"),

  magic_select: new Button(0, 0, "icon", function() {

    line(-1.5, -1.5, 6, 6);

    line(2, -2, 3, -2);
    line(-2, 2, -2, 3);
    line(-5, -2, -7, -2);
    line(-2, -7, -2, -5);

  }, function() {
    m.setTool("magic_select");
  }, "any"),

  move: new Button(0, 0, "icon", function() {

    for (var i = 0; i < 4; i++) {
      line(0, 0, 7, 0);
      line(5, -2, 7, 0);
      line(5, 2, 7, 0);

      rotate(PI*0.5);
    }
    resetMatrix();

  }, function() {
    m.setTool("move");
  }, "any"),

};
var windows = {
  "main": new Window(510, 30, 90, 450, "main", false, function() {

    // fine lines between menu sections
    noStroke();
    fill(c.light);
    rect(515, 30, 80, 1);

    // color sample
    strokeWeight(1);
    stroke(c.light);
    colorSquare(520, 40, 70, colors[m.color], 60);

    stroke(255);
    fill(0);
    strokeWeight(2);
    textAlign(CENTER, CENTER);
    textSize(16);
    text("'" + m.color + "'", 555, 70)

    // clicking the color sample brings up the color picker
    if(m.in(520, 40, 70, 60) && m.color !== ".") {
      cursor("pointer");
      if(m.click) {
        openWindow("picker");
        colorMenu = "swatches";
      }
      tooltip = "open_picker";
    }

    buttons.erase.all();

    // inner pane for swatches or palettes
    noStroke();
    fill(c.light);
    rect(519, 163, 72, 317);

    fill(c.background);
    rect(520, 164, 70, 315);

    if(colorMenu === "swatches") {
      // swatch selector menu


      //buttons.eraser.all(555, 127, "main");

      // back to all palettes button
      buttons.swatch_back.all();
      noStroke();

      // swatches
      var j = 0;
      for(var i in colors) {
        colorButton(520 + (j%2)*35, 164 + (~~(j/2))*35, 35, i);
        j++;
      }

      // if fewer than 18 colors, show the 'new swatch' button
      if(j < 18) {
        // add swatch button
        buttons.add_swatch.all();//(525 + (j%2)*35, 204 + (~~(j/2))*35)
      }

    } else {
      // palette selecor menu

      if(Object.keys(palettes).length < 18) {
        buttons.add_palette.all();
      }


      var j = 0;
      for(var i in palettes) {

        paletteButton(523 + (j % 2)*34, 167 + (~~(j/2))*34, 30, i);
        j++;
        if(j > 18) {
          break;
        }

      }


    }

  }, true),
  "top": new Window(0, 0, 600, 30, "top", false, function() {


    if(m.in(145, 0, 130, 30) && m.tool === "diameter") {
      tooltip = "diameter_slider";
    }

    noStroke();
    fill(c.light);
    textAlign(RIGHT, BOTTOM);
    textSize(16);
    //text(mouseX + ", " + mouseY, 460, 25);
    text(tooltip, 430, 25);
    textAlign(LEFT, BOTTOM);
    text("LeviSprite PRO", 10, 25);

    if(m.tool === "diameter") {
      fill(c.light);
      rect(160, 13, 100, 4, 3);
      m.radius = slider(160, 15, false, 100, m.radius/100, 15, "top", m.radius*2)*100;
    }

    // undo and redo buttons
    buttons.undo.all();
    buttons.redo.all();

    buttons.edit_canvas.all();
    buttons.save.all();
    buttons.settings.all();


  }, true),
  "toolbar": new Window(-10, 120, 40, 270, "toolbar", true, function() {


    for (var i = 0; i < tools.length; i++) {
      if(tools[i]) {
        buttons[tools[i]].all(15, 135 + i*30);
      }
    }

  }, true),
  "frames": new Window(0, 480, 600, 120, "frames", false, function() {
    var n = ~~(100/max(can.pw, can.ph)) || 1;
    n = 2;
    image(can.backImg, 10, 490, n*can.pw, n*can.ph);
    image(can.canvasImg, 10, 490, n*can.pw, n*can.ph);
  }, true),

  "picker": new Window(380, 40, 120, 150, "picker", true, function() {

    // saturation + brightness picker
    strokeWeight(1);
    stroke(c.light);
    rect(390, 50, 70, 70);

    noStroke();
    colorMode(HSB);
    fill(cPicker.h, 255, 255)
    rect(390, 50, 70, 70);
    colorMode(RGB);

    image(cPicker.grad, 390, 50);
    image(cPicker.hue, 470, 50);

    fill(c.light);
    rect(485, 50, 3, 70, 3);

    cPicker.h = slider(471, 50, true, 70, cPicker.h/360, 8, "picker")*360;
    cPicker.o = 255 - round(slider(486, 50, true, 70, 1 - cPicker.o/255, 7, "picker")*255);


    var big = m.in(390, 50, 70, 70)? 8: 5;

    if(m.press && within(m.startX, m.startY, 390, 50, 70, 70) && m.context === "picker") {

      cPicker.s = constrain((mouseX - 390)/70, 0, 1)*255;
      cPicker.b = 255 - constrain((mouseY - 50)/70, 0, 1)*255;
      big = 8;

    }

    stroke(255);
    strokeWeight(1);
    ellipse(390 + (cPicker.s/255)*70, 50 + (1 - cPicker.b/255)*70, big, big);
    stroke(0)
    ellipse(390 + (cPicker.s/255)*70, 50 + (1 - cPicker.b/255)*70, big - 1, big - 1);


    if(m.press && m.context === "picker") {
      //var clr = HSBtoRGB(cPicker.h, cPicker.s, cPicker.b, cPicker.o);
      //console.log(clr);
      colors[m.color] = HSBtoRGB(cPicker.h, cPicker.s, cPicker.b, cPicker.o);
    }

    fill(c.light);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(11);
    //text("color(" + red(colors[m.color]) + "," + green(colors[m.color]) + "," + blue(colors[m.color]) + "," + round(alpha(colors[m.color])*100)/100 + ")", 440, 130);

    buttons.enter_hex.all();

  }),

  "quicktools": new Window(0, 0, 135, 80, "quicktools", true, function() {

    for(var i = 0; i < 4; i++) {

      if(i < m.history.length) {
        colorButton(this.x + 10 + i*30, this.y + 10, 25, m.history[i]);
      } else {
        fill(c.background)
        rect(this.x + 10 + i*30, this.y + 10, 25, 25);
      }

      buttons[tools[i]].all(this.x + 22.5 + i*30, this.y + 60);

    }
    fill(c.light);
    rect(this.x + 10, this.y + 42, 115, 1);



  }),


  "save menu": new Menu(300, 40, 200, "save menu", [
    {txt: "export palettes", action: function() {
      createPopup("save palettes");
    }},
    {txt: "export pixel data", action: function() {
      createPopup("save canvas");
    }},
    {txt: "import palettes", action: function() {
      createPopup("import palette");
    }},
    {txt: "import pixel data", action: function() {
      createPopup("import canvas");
    }},
  ]),

  "palette options": new Menu(350, 0, 150, "palette options", [
    {txt: "rename", action: function() {
      createPopup("rename palette", windows["palette options"].inp)
    }},
    {txt: "duplicate", action: function() {
      if(Object.keys(palettes).length < 18) {
        pushSave("palettes");
        palettes[(windows["palette options"].inp + " copy")] = palettes[windows["palette options"].inp];
        createPopup("rename palette", (windows["palette options"].inp + " copy"))

      } else {
        alert("Too many palettes, couldn't duplicate.")
      }
    }},
    {txt: "delete", action: function() {
      if(confirm("Deleting this palette could have unexpected consequences. Please be certain it will not be used. Continue?")) {
        pushSave("palettes");
        delete palettes[windows["palette options"].inp];
      }
    }},
  ]),
  "swatch options": new Menu(350, 0, 150, "swatch options", [
    {txt: "duplicate", action: function() {
      if(Object.keys(colors).length < 18) {
        pushSave("palettes", palettes);
        var n = lets[Object.keys(colors).length];
        colors[n] = colors[windows["swatch options"].inp];
        m.setColor(n);
        palettes[cInd] = colors;
        openWindow("picker");
      } else {
        alert("Too many swatches, couldn't duplicate.")
      }
    }},
    {txt: "delete", action: function() {
      alert("It seemed too hard to code in this feature with the current system. I may add it in the future. Sorry for the inconvenience");
    }},
  ]),

  "settings menu": new Menu(300, 40, 200, "settings menu", [
    {txt: "clear canvas", action: function() {
      pushSave("canvas");
      can.create();
      can.setCanvas();
    }},
    /*{txt: "toggle light mode", action: function() {
      cMode = cMode === "light"? "dark": "light";
      c = cOptions[cMode];
    }},*/
    /*{txt: "", action: function() {

    }},*/
  ]),
};
var windowInd = Object.keys(windows);


// html (function), buttons (array), validate (function)
popupCodes = {
  "name palette": [function() {
    return "<h2>Name this new palette</h2><p>choose something short and unique</p><input id='pop-answer' type='text' placeholder='12 characters max' minlength='1' maxlength='12' required><div id='pop-error'>another palette already has this name,<br>or it's too short</div>";
  }, ["cancel", "enter"], function(inp) {

    if(inp.length > 0) {
      for(var i in palettes) {
        if(i === inp) {

          return false;
        }
      }

      pushSave("palettes", palettes);
      palettes[cInd] = colors;
      palettes[inp] = {
        "a": color(255),
      };

      cInd = inp;
      colors = palettes[cInd];
      colorMenu = "swatches";
      m.color = "a";

      openWindow("picker");

      return true;
    } else {
      return false;
    }
  }],

  "rename palette": [function(inp) {
    return "<h2>Rename '" + inp + "'</h2><p>choose something short and unique</p><input id='pop-answer' type='text' placeholder='12 characters max' minlength='1' maxlength='12' required><div id='pop-error'>another palette already has this name,<br>or it's too short</div>";
  }, ["cancel", "enter"], function(inp) {

    if(inp.length > 0) {
      for(var i in palettes) {
        if(i === inp) {
          return false;
        }
      }

      pushSave("palettes", palettes);
      // should be the original name of the renamed palette
      var nm = popInp;

      palettes[inp] = palettes[popInp];
      delete palettes[popInp];



      return true;
    } else {
      return false;
    }
  }],

  "save palettes": [function() {
    var t = "<p>var palettes = {";
    for (var i in palettes) {
      t += "<br>&nbsp;&nbsp;\"" + i + "\": {"

      for (var j in palettes[i]) {
        var a = alpha(palettes[i][j]);
        t += "<br>&nbsp;&nbsp;&nbsp;&nbsp;" + j + ": color(" + red(palettes[i][j]) + ", " + green(palettes[i][j]) + ", " + blue(palettes[i][j]) + (a === 255? "": ", " + a) + "),";
      }
      t += "<br>&nbsp;&nbsp;},"
    }
    t += "<br>};</p>";
    return t;
  }, ["close"], function() { return true; }],


  "save canvas": [function() {
    var t = "\"\": [\"\", \"" + cInd + "\", \"";

    for(var y = 0; y < can.a.length; y++) {
      for(var x = 0; x < can.a[y].length; x++) {
        t += can.a[y][x];
      }
      if(y < can.a.length - 1) {
        t += ",";
      }
    }

    return t + "\"],";
  }, ["close"], function() { return true; }],


  "import palette": [function() {

    return "<h2>Paste in full palette code</h2><input id='pop-answer' type='text' placeholder='var palette = {}'><div id='pop-error'>operation failed.</div>";

  }, ["cancel", "enter"], function(inp) {

    if(confirm("All save data will be lost. Continue?")) {
      palettes = {};

      saves = [];
      saveInd = 0;

      var first = 0;
      for(var i = 0; i < inp.length; i++) {
        if(inp[i] === '{') {
          first = i + 1;
          i = inp.length;
        }
      }
      for(var i = inp.length - 1; i >= 0; i--) {
        if(inp[i] === '}') {
          inp = inp.slice(first, i);
          i = -1;
        }
      }


      var s = "", n = 0;
      for(var i = 0; i < inp.length; i++) {
        if(inp[i] !== " " || n % 2 === 1) {
          s += inp[i];
          if(inp[i] === '\"') {
            n++;
          }
        }
      }
      inp = s;

      inp = inp.split("},");
      inp.pop();

      for(var i = 0; i < inp.length; i++) {

        inp[i] = inp[i].split(":{");
        inp[i][1] = inp[i][1].split("),");

        var q = {};

        for(var j = 0; j < inp[i][1].length - 1; j++) {
          var ssfkslekflsk = (inp[i][1][j].slice(8, 100)).split(",");
          q[inp[i][1][j][0]] = [];
          for(var k = 0; k < ssfkslekflsk.length; k++) {
            q[inp[i][1][j][0]].push(int(ssfkslekflsk[k]));
          }
        }

        palettes[inp[i][0]] = q;

      }
      pushSave("palettes");


      return true;
    } else {
      return false;
    }

  }],

  "import canvas": [function() {

    return "<h2>Paste in <em>just</em> the art array</h2><input id='pop-answer' type='text' placeholder='[\"(name)\", \"(palette)\", \"(art string)\"],' size='40'><div id='pop-error'>operation failed.</div>";

  }, ["cancel", "enter"], function(inp) {

    // ["blocks", "bubble tea", "a..,.a.,..a"],

    pushSave("canvas");

    inp = inp.split("\", \"");

    var a = [[]];

    var y = 0, x = 0, comma = inp[2][inp[2].length - 1] === "," ? 3 : 2;
    for(var i = 0; i < inp[2].length - comma; i++) {
      if(inp[2][i] === ",") {
        y++;
        x = 0;
        a.push([]);
      } else {
        a[y].push(inp[2][i])
      }
    }

    if(palettes[inp[1]]) {
      cInd = inp[1];
      colors = palettes[cInd];
    }

    can.create(a);

    return true;

  }],

  "resize canvas": [function() {

    return "<h2>Resize canvas</h2><p>only the format WIDTHxHEIGHT works. Limit of 20x20. Wacky inputs will default to 8.</p><input id='pop-answer' type='text' placeholder='e.g. 8x8 or 16x16'><div id='pop-error'>make sure it's in the right format</div>";

  }, ["cancel", "enter"], function(inp) {

    pushSave("canvas");
    inp = inp.split("x");
    can.create(min((int(inp[0]) || 8), 20), min((int(inp[1]) || 8), 20));

    return true;

  }],

};


// basically the 'draw' function, but now in the 'setup' function due to scope errors
frame = function() {
  cursor("default");

  if(!m.press) {
    m.setContext();
    setTooltip();
  } else if(m.context === "canvas") {
    tooltip = (m.x + 1) + ", " + (m.y + 1) + "  " + m.tool;
  }

  if(!(m.context === "canvas" && m.press)) {
    background(c.background);
  }

  if(m.context === "canvas") {
    cursor(can.cursors[m.tool]);
    if(m.click) {
      closeWindows();
    }
  }

  m.x = ~~((mouseX - can.x)/can.ps);
  m.y = ~~((mouseY - can.y)/can.ps);

  noStroke();
  fill(c.light);
  rect(can.x - 1, can.y - 1, can.w + 2, can.h + 2);

  can.handleMouse();
  can.draw();

  if(!(m.context === "canvas" && m.press)) {
    for(var i in windows) {
      if(windows[i].active) {
        windows[i].draw();
      }
    }
  } else {
    can.drawTemp();
  }

  can.cursorsExtra[m.tool]();

  m.click = false;
}

createPopup("resize canvas")

/*
thank you codeInWP.com :)
*/
parentElement.addEventListener('contextmenu', function (e) {
  // do something here...
  e.preventDefault();
}, false);

// option or shift + drag with select tools
var keyFunc = {

  " ": function() {
    m.setColor(m.history[0] || m.color);
  },

  "z": undoSave,
  "x": redoSave,

  "Backspace": buttons.erase.action,

  "`": buttons.erase.action,

  "[": function() {
    if(m.tool === "diameter") {
      m.radius = max(m.radius - 10, 0);
    }
  },
  "]": function() {
    if(m.tool === "diameter") {
      m.radius = min(m.radius + 10, 300);
    }
  },


  "i": function() {
    m.setTool("eyedropper");
  },
  "n": function() {
    m.setTool("pixel");
  },
  "b": function() {
    m.setTool("diameter");
  },
  "k": function() {
    m.setTool("bucket");
  },
  "e": buttons.erase.action,


  "a": function() {
    m.setTool("select");
  },
  "w": function() {
    m.setTool("magic_select");
  },
  "v": function() {
    m.setTool("move");
  },


  "ArrowLeft": function() {

    if(can.a[0].length > 1) {
      pushSave("canvas");
      if(keys[16]) {
        for(var i = 0; i < can.a.length; i++) {
          can.a[i].pop();
        }
        can.setSize();
        can.setBackground();
      } else {
        for(var i = 0; i < can.a.length; i++) {
          can.a[i].push(can.a[i].shift());
        }
      }
      can.setCanvas();
    }

  },
  "ArrowRight": function() {

    pushSave("canvas");
    if(keys[16]) {
      for(var i = 0; i < can.a.length; i++) {
        can.a[i].push(".");
      }
      can.setSize();
      can.setBackground();
    } else {
      for(var i = 0; i < can.a.length; i++) {
        can.a[i].unshift(can.a[i].pop());
      }
    }
    can.setCanvas();

  },
  "ArrowUp": function() {

    if(can.a.length > 1) {
      pushSave("canvas");
      if(keys[16]) {
        can.a.pop();
        can.setSize();
        can.setBackground();
      } else {
        can.a.push(can.a.shift());
      }
      can.setCanvas();
    }
  },
  "ArrowDown": function() {

    pushSave("canvas");
    if(keys[16]) {
      var arr = [];
      for(var i = 0; i <= can.pw; i++) {
        arr.push(".");
      }
      can.a.push(arr);
      can.setSize();
      can.setBackground();
    } else {
      can.a.unshift(can.a.pop());
    }
    can.setCanvas();

  },

  /*"": function() {

  },*/
}

mousePressed = function() {
  if(!popupOpen && m.in(0, 0, 600, 600)) {
    m.click = true;
    m.press = true;
    m.setContext();

    m.startX = mouseX;
    m.startY = mouseY;


    if(mouseButton === RIGHT && (m.context === "canvas" || m.context === "")) {
      m.click = false;
      m.press = false;
      openWindow("quicktools");
      windows.quicktools.x = constrain(mouseX, 40, 360);
      windows.quicktools.y = constrain(mouseY, 40, 380);

    }
    if(m.context === "picker") {
      tempPal = parsePal();
    }

  }

};

mouseReleased = function() {
  //m.context = "";
  m.press = false;
  if(m.context === "canvas") {
    can.refresh();
  } else if(m.context === "picker") {
    can.setCanvas();
    pushSave("palettes");
  }
};

keyPressed = function() {

  console.log("keyCode: " + keyCode + ", key: '" + key + "'")
  keys[keyCode] = true;
  keys[key] = true;

  if(key === "`") {
    buttons.erase.action();
  }

};

keyReleased = function() {
  delete keys[keyCode];
  delete keys[key];

  if(keyFunc[key]) {
    keyFunc[key]();
  }
};

// end of global setup function
}

function draw() {
  frame();
}
