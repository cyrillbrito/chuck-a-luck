<template>
  <div class="game-board">
    <div class="tiles">
      <div
        class="tile"
        v-for="index in 6"
        :key="index"
        v-on:click="selected = index === selected ? 0 : index"
        v-bind:class="{ selected: index === selected }"
      >
        <div>{{ index }}</div>
        <img src="../assets/chip.png" width="100" height="100" />
      </div>
    </div>

    <div class="amount">
      <input type="number" placeholder="Bet amount in ETH" v-model="amount" />
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
  waves: any[] = [];
  selected = 0;
  amount = "";
  beingMined = false;
  roll0 = 0;
  roll1 = 0;
  roll2 = 0;
  prize = -1;

  contractAddess = '0xebB74Ec6615a968B355345b45Fd8F2cFB98A8f6E';

  mounted() {
    this.checkIfWalletIsConnected();
  }

  async checkIfWalletIsConnected(): Promise<void> {
    try {
      const { ethereum } = window as any;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      /*
       * Check if we're authorized to access the user's wallet
       */
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        this.useraccount = account;
        // await this.getAllWaves();
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log(error);
    }
  }

  async connectWallet(): Promise<void> {
    try {
      const { ethereum } = window as any;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      this.useraccount = accounts[0];
    } catch (error) {
      console.log(error);
    }
  }

  async placeBet(): Promise<void> {
    this.beingMined = true;
    this.roll0 = 0;
    this.roll1 = 0;
    this.roll2 = 0;

    try {
      const { ethereum } = window as any;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          this.contractAddess,
          contract.abi,
          signer
        );

        const transaction = await wavePortalContract.bet(this.selected - 1, {
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
        console.log(ethers.utils.formatEther(prize));

        this.beingMined = false;
      } else {
        this.beingMined = false;
        alert("Ethereum object doesn't exist!");
      }
    } catch (error) {
      this.beingMined = false;
      alert("Oops! Somethings went wrong.");
      console.error(error);
    }
  }

  async count(): Promise<void> {
    try {
      const { ethereum } = window as any;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          this.contractAddess,
          contract.abi,
          signer
        );

        let count = await wavePortalContract.getTotalPings();
        console.log("Retrieved total wave count...", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getAllWaves(): Promise<void> {
    try {
      const { ethereum } = window as any;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          this.contractAddess,
          contract.abi,
          signer
        );

        /*
         * Call the getAllWaves method from your Smart Contract
         */
        const waves = await wavePortalContract.getAllWaves();

        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        waves.forEach((wave: any) => {
          this.waves.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
          });
        });

        /*
         * Store our data in React State
         */
        // this.waves = wavesCleaned;
        console.log(this.waves);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
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
.tile:not(:nth-child(3n)) {
  border-right: 1px solid #f2e5bd;
}
.tile:not(:nth-child(n+4)){
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
.tile:hover img {
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
