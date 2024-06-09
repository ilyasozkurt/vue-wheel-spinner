<template>
  <div class="wheel-wrapper" ref="playgroundContainer">
    <canvas ref="playgroundCanvas"></canvas>
    <div
        class="spin-button-container"
        :style="{'width': `${spinButtonSize}%`, 'height': `${spinButtonSize}%`}">
      <div
          class="needle"
          :style="needleStyle"
      ></div>
      <button
          class="spin-button"
          :disabled="isSpinning"
          :style="{
            'backgroundColor': spinButtonBackgroundColor,
            'color': spinButtonLabelColor
          }"
          @mouseover="handleSpinButtonHover"
          @mouseleave="handleSpinButtonLeave"
          @click="handleSpinButtonClick">
        {{ spinButtonLabel }}
      </button>
    </div>
  </div>
</template>

<script setup>
import {computed, defineExpose, onBeforeMount, onBeforeUnmount, onMounted, ref} from 'vue';

const playgroundContainer = ref(null)
const playgroundCanvas = ref(null);
const currentAngle = ref(0);
const isSpinning = ref(false);
const spinButtonClickAudio = ref(null);
const spinButtonHoverAudio = ref(null);
const spinButtonLeaveAudio = ref(null);
const spinningAudio = ref(null);
const wonAudio = ref(null);
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
  extraSpins: {
    type: Number,
    default: 10
  },
  spinDuration: {
    type: Number,
    default: 4000
  },
  spinButtonLabel: {
    type: String,
    default: 'Spin'
  },
  spinButtonSize: {
    type: Number,
    default: 20
  },
  spinButtonBackgroundColor: {
    type: String,
    default: '#eaeaea'
  },
  spinButtonLabelColor: {
    type: String,
    default: '#000'
  },
  needleBackgroundColor: {
    type: String,
    default: '#fff'
  },
  needleScale: {
    type: Number,
    default: 1
  },
  sounds: {
    type: Object,
    default: () => {
      return {
        spinButtonClick: null,
        spinButtonHover: null,
        spinButtonLeave: null,
        spinning: () => null,
        won: () => null
      }
    }
  },
});

function handleSpinButtonClick() {
  if (spinButtonClickAudio.value) {
    playAudio(spinButtonClickAudio.value)
  }
  spinWheel(props.winnerIndex);
}

function handleSpinButtonHover() {
  if (spinButtonHoverAudio.value) {
    playAudio(spinButtonHoverAudio.value)
  }
}

function handleSpinButtonLeave() {
  if (spinButtonLeaveAudio.value) {
    playAudio(spinButtonLeaveAudio.value)
  }
}

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

function getSliceAngles(sliceIndex, currentCanvasAngle) {

  const slices = getSlices();
  const anglePerSlice = 360 / slices.length;
  const startAngle = getNormalizedAngle(currentCanvasAngle + (anglePerSlice * sliceIndex));
  const endAngle = getNormalizedAngle(currentCanvasAngle + startAngle + anglePerSlice);

  return {
    startAngle,
    endAngle
  }

}

function getEaseInOutQuart(progress) {
  return progress < 0.5 ? 8 * Math.pow(progress, 4) : 1 - Math.pow(-2 * progress + 2, 4) / 2;
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

  const containerWidth = container.clientWidth;
  const containerHeight = container.clientWidth;

  canvas.width = containerWidth;
  canvas.height = containerHeight;

  // Adjust width and height
  const width = containerWidth;
  const height = containerHeight;
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

  // Play spinning sound
  if (spinningAudio.value) {
    playAudio(spinningAudio.value, true);
  }

  // Emit spin start event
  emits('spin-start');

  // Get canvas and container
  const canvas = playgroundCanvas.value;

  // Get random spins count
  const extraSpins = props.extraSpins;

  // Get random spins count
  const extraSpinsAngle = extraSpins * 360;

  // Get winner start and end angle with current status
  const {
    endAngle: winnerEndAngle
  } = getSliceAngles(winnerIndex, currentAngle.value);

  // Calculate target angle
  const targetAngle = currentAngle.value + extraSpinsAngle + (getCursorAngle() - winnerEndAngle) + getRandomBetween(0, getAnglePerSlice());

  // Get start time to finish spinning
  const startTime = performance.now();

  // Create animation
  const animate = (currentTime) => {

    const elapsedTime = currentTime - startTime;
    const progress = Math.min(elapsedTime / props.spinDuration, 1);

    let rotationAngle = currentAngle.value + (targetAngle * getEaseInOutQuart(progress));
    canvas.style.transform = `rotate(${rotationAngle}deg)`;

    if (progress < 1) {

      requestAnimationFrame(animate);

    } else {

      rotationAngle = getNormalizedAngle(rotationAngle);
      canvas.style.transform = `rotate(${rotationAngle}deg)`;
      currentAngle.value = rotationAngle;

      isSpinning.value = false;

      if (wonAudio.value) {
        wonAudio.value.play();
      }

      emits('spin-end', winnerIndex);

      // Stop spinning sound
      if (spinningAudio.value) {
        stopAudio(spinningAudio.value);
      }

    }

  };

  // Run animation
  requestAnimationFrame(animate);

}

function playAudio(audio) {
  if (audio) {
    audio.volume = 0.5
    audio.play();
  }
}

function stopAudio(audio) {
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
}

const needleStyle = computed(() => {
  const scaleBase = 10;
  return {
    borderLeft: Math.round(scaleBase * props.needleScale) + 'px solid transparent',
    borderRight: Math.round(scaleBase * props.needleScale) + 'px solid transparent',
    borderBottom: Math.round(scaleBase * props.needleScale * 2) + 'px solid ' + props.needleBackgroundColor,
  };
});

onBeforeMount(() => {
  window.addEventListener('resize', () => {
    console.log('resize');
    drawWheel(playgroundContainer.value, playgroundCanvas.value);
  });
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', () => {
    drawWheel(playgroundContainer.value, playgroundCanvas.value);
  });
});

onMounted(() => {

  if (props.sounds?.spinning) {
    spinningAudio.value = new Audio(props.sounds?.spinning);
  }

  if (props.sounds?.spinButtonClick) {
    spinButtonClickAudio.value = new Audio(props.sounds?.spinButtonClick);
  }

  if (props.sounds?.spinButtonHover) {
    spinButtonHoverAudio.value = new Audio(props.sounds?.spinButtonHover);
  }

  if (props.sounds?.spinButtonLeave) {
    spinButtonLeaveAudio.value = new Audio(props.sounds?.spinButtonLeave);
  }

  if (props.sounds?.won) {
    wonAudio.value = new Audio(props.sounds?.won);
  }

  drawWheel(playgroundContainer.value, playgroundCanvas.value);

});

defineExpose({
  spinWheel
});

</script>

<style scoped>
.wheel-wrapper {
  max-width: 100vw;
  width: 100%;
  position: relative;
  aspect-ratio: 1 / 1;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

canvas {
  will-change: transform, width, height;
  aspect-ratio: 1 / 1;
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
  width: 100%;
  height: 100%;
  background: red;
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  outline: none;
  z-index: 10;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
}

.spin-button:disabled {
  pointer-events: none;
}

.spin-button:hover {
  transform: scale(1.1);
}

.spin-button:active {
  transform: scale(0.9);
}
</style>