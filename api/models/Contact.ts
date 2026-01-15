import { DataTypes, Model } from "sequelize";
import {sequelize} from "../config/database.js";


class Contact extends Model {
    public id!: number;
    public phoneNumber!: string;
    public address!: string;
}

Contact.init({
    id:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    phoneNumber:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    address:{
        type: DataTypes.STRING,
        allowNull: true,
    },
},{
    sequelize,
    modelName: "Contact",
    tableName: "contacts",
    timestamps: false,
})

export default Contact;