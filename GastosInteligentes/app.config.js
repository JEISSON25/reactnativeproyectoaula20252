import 'dotenv/config';

export default {
  expo: {
    name: "projectGastosPersonales",
    slug: "gastospersonales",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
    },
    android: {
      "package": "com.gastospersonales.io",
      "googleServicesFile": "./google-services.json",
      "versionCode": 1,
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    extra: {
      eas: {
        projectId: "37dd0b69-5173-42ce-92cc-d6dc7b3fb369"
      }
    },
  },
};
