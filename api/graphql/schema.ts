import { gql } from "graphql-tag";

export const typeDefs = gql` 

  type Query {
    users: [User!]!
  }
     type Query {
    hello: String
  }
  input SignUpInput {
  username: String!
  email: String!
  phonenumber: String!
  password: String!
}

type User {
  id: ID!
  username: String!
  email: String!
  phonenumber: String!
  role: String!
}
  type SignUpResponse {
  success: Boolean!
  user: User
}
  type Mutation {
    signUp(input: SignUpInput!): SignUpResponse
  }

  input LoginInput {
  email: String!
  password: String!
}

type LoginResponse {
  success: Boolean!
  token: String!
  user: User!
  role: String!
}

type Mutation {
  logIn(input: LoginInput!): LoginResponse!
}

type checkAuthResponse {
  success: Boolean!
  token: String!
  user: User!
}

type Mutation {
  checkAuth: checkAuthResponse!
}

 # content item types and inputs

type ContentItem {
  id: ID!
  title: String!
  description: String
  contentUrl: String!
  contentType: String!
  status: String!
  submittedBy: User!
  assignedModerator: User
  reviewComments: String
  rejectionReason: String
  submittedAt: String!
  reviewedAt: String
  priority: String!
}

input SubmitContentInput {
  title: String!
  description: String
  contentUrl: String!
  contentType: String!
  priority: String
}
type contentResponse {
  success: Boolean!
  ContentItem: ContentItem!
}
type Mutation {
  submitContent(input: SubmitContentInput!): contentResponse!
}

type Query {
  contents: [ContentItem]
  content(id: ID!): ContentItem
  contentByUser: [ContentItem]
  refreshToken: Boolean!
}

input UpdateContentStatusInput {
  contentId: ID!
  status: String!
}

type Mutation {
  updateContentStatus(input: UpdateContentStatusInput!): UpdateContentStatusResponse
}

type UpdateContentStatusResponse {
  success: Boolean!
  message: String
  ContentItem: ContentItem
}
type Query {
  approvedContent: [ContentItem!]!
}
`;