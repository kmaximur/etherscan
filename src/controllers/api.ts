import {errorHandler} from '../utils/errorHandler'
import {getMaxAddress} from '../sequelize/queries';
import {sequelizeClient} from '../sequelize/connect';
import {QueryTypes} from 'sequelize';
import {EtherscanService} from '../shared/services/etherscanService';

const etherscanService = new EtherscanService

export const biggest100 = async (req, res) => {
    try {
        req.setTimeout(1000 * 60 * 5)
        const max = await etherscanService.getMaxChangeAddress100()
        res.status(200).json({
            max
        })
    } catch (e) {
        errorHandler(res, e)
    }
}

export const biggestdb = async (req, res) => {
    try {
        req.setTimeout(1000 * 60 * 5)
        const max = await sequelizeClient.query(getMaxAddress, {type: QueryTypes.SELECT});
        res.status(200).json({
            max
        })
    } catch (e) {
        errorHandler(res, e)
    }
}