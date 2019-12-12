var express = require('express');
var router = express.Router();
var fs = require('fs');
const { FileSystemWallet, Gateway } = require('fabric-network');
const path = require('path');
const ccpPath = path.resolve('/media/nazmus/Edu & Softs/4-2/Thesis/fabric-samples/first-network/connection-org1.json');
const ipfsClient=require('ipfs-http-client');
const ipfs=new ipfsClient({host: '127.0.0.1', port: '5001', protocol: 'http'});

/* generate tokens */
function makeid(length) {
    var result = '';
    var characters = 'abcdefghijklmnopqrstuvwxyz';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

/* query all the transaction */
router.get('/all', async function (req, res) {
    try {
        var obj=[];
        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists('user1');
        if (!userExists) {
            console.log('An identity for the user "user1" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccpPath, { wallet, identity: 'user1', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('fabcar');

        // Evaluate the specified transaction.
        // queryCar transaction - requires 1 argument, ex: ('queryCar', 'CAR4')
        //queryAllCars transaction - requires no arguments, ex: ('queryAllCars')
        const result = await contract.evaluateTransaction('queryAllCars');
        var k=0;
        for(x in JSON.parse(result.toString())){
            if(JSON.parse(result.toString())[x].Record.type == 'ehr'){
                obj[k]=JSON.parse(result.toString())[x];
                k=k+1;
            }  
        }
        console.log(obj)
        return res.send({response: obj})

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        return res.send({message: `Failed to submit transaction: ${error}`});
    }
});

/* query a specific transaction */
router.post('/query/:id', async function (req, res) {
    try {
        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists('user1');
        if (!userExists) {
            console.log('An identity for the user "user1" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccpPath, { wallet, identity: 'user1', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('fabcar');

        // Evaluate the specified transaction.
        // queryCar transaction - requires 1 argument, ex: ('queryCar', 'CAR4')
        //queryAllCars transaction - requires no arguments, ex: ('queryAllCars')
        const result = await contract.evaluateTransaction('queryCar', req.params.id);
        console.log(JSON.parse(result.toString()));
        return res.send( JSON.parse(result.toString()));
       

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        return res.send(`Failed to evaluate transaction: ${error}`);
    }
});

/* create the token and add to ledger */
router.post('/create/token', async function (req, res) {
    try {
        var pointer=makeid(10);
        var issued = new Date();
        var maturity = 60*1000*Number(req.body.limit) + Number(issued);
        issued = issued.getTime().toString();
        maturity = maturity.toString();
        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists('user1');
        if (!userExists) {
            console.log('An identity for the user "user1" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccpPath, { wallet, identity: 'user1', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('fabcar');

        // Submit the specified transaction.
        // createCar transaction - requires 5 argument, ex: ('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom')
        // changeCarOwner transaction - requires 2 args , ex: ('changeCarOwner', 'CAR10', 'Dave')
        // await contract.submitTransaction('createCar', 'A4', 'A4', '12s1' ,'EHR', 'Qmas8duiojasd');
        await contract.submitTransaction('createCar', pointer, req.body.key, req.body.uid, "permission", "yes", issued, maturity);
        //await contract.submitTransaction('changeCarOwner', 'A2', 'No');
        console.log('Transaction has been submitted');
        // Disconnect from the gateway.
        await gateway.disconnect();
        return res.send({token: pointer});

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        return res.send({message: `Failed to submit transaction: ${error}`})
    }
});

/* create ehr and add file to ipfs */
router.post('/create/ehr', async function (req, res) {     
    try {     
    var str= req.body.data;
    var obj = str.split(":");
    var steps=obj[1];
    var calory=obj[2];
    var distance=obj[3];
    var date = new Date();
    date=date.toString();
    var issued = new Date();
    issued=issued.getTime().toString();
    var maturity = "N/A";
    
    fs.appendFileSync('files/query.txt', date.toString() + '\n' 
    + `Steps: ${steps} \n` + `Calory: ${calory} \n` + 
    `Distance: ${distance} \n`, 
    function (err) {
        if (err) throw err;
      });

    var pointer= makeid(10);
    const file=fs.readFileSync('files/query.txt');
    const fileAdded= await ipfs.add({path: 'files/query.txt', content: file});
    const fileHash=fileAdded[0].hash;
    console.log(fileHash);
        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists('user1');
        if (!userExists) {
            console.log('An identity for the user "user1" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccpPath, { wallet, identity: 'user1', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('fabcar');

        // Submit the specified transaction.
        // createCar transaction - requires 5 argument, ex: ('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom')
        // changeCarOwner transaction - requires 2 args , ex: ('changeCarOwner', 'CAR10', 'Dave')
        // await contract.submitTransaction('createCar', 'A4', 'A4', '12s1' ,'EHR', 'Qmas8duiojasd');
        await contract.submitTransaction('createCar', pointer, pointer, obj[0], "ehr", fileHash, issued, maturity);
        //await contract.submitTransaction('changeCarOwner', 'A2', 'No');
        console.log('Transaction has been submitted');
        // Disconnect from the gateway.
        await gateway.disconnect();
        return res.status(200).json({message: fileHash});

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        return res.send({message: `Failed to submit transaction: ${error}`});
    }
});

module.exports = router;