import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "Pedator Admin",
  version: packageJson.version,
  copyright: `© ${currentYear}, Studio Admin.`,
  meta: {
    title: "Pedetor Admin - Modern Next.js Dashboard Starter Template",
    description: "Pedetor Admin",
  },
};
