const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: './global.css' });

// const { getDefaultConfig } = require('expo/metro-config');
// const { withNativeWind } = require('nativewind/metro');

// module.exports = (async () => {
//   const config = await getDefaultConfig(__dirname);
//   const {
//     resolver: { sourceExts, assetExts },
//     transformer,
//   } = config;

//   return withNativeWind(
//     {
//       ...config,
//       transformer: {
//         ...transformer,
//         babelTransformerPath: require.resolve('react-native-svg-transformer'),
//       },
//       resolver: {
//         assetExts: assetExts.filter((ext) => ext !== 'svg'),
//         sourceExts: [...sourceExts, 'svg'],
//       },
//     },
//     { input: './global.css' }
//   );
// })();
