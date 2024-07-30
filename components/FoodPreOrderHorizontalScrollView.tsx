import { Image, Text, ScrollView, TouchableOpacity, Dimensions, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import ReadMore from '@fawazahmed/react-native-read-more';
import { supabase } from '@/lib/supabase-client';
import { Database } from '@/types/supabase';

// const vendors = [
//   {
//     id: 1,
//     name: 'Daikokuya',
//     logo: require('@/assets/images/vendors/daikokuya/logo.png'),
//     image: require('@/assets/images/vendors/daikokuya/daikokuyaramen.jpg'),
//     category: 'Ramen',
//     description: 'Daikokuya is a ramen restaurant that specializes in ramen.',
//   },
//   {
//     id: 2,
//     name: 'Kashiwa Ramen',
//     logo: require('@/assets/images/vendors/kashiwaramen/logo.png'),
//     image: require('@/assets/images/vendors/kashiwaramen/kashiwaramen.jpeg'),
//     category: 'Ramen',
//     description: 'Kashiwa Ramen is a ramen restaurant that specializes in ramen.',
//   },
//   {
//     id: 3,
//     name: 'Tanota',
//     logo: require('@/assets/images/vendors/tanota/logo.jpeg'),
//     image: require('@/assets/images/vendors/tanota/takoyaki.jpeg'),
//     category: 'Ramen',
//     description: 'Kashiwa Ramen is a ramen restaurant that specializes in ramen.',
//   },
// ];

const deviceWidth = Dimensions.get('window').width;

type Vendor = Database['public']['Tables']['vendors']['Row'];

export default function FoodPreOrderHorizontalScrollView() {
  const router = useRouter();
  const [data, setData] = useState<Database['public']['Tables']['vendors']['Row'][]>([]);

  useEffect(() => {
    const fetchVendors = async () => {
      let { data: vendors, error } = await supabase.from('vendors').select('*');
      if (error) {
        console.error(error);
      }
      setData(vendors as Database['public']['Tables']['vendors']['Row'][]);
    };
    fetchVendors();
  }, []);

  const onPressVendor = (vendor: Vendor) => {
    router.navigate({
      pathname: 'food-vendor-page',
      params: { vendor: JSON.stringify(vendor) }, // vendor を JSON 文字列として渡す
    });
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className='flex'>
      {data?.map((vendor) => (
        <TouchableOpacity key={vendor.id} className='w-[75vw] h-auto rounded-xl overflow-hidden mr-5' onPress={() => onPressVendor(vendor)}>
          {vendor.images && vendor.images[0] && (
            <View className='flex w-full'>
              <Image source={{ uri: vendor.images[0].uri }} resizeMode='cover' className='w-full h-[200px] rounded-xl overflow-hidden' />
            </View>
          )}
          <View className='flex mt-4'>
            <Text className='text-white text-lg font-semibold'>{vendor.name}</Text>
            <Text className='text-white text-sm'>{vendor.categories.join(', ')}</Text>
            <ReadMore numberOfLines={1} style={{ color: 'white' }} className='text-white text-sm text-wrap'>
              {vendor.descriptions}
            </ReadMore>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
