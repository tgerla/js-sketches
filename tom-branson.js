const tinygradient = require("tinygradient");
const canvasSketch = require("canvas-sketch");
var gradient = require("gradient-parser");

var obj = gradient.parse(
  `linear-gradient(90deg, rgba(215,213,68,1)0%, rgba(255,255,255,1) 50%, rgba(0,212,255,1) 60%, rgba(0,81,97,1) 100%)`
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

const sketch = () => {
  return ({ context, width, height }) => {
    context.fillStyle = "white";
    context.fillRect(0, 0, width, height);

    let cellWidth = 32;
    let cellHeight = 32;

    var gradient = tinygradient(gradientArray);
    var rgb = gradient.rgb(80);

    context.strokeStyle = "white";
    context.lineWidth = 1;
    for (let x = 0; x < width / cellWidth; x++) {
      for (let y = 0; y < height / cellHeight; y++) {
        let colorIdx = Math.floor(
          ((height - y * cellHeight) / height) * rgb.length
        );

        context.strokeStyle = rgb[colorIdx];
        context.beginPath();

        let cx = x * cellWidth;
        let cy = y * cellHeight;
        context.moveTo(cx + cellWidth / 2, cy);
        context.lineTo(
          cx + cellWidth / 2 + rangeFloor(-32, 32),
          cy + cellHeight / 2 + rangeFloor(-32, 32)
        );
        context.lineTo(cx + cellWidth / 2, cy + cellHeight);
        context.lineTo(cx, cy + cellHeight);
        context.lineTo(cx, cy);
        context.stroke();
      }
    }
  };
};

const drawSegment = (
  context,
  outerRadius,
  innerRadius,
  outerAngle1,
  outerAngle2,
  innerAngle1,
  innerAngle2
) => {
  context.save();
  context.beginPath();
  context.arc(1024, 1024, outerRadius, outerAngle1, outerAngle2);
  context.lineTo(...circleLoc(innerRadius, innerAngle2));
  context.arc(
    1024,
    1024,
    innerRadius,
    innerAngle2,
    innerAngle1,
    (anticlockwise = true)
  );
  context.lineTo(...circleLoc(outerRadius, outerAngle1));
  context.clip();
  context.rect(0, 0, 2048, 2048);
  context.closePath();
  context.fill();
  context.stroke();
  context.restore();
};

const marker = (context, x, y, color = "blue", radius = 25) => {
  context.fillStyle = color;
  context.save();
  context.beginPath();
  context.arc(x, y, radius, 0, 2 * Math.PI);
  context.fill();
  context.restore();
};

const circleLoc = (radius, angle) => {
  return [
    Math.floor(radius * Math.sin(-angle + Math.PI / 2) + 1024),
    Math.floor(radius * Math.cos(angle - Math.PI / 2) + 1024)
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
  if (index > array.length) return array[index - array.length];
  else return array[index];
}

canvasSketch(sketch, settings);
