<template>
  <v-card elevation="2" mx-auto class="lg ma-5 pa-2">
    <v-card-title class="mx-1"> {{ this.vaultName }}</v-card-title>

    <v-card-text align="left" class="my-2">
      <v-row class="mx-1"
        ><p>Deposited: {{ this.vaultDepositedEther }} {{ this.$store.state.contractNativeToken }}</p></v-row
      >
      <v-row v-if="this.secondsToUnlock() > 0" class="mx-1">
        <p>Time to release: {{ this.daysToUnlock(true) }} days</p>
      </v-row>
      <v-row v-else-if="this.secondsToUnlock() <= 0" class="mx-1">
        <v-chip color="success" outlined>
          <v-icon left> mdi-check-circle </v-icon>
          Unlocked
        </v-chip>
      </v-row>
    </v-card-text>
    <v-card-actions class="justify-space-around">
      <v-row>
        <v-col>
          <v-dialog v-model="dialog" persistent max-width="320">
            <template v-slot:activator="{ on, attrs }">
              <v-btn rounded text small v-bind="attrs" v-on="on">
                Deposit
              </v-btn>
            </template>

            <!-- dialog -->

            <v-card>
              <v-card-title class="text-h5"> Deposit </v-card-title>

              <v-card-text>
                <div>
                  <p>
                    Note: You wont be able to access your tokens until
                    23-03-2022 TODO
                  </p>
                </div>

                <div class="ma-2">
                  <v-row>
                    <v-col cols="8">
                      <v-text-field
                        dense
                        label="Enter amount"
                        required
                        v-model="depositAmount"
                        solo
                      ></v-text-field>
                    </v-col>
                    <v-col cols="3" class="mt-2"><p>{{ this.$store.state.contractNativeToken }}</p></v-col>
                  </v-row>
                </div>
              </v-card-text>
              <v-row> </v-row>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="red darken-1" text @click="dialog = false">
                  Cancel
                </v-btn>
                <v-btn
                  color="green darken-1"
                  text
                  @click="addToVaultNative(depositAmount)"
                >
                  Send
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-col>
        <v-col>
          <v-btn
            rounded
            text
            small

            color="success"
            :disabled="!withdrawAvailable"
            @click="withdrawNative()"
          >
            Withdraw
          </v-btn>
        </v-col>
      </v-row>
    </v-card-actions>
  </v-card>
</template>

<script>
import Web3 from "web3";
import {ethers} from 'ethers';

export default {
  data: () => ({
    dialog: false,
    depositAmount: null,
  }),
  props: {
    vaultName: String,
    vaultNativeBallance: Number,
    vaultMaturity: Number,
    vaultID: Number,
  },

  methods: {
    secondsToUnlock() {
      let currentVaultMaturity = new Date(this.vaultMaturity).getTime();
      let currentTime = new Date().getTime() / 1000;

      let secondsToUnlock = currentVaultMaturity - currentTime;

      return secondsToUnlock;
    },

    daysToUnlock(full = false) {
      let secondsToUnlock = this.secondsToUnlock();

      let minutes = secondsToUnlock / 60;
      let hours = minutes / 60;
      let days = hours / 24;

      if (full) {
        return Math.floor(days);
      }

      return days;
    },

    async getUserVaults() {
      return await this.$store.state.contract.getUserVaults();
    },

    async addToVaultNative(depositAmount) {
      this.dialog = false;
    
      console.log("number of days ", this.daysToUnlock());

      // const signer = this.$store.state.provider.getSigner();

      var overrideOptions = {
          value: ethers.utils.parseEther(depositAmount.toString())
      };

      await this.$store.state.contract
        .depositNative(this.vaultID, overrideOptions)
        .then(console.log("ok"));
        //TODO add event to update the UI ballance
      this.userVaults = this.getUserVaults();
    },

    async withdrawNative() {
      await this.$store.state.contract
        .withdrawNative(this.vaultID)
        .then(console.log("ok"));
    },

    // TODO
    async depositToken() {
      await this.$store.state.contract
        .depositToken(this.vaultID, 100)
        .then(console.log("ok"));
    },

    // TODO
    async withdrawToken() {
      await this.$store.state.contract
        .withdrawToken(this.vaultID, 100)
        .then(console.log("ok"));
    },



    // async getTokenBallance(tokenID) {
    //   await this.$store.state.contract
    //     .getTokenBallanceInVault(this.vaultID, tokenID)
    //     .then(console.log("ok"));
    // },


  },
  computed: {
    vaultDepositedEther() {
      let cval = this.vaultNativeBallance.toString();
      return Web3.utils.fromWei(cval, "ether");
    },
    withdrawAvailable() {
      let currentTime = new Date().getTime() / 1000;
      let timedifference = this.vaultMaturity - currentTime;

      if (timedifference > 0) {
        return false;
      }

      return true;
    },
  },
};
</script>

<style>
</style>