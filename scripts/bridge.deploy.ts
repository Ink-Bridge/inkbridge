import { patract, network } from 'redspot';

const { getContractFactory } = patract;
const { createSigner, keyring, api } = network;

const uri =
  'bottom drive obey lake curtain smoke basket hold race lonely fit walk//Alice';

async function run() {
  await api.isReady;

  const signer = createSigner(keyring.createFromUri(uri));
  const contractFactory = await getContractFactory('btc_bridge', signer);

  const balance = await api.query.system.account(signer.address);

  console.log('Balance: ', balance.toHuman());

  let btcHeader = { version: '536870912', previous_header_hash: '0x8919df61b994718a153942dde882b34a3ba8993107aa06000000000000000000',
   merkle_root_hash: '0x4dc2c7d9abd840e0547349549eeecfd8b88e99a7085cc5d017bf37753116394e', time: '1615379696', bits: '386736012', nonce: '4275554107' };

  let btcHeaderInfo = { header: btcHeader, height: '674000' };

  const contract = await contractFactory.deployed('new', btcHeaderInfo, 1, {
    gasLimit: '200000000000',
    value: '100000000000',
  });

  console.log('');
  console.log(
    'Deploy ink bridge successfully. The contract address: ',
    contract.address.toString()
  );
  console.log('');

  const wbtcContractFactory = await getContractFactory('erc20_issue', signer);
  const wbtcContract = await wbtcContractFactory.deployed('IErc20,new', '0', 'Wrapped Bitcoin', 'WBTC', '8', {
    gasLimit: '200000000000',
    value: '100000000000',
  });
  console.log(
    'Deploy wbtc successfully. The contract address: ',
    wbtcContract.address.toString()
  );
  console.log('');

  const exampleFactory = await getContractFactory('bridge_example', signer);
  const exampleContract = await exampleFactory.deployed('new', contract.address, wbtcContract.address, {
    gasLimit: '200000000000',
    value: '100000000000',
  });
  console.log('');
  console.log(
    'Deploy bridge example successfully. The contract address: ',
    exampleContract.address.toString()
  );

  // transfer dai contract ownership to maker
  await wbtcContract.tx['ownable,transferOwnership'](exampleContract.address.toString())

  api.disconnect();
}

run().catch((err) => {
  console.log(err);
});
