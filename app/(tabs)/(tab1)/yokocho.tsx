import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View, ScrollView, Pressable, SafeAreaView } from 'react-native';
import { Image } from 'expo-image';
import { getCollection } from '@/app/api/get-collection';
import { gql, useQuery } from '@apollo/client';
import ReadMore from '@fawazahmed/react-native-read-more';
import Ionicons from '@expo/vector-icons/Ionicons';
import SegmentedControl from '@react-native-segmented-control/segmented-control';

const GET_COLLECTIONS = gql`
  query GetCollections {
    collections(first: 10) {
      edges {
        node {
          id
          title
          handle
          image {
            url
            altText
          }
          products(first: 10) {
            edges {
              node {
                id
                title
                description
                images(first: 1) {
                  edges {
                    node {
                      url
                      altText
                    }
                  }
                }
                priceRange {
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export default function YokochoPage() {
  const [selectedDate, setSelectedDate] = useState(0);
  const [tickets, setTickets] = useState([]);

  const { loading, error, data } = useQuery(GET_COLLECTIONS);

  if (loading) return <Text className='text-white'>読み込み中...</Text>;
  if (error) return <Text className='text-white'>エラー: {error.message}</Text>;

  const collections = data?.collections?.edges?.map((edge) => edge.node) || [];
  console.log(collections);

  return (
    <SafeAreaView className='flex-1 bg-black'>
      <ScrollView className='flex'>
        <View className='flex flex-col gap-6'>
          <View className='flex bg-yellow-400 p-4'>
            <Image
              source={'https://cdn.shopify.com/s/files/1/0663/3209/8735/files/30C1C4B1CF866B0C5600D2FDC4620946E270E2C7.jpg?v=1725318622'}
              contentFit='contain'
              style={{ width: '100%', height: 200 }}
            />
          </View>
          <View className='flex flex-col px-4 gap-4'>
            <Text className='text-white text-2xl font-bold'>Experience Yokocho</Text>
            <Text className='text-white text-xl'>
              Drink and Dine like you’re in Japan! Let us take you on a full beer & sake experience, an authentic glimpse into Japan’s local drinking
              culture of Japanese Beer, Sake, & Shochu. “Yokocho” is Japanese for “alleyway”, a place where you can both eat and drink to your heart’s
              content!
            </Text>
          </View>
          {/* Ticket section */}
          <View className='flex flex-col px-4 gap-4'>
            <View className='flex flex-row justify-between items-center'>
              <Text className='text-white text-2xl font-bold'>Ticket</Text>
            </View>
            <View className='flex flex-row justify-between items-center'></View>
          </View>
          <View className='flex px-4 gap-4'>
            <ReadMore numberOfLines={3} style={{ color: 'white' }}></ReadMore>
          </View>
          <View className='flex flex-col px-4'>
            <Text className='text-white text-2xl font-bold'>Pickup Date</Text>
            <View className='flex-row w-full my-6 gap-4'>
              <SegmentedControl
                values={['12/14', '12/15']}
                selectedIndex={selectedDate}
                onChange={(event) => {
                  setSelectedDate(event.nativeEvent.selectedSegmentIndex);
                }}
                tintColor='red'
                style={{ width: 200, height: 40 }}
                fontStyle={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}
                activeFontStyle={{ fontSize: 18, fontWeight: '800', color: 'white' }}
              />
            </View>
            <Text className='text-white text-2xl font-bold'>Pickup Time</Text>
          </View>
          <View className='flex flex-col px-4'>
            <Text className='text-white text-2xl font-bold'>Menus</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
