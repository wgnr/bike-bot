export interface EnvConfig {
  port: number;
  hosting: {
    url: string;
  };
}

export const envConfig: () => EnvConfig = () => ({
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  hosting: {
    url: process.env.HOSTING_DEPLOYED_URL ?? 'localhost',
  },
});
