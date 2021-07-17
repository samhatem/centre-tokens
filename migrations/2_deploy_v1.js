const fs = require("fs");
const path = require("path");
const some = require("lodash/some");

const FiatTokenV2_1 = artifacts.require("FiatTokenV2_1");

const THROWAWAY_ADDRESS = "0x0000000000000000000000000000000000000001";

let proxyAdminAddress = "";
let ownerAddress = "";
let masterMinterAddress = "";
let pauserAddress = "";
let blacklisterAddress = "";

// Read config file if it exists
if (fs.existsSync(path.join(__dirname, "..", "config.js"))) {
  ({
    PROXY_ADMIN_ADDRESS: proxyAdminAddress,
    OWNER_ADDRESS: ownerAddress,
    MASTERMINTER_ADDRESS: masterMinterAddress,
    PAUSER_ADDRESS: pauserAddress,
    BLACKLISTER_ADDRESS: blacklisterAddress,
  } = require("../config.js"));
}

module.exports = async (deployer, network) => {
  if (some(["development", "coverage"], (v) => network.includes(v))) {
    // DO NOT USE THESE ADDRESSES IN PRODUCTION - these are the deterministic
    // addresses from ganache, so the private keys are well known and match the
    // values we use in the tests
    proxyAdminAddress = "0x2F560290FEF1B3Ada194b6aA9c40aa71f8e95598";
    ownerAddress = "0xE11BA2b4D45Eaed5996Cd0823791E0C93114882d";
    masterMinterAddress = "0x3E5e9111Ae8eB78Fe1CC3bb8915d5D461F3Ef9A9";
    pauserAddress = "0xACa94ef8bD5ffEE41947b4585a84BdA5a3d3DA6E";
    blacklisterAddress = "0xd03ea8624C8C5987235048901fB614fDcA89b117";
  }

  console.log(`Proxy Admin:   ${proxyAdminAddress}`);
  console.log(`Owner:         ${ownerAddress}`);
  console.log(`Master Minter: ${masterMinterAddress}`);
  console.log(`Pauser:        ${pauserAddress}`);
  console.log(`Blacklister:   ${blacklisterAddress}`);

  if (
    !proxyAdminAddress ||
    !ownerAddress ||
    !masterMinterAddress ||
    !pauserAddress ||
    !blacklisterAddress
  ) {
    throw new Error(
      "PROXY_ADMIN_ADDRESS, OWNER_ADDRESS, MASTERMINTER_ADDRESS, PAUSER_ADDRESS, and BLACKLISTER_ADDRESS must be provided in config.js"
    );
  }

  console.log("Deploying implementation contract...");
  await deployer.deploy(FiatTokenV2_1);
  const fiatTokenV2_1 = await FiatTokenV2_1.deployed();
  console.log("Deployed implementation contract at", FiatTokenV2_1.address);

  console.log("Initializing implementation contract...");
  await fiatTokenV2_1.initialize(
    "USD//C",
    "USDC",
    "USD",
    6,
    masterMinterAddress,
    pauserAddress,
    blacklisterAddress,
    ownerAddress
  );
  await fiatTokenV2_1.initializeV2("USD Coin");
  await fiatTokenV2_1.initializeV2_1(THROWAWAY_ADDRESS);
};
