<template>
  <h3 v-if="connectionProblem">Make sure you have MetaMask installed in the browser.</h3>
  <button v-if="noConnection" v-on:click="connectWallet">Connect Wallet</button>
  <h3 v-if="generalProblem">Unexpected error occurred.</h3>
  <div
    class="game-board"
    v-bind:class="{
      locked: noConnection || connectionProblem || generalProblem,
    }"
  >
    <div class="tiles">
      <div
        class="tile"
        v-for="index in 6"
        :key="index"
        v-on:click="select(index)"
        v-bind:class="{
          selected: index === selected,
          disabled: noConnection || connectionProblem || generalProblem,
        }"
      >
        <div>{{ index }}</div>
        <img src="../assets/chip.png" width="100" height="100" />
      </div>
    </div>

    <div class="amount">
      <input
        type="number"
        placeholder="Bet amount in ETH"
        v-model="amount"
        v-bind:disabled="noConnection || connectionProblem || generalProblem"
      />
      <button
        v-on:click="placeBet"
        v-bind:disabled="!selected || !amount || amount <= 0"
      >
        Place Bet !
      </button>
    </div>

    <div class="results">
      <Dices
        v-if="beingMined || roll0"
        v-bind:roll0="roll0"
        v-bind:roll1="roll1"
        v-bind:roll2="roll2"
      />
      <p v-if="beingMined">Wainting for the miners response...</p>
      <h3 v-if="!beingMined && prize > 0">You won {{ prize }} ETH !</h3>
      <h3 v-if="!beingMined && prize == 0">You lost...</h3>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { ethers } from "ethers";
import contract from "../assets/ChuckALuck.json";
import Dice from "./Dice.vue";
import Dices from "./Dices.vue";

@Options({
  props: {},
  components: {
    Dice,
    Dices,
  },
})
export default class GameBoard extends Vue {
  useraccount = "";

  selected = 0;
  amount = "";

  beingMined = false;
  roll0 = 0;
  roll1 = 0;
  roll2 = 0;
  prize = -1;

  noConnection = false;
  connectionProblem = false;
  generalProblem = false;

  mounted() {
    this.checkIfWalletIsConnected();
  }

  async checkIfWalletIsConnected(): Promise<void> {
    await this.ethConnect(async (ethereum) => {
      const accounts = await ethereum.request({
        method: "eth_accounts",
      });
      if (!accounts.length) {
        this.noConnection = true;
      }
    });
  }

  async connectWallet(): Promise<void> {
    await this.ethConnect(async (ethereum) => {
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      if(accounts.length){
        this.noConnection = false;
      }
    });
  }

  select(index: number) {
    if (this.noConnection || this.connectionProblem || this.generalProblem) {
      return;
    }
    this.selected = index === this.selected ? 0 : index;
  }

  async placeBet(): Promise<void> {
    this.beingMined = true;
    this.roll0 = 0;
    this.roll1 = 0;
    this.roll2 = 0;

    await this.ethCall(async (luckContract) => {
      const transaction = await luckContract.bet(this.selected - 1, {
        value: ethers.utils.parseEther(this.amount.toString()),
        gasLimit: 300000,
      });

      const transactionResult = await transaction.wait();

      const [roll0, roll1, roll2, prize] = transactionResult.events[0].args;
      this.roll0 = roll0 + 1;
      this.roll1 = roll1 + 1;
      this.roll2 = roll2 + 1;
      this.prize = Number(ethers.utils.formatEther(prize));

      console.log(roll0, roll1, roll2, prize);
      console.log(this.prize);
    });

    this.beingMined = false;
  }

  async getAllWaves(): Promise<void> {
    this.ethCall(async (luckContract) => {
      const waves = await luckContract.getAllWaves();
      const waves2: any[] = [];
      waves.forEach((wave: any) => {
        waves2.push({
          address: wave.waver,
          timestamp: new Date(wave.timestamp * 1000),
          message: wave.message,
        });
      });

      console.log(waves2);
    });
  }

  private async ethConnect(fn: (ethereum: any) => Promise<void>) {
    try {
      const { ethereum } = window as any;

      if (!ethereum) {
        console.error("Ethereum object doesn't exist!");
        this.connectionProblem = true;
        return;
      }

      await fn(ethereum);
    } catch (error) {
      console.error(error);
      this.connectionProblem = true;
    }
  }

  private async ethCall(fn: (contract: ethers.Contract) => Promise<void>) {
    try {
      await this.ethConnect(async (ethereum) => {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const luckContract = new ethers.Contract(
          "0xebB74Ec6615a968B355345b45Fd8F2cFB98A8f6E",
          contract.abi,
          signer
        );

        await fn(luckContract);
      });
    } catch (error) {
      console.error(error);
      this.generalProblem = true;
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.game-board.locked {
  opacity: 0.2;
}
.tiles {
  margin: 20px auto;

  display: grid;
  grid-template-columns: repeat(3, 145px);
  grid-template-rows: repeat(2, 130px);
  border: 2px solid #f2e5bd;
  border-radius: 10px;
  width: fit-content;
}
.tile {
  cursor: pointer;
  display: flex;
}
.tile.disabled {
  cursor: default;
}
.tile:not(:nth-child(3n)) {
  border-right: 1px solid #f2e5bd;
}
.tile:not(:nth-child(n + 4)) {
  border-bottom: 1px solid #f2e5bd;
}
.tile div {
  margin: 10px 0 0 15px;
  font-family: Aladin;
  font-size: 40px;
}
img {
  margin: 15px 0;
  opacity: 0;
}
.tile:hover:not(.disabled) img {
  opacity: 0.3;
}
.tile.selected img {
  opacity: 1;
}
.amount {
  margin-top: 20px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
}
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"] {
  -moz-appearance: textfield;
}
input {
  outline: none;
  border: none;
  height: 50px;
  box-sizing: border-box;
  background: transparent;
  border: 2px solid #f2e5bd;
  border-radius: 10px;
  color: #f0f0e6;
  text-align: center;
  font-size: 24px;
  width: 256px;
  margin-right: 15px;
}
button {
  width: 256px;
  height: 49px;
  margin-left: 15px;

  border-radius: 10px;
  border: none;
  box-shadow: 0 2px 2px 2px rgba(0, 0, 0, 0.5);

  background-color: #c2a24a;
  font-size: 24px;
  font-weight: bold;
  color: #f0f0e6;
  cursor: pointer;

  transition-duration: 0.2s;
}
button:disabled {
  box-shadow: none;
  color: #999;
  background-color: #ccc;
  font-weight: normal;
  cursor: default;
}
.results {
  margin-top: 20px;
}
h3 {
  font-family: Aladin;
  font-size: 30px;
}
</style>
