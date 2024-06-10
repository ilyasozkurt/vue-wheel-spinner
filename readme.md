# Wheel Spinner Component

A customizable wheel spinner component built with Vue.js.

![image](https://github.com/ilyasozkurt/vue-wheel-spinner/assets/4955440/08cb6195-60eb-4ac4-82cb-2a4b5296dc5e)

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Props](#props)
- [Events](#events)
- [License](#license)

[Demo](https://vue-wheel-spinner-demo.vercel.app/)
[Demo Project Source](https://stackblitz.com/~/github.com/ilyasozkurt/vue-wheel-spinner)

## Installation

To use this component, you need to have a Vue.js project set up. If you don't have one, you can create a new Vue.js
project using Vue CLI:

```sh
npm install -g @vue/cli
vue create my-project
cd my-project
```

Install the component

```sh
npm install vue-wheel-spinner
```

## Usage

Import and register the component in your Vue component:

```vue
<template>

  <div class="wheel">
    <div class="wheel-state">
      <div v-if="winnerResult">
        Winner: <span :style="{'color': winnerResult.color}">{{ winnerResult.text }}</span> 🎉
      </div>
      <div v-else-if="isSpinning">
        Spinning...
      </div>
      <div v-else>
        Ready to spin?
      </div>
    </div>
    <VueWheelSpinner
        ref="spinner"
        :slices="slices"
        :winner-index="winnerIndex"
        :spin-duration="spinDuration"
        :spin-button-label="spinButtonLabel"
        :spin-button-size="spinButtonSize"
        :spin-button-background-color="spinButtonBackgroundColor"
        :spin-button-label-color="spinButtonLabelColor"
        :needle-background-color="needleBackgroundColor"
        :needle-scale="needleScale"
        :is-spinning="isSpinning"
        :sounds="sounds"
        @spin-start="onSpinStart"
        @spin-end="onSpinEnd"
    />
  </div>

  <div>
    <button v-for="(slice, index) in slices" :disabled="isSpinning" @click="spinFor(index)">
      Win for {{ slice.text }}
    </button>
  </div>

</template>

<script>
  import VueWheelSpinner from 'vue-wheel-spinner';

  import wonSound from './sounds/won.mp3';
  import clickSound from './sounds/click.mp3';
  import hoverSound from './sounds/hover.mp3';
  import leaveSound from './sounds/leave.mp3';
  import spinningSound from './sounds/spinning.mp3';

  export default {
    components: {
      VueWheelSpinner
    },
    data() {
      return {
        winnerResult: null,
        slices: [
          {color: '#FF0000', text: 'Prize 1'},
          {color: '#00FF00', text: 'Prize 2'},
          {color: '#0000FF', text: 'Prize 3'},
          {color: '#FFFF00', text: 'Prize 4'},
          {color: '#FFA500', text: 'Prize 5'},
          {color: '#800080', text: 'Prize 6'},
        ],
        winnerIndex: 1,
        spinDuration: 4000,
        isSpinning: false,
        spinButtonLabel: 'Spin',
        spinButtonSize: 20,
        spinButtonBackgroundColor: '#fff',
        spinButtonLabelColor: '#000',
        needleBackgroundColor: '#fff',
        needleScale: 1.5,
        sounds: {
          won: wonSound,
          spinButtonClick: clickSound,
          spinButtonHover: hoverSound,
          spinButtonLeave: leaveSound,
          spinning: spinningSound
        }
      };
    },
    methods: {
      spinFor(index) {
        this.winnerIndex = index;
        this.$refs.spinner.spinWheel(index);
      },
      onSpinStart() {
        this.winnerResult = null;
        this.isSpinning = true;
      },
      onSpinEnd(winnerIndex) {
        this.isSpinning = false;
        this.winnerResult = this.slices[winnerIndex];
      }
    }
  };
</script>
```

## Props

| Prop                        | Type   | Default    | Description                                                                          |
|-----------------------------|--------|------------|--------------------------------------------------------------------------------------|
| `slices`                    | Array  | required   | Array of slice objects. Each slice object should have `color` and `text` properties. |
| `winnerIndex`               | Number | 0          | Index of the slice that will be the winner.                                          |
| `spinDuration`              | Number | 4000       | Duration of the spin animation in milliseconds.                                      |
| `spinButtonLabel`           | String | 'Spin'     | Label of the spin button.                                                            |
| `spinButtonBackgroundColor` | String | '#eaeaea' | Background color of the spin button.                                                 |
| `spinButtonLabelColor`      | String | '#000'     | Text color of the spin button.                                                       |
| `spinButtonSize`            | Number | 20         | Button size of the spin button with container percentage. 20%                        |
| `needleBackgroundColor`     | String | '#fff'     | Background color of the needle.                                                      |
| `needleScale`               | Number | 1.5        | Scale of the needle.                                                                 |
| `sounds`                    | Object | {}         | Object of sound files.                                                               |
| `sounds.won`                | String | null       | Sound file for the winning event.                                                    |
| `sounds.spinButtonClick`    | String | null       | Sound file for the spin button click event.                                          |
| `sounds.spinButtonHover`    | String | null       | Sound file for the spin button hover event.                                          |
| `sounds.spinButtonLeave`    | String | null       | Sound file for the spin button leave event.                                          |
| `sounds.spinning`           | String | null       | Sound file for the spinning event.                                                   |


## Events

| Event         | Description                                                         |
|---------------|---------------------------------------------------------------------|
| `spin-start`  | Emitted when the spin starts.                                       |
| `spin-end`    | Emitted when the spin ends. Passes the `winnerIndex` as a parameter.|


## License
This project is licensed under the MIT License.
