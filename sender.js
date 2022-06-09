const Web3 = require("web3"); 
const con = require("./databse");
const {infuraLink} = require("./config/infuraLink")
const web3 = new Web3(new Web3.providers.HttpProvider(infuraLink))
const EthereumTx = require('ethereumjs-tx').Transaction;
const {senderData} = require('./config/sender_data')
const senderAddress = senderData.senderAddress
const privateKey = senderData.privateKey
let recAddress = "0x0dc7f556d03882527dd92371c74b3739c5553ba2"
// recAddress = "0x1a7a49dd847521daef30ea3de3c1f74771e5c875"

let status= " ";
let process = 0;


async function sendEthereum(senderAdddress,privateKey, recAddress, amount){
    var nonce = await web3.eth.getTransactionCount(senderAddress);
    console.log(nonce);
    web3.eth.getBalance(senderAddress,async(err,result) => {
        if(err){
            return err;
        }
        let balance = web3.utils.fromWei(result,'ether');
        console.log(balance + " ETH");
        if(balance<amount){
            console.log("insufficient balance");
            return "balance insufficient";
        }
        sign_transaction(senderAdddress,privateKey, recAddress, amount,nonce)
    });
}

async function sign_transaction(senderAddress ,privateKey, recAddress, amount,nonce){
    con.query("Select id,status from transaction order by id desc limit 1",async function(err,result){
        if(err){
            return err;
        }
        // console.log(result[0].status)
        console.log(result.length)
        if(result.length<=0){
            nonce = nonce +1;
            let status = "pending";
            const createTransaction = await web3.eth.accounts.signTransaction(
                {
                   from: senderAddress,
                   to: recAddress,
                   value: web3.utils.toWei(amount.toString(), 'ether'),
                   gas: '21000',
                },
                privateKey
             );
             status = "pending";
             process = process+1;
             con.query("Insert into transaction(id, from_add, to_add, amount, status, process, transactio_hash, raw_transaction, timestamp) values(?,?,?,?,?,?,?,?,?)",
                [nonce, senderAddress, recAddress, amount, status, process,createTransaction.transactionHash,createTransaction.rawTransaction,Math.floor(Date.now() / 1000)]);
            console.log(createTransaction);

        }
        else{
            if(result[0].status="pending"){
                nonce = result[0].id+1;
            }
            else{
                nonce = nonce +1;
            }
            const createTransaction = await web3.eth.accounts.signTransaction(
                {
                   from: senderAddress,
                   to: recAddress,
                   value: web3.utils.toWei(amount.toString(), 'ether'),
                   gas: '21000',
                },
                privateKey
             );
             status = "pending";
             process = process+1;
             con.query("Insert into transaction(id, from_add, to_add, amount, status, process, transactio_hash, raw_transaction, timestamp) values(?,?,?,?,?,?,?,?,?)",
                [nonce, senderAddress, recAddress, amount, status, process,createTransaction.transactionHash,createTransaction.rawTransaction,Math.floor(Date.now() / 1000)]);
            console.log(createTransaction);
             return createTransaction;
        }
    });
}

async function deploy_transaction(){
    con.query("Select * from transaction where status = 'pending'",async function(err, result){
        if(err){
            return err;
        }
        for(let i=0;i<result.length;i++){
            await web3.eth.getTransactionCount("0x6343D7675ef45d12ED09e66ec45CD12BC5f6423d").then(console.log)
            web3.eth.sendSignedTransaction(result[i].raw_transaction);
            con.query("Update transaction set timestamp = ? where status = 'pending'",[Math.floor(Date.now() / 1000)]);
            con.query("Update transaction set status = 'successfull' where id = "+result[i].id);
            web3.setTransactionCount
            console.log("Transaction successful with hash: " + result[i].raw_transaction)
        }
    })
}

deploy_transaction()
sendEthereum(senderAddress,privateKey,recAddress,00)
