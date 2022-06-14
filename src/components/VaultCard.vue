<template>
  <v-card elevation="2" mx-auto class="lg ma-5 pa-2">
    <v-card-title class="mx-1"> {{ this.vaultName }}</v-card-title>

    <v-card-text align="left" class="m1-2">
      <v-row class="mx-1"><p class="body-1">Deposited:</p> </v-row>

      <div :key="rerenderTokenList" class="my-3">
        <v-row class="mx-1">
          {{ this.$store.state.contractNativeToken }} :
          {{ this.vaultDepositedEther }}
        </v-row>
        <v-row
          class="mx-1"
          v-for="(item, key, index) in tokenBallances"
          :key="`${rerenderTokenList}-${index}`"
        >
          {{ key }} : {{ tokenBallances[key] }}
        </v-row>
      </div>

      <v-row v-if="this.secondsToUnlock() > 0" class="mx-1 mt-5">
        <p>Time to release: {{ this.daysToUnlock(true) }} days</p>
      </v-row>
      <v-row v-else-if="this.secondsToUnlock() <= 0" class="mx-1 mt-2">
        <v-chip color="success" outlined small class="mt-3">
          <v-icon left small> mdi-check-circle </v-icon>
          Unlocked
        </v-chip>
      </v-row>
    </v-card-text>
    <v-spacer></v-spacer>
    <v-card-actions class="d-flex justify-end">
      <v-row>
        <v-col>
          <v-dialog v-model="depositDialog" persistent max-width="400">
            <template v-slot:activator="{ on, attrs }">
              <v-btn rounded text small v-bind="attrs" v-on="on">
                <!-- :disabled="!this.depositDisabled" -->
                Deposit
              </v-btn>
            </template>

            <!-- dialog -->

            <v-card>
              <v-toolbar flat dense>
                <v-toolbar-title class="text-h5 ma-3">Deposit</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn icon color="red darken-1">
                  <v-icon
                    @click="
                      depositDialog = false;
                      resetFormInputs();
                    "
                    >mdi-close-circle</v-icon
                  >
                </v-btn>
              </v-toolbar>
              <v-card-text>
                <div>
                  <p>
                    Note: You wont be able to access your tokens until
                    {{ new Date(vaultMaturity*1000) }}
                  </p>
                </div>

                <div class="ma-2">
                  <v-row>
                    <v-col cols="7">
                      <v-text-field
                        dense
                        label="Enter amount"
                        required
                        v-model="depositAmount"
                        :disabled="lockDepositTextField"
                        solo
                      ></v-text-field>
                    </v-col>
                    <v-col cols="5">
                      <v-select
                        :items="availbleDepositTokens"
                        v-model="selectedToken"
                        :disabled="lockDepositTextField"
                        dense
                        solo
                      ></v-select>
                    </v-col>
                  </v-row>
                  <!-- TOKEN WITH APPROVAL TO SPEND REQUIRED -->
                  <template v-if="approveRequired" class="mb-3">
                    <div class="d-flex align-start mb-3">
                      <v-card-text class="text-left body-2">
                        1. Approve this smart contract to spend the selected
                        token. <br />
                        2. Once the approval is complete, you can send the
                        tokens to the vault <br />
                        <br />
                        <p class="font-weight-bold">
                          Note: you need to complete both operations to
                          successfully deposit a token.
                        </p>
                      </v-card-text>
                    </div>

                    <v-row class="d-flex justify-center">
                      <v-tooltip bottom :disabled="positiveDepositAmount">
                        <template v-slot:activator="{ on }">
                          <div v-on="on">
                            <v-btn
                              class="mx-3"
                              color="orange darken-1"
                              rounded
                              text
                              small
                              :disabled="
                                !positiveDepositAmount || approveEventSuccessful
                              "
                              @click="approveTokenSpend(depositAmount)"
                            >
                              1. Approve
                            </v-btn>
                          </div>
                        </template>
                        <span>Enter a valid amount to approve</span>
                      </v-tooltip>

                      <v-tooltip bottom :disabled="approveEventSuccessful">
                        <template v-slot:activator="{ on }">
                          <div v-on="on">
                            <v-btn
                              class="mx-3"
                              color="green darken-1"
                              rounded
                              text
                              small
                              :disabled="!approveEventSuccessful"
                              @click="depositToken()"
                            >
                              2. Send
                            </v-btn>
                          </div>
                        </template>
                        <span>Wait till approve is complete</span>
                      </v-tooltip>
                    </v-row>
                  </template>

                  <!-- NATIVE TOKEN, NO APPROVE REQUIRED -->
                  <template v-else-if="!approveRequired">
                    <v-row class="d-flex justify-center">
                      <v-tooltip bottom :disabled="positiveDepositAmount">
                        <template v-slot:activator="{ on }">
                          <div v-on="on">
                            <v-btn
                              color="green darken-1"
                              rounded
                              text
                              small
                              :disabled="!positiveDepositAmount"
                              @click="depositNative(depositAmount)"
                            >
                              <div v-if="!loadingDeposit">Send</div>

                              <div v-else-if="loadingDeposit">
                                <v-progress-circular
                                  :size="30"
                                  indeterminate
                                  color="green"
                                ></v-progress-circular>
                              </div>
                            </v-btn>
                          </div>
                        </template>
                        <span>Enter a valid amount to deposit</span>
                      </v-tooltip>
                    </v-row>
                  </template>
                </div>
              </v-card-text>
            </v-card>
          </v-dialog>
        </v-col>
        <v-col>
          <!-- WITHDRAW DIALOG -->

          <v-dialog v-model="withdrawDialog" persistent max-width="400">
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                :disabled="!withdrawAvailable"
                v-bind="attrs"
                v-on="on"
                rounded
                text
                small
                color="success"
              >
                Withdraw
              </v-btn>
            </template>

            <v-card>
              <v-toolbar flat dense>
                <v-toolbar-title class="text-h5">Withdraw</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn icon color="red darken-1">
                  <v-icon
                    @click="
                      withdrawDialog = false;
                      resetFormInputs();
                    "
                    >mdi-close-circle</v-icon
                  >
                </v-btn>
              </v-toolbar>
              <v-card-text :key="rerenderList">
                <template v-if="rerenderList > 0">
                  <div v-if="withdrawableTokens.length > 0">
                    <v-row>
                      <v-col cols="7">
                        <p>Select token to withdraw:</p>
                      </v-col>

                      <v-col cols="5">
                        <v-select
                          :items="withdrawableTokens"
                          v-model="selectedToken"
                          dense
                          solo
                        ></v-select>
                      </v-col>
                    </v-row>
                    <v-row class="d-flex justify-center">
                      <v-btn
                        rounded
                        text
                        small
                        color="success"
                        :disabled="!withdrawAvailable"
                        @click="withdraw()"
                      >
                        Withdraw
                      </v-btn>
                    </v-row>
                  </div>
                  <div v-else>
                    <v-card-text>
                      No available tokens to withdraw!
                    </v-card-text>
                  </div>
                </template>

                <!-- </div> -->
              </v-card-text>
            </v-card>
          </v-dialog>
        </v-col>
      </v-row>
    </v-card-actions>
  </v-card>
