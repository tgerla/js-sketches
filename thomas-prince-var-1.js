const tinygradient = require("tinygradient");
const canvasSketch = require("canvas-sketch");
var gradient = require("gradient-parser");

var obj = gradient.parse(
  `linear-gradient(90deg, rgba(215,213,68,1) 0%, rgba(255,255,255,1) 15%, rgba(0,212,255,1) 47%, rgba(0,81,97,1) 100%)`
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

    let mainRadius = width / 2;
    let sectionRadius = 64;
    let centerX = width / 2;
    let centerY = height / 2;
    let segmentWidth = 64;
    let segmentRandomness = 0.75; // percent of segment width to randomize
    let chanceOfColor = 0.005;

    context.strokeStyle = "#333333";
    context.lineWidth = 4;

    var gradient = tinygradient(gradientArray);
    var rgb = gradient.rgb(50);

    context.fillStyle = "#dddddd";

    context.beginPath();

    context.ellipse(
      centerX,
      centerY,
      mainRadius - 128,
      mainRadius - 128,
      0,
      0,
      Math.PI * 2
    );
    context.ellipse(
      centerX,
      centerY,
      mainRadius - 256,
      mainRadius - 256,
      0,
      0,
      Math.PI * 2
    );
    context.fill();
    context.stroke();

    context.strokeStyle = "black";

    for (let radius = mainRadius; radius > 0; radius -= segmentWidth) {
      let outerAngle1 = 0;
      let innerAngle1 = 0;
      let outerAngle2 = 0;
      let innerAngle2 = 0;

      for (let x = 0; x < 70; x++) {
        console.log(outerAngle1, innerAngle1, outerAngle2, innerAngle2);
        outerAngle2 += 0.1 + random(-0.02, 0.02);
        innerAngle2 += 0.1 + random(-0.02, 0.02);

        context.fillStyle = pick(rgb);
        drawSegment(
          context,
          radius,
          radius - sectionRadius,
          outerAngle1,
          outerAngle2,
          innerAngle1,
          innerAngle2
        );

        outerAngle1 = outerAngle2;
        innerAngle1 = innerAngle2;
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
    radius * Math.sin(-angle + Math.PI / 2) + 1024,
    radius * Math.cos(angle - Math.PI / 2) + 1024
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
  index = Math.abs(index);
  if (index > array.length) return array[index - array.length];
  else return array[index];
}

canvasSketch(sketch, settings);
