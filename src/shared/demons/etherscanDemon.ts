import {Transaction} from "../../sequelize/models/Transaction";
import {sequelizeClient, isConnected} from "../../sequelize/connect";
import {EtherscanService} from "../services/etherscanService"
import * as utils from "web3-utils";
import Timeout = NodeJS.Timeout;

const etherscanService = new EtherscanService

let intervalCheck: Timeout = null
let waiting: boolean = false

function checkLastBlockFromDb(): Promise<number> {
    return new Promise(async (resolve, reject) => {
        try {
            const candidate: number = await Transaction.max('blockNumber')
            if (candidate && !isNaN(candidate))
                resolve(candidate)
            else
                resolve(9842804)
        } catch (e) {
            reject(e)
        }
    })
}

function checkLastBlockFromEtherscan(): Promise<number> {
    return new Promise(async (resolve, reject) => {
        try {
            const lastBlockNumHex: any = await etherscanService.getLastBlockNumber()
            const lastBlock: number = utils.hexToNumber(lastBlockNumHex.data.result)
            resolve(lastBlock)
        } catch (e) {
            reject(e)
        }
    })
}

function saveTransaction(transaction: Transaction, t): Promise<null> {
    return new Promise(async (resolve, reject) => {
        try {
            const value = Number(utils.fromWei(transaction.value, 'ether'))
            if (value > 0 && transaction.from && transaction.to && transaction.hash && transaction.blockNumber)
                await Transaction.upsert({
                    blockNumber: utils.hexToNumber(transaction.blockNumber),
                    from: transaction.from,
                    to: transaction.to,
                    hash: transaction.hash,
                    value: value
                }, {transaction: t})
            resolve()
        } catch (e) {
            reject(e)
        }
    })
}

async function saveBlock(num: number): Promise<null> {
    return new Promise(async (resolve, reject) => {
        try {
            const block = await etherscanService.getBlock(num)
            if (block && block.data && block.data.result.transactions) {
                let empty = true
                for (let i = 0; i < block.data.result.transactions.length; i++) {
                    if (Number(utils.fromWei(block.data.result.transactions[i].value, 'ether')) > 0) {
                        empty = false
                        break
                    }
                }
                if (empty) {
                    await Transaction.upsert({
                        blockNumber: num,
                        from: 'empty',
                        to: 'empty',
                        hash: `empty${num}`,
                        value: 0.000000000000001
                    })
                    console.log('Block # ' + num + ' saved')
                    resolve()
                } else {
                    const t = await sequelizeClient.transaction()
                    Promise.all(block.data.result.transactions.map((item) => saveTransaction(item, t))).then(async () => {
                        await t.commit();
                        console.log('Block # ' + num + ' saved')
                        resolve()
                    }, async rej => {
                        await t.rollback();
                        console.log(rej)
                        reject()
                    })
                }
            } else {
                console.log('no data')
                reject()
            }
        } catch (e) {
            console.log(e)
            reject()
        }
    })
}

const runDemon = async () => {
    console.log('demon started')
    intervalCheck = setInterval(async () => {
        try {
            if (waiting || !isConnected)
                return
            waiting = true
            const etherscanNumBlock = await checkLastBlockFromEtherscan()
            const dbNumBlock = await checkLastBlockFromDb()
            if (etherscanNumBlock && etherscanNumBlock && dbNumBlock < etherscanNumBlock) {
                for (let i = dbNumBlock + 1; i <= etherscanNumBlock; i++) {
                    await saveBlock(i)
                }
            }
            waiting = false
        } catch (e) {
            console.log(e)
            waiting = false
        }
    }, 5000)
}

const stopDemon = () => {
    console.log('demon stopped')
    clearInterval(intervalCheck)
    intervalCheck = null
}

export {runDemon, stopDemon}