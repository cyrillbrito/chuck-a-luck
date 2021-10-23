
const main = async () => {
  const luckContractFactory = await hre.ethers.getContractFactory('ChuckALuck');
  const luckContract = await luckContractFactory.deploy({
    value: hre.ethers.utils.parseEther('0.001'),
  });

  await luckContract.deployed();

  console.log('ChuckALuck address: ', luckContract.address);
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

runMain();