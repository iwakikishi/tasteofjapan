import { useCallback, useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View, SafeAreaView, Pressable, Dimensions, Platform, FlatList } from 'react-native';
import { Image } from 'expo-image';
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import TitleComponent from '@/components/TitleComponent';
import { Link, useRouter } from 'expo-router';
import PreOrderHorizontalScrollView from '@/components/PreOrderHorizontalScrollView';
import CountDown from '@/components/CountDown';
import YoutubePlayer from 'react-native-youtube-iframe';
import ReadMore from '@fawazahmed/react-native-read-more';
import { Ionicons } from '@expo/vector-icons';
import { fetchVendors } from '@/functions/fetchVendors';
import { SimpleCarousel } from '@/components/SimpleCarousel';
import MapView, { Callout, Marker } from 'react-native-maps';
import MarkerIcon from '@/assets/images/marker.png';
import * as WebBrowser from 'expo-web-browser';
import { LinearGradient } from 'expo-linear-gradient';

const timeUntil = Math.floor((new Date('2024-12-14T16:00:00-08:00').getTime() - new Date().getTime()) / 1000);

const deviceWidth = Dimensions.get('window').width;

type Vendors = Vendor[];

type Vendor = {
  name: string;
  categories: string[];
  links: { instagram: string; website: string; facebook: string; tiktok: string; x: string; youtube: string };
  images: { uri: string }[];
};

const sumoImages = [
  { uri: 'https://cdn.shopify.com/s/files/1/0663/3209/8735/files/USA_SUMO.png?v=1727129890' },
  { uri: 'https://cdn.shopify.com/s/files/1/0663/3209/8735/files/mvs1024.jpg?v=1728278198' },
  { uri: 'https://cdn.shopify.com/s/files/1/0663/3209/8735/files/mv1480.jpg?v=1728278198' },
  { uri: 'https://cdn.shopify.com/s/files/1/0663/3209/8735/files/20240623_182334_da77a4af-6eb5-420c-88e5-0814bf737565.jpg?v=1728420756' },
  { uri: 'https://cdn.shopify.com/s/files/1/0663/3209/8735/files/StephanieYanez.jpg?v=1728420765' },
  { uri: 'https://cdn.shopify.com/s/files/1/0663/3209/8735/files/20220618_142126.jpg?v=1728420821' },
  { uri: 'https://cdn.shopify.com/s/files/1/0663/3209/8735/files/tunacutting.jpg?v=1728426330' },
];

