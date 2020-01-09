const Mode = {PEN: "pen", ERASER: "eraser"};
let elem;
let two;
let rect;
let penDownPoint;
let eraserPrevPoint;
let curStroke;
let allStrokes = [];
let mode = Mode.PEN;

function Stroke() {
  this.path = null;
  this.bounds = null;
}

window.onload = function() {
  elem = document.getElementById("draw");
  elem.addEventListener('mousedown', onTouchDown);
  elem.addEventListener('mousemove', onTouchUpdate);
  elem.addEventListener('mouseup', onTouchUp);
  let params = {width: 800, height: 600};
  two = new Two(params).appendTo(elem);

  rect = elem.getBoundingClientRect();
}

function onTouchDown(event) {
  let x = event.clientX - rect.x;
  let y = event.clientY - rect.y;
  if(mode == Mode.PEN) {
    penDownPoint = new Two.Vector(x, y);
  }
  else if(mode == Mode.ERASER) {
    eraserPrevPoint = new Two.Vector(x, y);
  }
  two.update();
}

function onTouchUpdate(event) {
  if(!penDownPoint && !eraserPrevPoint) {
    return;
  }
  let x = event.clientX - rect.x;
  let y = event.clientY - rect.y;
  let curPoint = new Two.Vector(x, y);
  if(mode == Mode.PEN) {
    if(curStroke) {
      curStroke.path.vertices.push(curPoint);
    }
    else {
      curStroke = makeNewStroke(penDownPoint, curPoint);
      two.add(curStroke.path);
    }
  }
  else if(mode == Mode.ERASER) {
    for(let i = allStrokes.length - 1; i >= 0; --i) {
      let stroke = allStrokes[i];
      if(pointInRectangle(curPoint, stroke.bounds)) {
        two.remove(stroke.path);
        two.remove(stroke.bounds);
        allStrokes.splice(i, 1);
      }
    }
    eraserPrevPoint = curPoint;
  }
  two.update();
}

function onTouchUp(event) {
  let x = event.clientX - rect.x;
  let y = event.clientY - rect.y;
  if(mode == Mode.PEN) {
    if(curStroke) {
      curStroke.path.vertices.push(new Two.Vector(x, y));
      curStroke.bounds = getBoundingRect(curStroke);
      two.add(curStroke.bounds);
      allStrokes.push(curStroke);
      curStroke = null;
    }
  }
  penDownPoint = null;
  eraserPrevPoint = null;
  two.update();
}

function makeNewStroke(inStartPoint, inEndPoint) {
  let stroke = new Stroke();
  let path = new Two.Path([inStartPoint, inEndPoint]);
  path.closed = false;
  path.curved = true;
  path.noFill();
  path.cap = "round";
  path.join = "round";
  path.linewidth = 4;
  stroke.path = path;
  return stroke;
}

function getBoundingRect(inStroke) {
  let bRect = inStroke.path.getBoundingClientRect(true);
  let x = bRect.left + bRect.width * 0.5;
  let y = bRect.top + bRect.height * 0.5;
  displayRect = new Two.Rectangle(x, y, bRect.width, bRect.height);
  displayRect.noFill();
  return displayRect;
}

function setMode(inMode) {
  mode = inMode;
}

function pointInRectangle(inPoint, inRect) {
  let left = inRect.translation.x - inRect.width * 0.5;
  let top = inRect.translation.y - inRect.height * 0.5;
  let right = inRect.translation.x + inRect.width * 0.5;
  let bottom = inRect.translation.y + inRect.height * 0.5;

  if(inPoint.x < left || inPoint.x > right ||
     inPoint.y < top || inPoint.y > bottom) {
    return false;
  }
  return true;
}
