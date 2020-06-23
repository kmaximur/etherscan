import {Model, DataTypes} from 'sequelize';
import {sequelizeClient} from '../connect'

class Transaction extends Model {
    public id!: string;
    public blockNumber!: number;
    public from!: string;
    public to!: string;
    public hash!: string;
    public value!: number;
}

Transaction.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        primaryKey: true
    },
    blockNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    from: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    to: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    hash: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    value: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        validate: {
            isDecimal: true,
            notEmpty: true,
            customValidator(value) {
                if (value <= 0) {
                    throw new Error("value must be > 0");
                }
            }
        }
    }
}, {
    sequelize: sequelizeClient,
    tableName: 'Transactions',
    timestamps: false
});

export {Transaction}