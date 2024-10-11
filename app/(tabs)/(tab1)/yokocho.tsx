import React from 'react';
import { Text, View, ScrollView, SafeAreaView, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import { GET_COLLECTION_BY_ID } from '@/graphql/queries';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@apollo/client';
import * as WebBrowser from 'expo-web-browser';

const sakeSponsors = [
  {
    name: 'Asahi',
    image: 'https://cdn.shopify.com/s/files/1/0663/3209/8735/files/AsahiBeer.jpg?v=1724823260',
    description:
      'Asahi Super Dry’s master brewers dared to be different, taking inspiration from the dry taste of sake, they redefined beer forever. In Tokyo, on 17th March 1987, they created the world’s first Super Dry lager, a taste like no other.',
    link: 'https://www.asahisuperdry.com/age-gate/',
  },
  {
    name: 'Hakutsuru',
    image: 'https://cdn.shopify.com/s/files/1/0663/3209/8735/files/hakutsuru.jpg?v=1724823272',
    description:
      'Our sakes are each individual characters with distinctly different tastes, appearances and traditional ways of being enjoyed. Sake is ideal with food and for each of ours we suggest a few dishes that convey suitable complementary flavors. We welcome you to discover a moment for our sake in your life.',
    link: 'https://www.hakutsuru-sake.com/global/us/',
  },
  {
    name: 'Choya',
    image: 'https://cdn.shopify.com/s/files/1/0663/3209/8735/files/Choya.png?v=1724823357',
    description:
      'The most important aspect upon making The CHOYA is the high-quality ume fruit. For more than half a century, CHOYA has worked with local ume farmers researching and developing different solutions such as reducing pesticides, growing of organic fruit, as well as creating optimal soil. As a result, we are able to use ume fruit that is highly selected and particularly suitable for Umeshu production.',
    link: 'https://www.choya.co.jp/en/',
  },
];

const deviceWidth = Dimensions.get('window').width;
const itemWidth = deviceWidth / 2;

export default function YokochoPage() {
  const router = useRouter();
  const { loading, error, data } = useQuery(GET_COLLECTION_BY_ID, {
    variables: { id: 'gid://shopify/Collection/331752865967' },
  });

  if (loading) return <Text className='text-white'>Loading...</Text>;
  if (error) return <Text className='text-white'>Error: {error.message}</Text>;

  const collection = data?.collection;

  const _handlePressSponsorLink = async (link: string) => {
    let result = await WebBrowser.openBrowserAsync(link);
  };

  return (
    <SafeAreaView className='flex-1'>
      <ScrollView className='flex' style={{ backgroundColor: '#fff1ec' }}>
        <View className='flex flex-col gap-6'>
          <View className='flex shadow-sm shadow-purple-800'>
            <Image
              source={'https://cdn.shopify.com/s/files/1/0663/3209/8735/files/welcometoyokocho.jpg?v=1724822477'}
              contentFit='cover'
              style={{ width: '100%', height: 240 }}
            />
            <Image
              source={'https://cdn.shopify.com/s/files/1/0663/3209/8735/files/30C1C4B1CF866B0C5600D2FDC4620946E270E2C7.jpg?v=1725318622'}
              contentFit='cover'
              style={{ width: '100%', height: 150 }}
            />
          </View>
          <View className='flex flex-col gap-4 p-4'>
            <Text className='text-slate-700 text-3xl font-NotoSansBold mb-2'>Experience Yokocho</Text>
            <Text className='text-slate-700 text-xl font-NotoSans'>
              Drink and Dine like you’re in Japan! Let us take you on a full beer & sake experience, an authentic glimpse into Japan’s local drinking
              culture of Japanese Beer, Sake, & Shochu. “Yokocho” is Japanese for “alleyway”, a place where you can both eat and drink to your heart’s
              content!
            </Text>
          </View>
          {/* Ticket section */}
          <View className='flex flex-col gap-4'>
            <View className='flex mt-6'>
              <View className='flex flex-row items-center gap-2 px-4'>
                <Ionicons name='ticket-outline' size={24} color='navy' />
                <Text className='text-slate-700 text-2xl font-NotoSansBold'>Sampler Ticket</Text>
              </View>
              <FlatList
                horizontal
                className='flex w-full mt-6'
                data={collection.products.edges}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => router.push({ pathname: '/product-detail', params: { productId: item.node.id } })}
                    style={{ width: itemWidth }}
                    className='bg-red-600 rounded-md justify-between items-center p-4 ml-4'>
                    <Image source={item.node.images.edges[0].node.url} contentFit='contain' style={{ width: itemWidth - 24, aspectRatio: 1 }} />
                    <View className='flex flex-col  mt-3'>
                      <Text className='text-white text-lg font-bold'>{item.node.title}</Text>
                      <Text className='text-white text-lg font-bold mt-2'>
                        {item.node.priceRange.minVariantPrice.amount}
                        {item.node.priceRange.minVariantPrice.currencyCode}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
                contentContainerStyle={{ paddingHorizontal: 0 }}
                ItemSeparatorComponent={null}
                showsHorizontalScrollIndicator={false}
              />
            </View>
            <View className='flex flex-row justify-between items-center'></View>
          </View>

          <View className='flex flex-col mt-6'>
            <Text className='text-slate-700 text-2xl font-NotoSansBold pl-4'>Sponsors</Text>
            <FlatList
              horizontal
              className='flex w-full mt-6'
              data={sakeSponsors}
              renderItem={({ item }) => (
                <View style={{ width: deviceWidth / 1.5 }} className='flex flex-col gap-3 ml-4 mr-2'>
                  <Image source={item.image} contentFit='cover' style={{ width: deviceWidth / 1.5, aspectRatio: 1, borderRadius: 10 }} />
                  <Text className='text-slate-700 text-2xl font-NotoSansBold'>{item.name}</Text>
                  <Text className='text-slate-700 text-lg font-NotoSans'>{item.description}</Text>
                  <TouchableOpacity onPress={() => _handlePressSponsorLink(item.link)} style={{ alignSelf: 'flex-start' }}>
                    <Text className='text-black text-lg font-NotoSansBold'>Learn more →</Text>
                  </TouchableOpacity>
                </View>
              )}
              contentContainerStyle={{ paddingHorizontal: 0 }}
              ItemSeparatorComponent={null}
              showsHorizontalScrollIndicator={false}
            />
          </View>
        </View>
        <View className='h-20' />
      </ScrollView>
    </SafeAreaView>
  );
}
