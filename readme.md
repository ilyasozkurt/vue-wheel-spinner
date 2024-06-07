# Wheel Spinner Component

A customizable wheel spinner component built with Vue.js.

![image](https://github.com/ilyasozkurt/vue-wheel-spinner/assets/4955440/08cb6195-60eb-4ac4-82cb-2a4b5296dc5e)

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Props](#props)
- [Events](#events)
- [License](#license)

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
  <div>
    <VueWheelSpinner
      :slices="slices"
      :winnerIndex="winnerIndex"
      :spinDuration="spinDuration"
      :spinButtonLabel="spinButtonLabel"
      :spinButtonBackgroundColor="spinButtonBackgroundColor"
      :spinButtonLabelColor="spinButtonLabelColor"
      @spin-end="handleSpinEnd"
    />
  </div>
</template>

<script>
import WheelSpinner from './components/VueWheelSpinner.vue';

export default {
  components: {
    WheelSpinner
  },
  data() {
    return {
      slices: [
        { color: '#FF0000', text: 'Prize 1' },
        { color: '#00FF00', text: 'Prize 2' },
        { color: '#0000FF', text: 'Prize 3' },
        { color: '#FFFF00', text: 'Prize 4' },
        { color: '#FFA500', text: 'Prize 5' },
        { color: '#800080', text: 'Prize 6' }
      ],
      winnerIndex: 0,
      spinDuration: 4000,
      spinButtonLabel: 'Spin',
      spinButtonBackgroundColor: '#eaeaea',
      spinButtonLabelColor: '#000'
    };
  },
  methods: {
    handleSpinEnd(winnerIndex) {
      alert(`The winner is slice ${winnerIndex}`);
    }
  }
};
</script>
```

## Props

| Prop                     | Type   | Default    | Description                                                                          |
|--------------------------|--------|------------|--------------------------------------------------------------------------------------|
| `slices`                 | Array  | required   | Array of slice objects. Each slice object should have `color` and `text` properties. |
| `winnerIndex`            | Number | 0          | Index of the slice that will be the winner.                                          |
| `spinDuration`           | Number | 4000       | Duration of the spin animation in milliseconds.                                      |
| `spinButtonLabel`        | String | 'Spin'     | Label of the spin button.                                                            |
| `spinButtonBackgroundColor` | String | '#eaeaea' | Background color of the spin button.                                                 |
| `spinButtonLabelColor`   | String | '#000'     | Text color of the spin button.                                                       |


## Events

| Event         | Description                                                         |
|---------------|---------------------------------------------------------------------|
| `spin-start`  | Emitted when the spin starts.                                       |
| `spin-end`    | Emitted when the spin ends. Passes the `winnerIndex` as a parameter.|


## License
This project is licensed under the MIT License.
