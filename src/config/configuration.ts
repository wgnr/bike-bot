export interface EnvConfig {
  port: number;
  hosting: {
    url: string;
  };
  db: {
    uri: string;
  };
  dataURL: string;
  cron: {
    stop: boolean;
  };
  bot: {
    token: string;
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
  dataURL: process.env.WEB_TARGET_URL ?? '',
  cron: {
    stop: String(process.env.DISABLE_CRONS).toLowerCase() === 'true',
  },
  bot: {
    token: process.env.TELEGRAM_BOT_KEY ?? '',
  },
});
