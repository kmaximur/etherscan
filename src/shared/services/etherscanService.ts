import {keys} from "../../config/keys"
import axios from "axios";
import * as utils from "web3-utils";
import {IAddress, ITransaction} from "../interfaces";

export class EtherscanService {

    private addresses: IAddress[] = []
    private timeReqs: number[] = []

    constructor() {
    }

    private sleep(): Promise<null> {
        return new Promise(resolve => {
            this.timeReqs.push(Date.now())
            let needSleep: boolean = true
            if (this.timeReqs.length < 5) {
                needSleep = false
            } else {
                for (let i = this.timeReqs.length - 1; i > 0; i--) {
                    if (this.timeReqs[i] - this.timeReqs[0] > 1000) {
                        this.timeReqs.splice(0, 1)
                        if (this.timeReqs.length < 5)
                            needSleep = false
                    }
                }
            }
            if (needSleep) {
                const timeToSleep: number = 1000 - (this.timeReqs[this.timeReqs.length - 1] - this.timeReqs[0])
                setTimeout(() => {
                    resolve()
                }, timeToSleep)
            } else
                resolve()
        })
    }

    public getBlock = (number: number): Promise<any> => axios.get('https://api.etherscan.io/api?module=proxy&action=eth_getBlockByNumber&tag=' + utils.numberToHex(number) + '&boolean=true' + '&apikey=' + keys.apiToken)

    public getLastBlockNumber = (): Promise<any> => axios.get('https://api.etherscan.io/api?module=proxy&action=eth_blockNumber' + '&apikey=' + keys.apiToken)

    private checkAddress(transaction: ITransaction): void {
        if (this.addresses.length === 0) {
            this.addresses.push({
                address: transaction.from,
                change: -(Number(utils.fromWei(transaction.value, 'ether')))
            })
            this.addresses.push({
                address: transaction.to,
                change: Number(utils.fromWei(transaction.value, 'ether'))
            })
        } else {
            let fromExist = false
            let toExist = false
            for (let i = 0; i < this.addresses.length; i++) {
                if (this.addresses[i].address === transaction.from) {
                    this.addresses[i].change -= Number(utils.fromWei(transaction.value, 'ether'))
                    fromExist = true
                } else if (this.addresses[i].address === transaction.to) {
                    this.addresses[i].change += Number(utils.fromWei(transaction.value, 'ether'))
                    toExist = true
                }
                if (fromExist && toExist)
                    break
            }
            if (!fromExist)
                this.addresses.push({
                    address: transaction.from,
                    change: -(Number(utils.fromWei(transaction.value, 'ether')))
                })
            if (!toExist)
                this.addresses.push({
                    address: transaction.to,
                    change: Number(utils.fromWei(transaction.value, 'ether'))
                })
        }
    }

    public getMaxChangeAddress100(): Promise<IAddress> {
        return new Promise(async (resolve, reject) => {
            try {
                const lastBlockNumHex: any = await this.getLastBlockNumber()
                const lastBlock: number = utils.hexToNumber(lastBlockNumHex.data.result)
                let completed: number = 0;
                for (let i = lastBlock - 100; i <= lastBlock; i++) {
                    await this.sleep()
                    console.log('get block # ' + (100 - lastBlock + i))
                    this.getBlock(i).then((block) => {
                        if (block && block.data && block.data.result.transactions) {
                            block.data.result.transactions.forEach(item => {
                                this.checkAddress(item)
                            })
                        }
                        completed += 1;
                        if (completed === 100) {
                            let max: number = 0
                            for (let i = 0; i < this.addresses.length; i++) {
                                if (Math.abs(this.addresses[i].change) > Math.abs(this.addresses[max].change))
                                    max = i
                            }
                            resolve(this.addresses[max])
                            this.addresses = null
                            this.addresses = []
                        }
                    }, err => {
                        console.log(err)
                        reject(err)
                    })
                }
            } catch (e) {
                reject(e)
                console.log(e)
            }
        })
    }
}