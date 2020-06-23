import {Sequelize} from 'sequelize';
import {keys} from "../config/keys"

const sequelizeClient = new Sequelize(keys.dbName, keys.dbUser, keys.dbPassword, {
    host: keys.dbHost,
    dialect: 'postgres',
    logging: false
})

let isConnected = false

sequelizeClient.authenticate()
    .then(() => {
        console.log('Sequelize: Connection has been established successfully.');
        isConnected = true
    })
    .catch(err => {
        console.error('Sequelize: Unable to connect to the database:', err);
    });


export {sequelizeClient, isConnected}