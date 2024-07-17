require('dotenv').config();

const avatarAppConfig = {
  cogSvcRegion: process.env.COG_SVC_REGION,
  cogSvcSubKey: process.env.COG_SVC_SUB_KEY,
  voiceName: process.env.VOICE_NAME,
  avatarCharacter: process.env.AVATAR_CHARACTER,
  avatarStyle: process.env.AVATAR_STYLE,
  avatarBackgroundColor: process.env.AVATAR_BACKGROUND_COLOR,
  iceUrl: process.env.ICE_URL,
  iceUsername: process.env.ICE_USERNAME,
  iceCredential: process.env.ICE_CREDENTIAL
};

console.log(avatarAppConfig);
