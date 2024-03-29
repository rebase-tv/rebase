export default {
  expo: {
    name: "rebase-mobile",
    slug: "rebase",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.rebasetv.rebase",
    },
    android: {
      package: "tv.rebase.app",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      package: "com.rebasetv.rebase",
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    extra: {
      apiUrl: process.env.SST_Api_url_api,
      eas: {
        projectId: "f7d88c1d-59a0-45ad-a376-58fffc034be6",
      },
    },
    owner: "adamelmore",
  },
}
