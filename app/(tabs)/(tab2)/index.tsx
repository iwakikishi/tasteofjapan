import { useState, useRef, useEffect } from 'react';
import { SafeAreaView, Text, ScrollView, View, FlatList, Linking, TouchableOpacity, Dimensions, TouchableHighlight } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { supabase } from '@/lib/supabase-client';
import { VendorCarousel } from '@/components/VendorCarousel';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import Accordion from 'react-native-collapsible/Accordion';
import { Image } from 'expo-image';
import PagerView from 'react-native-pager-view';
import { Ionicons } from '@expo/vector-icons';
import { fetchVendors } from '@/functions/fetchVendors';

const deviceHeight = Dimensions.get('window').height;

const carouselImages = [
  {
    path: require('@/assets/images/stage/stage_1.jpg'),
    order: 1,
  },
  {
    path: require('@/assets/images/stage/stage_2.jpg'),
    order: 2,
  },
  {
    path: require('@/assets/images/stage/stage_3.jpg'),
    order: 3,
  },
];

const SAT_SECTIONS = [
  {
    time: '10:00 AM',
    title: 'Terminal Islanders',
    content: 'Lorem ipsum...',
    image: require('@/assets/images/stage/stage_1.jpg'),
  },
  {
    time: '10:30 AM',
    title: 'Shotokyo Kendo Dojo',
    content: 'Lorem ipsum...',
    image: require('@/assets/images/stage/stage_2.jpg'),
  },
  {
    time: '11:00 AM',
    title: 'Shotokyo Kendo Dojo',
    content: 'Lorem ipsum...',
    image: require('@/assets/images/stage/stage_2.jpg'),
  },
  {
    time: '11:30 AM',
    title: 'Shotokyo Kendo Dojo',
    content: 'Lorem ipsum...',
    image: require('@/assets/images/stage/stage_2.jpg'),
  },
  {
    time: '12:00 PM',
    title: 'Shotokyo Kendo Dojo',
    content: 'Lorem ipsum...',
    image: require('@/assets/images/stage/stage_2.jpg'),
  },
];

const SUN_SECTIONS = [
  {
    time: '3:00 PM',
    title: 'Terminal Islanders',
    content: 'Lorem ipsum...',
    image: require('@/assets/images/stage/stage_1.jpg'),
  },
  {
    time: '3:30 PM',
    title: 'Shotokyo Kendo Dojo',
    content: 'Lorem ipsum...',
    image: require('@/assets/images/stage/stage_2.jpg'),
  },
  {
    time: '4:00 PM',
    title: 'Shotokyo Kendo Dojo',
    content: 'Lorem ipsum...',
    image: require('@/assets/images/stage/stage_2.jpg'),
  },
  {
    time: '4:30 PM',
    title: 'Shotokyo Kendo Dojo',
    content: 'Lorem ipsum...',
    image: require('@/assets/images/stage/stage_2.jpg'),
  },
  {
    time: '5:00 PM',
    title: 'Shotokyo Kendo Dojo',
    content: 'Lorem ipsum...',
    image: require('@/assets/images/stage/stage_2.jpg'),
  },
];

type Vendor = {
  name: string;
  categories: string[];
  links: { instagram: string; website: string; facebook: string; tiktok: string; x: string; youtube: string };
  images: { uri: string }[];
};

