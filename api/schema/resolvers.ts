

export const resolvers = {
  Query: {
    // users: async () => await User.findAll(),
  },
  Mutation: {
    createUser: async (_: any, { name, email }: { name: string, email: string }) => {
    //   return await User.create({ name, email });
    },
  },
};