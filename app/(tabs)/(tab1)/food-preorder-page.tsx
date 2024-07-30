import { Dimensions, FlatList, View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase-client';
import { Database } from '@/types/supabase';
import ReadMore from '@fawazahmed/react-native-read-more';

const deviceWidth = Dimensions.get('window').width;

type Vendor = Database['public']['Tables']['vendors']['Row'];

export default function FoodPreOrderVendorList() {
  const router = useRouter();
  const [vendorData, setVendorData] = useState<Vendor[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);

  useEffect(() => {
    const fetchVendors = async () => {
      let { data: vendors, error } = await supabase.from('vendors').select('*');
      if (vendors) {
        setVendorData(vendors);
        setFilteredVendors(vendors);
      }
      if (error) {
        console.log(error);
      }
    };
    fetchVendors();
  }, []);

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

  const onPressVendor = (vendor: Vendor) => {
    router.navigate({
      pathname: 'food-vendor-page',
      params: { vendor: JSON.stringify(vendor) }, // vendor を JSON 文字列として渡す
    });
  };

  const blurhash =
    '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

  return (
    <View className='flex flex-col px-2'>
      <FlatList
        className='flex'
        data={filteredVendors}
        stickyHeaderIndices={[0]}
        renderItem={({ item }) => {
          return (
            <TouchableOpacity className='flex py-5' onPress={() => onPressVendor(item)}>
              <View className='flex flex-col'>
                <Image
                  source={{ uri: item.images?.[0]?.uri || '' }}
                  style={{ width: deviceWidth, height: 300 }}
                  resizeMode='cover'
                  className='rounded-lg'
                />
                <Image
                  source={{ uri: item.logo || '' }}
                  style={{ width: 60, height: 60 }}
                  resizeMode='contain'
                  className='absolute bottom-1 left-2 rounded-full'
                />
              </View>

              <View className='px-2 gap-y-2 pt-2'>
                <Text className='text-white text-2xl font-bold'>{item.name}</Text>
                <Text className='text-white text-md font-semibold'>{item.categories.join(', ')}</Text>
                <ReadMore numberOfLines={2} style={{ color: 'white' }} className='text-white text-md font-semibold'>
                  {item.descriptions}
                </ReadMore>
              </View>
            </TouchableOpacity>
          );
        }}
        ListHeaderComponent={ListHeaderComponent}
      />
    </View>
  );
}
