import { signUp } from "./signup";
import { logIn } from "./login";
import { contentResolvers } from "./content";
import { checkAuth } from "./checkAuth";
const resolvers = {
  Mutation: {
    // signUp,
    // logIn,
    // checkAuth,
    // ...contentResolvers.Mutation,
    // other mutations...
  },
  ContentItem: {
    // ...contentResolvers.ContentItem,
  },

  Query: {
    hello: () => "Hello World from GraphQL!",
    // ...contentResolvers.Query,
  },
};

export default resolvers;
