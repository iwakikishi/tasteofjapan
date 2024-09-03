import Ionicons from '@expo/vector-icons/Ionicons';
import { Platform, SafeAreaView, Text, ScrollView, View } from 'react-native';
import { VendorCarousel } from '@/components/VendorCarousel';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { useState } from 'react';
import Accordion from 'react-native-collapsible/Accordion';
import { Image } from 'expo-image';

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

export default function StageScreen() {
  const [selectedDate, setSelectedDate] = useState('12/14');
  const [activeSections, setActiveSections] = useState([]);

  // const _renderSectionTitle = (section) => {
  //   return (
  //     <View className='flex'>
  //       <Text className='text-white'>{section.content}</Text>
  //     </View>
  //   );
  // };

  const _renderHeader = (section) => {
    return (
      <View className='flex mt-5 p-4 border border-white rounded-lg'>
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

  const _renderContent = (section) => {
    return (
      <View className='flex'>
        <Text className='text-white'>{section.content}</Text>
      </View>
    );
  };

  const _updateSections = (activeSections) => {
    setActiveSections(activeSections);
  };

  return (
    <SafeAreaView className='flex-1'>
      <ScrollView className='flex' showsVerticalScrollIndicator={false} stickyHeaderIndices={[1]}>
        <View className='flex'>
          <VendorCarousel images={carouselImages} />
        </View>
        <View className='flex px-10 py-3 my-4 bg-black'>
          <SegmentedControl
            values={['12/14', '12/15']}
            selectedIndex={0}
            onChange={(event) => {
              const index = event.nativeEvent.selectedSegmentIndex;
              setSelectedDate(index === 0 ? '12/14' : '12/15');
            }}
          />
        </View>
        <View className='flex px-4'>
          <Accordion
            sections={selectedDate === '12/14' ? SAT_SECTIONS : SUN_SECTIONS}
            activeSections={activeSections}
            // renderSectionTitle={_renderSectionTitle}
            renderHeader={_renderHeader}
            renderContent={_renderContent}
            onChange={_updateSections}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
