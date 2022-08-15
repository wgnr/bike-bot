export interface EnvConfig {
  port: number;
  hosting: {
    url: string;
  };
  db: {
    uri: string;
  };
  station: {
    scrap: [
      {
        url: string;
        method: 'GET' | 'POST';
      },
    ];
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
  station: {
    scrap: [
      {
        url: process.env.WEB_TARGET_URL ?? '',
        method: 'GET',
      },
    ],
  },
});
