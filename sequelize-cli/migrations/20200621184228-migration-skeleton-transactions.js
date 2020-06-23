'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('Transactions', {
            id: {
                type: Sequelize.DataTypes.UUID,
                defaultValue: Sequelize.DataTypes.UUIDV1,
                primaryKey: true
            },
            blockNumber: {
                type: Sequelize.DataTypes.INTEGER,
                allowNull: false,
            },
            from: {
                type: Sequelize.DataTypes.STRING(50),
                allowNull: false,
            },
            to: {
                type: Sequelize.DataTypes.STRING(50),
                allowNull: false
            },
            hash: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            value: {
                type: Sequelize.DataTypes.DECIMAL,
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
        });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('Transactions');
    }
};
