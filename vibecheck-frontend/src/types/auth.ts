export type LoginResponse = {
  token: string;
  user: {
    userId: string;
    username: string;
    createdAt: string;
  };
};
