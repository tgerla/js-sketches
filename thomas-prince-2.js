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

    let mainRadius = width / 2;
    let sectionRadius = 256;
    let sectionShrink = 48;
    let centerX = width / 2;
    let centerY = height / 2;
    let segmentWidth = 64;
    let segmentRandomness = 0.25; // percent of segment width to randomize
    let chanceOfColor = 0.1;

    context.strokeStyle = "#333333";
    context.lineWidth = 4;

    var gradient = tinygradient(gradientArray);
    var rgb = gradient.rgb(80);

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

    for (let radius = mainRadius; radius > 32; radius -= sectionRadius) {
      let colorOffset = 0;
      let colorCounter = 0;
      let colorIdx = 0;

      // around the ring
      let segmentLength = segmentWidth / radius;

      // figure out how many segments we can have
      let segments = Math.round((radius * 2 * 3.141592) / segmentWidth);
      // normalize it to fit around the circle
      segmentWidth = (radius * 2 * 3.141592) / segments;
      segmentLength = segmentWidth / radius;

      let outerAngle1 = 0;
      let innerAngle1 = 0;
      let outerAngle2 = 0;
      let innerAngle2 = 0;

      let rotation = random(-Math.PI, Math.PI);

      colorIdx = rangeFloor(0, rgb.length);
      for (let s = 0; s < segments; s++) {
        if (colorCounter == 0 && Math.random() > 1 - chanceOfColor) {
          colorOffset = rangeFloor(-100, 100);
          colorCounter = rangeFloor(0, 5);
        }
        if (colorCounter) {
          context.fillStyle = wrap(rgb, s + colorOffset);
          colorCounter--;
        } else {
          let loc = circleLoc(radius, outerAngle2 + rotation);

          colorIdx = Math.floor(((height - loc[1]) / height) * rgb.length);

          context.fillStyle = rgb[colorIdx + rangeFloor(-3, 3)];
        }

        outerAngle2 += segmentLength;
        innerAngle2 += segmentLength;

        let newOuterAngle2 =
          outerAngle2 +
          random(
            -segmentRandomness * segmentLength,
            segmentRandomness * segmentLength
          );
        let newInnerAngle2 =
          innerAngle2 +
          random(
            -segmentRandomness * segmentLength,
            segmentRandomness * segmentLength
          );

        if (s == segments - 1) {
          newOuterAngle2 = 0;
          newInnerAngle2 = 0;

          if (outerAngle1 > Math.PI * 2) outerAngle1 = 0;
          if (innerAngle1 > Math.PI * 2) innerAngle1 = 0;
        }

        drawSegment(
          context,
          radius,
          radius - sectionRadius,
          outerAngle1 + rotation,
          newOuterAngle2 + rotation,
          innerAngle1 + rotation,
          newInnerAngle2 + rotation
        );

        outerAngle1 = newOuterAngle2;
        innerAngle1 = newInnerAngle2;
      }
      if (sectionRadius > 64) sectionRadius -= sectionShrink;
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
