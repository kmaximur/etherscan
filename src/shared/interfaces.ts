export interface IAddress {
    address: string,
    change: number,
}

export interface ITransaction {
    blockHash: string,
    blockNumber: string,
    from: string,
    gas: string,
    gasPrice: string,
    hash: string,
    input: string,
    nonce: string,
    to: string,
    transactionIndex: string,
    value: string,
    v: string,
    r: string,
    s: string
}