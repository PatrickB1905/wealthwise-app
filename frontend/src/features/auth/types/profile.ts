export type Profile = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
};

export type BannerMsg = { type: 'success' | 'error'; text: string };