</template>

<script>
import { ethers } from "ethers";

import { getTokenInterface } from "../utils/getWeb3";

export default {
  data: () => ({
    depositDialog: false,
    withdrawDialog: false,

    depositAmount: null,
    selectedToken: null,
    availbleDepositTokens: [], //list of tickers of possible tokens to deposit, BTCB, BUSD etc

    tokenBallances: {}, //not null ballances of deposited tokens
    rerenderTokenList: 0,
    lockDepositTextField: false,
    approveEventSuccessful: false,

    withdrawableTokens: [],
    rerenderList: 0,

    currentNativeBallance: 0,

    loadingDeposit: false,
  }),
  props: {
    vaultName: String,
    vaultNativeBallance: Number,
    vaultMaturity: Number,
    depositDisabled: Boolean,
    vaultIX: Number,
    vaultUID: Number,
  },

  async created() {
    this.currentNativeBallance = this.vaultNativeBallance;

    //set native token to the initially shown in select
    this.selectedToken = this.$store.state.contractNativeToken;

    //add all supported tokens to the dropdown menu
    this.availbleDepositTokens.push(this.$store.state.contractNativeToken); //zero IX

    for (let id in this.$store.state.contractSupportedTokens) {
      this.availbleDepositTokens.push(
        this.$store.state.contractSupportedTokens[id].ticker
      );
    }

    await this.getTokenBallances();
    const withdrawable = await this.getWithdrawableTokens();

    this.withdrawableTokens = withdrawable;

    this.rerenderList += 1;
  },

  computed: {
    approveRequired: function () {
      return this.selectedToken != this.$store.state.contractNativeToken;
    },

    positiveDepositAmount() {
      return this.depositAmount > 0;
    },

    vaultDepositedEther() {
      let cval = this.currentNativeBallance.toString();
      return ethers.utils.formatUnits(cval, "ether");
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

  methods: {
    async getWithdrawableTokens() {
      let out = [];

      if (this.currentNativeBallance > 0) {
        out.push(this.$store.state.contractNativeToken);
      }

      out.push.apply(out, Object.keys(this.tokenBallances));

      return out;
    },

    resetFormInputs() {
      this.selectedToken = this.$store.state.contractNativeToken;
      this.depositAmount = 0;
      this.lockDepositTextField = false;
      this.approveEventSuccessful = false;
      this.loadingDeposit = false;
    },

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

    getAddressSelectedToken() {
      let tokenContractAddress = null;
      //get selected token smart contract address
      for (let id in this.$store.state.contractSupportedTokens) {
        if (
          this.$store.state.contractSupportedTokens[id].ticker ==
          this.selectedToken
        ) {
          tokenContractAddress =
            this.$store.state.contractSupportedTokens[id].address;
        }
      }

      return tokenContractAddress;
    },

    getDecimalsSelectedToken() {
      let decimals = 0;
      //get selected token smart contract address
      for (let id in this.$store.state.contractSupportedTokens) {
        if (
          this.$store.state.contractSupportedTokens[id].ticker ==
          this.selectedToken
        ) {
          decimals = this.$store.state.contractSupportedTokens[id].decimals;
        }
      }

      return decimals;
    },

    async depositNative(depositAmount) {
      this.lockDepositTextField = true;

      var overrideOptions = {
        value: ethers.utils.parseEther(depositAmount.toString()),
      };
      this.loadingDeposit = true;

      const tx = await this.$store.state.contract.depositNative(
        this.vaultIX,
        overrideOptions
      );

      await tx.wait();

      let vaults = await this.$store.state.contract.getUserVaults();
      this.userVaults = vaults;

      this.currentNativeBallance = vaults[this.vaultIX][2];

      this.resetFormInputs();
      this.depositDialog = false;
    },

    // async withdrawNative() {
    //   await this.$store.state.contract
    //     .withdrawNative(this.vaultIX)
    //     .then(console.log("ok"));
    // },

    getTokenKeyByTicker(object, value) {
      return Object.keys(object).find((key) => object[key].ticker === value);
    },

    //ERC-20 Token menthods
    async approveTokenSpend(depositAmount) {
      this.lockDepositTextField = true;

      let tokenID = this.getTokenKeyByTicker(
        this.$store.state.contractSupportedTokens,
        this.selectedToken
      );

      let tokenContract = await getTokenInterface(tokenID);

      let decimals = this.getDecimalsSelectedToken();

      console.log("decimals ", decimals);

      let amount = ethers.utils.parseEther(depositAmount.toString()); //amount is in wei

      amount = amount.toString().slice(0, decimals); //TODO FIND A MORE NEAT WAY?

      const tx = await tokenContract.approve(
        this.$store.state.contract.address,
        amount
      );

      await tx.wait();

      this.approveEventSuccessful = true;
    },

    async depositToken() {
      //Get internal token ID
      let tokenID = this.getTokenKeyByTicker(
        this.$store.state.contractSupportedTokens,
        this.selectedToken
      );

      let tokenContractAddress = this.getAddressSelectedToken();

      let decimals = this.getDecimalsSelectedToken();

      console.log("decimals ", decimals);

      let amount = ethers.utils.parseEther(this.depositAmount.toString()); //amount is in wei
      amount = amount.toString().slice(0, decimals);

      console.log(
        "depositing token ",
        this.selectedToken,
        "amount",
        amount,
        " address ",
        tokenContractAddress
      );
      const tx = await this.$store.state.contract
        .depositToken(this.vaultIX, tokenContractAddress, amount)
        .then(console.log("ok"));

      await tx.wait();

      //Get the new ballance for this token
      let val = await this.$store.state.contract.getTokenBallanceInVault(
        this.vaultUID,
        tokenID
      );

      //update the ballance in view
      this.tokenBallances[this.selectedToken] = ethers.utils.formatUnits(
        val.toString(),
        decimals
      );

      this.resetFormInputs();
      this.rerenderList += 1;
      this.depositDialog = false;
    },

    async withdraw() {
      //Native token
      if (this.selectedToken == this.$store.state.contractNativeToken) {
        const tx = await this.$store.state.contract
          .withdrawNative(this.vaultIX)
          .then(console.log("ok"));
        await tx.wait();

        let vaults = await this.$store.state.contract.getUserVaults();
        this.userVaults = vaults;

        this.currentNativeBallance = vaults[this.vaultIX][2];

        this.resetFormInputs();
        this.withdrawDialog = false;
      }
      //ERC token
      else if (this.selectedToken != this.$store.state.contractNativeToken) {
        let tokenContractAddress = this.getAddressSelectedToken();

        const tx = await this.$store.state.contract
          .withdrawToken(this.vaultIX, tokenContractAddress)
          .then(console.log("ok"));

        await tx.wait();

        //Get internal token ID
        let tokenID = this.getTokenKeyByTicker(
          this.$store.state.contractSupportedTokens,
          this.selectedToken
        );

        //Get the new ballance for this token
        let val = await this.$store.state.contract.getTokenBallanceInVault(
          this.vaultUID,
          tokenID
        );

        //update the ballance in view
        this.tokenBallances[this.selectedToken] = ethers.utils.formatUnits(
          val.toString(),
          "ether"
        );

        this.resetFormInputs();
        this.rerenderTokenList += 1;
        this.withdrawDialog = false;
      }
    },

    async getTokenBallances() {
      for (let id in this.$store.state.contractSupportedTokens) {
        let ctoken = this.$store.state.contractSupportedTokens[id];

        let val = await this.$store.state.contract.getTokenBallanceInVault(
          this.vaultUID,
          id
        );

        if (val > 0) {
          let amount = ethers.utils.formatUnits(
            val.toString(),
            ctoken.decimals
          );

          this.tokenBallances[ctoken.ticker] = amount;

          this.rerenderTokenList += 1;
        }
      }
    },
  },
};
</script>

<style>
</style>