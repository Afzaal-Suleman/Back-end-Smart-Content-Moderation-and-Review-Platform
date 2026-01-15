import { DataTypes, Model, Optional } from "sequelize";
import {sequelize} from "../config/database.js";
import User from "./User.js";

interface ContentItemAttributes {
  id: number;
  title: string;
  description?: string;
  contentUrl: string;
  contentType: "image" | "video" | "text" | "audio" | "document";
  status: "pending" | "approved" | "rejected" | "needs_review" | "publish" | "draft";
  submittedBy: number;
  assignedModerator?: number | null;
  reviewedBy?: number | null;
  reviewComments?: string | null;
  rejectionReason?: string | null;
  submittedAt: Date;
  reviewedAt?: Date | null;
  publishedAt?: Date | null;
  priority: "low" | "medium" | "high";
}

interface ContentItemCreationAttributes extends Optional<ContentItemAttributes, "id" | "assignedModerator" | "reviewComments" | "rejectionReason" | "reviewedAt"> { }

class ContentItem extends Model<ContentItemAttributes, ContentItemCreationAttributes>
  implements ContentItemAttributes {

  public declare id: number;
  public declare title: string;
  public declare description?: string;
  public declare contentUrl: string;
  public declare contentType: "image" | "video" | "text" | "audio" | "document";
  public declare status: "pending" | "approved" | "rejected" | "needs_review" | "publish" | "draft";
  public declare submittedBy: number;
  public declare assignedModerator?: number | null;
  public declare reviewedBy?: number | null;
  public declare reviewComments?: string | null;
  public declare rejectionReason?: string | null;
  public declare submittedAt: Date;
  public declare reviewedAt?: Date | null;
  public declare publishedAt?: Date | null;
  public declare priority: "low" | "medium" | "high";

  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;
}


ContentItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    contentUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contentType: {
      type: DataTypes.ENUM("image", "video", "text", "audio", "document"),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected", "needs_review", "publish", "draft"),
      defaultValue: "pending",
    },
    submittedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    assignedModerator: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: User,
        key: "id",
      },
    },
    reviewedBy: {
      type: DataTypes.INTEGER, // FK to Users table
      allowNull: true,
    },
    reviewComments: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    submittedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    publishedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    priority: {
      type: DataTypes.ENUM("low", "medium", "high"),
      defaultValue: "medium",
    },
  },
  {
    sequelize,
    modelName: "ContentItem",
    tableName: "content_items",
  }
);

// Associations
ContentItem.belongsTo(User, { as: "submitter", foreignKey: "submittedBy" });
ContentItem.belongsTo(User, { as: "moderator", foreignKey: "assignedModerator" });

export default ContentItem;
