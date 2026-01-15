import { signUp } from "./signup.js";
import { logIn } from "./login.js";
import { contentResolvers } from "./content.js";
import { checkAuth } from "./checkAuth.js";
const resolvers = {
  Mutation: {
    signUp,
    logIn,
    checkAuth,
    ...contentResolvers.Mutation,
    // other mutations...
  },
  ContentItem: {
    ...contentResolvers.ContentItem,
  },

  Query: {
    hello: () => "Hello World from GraphQL!",
    ...contentResolvers.Query,
  },
};

export default resolvers;
