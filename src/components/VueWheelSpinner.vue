<template>
  <div class="wheel-wrapper" ref="playgroundContainer">
    <canvas ref="playgroundCanvas"></canvas>
    <div class="spin-button-container">
      <div class="needle"></div>
      <button
          class="spin-button"
          :style="{'backgroundColor': spinButtonBackgroundColor, 'color': spinButtonLabelColor}"
          @click="spinWheel(winnerIndex)">
        {{ spinButtonLabel }}
      </button>
    </div>
  </div>
</template>

<script setup>
import {defineEmits, onBeforeMount, onMounted, ref} from 'vue';

const playgroundContainer = ref(null)
const playgroundCanvas = ref(null);
const currentAngle = ref(0);
const isSpinning = ref(false);
const emits = defineEmits([
  'spin-start',
  'spin-end'
]);

const props = defineProps({
  slices: {
    type: Array,
    required: true
  },
  winnerIndex: {
    type: Number,
    default: 0
  },
  spinDuration: {
    type: Number,
    default: 4000
  },
  spinButtonLabel: {
    type: String,
    default: 'Spin'
  },
  spinButtonBackgroundColor: {
    type: String,
    default: '#eaeaea'
  },
  spinButtonLabelColor: {
    type: String,
    default: '#000'
  }
});

function degreesToRadians(degrees) {
  return degrees * (Math.PI / 180);
}

function getSlices() {
  return props.slices;
}

function getContrastingColor(bgColor) {
  let color = bgColor;
  if (bgColor.charAt(0) === '#') {
    color = bgColor.substring(1, 7);
  }

  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);

  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  return brightness > 125 ? 'black' : 'white';
}

function getAnglePerSlice() {
  return 360 / getSlices().length;
}

function getCursorAngle() {
  return 270;
}

function getRandomBetween(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getNormalizedAngle(angle) {
  return angle % 360;
}

function getSliceAngles(sliceIndex) {

  const slices = getSlices();
  const anglePerSlice = 360 / slices.length;
  const startAngle = getNormalizedAngle(currentAngle.value + anglePerSlice * sliceIndex);
  const endAngle = getNormalizedAngle(startAngle + anglePerSlice);

  return {
    startAngle,
    endAngle
  }

}

function drawSlice(context, centerX, centerY, radius, startAngle, endAngle, fillColor) {
  // Draw pie slice
  context.beginPath();
  context.moveTo(centerX, centerY);
  context.arc(centerX, centerY, radius, degreesToRadians(startAngle), degreesToRadians(endAngle));
  context.stroke();
  context.fillStyle = fillColor;
  context.fill();
  context.closePath();
  context.save();
}

function drawLabel(context, centerX, centerY, radius, startAngle, endAngle, fillColor, sliceLabel) {
  // Draw label
  const textRotateAngle = (endAngle - startAngle) / 2 + startAngle;
  context.translate(centerX, centerY);
  context.rotate(degreesToRadians(textRotateAngle));
  context.textAlign = 'right';
  context.textBaseline = 'middle';
  context.fillStyle = getContrastingColor(fillColor);
  context.font = 'bold 16px Arial';
  context.fillText(sliceLabel, radius - 10, 0);
  context.restore();
}

function drawWheel(container, canvas) {

  const slices = getSlices();

  // Access canvas and context.
  const context = canvas.getContext('2d');

  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;

  // Adjust width and height
  const width = container.clientWidth;
  const height = container.clientHeight;
  context.scale(1, 1);

  // Calculate centroids
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = width / 2;

  // Calculate angle per slice
  const anglePerSlice = 360 / slices.length;

  // Draw slices
  slices.forEach(function (slice, sliceIndex) {
    const startAngle = anglePerSlice * sliceIndex;
    const endAngle = startAngle + anglePerSlice;

    // Draw slice
    drawSlice(context, centerX, centerY, radius, startAngle, endAngle, slice.color);

    // Draw slice label
    drawLabel(context, centerX, centerY, radius, startAngle, endAngle, slice.color, slice.text);
  });

}

function spinWheel(winnerIndex) {

  // If already spinning do nothing
  if (isSpinning.value) {
    return false;
  }

  // Set spinning true
  isSpinning.value = true;

  const canvas = playgroundCanvas.value;

  // Get random spins count
  const extraSpins = 10;

  // Get random spins count
  const extraSpinsAngle = extraSpins * 360;

  // Get winner start and end angle with current status
  const {
    startAngle: winnerStartAngle,
    endAngle: winnerEndAngle
  } = getSliceAngles(winnerIndex);

  // Calculate target angle
  const targetAngle = currentAngle.value + extraSpinsAngle + (getCursorAngle() - winnerEndAngle) + getRandomBetween(0, getAnglePerSlice());

  // Get start time to finish spinning
  const startTime = performance.now();

  // Create animation
  const animate = (currentTime) => {
    const elapsedTime = currentTime - startTime;
    const progress = Math.min(elapsedTime / props.spinDuration, 1);
    const easing = (t) => {
      if (t < 0.5) {
        return 4 * t * t * t;
      } else {
        return (--t) * t * t * 4 + 1;
      }
    };

    let rotationAngle = currentAngle.value + (targetAngle * easing(progress));
    canvas.style.transform = `rotate(${rotationAngle}deg)`;

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      rotationAngle = getNormalizedAngle(rotationAngle);
      canvas.style.transform = `rotate(${rotationAngle}deg)`;
      currentAngle.value = rotationAngle
      isSpinning.value = false;
      emits('spin-end', winnerIndex);
    }

  };

  // Run animation
  requestAnimationFrame(animate);

}

onBeforeMount(() => {
  window.addEventListener('resize', () => {
    drawWheel(playgroundContainer.value, playgroundCanvas.value);
  });
});

onMounted(() => {
  drawWheel(playgroundContainer.value, playgroundCanvas.value);
});

</script>

<style scoped>
.wheel-wrapper {
  position: relative;
  width: 500px;
  height: 500px;
  aspect-ratio: 1 / 1;
  margin: 0;
}

canvas {
  will-change: transform;
}

.needle {
  position: absolute;
  bottom: calc(100% - 5px);
  left: 50%;
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 20px solid #ffffff;
  transform: translateX(-50%);
  z-index: -1;
}

.spin-button-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.spin-button {
  width: 50px;
  height: 50px;
  background: red;
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  outline: none;
  z-index: 10;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
}

.spin-button:hover {
  transform: scale(1.1);
}

.spin-button:active {
  transform: scale(0.9);
}
</style>