export default function SearchScreen() {
  const { colors } = useTheme();
  const [selectedDate, setSelectedDate] = useState('12/14');
  const [activeSections, setActiveSections] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [foodVendors, setFoodVendors] = useState<Vendor[]>([]);
  const [retailVendors, setRetailVendors] = useState<Vendor[]>([]);

  const pagerRef = useRef<PagerView>(null);

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

  const _renderHeader = (section: any) => {
    return (
      <View className='flex mt-5 p-4 border-b border-b-slate-800 rounded-lg'>
        <View className='flex-row justify-between items-center'>
          <View className='flex pr-5'>
            <Text className='text-xl font-bold text-red-300'>{section.time}</Text>
            <View className='items-center'>
              <Text className='text-white font-bold text-lg'>{section.title}</Text>
            </View>
          </View>
          <View className='items-center'>
            <Image source={section.image} style={{ width: 40, height: 40, borderRadius: 20 }} />
          </View>
        </View>
      </View>
    );
  };

  const _renderContent = (section: any) => {
    return (
      <View className='flex'>
        <Text className='text-white'>{section.content}</Text>
      </View>
    );
  };

  const _updateSections = (activeSections: any) => {
    setActiveSections(activeSections);
  };

  const onChangeTab = (index: number) => {
    setSelectedTab(index);
    pagerRef?.current?.setPage(index);
  };

  // const TopButtons = () => {
  //   return (
  //     <View className='flex w-full h-[60px] justify-center items-center'>
  //       <SegmentedControl
  //         values={['Stage', 'Food', 'Retail']}
  //         selectedIndex={selectedTab}
  //         onChange={(event) => {
  //           const index = event.nativeEvent.selectedSegmentIndex;
  //           onChangeTab(index);
  //         }}
  //         tintColor={'red'}
  //         fontStyle={{ color: 'white', fontSize: 16, fontFamily: 'NotoSansBold' }}
  //         activeFontStyle={{ color: 'white', fontSize: 16, fontFamily: 'NotoSansBold' }}
  //         backgroundColor={'transparent'}
  //         style={{ width: '80%', height: 30 }}
  //         tabStyle={{ borderRadius: 100 }}
  //       />
  //     </View>
  //   );
  // };

  const onPressTab = (index: number) => {
    setSelectedTab(index);
    pagerRef?.current?.setPage(index);
  };

  const TopButtons = () => {
    return (
      <View className='flex-row w-full h-[60px] justify-center items-center'>
        <TouchableHighlight className={`rounded-full px-6 py-1 ${selectedTab === 0 ? 'bg-red-600' : 'bg-gray-800'}`} onPress={() => onPressTab(0)}>
          <Text className={`text-white text-lg ${selectedTab === 0 ? 'font-NotoSansBold' : 'font-NotoSans'}`}>Stage</Text>
        </TouchableHighlight>
        <TouchableHighlight
          className={`mx-3 rounded-full px-6 py-1 ${selectedTab === 1 ? 'bg-red-600' : 'bg-gray-800'}`}
          onPress={() => onPressTab(1)}>
          <Text className={`text-white text-lg ${selectedTab === 1 ? 'font-NotoSansBold' : 'font-NotoSans'}`}>Food</Text>
        </TouchableHighlight>
        <TouchableHighlight className={`rounded-full px-6 py-1 ${selectedTab === 2 ? 'bg-red-600' : 'bg-gray-800'}`} onPress={() => onPressTab(2)}>
          <Text className={`text-white text-lg ${selectedTab === 2 ? 'font-NotoSansBold' : 'font-NotoSans'}`}>Retail</Text>
        </TouchableHighlight>
      </View>
    );
  };

  return (
    <SafeAreaView className='flex-1' style={{ backgroundColor: colors.background }}>
      <TopButtons />
      <PagerView
        ref={pagerRef}
        style={{ width: '100%', height: deviceHeight - 235 }}
        initialPage={0}
        onPageSelected={(event) => setSelectedTab(event.nativeEvent.position)}>
        {/* <View className='w-full h-full items-center justify-center' key='1'>
          <Text className='text-white font-NotoSansBold text-2xl'>Coming soon</Text>
        </View> */}
        <View className='w-full h-full items-center justify-center' key='1'>
          <Text className='text-white font-NotoSansBold text-2xl'>Coming soon</Text>

          {/* <ScrollView className='flex' style={{ backgroundColor: colors.background }} showsVerticalScrollIndicator={false}>
            <View className='flex'>
              <VendorCarousel images={carouselImages} />
            </View>
            <View className='w-3/4 mt-6 px-3 rounded-full overflow-hidden'>
              <SegmentedControl
                values={['12/14 Sat', '12/15 Sun']}
                selectedIndex={0}
                onChange={(event) => {
                  const index = event.nativeEvent.selectedSegmentIndex;
                  setSelectedDate(index === 0 ? '12/14' : '12/15');
                }}
                tintColor={'red'}
                fontStyle={{ color: 'white', fontSize: 16, fontWeight: '800' }}
                activeFontStyle={{ color: 'white', fontSize: 16, fontWeight: '800' }}
                backgroundColor={'transparent'}
                style={{ height: 36 }}
              />
            </View>
            <View className='flex'>
              <Accordion
                sections={selectedDate === '12/14' ? SAT_SECTIONS : SUN_SECTIONS}
                activeSections={activeSections}
                // renderSectionTitle={_renderSecti3nTitle}
                renderHeader={_renderHeader}
                renderContent={_renderContent}
                onChange={_updateSections}
              />
            </View>
          </ScrollView> */}
        </View>
        <View className='flex' key='2'>
          <FlatList
            data={foodVendors}
            renderItem={({ item }) => (
              <View className='flex-row items-center py-6 px-4 gap-6'>
                <Image source={item.images[0].uri} style={{ width: 77, height: 77, borderRadius: 20 }} />
                <View className='flex-col gap-4'>
                  <Text className='text-white font-NotoSansBold text-2xl'>{item.name}</Text>
                  <View className='flex-row gap-2'>
                    {item.links.instagram && (
                      <TouchableOpacity onPress={() => Linking.openURL(item.links.instagram)}>
                        <Ionicons name='logo-instagram' size={30} color='white' />
                      </TouchableOpacity>
                    )}
                    {item.links.website && (
                      <TouchableOpacity onPress={() => Linking.openURL(item.links.website)}>
                        <Ionicons name='globe' size={30} color='white' />
                      </TouchableOpacity>
                    )}
                    {item.links.facebook && (
                      <TouchableOpacity onPress={() => Linking.openURL(item.links.facebook)}>
                        <Ionicons name='logo-facebook' size={30} color='white' />
                      </TouchableOpacity>
                    )}
                    {item.links.tiktok && (
                      <TouchableOpacity onPress={() => Linking.openURL(item.links.tiktok)}>
                        <Ionicons name='logo-tiktok' size={30} color='white' />
                      </TouchableOpacity>
                    )}
                    {item.links.x && (
                      <TouchableOpacity onPress={() => Linking.openURL(item.links.x)}>
                        <Ionicons name='logo-twitter' size={30} color='white' />
                      </TouchableOpacity>
                    )}
                    {item.links.youtube && (
                      <TouchableOpacity onPress={() => Linking.openURL(item.links.youtube)}>
                        <Ionicons name='logo-youtube' size={30} color='white' />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            )}
          />
        </View>
        <View className='flex' key='3'>
          <FlatList
            data={retailVendors}
            renderItem={({ item }) => (
              <View className='flex-row items-center py-6 px-4 gap-6'>
                <Image source={item.images[0].uri} style={{ width: 77, height: 77, borderRadius: 20 }} />
                <View className='flex-col gap-4'>
                  <Text className='text-white font-NotoSansBold text-2xl'>{item.name}</Text>
                  <View className='flex-row gap-2'>
                    {item.links.instagram && (
                      <TouchableOpacity onPress={() => Linking.openURL(item.links.instagram)}>
                        <Ionicons name='logo-instagram' size={30} color='white' />
                      </TouchableOpacity>
                    )}
                    {item.links.website && (
                      <TouchableOpacity onPress={() => Linking.openURL(item.links.website)}>
                        <Ionicons name='globe' size={30} color='white' />
                      </TouchableOpacity>
                    )}
                    {item.links.facebook && (
                      <TouchableOpacity onPress={() => Linking.openURL(item.links.facebook)}>
                        <Ionicons name='logo-facebook' size={30} color='white' />
                      </TouchableOpacity>
                    )}
                    {item.links.tiktok && (
                      <TouchableOpacity onPress={() => Linking.openURL(item.links.tiktok)}>
                        <Ionicons name='logo-tiktok' size={30} color='white' />
                      </TouchableOpacity>
                    )}
                    {item.links.x && (
                      <TouchableOpacity onPress={() => Linking.openURL(item.links.x)}>
                        <Ionicons name='logo-twitter' size={30} color='white' />
                      </TouchableOpacity>
                    )}
                    {item.links.youtube && (
                      <TouchableOpacity onPress={() => Linking.openURL(item.links.youtube)}>
                        <Ionicons name='logo-youtube' size={30} color='white' />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            )}
          />
        </View>
      </PagerView>
      <ScrollView className='flex' style={{ backgroundColor: colors.background }} showsVerticalScrollIndicator={false}></ScrollView>
    </SafeAreaView>
  );
}