export default function HomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [playing, setPlaying] = useState(false);
  const [foodVendors, setFoodVendors] = useState<Vendors>([]);
  const [retailVendors, setRetailVendors] = useState<Vendors>([]);

  const onStateChange = useCallback((state) => {
    if (state === 'ended') {
      setPlaying(false);
      Alert.alert('video has finished playing!');
    }
  }, []);

  const openMap = () => {
    const latitude = 33.4502;
    const longitude = -112.06594;
    const address = '113 N 6th St. Phoenix, AZ 85004';
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = latitude && longitude ? `${latitude},${longitude}` : null;

    const label = encodeURIComponent(address);
    const url = Platform.select({
      ios: `${scheme}${label}`,
      android: `${scheme}${latLng ? latLng : label}`,
    });

    Linking.openURL(url as string).catch((err) => console.error('Error opening map:', err));
  };

  const openWebsite = (url: string) => {
    WebBrowser.openBrowserAsync(url).catch((err) => console.error('Error opening website:', err));
  };

  useEffect(() => {
    const getVendors = async () => {
      const vendors = (await fetchVendors()) || [];
      if (vendors) {
        setFoodVendors(vendors.filter((vendor: Vendor) => vendor.categories.includes('Food')));
        setRetailVendors(vendors.filter((vendor: Vendor) => vendor.categories.includes('Retail')));
      }
    };
    getVendors();
  }, []);

  const VendorList = ({ vendors, title }: { vendors: Vendors; title: string }) => (
    <View className='flex'>
      <Text className='text-lg text-white font-NotoSandsItalic ml-4'>{title}</Text>
      <FlatList
        horizontal
        data={vendors}
        renderItem={({ item }) => (
          <View className='flex-col items-center gap-2 w-[136px] mt-4 pl-4'>
            <Image source={item.images[0].uri} style={{ width: 120, height: 120, borderRadius: 20 }} />
            <Text className='text-white text-center font-NotoSans text-lg text-wrap'>{item.name}</Text>
          </View>
        )}
      />
    </View>
  );

  return (
    <SafeAreaView className='flex-1' style={{ backgroundColor: colors.background }}>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#fff', dark: '#000' }}
        headerImage={<Image source={require('@/assets/images/toj_image_540.jpeg')} style={styles.reactLogo} contentFit='cover' />}>
        <View className='flex gap-8' style={{ backgroundColor: colors.background }}>
          <View className='flex w-full bg-white'>
            <View className='flex p-4 self-start gap-2'>
              <Text className='text-xl font-NotoSands' style={{ color: 'red' }}>
                Upcoming event
              </Text>

              <Text className='text-3xl font-NotoSandsItalic' style={{ color: 'red' }}>
                HERITAGE SQUARE IN DOWNTOWN PHOENIX, ARIZONA
              </Text>
              <TouchableOpacity className='flex-row items-center gap-1' onPress={openMap}>
                <Ionicons name='location-outline' size={18} color='red' />
                <Text className='text-xl font-NotoSands' style={{ color: 'red' }}>
                  113 N 6th St. Phoenix, AZ 85004
                </Text>
              </TouchableOpacity>
            </View>
            {/* Welcome section */}
            <View className='flex bg-red-600 px-4 py-8'>
              <View className='flex-row items-center'>
                <Text className='text-white text-4xl font-NotoSansBold'>Coming soon!</Text>
                <HelloWave />
              </View>
              <View className='flex mt-4 '>
                <View className='flex gap-4'>
                  <View className='flex-col'>
                    <Text className='text-white text-2xl font-NotoSansBold' style={{ fontWeight: 'bold' }}>
                      Dec. 14th (12pm - 9pm)
                    </Text>
                    <Text className='text-white text-2xl font-NotoSansBold' style={{ fontWeight: 'bold' }}>
                      Dec. 15th (12pm - 7pm)
                    </Text>
                  </View>
                  <View className='flex self-start'>
                    <CountDown
                      size={24}
                      until={timeUntil}
                      onFinish={() => alert('Finished')}
                      digitStyle={{ backgroundColor: 'transparent', borderWidth: 0.5, borderColor: 'white' }}
                      digitTxtStyle={{ color: 'yellow' }}
                      timeLabelStyle={{ color: 'white', fontWeight: 'bold' }}
                      separatorStyle={{ color: 'yellow', fontWeight: '300', paddingHorizontal: 4 }}
                      timeToShow={['D', 'H', 'M', 'S']}
                      timeLabels={{ d: 'Days', h: 'H', m: 'M', s: 'S' }}
                      showSeparator
                      style={{ marginTop: 12 }}
                    />
                  </View>
                  <ReadMore
                    numberOfLines={5}
                    style={{ color: 'white', fontSize: 18, fontFamily: 'NotoSans' }}
                    className='font-NotoSans'
                    seeMoreText='Read more'
                    seeLessText='See less'
                    seeMoreStyle={{ color: 'white', fontFamily: 'NotoSansBold' }}
                    seeLessStyle={{ color: 'white', fontFamily: 'NotoSansBold' }}>
                    Taste of Japan is thrilled to announce its return to Arizona for its second year! Following the success of our previous event in
                    Southern California, which attracted over 75,000 enthusiastic attendees, we are excited to bring this unique experience back to
                    Arizona once more! This year’s festivities will be bigger and better than ever, featuring an array of authentic Japanese foods,
                    pop culture experiences, live entertainment, merchandise, fun activities, and so much more! Whether you’re a family looking for a
                    fun day out, a food influencer eager to discover new culinary delights, or simply someone who loves Japanese culture, Taste of
                    Japan has something for everyone.
                  </ReadMore>

                  <View className='flex gap-3'>
                    <View
                      className='flex rounded-lg overflow-hidden mt-4'
                      style={{ width: '100%', height: ((Dimensions.get('window').width - 40) * 9) / 16 }}>
                      <YoutubePlayer
                        height={((Dimensions.get('window').width - 32) * 9) / 16}
                        play={playing}
                        videoId={'pC19Wi-5Wjw'}
                        onChangeState={onStateChange}
                      />
                    </View>
                    <View className='flex-row items-center justify-between'>
                      {[
                        'https://cdn.shopify.com/s/files/1/0663/3209/8735/files/20230617_173748.jpg?v=1724909473',
                        'https://cdn.shopify.com/s/files/1/0663/3209/8735/files/20220617_182853.jpg?v=1724909474',
                        'https://cdn.shopify.com/s/files/1/0663/3209/8735/files/20240623_182334.jpg?v=1724909476',
                        'instagram',
                      ].map((item, index) => (
                        <View key={index} className='justify-end' style={{ width: '23%', aspectRatio: 1 }}>
                          {item === 'instagram' ? (
                            <Link href='https://www.instagram.com/tasteofjpn/' asChild>
                              <TouchableOpacity className='flex bg-red-600 shadow-md shadow-yellow-500 py-2 rounded-lg'>
                                <Ionicons name='logo-instagram' size={50} color='white' style={{ alignSelf: 'center' }} />
                                <Text className='text-white text-center text-sm font-NotoSansBold'>Instagram</Text>
                              </TouchableOpacity>
                            </Link>
                          ) : (
                            <Image source={{ uri: item }} contentFit='cover' style={{ width: '100%', height: '100%', borderRadius: 5 }} />
                          )}
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              </View>

              <View className='flex mt-8 mb-2'>
                <Link href='/ticket' asChild>
                  <TouchableOpacity className='bg-white shadow-sm shadow-white rounded-md items-center justify-center py-3 px-8'>
                    <Text className='font-semibold text-black text-lg'>Buy EARLY BIRD ticket - $10</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          </View>

          {/* Reward section */}
          <View className='flex border bg-black shadow-md shadow-purple-900'>
            <View className='flex w-full relative'>
              <Image
                source={'https://cdn.shopify.com/s/files/1/0663/3209/8735/files/IMG_9792-4.jpg?v=1727136743'}
                contentFit='cover'
                style={{ width: '100%', height: 300, opacity: 0.5 }}
              />
              <View className='flex absolute top-6 left-4'>
                <Text className='text-white text-3xl font-NotoSansBold'>Rewards</Text>
                <Text className='text-white text-xl font-NotoSans'>Earn Points and Redeem Prizes</Text>
              </View>

              <TouchableOpacity
                className='absolute bottom-6 right-4 bg-white items-center justify-center rounded-lg px-4 py-2'
                onPress={() => openWebsite('https://www.tasteofjpn.com/pages/taste-of-japan-app')}>
                <Text className='text-slate-800 text-lg font-NotoSansBold'>Learn more about rewards</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Food-Pre-Order section */}
          <View className='flex bg-slate-900 pt-4 pb-4'>
            <View className='flex pl-4'>
              <View className='flex-row'>
                <Text className='text-white text-3xl font-NotoSandsItalic mb-2 animate-bounce'>🚀</Text>
                <Text className='text-white text-3xl font-NotoSandsItalic mb-2'> Skip the Line!</Text>
              </View>
              <Text className='text-white text-xl font-NotoSans'>Order in advance & earn extra points</Text>
            </View>
            <View className='flex mt-6'>
              <TitleComponent title='Food Pre-order' category='Food' />
              <PreOrderHorizontalScrollView category='Food' />
            </View>

            {/* Retail-Pre-Order section */}
            <View className='flex mt-4'>
              <TitleComponent title='Retail Pre-order' category='Retail' />
              <PreOrderHorizontalScrollView category='Retail' />
            </View>
          </View>

          {/* Yokocho section */}
          <LinearGradient
            colors={['#FFCC00', '#FFB700']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1, gap: 2, padding: 16, borderWidth: 1 }}>
            <View className='w-full shadow-md shadow-purple-500 bg-white'>
              <Image
                source={'https://cdn.shopify.com/s/files/1/0663/3209/8735/files/welcometoyokocho.jpg?v=1724822477'}
                contentFit='cover'
                style={{ width: '100%', height: 200 }}
              />
            </View>
            <View className='flex p-2'>
              <ReadMore
                numberOfLines={3}
                style={{ color: 'white', fontSize: 18, fontFamily: 'NotoSans' }}
                seeMoreText='Read more'
                seeLessText='See less'
                seeMoreStyle={{ color: 'white', fontFamily: 'NotoSansBold' }}
                seeLessStyle={{ color: 'white', fontFamily: 'NotoSansBold' }}>
                Yokocho means “alleyway” in Japanese. This special feature invites attendees to indulge in a full sake experience while learning about
                Japan’s local drinking culture. Walk-ins are welcome, but for those seeking an enhanced experience, our “Special Tasting tickets”
                offer Japanese Sake or Japanese Beer tasting and Tuna sashimi sampler!
              </ReadMore>
            </View>
            <View className='flex mt-4'>
              <Link href='/yokocho' asChild>
                <TouchableOpacity className='w-full h-12 rounded-md bg-white justify-center items-center'>
                  <Text className='text-slate-700 text-lg font-bold'>Learn more</Text>
                </TouchableOpacity>
              </Link>
              {/* <Link href='/yokocho' asChild>
                <TouchableOpacity className='w-1/2 h-12 justify-center items-center'>
                  <Text className='text-slate-700  text-lg font-semibold'>Learn more</Text>
                </TouchableOpacity>
              </Link> */}
            </View>
          </LinearGradient>

          {/* Goodie section */}
          <View className='flex'>
            <View className='flex w-full'>
              <Image
                source={'https://cdn.shopify.com/s/files/1/0663/3209/8735/files/TOJ_DTPHX_GoodieBag.jpg?v=1727209274'}
                contentFit='contain'
                style={{ width: deviceWidth, height: deviceWidth }}
              />
            </View>
            <View className='flex p-4 bg-orange-200'>
              <TouchableOpacity
                className='w-full h-12 rounded-md bg-white justify-center items-center'
                onPress={() =>
                  router.push({
                    pathname: '/product-detail',
                    params: {
                      productId: 'gid://shopify/Product/8060162146479',
                    },
                  })
                }>
                <Text className='text-slate-700 text-lg font-bold'>Get your goodie bag</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Vendors section */}
          <View className='flex bg-gray-900 pt-4 pb-6'>
            <TitleComponent title='Meet the Vendors' category='Rewards' />
            <View className='flex mt-6'>
              <VendorList vendors={foodVendors} title='🍣 OISHII YOKOCHO' />
            </View>
            <View className='flex mt-6'>
              <VendorList vendors={retailVendors} title='👘 RETAIL/MERCHANDISE' />
            </View>
            <View className='flex px-4'>
              <Link href='/(tabs)/(tab2)' asChild>
                <TouchableOpacity className='w-full h-12 rounded-md bg-white justify-center items-center'>
                  <Text className='text-slate-700 text-lg font-bold'>Learn more</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>

          {/* Sumo section */}
          <LinearGradient
            style={{ flex: 1, gap: 2, paddingVertical: 16 }}
            colors={['#000000', '#434343']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 1 }}>
            <View className='flex gap-1 px-4 mb-2'>
              <Text className='text-3xl text-white font-NotoSansBold'>Stage</Text>
              <Text className='text-white text-lg font-NotoSans'>USA SUMO coming to Taste of Japan!</Text>
            </View>
            <SimpleCarousel images={sumoImages} height={deviceWidth * 0.75} autoPlay={true} />
            <View className='flex mt-4 px-4'>
              <TouchableOpacity
                className='w-full h-12 rounded-md bg-white justify-center items-center'
                onPress={() => openWebsite('https://www.tasteofjpn.com/pages/stage')}>
                <Text className='text-slate-700 text-lg font-bold'>Learn more</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Map section */}
          <View className='flex p-4 gap-4'>
            <View className='flex-row items-center gap-2'>
              <Ionicons name='location-outline' size={24} color='white' />
              <Text className='text-3xl text-white font-NotoSansBold'>Location</Text>
            </View>
            <View className='flex'>
              <Text className='text-white text-md font-NotoSans'>HERITAGE SQUARE IN DOWNTOWN PHOENIX, ARIZONA</Text>
            </View>

            <Text className='text-white text-lg font-NotoSansBold'>113 N 6th St. Phoenix, AZ 85004</Text>

            <MapView
              style={{ width: deviceWidth, height: deviceWidth }}
              initialRegion={{
                latitude: 33.4502,
                longitude: -112.06594,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}>
              <Marker
                coordinate={{
                  latitude: 33.4502,
                  longitude: -112.06594,
                }}
                image={MarkerIcon}>
                <Callout onPress={() => openMap()} tooltip>
                  <View className='flex bg-white p-2 rounded-md'>
                    <Text className='text-lg font-NotoSansBold'>Taste of Japan, Arizona</Text>
                    <Text className='text-sm font-NotoSans'>HERITAGE SQUARE IN DOWNTOWN PHOENIX, ARIZONA</Text>
                  </View>
                </Callout>
              </Marker>
            </MapView>
            <View className='flex-row'>
              <TouchableOpacity className='self-start h-12 rounded-md bg-white justify-center items-center px-4 py-2 mr-4' onPress={() => openMap()}>
                <Text className='text-slate-700 text-lg font-NotoSansBold'>🚗 Directions</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className='self-start h-12 rounded-md bg-white justify-center items-center px-4 py-2'
                onPress={() => openWebsite('https://www.tasteofjpn.com/pages/arizona-location')}>
                <Text className='text-slate-700 text-lg font-NotoSansBold'>🅿️ Parking Info</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View className='h-12' />
        </View>
      </ParallaxScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  stepContainer: {
    gap: 4,
    marginBottom: 8,
  },
  reactLogo: {
    height: '100%',
    width: '100%',
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
