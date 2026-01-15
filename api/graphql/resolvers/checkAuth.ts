export const checkAuth = async (_: any, __: any, context: any) => {
  if (!context.user) {
    throw new Error("Not authenticated");
  }

  const user = context.user;
  const token = context.token;

  return {
    success: true,
    token,
    user,
  };
};
