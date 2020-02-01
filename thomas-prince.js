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

    let mainRadius = width * 2;
    let sectionRadius = 64;
    let centerX = width / 2;
    let centerY = width / 2;
    let segmentWidth = 64;
    let segmentRandomness = 0.5; // percent of segment width to randomize
    let chanceOfColor = 0.005;

    context.strokeStyle = "#333333";
    context.lineWidth = 4;

    var gradient = tinygradient(gradientArray);
    var rgb = gradient.rgb(50);

    for (let radius = mainRadius; radius > 32; radius -= sectionRadius) {
      // around the ring
      let segmentLength = segmentWidth / radius;

      // figure out how many segments we can have
      let segments = Math.round((radius * 2 * 3.141592) / segmentWidth);
      // normalize it to fit around the circle
      segmentWidth = (radius * 2 * 3.141592) / segments;
      segmentLength = segmentWidth / radius;

      let colorOffset = 0;
      let colorCounter = 0;

      let previousAngle = 0;
      let angleAdjust = random(
        -Math.PI * 2 * segmentRandomness,
        Math.PI * 2 * segmentRandomness
      );

      for (let segment = 0; segment < segments; segment++) {
        if (colorCounter == 0 && Math.random() > 1 - chanceOfColor) {
          colorOffset = rangeFloor(-100, 100);
          colorCounter = rangeFloor(5, 10);
        }
        if (colorCounter) {
          context.fillStyle = wrap(rgb, segment + colorOffset);
          colorCounter--;
        } else {
          context.fillStyle = wrap(rgb, segment);
        }

        let newAngle =
          previousAngle +
          segmentLength +
          random(
            -segmentLength * segmentRandomness,
            segmentLength * segmentRandomness
          );

        if (segment == segments - 1) {
          newAngle = 0;
        }

        if (previousAngle < Math.PI * 2) {
          context.beginPath();
          context.moveTo(centerX, centerY);
          context.arc(
            centerX,
            centerY,
            radius,
            previousAngle + angleAdjust,
            newAngle + angleAdjust
          );
          context.closePath();
          context.fill();
          context.stroke();
        }

        previousAngle = newAngle;
      }

      context.beginPath();
      context.ellipse(centerX, centerY, radius, radius, 0, 0, 1 * 3.14 * 2);
      context.stroke();
    }

    context.fillStyle = pick(rgb);
    context.beginPath();
    context.ellipse(
      centerX,
      centerY,
      sectionRadius / 4,
      sectionRadius / 4,
      0,
      0,
      Math.PI * 2
    );
    context.fill();
    context.stroke();
  };
};

const circleLoc = (radius, angle) => {
  return [radius * Math.sin(angle) + 1024, radius * Math.cos(angle) + 1024];
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
