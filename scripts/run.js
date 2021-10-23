const main = async () => {

  // Compile and Deploy
  const luckContractFactory = await hre.ethers.getContractFactory('ChuckALuck');
  const luckContract = await luckContractFactory.deploy({
    value: hre.ethers.utils.parseEther('0.1'),
  });
  await luckContract.deployed();
  console.log('Contract address:', luckContract.address);

  // Check balance
  let contractBalance = await hre.ethers.provider.getBalance(luckContract.address);
  console.log('Contract balance:', hre.ethers.utils.formatEther(contractBalance));

  let bets;
  bets = await luckContract.getAllBets();
  console.log(bets);

  // Bet 1
  const betTxn1 = await luckContract.bet(4, { value: hre.ethers.utils.parseEther('0.01'), });
  await betTxn1.wait();

  // Bet 2
  const betTxn2 = await luckContract.bet(6, { value: hre.ethers.utils.parseEther('0.01'), });
  await betTxn2.wait();

  // Bet 3
  const betTxn3 = await luckContract.bet(2, { value: hre.ethers.utils.parseEther('0.01'), });
  await betTxn3.wait();

  // Check balance
  let contractBalance1 = await hre.ethers.provider.getBalance(luckContract.address);
  console.log('Contract balance:', hre.ethers.utils.formatEther(contractBalance1));

  const [_, randomPerson] = await hre.ethers.getSigners();

  // Bet 4
  const betTxn4 = await luckContract.connect(randomPerson).bet(1, { value: hre.ethers.utils.parseEther('0.01'), });
  await betTxn4.wait();


  // Check balance
  let contractBalance2 = await hre.ethers.provider.getBalance(luckContract.address);
  console.log('Contract balance:', hre.ethers.utils.formatEther(contractBalance2));

  bets = await luckContract.getAllBets();
  console.log(bets);
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();