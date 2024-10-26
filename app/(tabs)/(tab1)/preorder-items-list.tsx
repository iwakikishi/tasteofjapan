import { Dimensions, FlatList, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, SafeAreaView, TouchableHighlight } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { supabase } from '@/lib/supabase-client';
import { Image } from 'expo-image';
import { Database } from '@/types/supabase';
import ReadMore from '@fawazahmed/react-native-read-more';
import { GET_COLLECTIONS } from '@/graphql/queries';
import { useQuery } from '@apollo/client';
import { SafeAreaFrameContext } from 'react-native-safe-area-context';
import PagerView from 'react-native-pager-view';

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

type Vendor = Database['public']['Tables']['vendors']['Row'];

export default function PreOrderItemsListScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [foodItems, setFoodItems] = useState<any[]>([]);
  const [retailItems, setRetailItems] = useState<any[]>([]);
  const [vendorData, setVendorData] = useState<Vendor[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [selectedTab, setSelectedTab] = useState(0);

  const pagerRef = useRef<PagerView>(null);

  const { loading, error, data } = useQuery(GET_COLLECTIONS, {
    variables: {
      collectionIds: ['gid://shopify/Collection/331376853167', 'gid://shopify/Collection/331631657135'],
    },
    onError: (error) => {
      console.error('GraphQL Error:', error);
    },
  });

  useEffect(() => {
    if (data) {
      setFoodItems(
        data.collections
          .filter((collection: any) => collection.handle === 'food-pre-order')
          .flatMap((item: any) => item.products.edges.map((edge: any) => edge.node))
      );
      setRetailItems(
        data.collections
          .filter((collection: any) => collection.handle === 'goodie-bags')
          .flatMap((item: any) => item.products.edges.map((edge: any) => edge.node))
      );
    }
  }, [data]);

  if (error) {
    console.error('GraphQL Error:', error);
  }

  if (loading) {
    return (
      <View className='flex-1 bg-black justify-center items-center'>
        <ActivityIndicator size='large' color='white' />
      </View>
    );
  }

  const ListHeaderComponent = () => {
    const categories = ['All', 'Ramen', 'Takoyaki', 'Crepes', 'Dessert'];
    const onCategoryPress = (category: string) => {
      if (category === 'All') {
        setFilteredVendors(vendorData);
      } else {
        setFilteredVendors(vendorData.filter((vendor) => vendor.categories.includes(category)));
      }
      setSelectedCategory(category);
    };

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className='flex py-3 pl-3 bg-black'>
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            onPress={() => onCategoryPress(category)}
            className={`${selectedCategory === category ? 'bg-slate-500' : 'bg-slate-700'} rounded-full p-2 px-4 mr-2`}>
            <Text className='text-white text-md font-bold'>{category}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const onPressTab = (index: number) => {
    setSelectedTab(index);
    pagerRef?.current?.setPage(index);
  };

  const TopButtons = () => {
    return (
      <View className='flex-row w-full h-[60px] items-center px-6'>
        <TouchableHighlight
          className={`mr-4 p-1  border-b-4 ${selectedTab === 0 ? 'border-red-600' : 'border-transparent'}`}
          onPress={() => onPressTab(0)}>
          <Text className={`text-white text-lg ${selectedTab === 0 ? 'font-NotoSansBold' : 'font-NotoSans'}`}>Food</Text>
        </TouchableHighlight>
        <TouchableHighlight className={`p-1 border-b-4 ${selectedTab === 1 ? 'border-red-600' : 'border-transparent'}`} onPress={() => onPressTab(1)}>
          <Text className={`text-white text-lg ${selectedTab === 1 ? 'font-NotoSansBold' : 'font-NotoSans'}`}>Retail</Text>
        </TouchableHighlight>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View className='flex-1' style={{ backgroundColor: colors.background }}>
        <TopButtons />
        <PagerView
          ref={pagerRef}
          style={{ width: '100%', height: deviceHeight - 235 }}
          initialPage={0}
          onPageSelected={(event) => setSelectedTab(event.nativeEvent.position)}>
          <View style={{ width: deviceWidth, height: '100%' }} key='1'>
            <FlatList
              className='flex'
              data={foodItems}
              renderItem={({ item }) => (
                <View className='flex p-2'>
                  <TouchableOpacity
                    className='flex-row gap-3 py-4 px-6 bg-slate-800 rounded-3xl'
                    onPress={() => router.navigate({ pathname: '/product-detail', params: { productId: item.id } })}>
                    <View className='w-[80px] h-[80px] rounded-xl overflow-hidden'>
                      <Image source={item.images?.edges[0].node.url} style={{ width: 80, height: 80 }} contentFit='cover' />
                    </View>
                    <View className='flex-1 px-2 gap-2 justify-center'>
                      <Text className='text-white text-xl font-NotoSansBold' numberOfLines={2}>
                        {item.title}
                      </Text>
                      <Text className='text-white text-lg font-NotoSans'>$ {parseFloat(item.priceRange.minVariantPrice.amount).toFixed(2)}</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
          <View style={{ width: deviceWidth, height: '100%' }} key='2'>
            <FlatList
              className='flex'
              data={retailItems}
              renderItem={({ item }) => (
                <View className='flex p-2'>
                  <TouchableOpacity
                    className='flex-row gap-3 p-3 bg-slate-900 rounded-xl'
                    onPress={() => router.navigate({ pathname: '/product-detail', params: { productId: item.id } })}>
                    <View className='w-[80px] h-[80px] rounded-lg overflow-hidden mt-2'>
                      <Image source={item.images?.edges[0].node.url} style={{ width: 80, height: 80 }} contentFit='cover' />
                    </View>
                    <View className='flex-1 px-2 gap-2'>
                      <Text className='text-white text-xl font-NotoSansBold' numberOfLines={2}>
                        {item.title}
                      </Text>
                      {/* <Text numberOfLines={2} className='text-white text-sm font-NotoSans'>
                      {item.description}
                    </Text> */}
                      <Text className='text-white text-xl font-NotoSansBold'>
                        {parseFloat(item.priceRange.minVariantPrice.amount).toFixed(2)} USD
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        </PagerView>
      </View>
    </SafeAreaView>
  );
}
