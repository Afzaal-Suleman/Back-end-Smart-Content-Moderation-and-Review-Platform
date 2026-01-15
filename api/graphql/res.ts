import bcrypt from "bcryptjs";
import Contact from "../models/Contact";
import User from "../models/User";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_here";
export const resolvers = {
  // Query: {
  //   users: async () => {
  //     return await User.findAll();
  //   },
  //   contact: async () => {
  //     return await Contact.findAll()
  //   },
  // },

  Mutation: {   
    createContact: async (_: any, args: { phoneNumber: string; address?: string }) => {
      const contact = await Contact.create({
        phoneNumber: args.phoneNumber,
        address: args.address,
      });
      return contact;
    },
    deleteContact: async (_: any, args: { id: number }) => {
      const deleted = await Contact.destroy({ where: { id: args.id } });
      return deleted > 0;
    },

    updateContact: async (_: any, args: { id: number; phoneNumber?: string; address?: string }) => {
      const contact = await Contact.findByPk(args.id);
      if (!contact) throw new Error("Contact not found");

      // Only update fields that are provided
      if (args.phoneNumber !== undefined) contact.phoneNumber = args.phoneNumber;
      if (args.address !== undefined) contact.address = args.address;

      await contact.save();
      return contact;
    },
    updateContactFull: async (_: any, args: { id: number; phoneNumber: string; address: string }) => {
      const contact = await Contact.findByPk(args.id);
      if (!contact) throw new Error("Contact not found");

      // Replace all fields
      contact.phoneNumber = args.phoneNumber;
      contact.address = args.address;

      await contact.save();
      return contact;
    },
  },
};
