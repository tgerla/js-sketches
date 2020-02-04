const tinygradient = require("tinygradient");
const canvasSketch = require("canvas-sketch");
var gradient = require("gradient-parser");

var obj = gradient.parse(
  `linear-gradient(90deg, rgba(251,205,127,1) 0%, rgba(189,91,42,1) 59%, rgba(96,61,38,1) 91%, rgba(73,101,83,1) 98%)`
);

const gradientArray = obj[0].colorStops.map(colorStop => {
  return {
    color: {
      r: colorStop.value[0],
      g: colorStop.value[1],
      b: colorStop.value[2]
    },
    pos: colorStop.length.value / 100
  };
});

const settings = {
  dimensions: [2048, 2048]
};

// Art controls
const sections = 32;
const perturbation = 12;
const gridSize = 64;
const chanceOfColor = 0.01;

const radiansPerSection = (Math.PI * 2) / sections;

const sketch = () => {
  return ({ context, width, height }) => {
    context.fillStyle = "white";
    context.fillRect(0, 0, width, height);

    var gradient = tinygradient(gradientArray);
    var rgb = gradient.rgb(gridSize);

    context.strokeStyle = "black";
    context.lineWidth = 3;
    context.lineJoin = "miter";

    var locs = [];

    for (let y = 0; y < height / gridSize + 1; y++) {
      for (let x = 0; x < width / gridSize + 1; x++) {
        locs.push([x, y]);
      }
    }
    //shuffle(locs);
    console.log(locs);

    let colorOffset = 0;
    let colorCounter = 0;
    let colorIdx = 0;

    locs.forEach(([x, y]) => {
      if (colorCounter == 0 && Math.random() > 1 - chanceOfColor) {
        colorOffset = rangeFloor(-25, 25);
        colorCounter = rangeFloor(7, 10);
      }
      if (colorCounter) {
        context.fillStyle = wrap(rgb, x + colorOffset);
        colorCounter--;
      } else {
        colorIdx = Math.floor(((y * gridSize) / height) * rgb.length);
        console.log(x, y, colorIdx);

        context.fillStyle = rgb[clamp(colorIdx, 0, rgb.length)];
      }
      segment(
        context,
        x * gridSize + rangeFloor(-32, 32),
        y * gridSize + rangeFloor(-32, 32),
        gridSize + 10
      );
    });
  };
};

const segment = (context, centerX, centerY, radius) => {
  context.beginPath();
  context.moveTo(...circleLoc(radius, 0, centerX, centerY));
  for (
    let angle = 0;
    angle < Math.PI * 2 - radiansPerSection;
    angle += radiansPerSection
  ) {
    let loc = circleLoc(radius, angle, centerX, centerY);
    context.lineTo(
      loc[0] + rangeFloor(-perturbation, perturbation),
      loc[1] + rangeFloor(-perturbation, perturbation)
    );
  }
  context.lineTo(...circleLoc(radius, 0, centerX, centerY));
  context.stroke();
  context.fill();
};

const marker = (context, x, y, color = "blue", radius = 25) => {
  context.fillStyle = color;
  context.save();
  context.beginPath();
  context.arc(x, y, radius, 0, 2 * Math.PI);
  context.fill();
  context.restore();
};

const circleLoc = (radius, angle, centerX = 1024, centerY = 1024) => {
  return [
    Math.floor(radius * Math.sin(-angle + Math.PI / 2) + centerX),
    Math.floor(radius * Math.cos(angle - Math.PI / 2) + centerY)
  ];
};
const random = (min, max) => Math.random() * (max - min) + min;

function rangeFloor(min, max) {
  // Return a random whole number between min and max
  return Math.floor(Math.random() * (max - min) + min);
}

function pick(array) {
  // Pick a random item out of an array
  if (array.length === 0) return undefined;
  return array[rangeFloor(0, array.length)];
}

function wrap(array, index) {
  if (index < 0) return index + array.length;
  if (index > array.length - 1) return array[index - array.length];
  else return array[index];
}

function clamp(val, min, max) {
  if (val >= min && val <= max) return val;
  else if (val < min) return min;
  else if (val > max) return max;
}

var shuffle = function(array) {
  var currentIndex = array.length;
  var temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};

canvasSketch(sketch, settings);
