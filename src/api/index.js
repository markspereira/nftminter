import { version } from '../../package.json';
import { Router } from 'express';
import facets from './facets';
import { ethers } from 'ethers';
import abi from '../ABIs/OHBLOCKABI'
// import Web3 from 'web3';

let privateKey = "";
let infuraProvider = new ethers.providers.InfuraProvider('rinkeby');

let walletWithProvider = new ethers.Wallet(privateKey, infuraProvider);

let contractAddress = "0xb909d0272713775781cc0cfd4c7a5b9ff0400751";

let contract = new ethers.Contract(contractAddress, abi, walletWithProvider);

const mintNFT = async (to, tokenURI, uID, edition) => {
  let tx = await contract.mintCollectible(to, tokenURI, uID, edition);
  const waiting = await tx.wait();
  return {tx: waiting}
};

export default ({ config, db }) => {
	let api = Router();

	// mount the facets resource
	api.use('/facets', facets({ config, db }));

	// perhaps expose some API metadata at the root
	api.get('/', (req, res) => {
		res.json({ version });
	});

	api.post('/mint',  async (req, res) => {
		if (req.body) {
			if (typeof req.body.to !== 'string') {
        return res.json({error: 'to address is not a string'});
			}
      if (typeof req.body.tokenURI !== 'string') {
        return res.json({error: 'tokenURI is not a string'});
      }
      if (typeof req.body.uniqueID !== 'string') {
        return res.json({error: 'uniqueID is not a string'});
      }
      if (typeof req.body.edition !== 'number') {
        return res.json({error: 'edition is not a number'});
      }

      console.log('REQ: ', req.body);
			const {to, tokenURI, uniqueID, edition} = req.body;
      const tx = await mintNFT(to, tokenURI, uniqueID, edition);
      res.json(tx)
		} else {
			res.json({message: 'ooo i don\'t like what you just did there'});
		}

	})

	return api;
}
