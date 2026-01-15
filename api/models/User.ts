import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database.js";


interface UserAttributes {
  id: number;
  username: string;
  email: string;
  phonenumber: string;
  password: string;
  role: "user" | "moderator" | "admin";
}

interface UserCreationAttributes extends Optional<UserAttributes, "id"> { }

class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes {
  public declare id: number;
  public declare username: string;
  public declare email: string;
  public declare role: "user" | "moderator" | "admin";
  public declare phonenumber: string;
  public declare password: string;

  // timestamps
  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;
}


User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },

    role: {
      type: DataTypes.ENUM("user", "moderator", "admin"),
      allowNull: false,
      defaultValue: "user",
    },

    phonenumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: false,
  }
);

export default User;
