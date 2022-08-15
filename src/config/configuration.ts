export interface EnvConfig {
  port: number;
  hosting: {
    url: string;
  };
  db: {
    uri: string;
  };
}

export const envConfig: () => EnvConfig = () => ({
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  hosting: {
    url: process.env.HOSTING_DEPLOYED_URL ?? 'localhost',
  },
  db: {
    uri: process.env.DB_URI ?? '',
  },
});
