<template>
  <div class="dices">
    <Dice v-bind:pips="rolls[0]" />
    <Dice v-bind:pips="rolls[1]" />
    <Dice v-bind:pips="rolls[2]" />
  </div>
</template>


<script lang="ts">
import { Options, Vue } from "vue-class-component";
import Dice from "./Dice.vue";

@Options({
  props: {
    roll0: Number,
    roll1: Number,
    roll2: Number,
  },
  watch: {
    roll0() {
      clearInterval(this.interval);
      if (!this.roll0) {
        this.rolls[0] = this.random();
        this.rolls[1] = this.random();
        this.rolls[2] = this.random();

        this.interval = setInterval(() => {
          this.rolls[this.nextR] = this.random();
          this.nextR = (this.nextR + 1) % 3;
        }, 150);
      } else {
        this.rolls[0] = this.roll0;
        this.rolls[1] = this.roll1;
        this.rolls[2] = this.roll2;
      }
    },
  },
  components: {
    Dice,
  },
})
export default class Dices extends Vue {
  roll0!: number;
  roll1!: number;
  roll2!: number;

  rolls: [number, number, number] = [0, 0, 0];

  nextR = 0;
  interval: any;

  mounted() {
    if (!this.roll0) {
      this.rolls[0] = this.random();
      this.rolls[1] = this.random();
      this.rolls[2] = this.random();

      this.interval = setInterval(() => {
        this.rolls[this.nextR] = this.random();
        this.nextR = (this.nextR + 1) % 3;
      }, 150);
    } else {
      this.rolls[0] = this.roll0;
      this.rolls[1] = this.roll1;
      this.rolls[2] = this.roll2;
    }
  }

  random(): number {
    return (Math.floor(Math.random() * 99999) % 6) + 1;
  }
}
</script>


<style scoped>
.dices {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}
</style>
