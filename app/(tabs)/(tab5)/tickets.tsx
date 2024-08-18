import { View, Text, SafeAreaView, ScrollView, Dimensions } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase-client';
import QRCode from 'react-native-qrcode-svg';
import SegmentedControl from '@react-native-segmented-control/segmented-control';

type Ticket = {
  id: string;
  category: string;
  price: number;
  qty: number;
  check_in_qty: number | null;
  check_in_status: string;
  check_in_time: string | null;
  created_at: string;
  event_name: string;
  user_id: string;
  valid_date: string;
};

const deviceWidth = Dimensions.get('window').width;

export default function TicketsScreen() {
  const { user } = useAuth();
  const [admissionTickets, setAdmissionTickets] = useState<Ticket[]>([]);
  const [otherTickets, setOtherTickets] = useState<Ticket[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<number>(0);

  useEffect(() => {
    const fetchTickets = async () => {
      const { data, error } = await supabase.from('tickets').select('*').eq('user_id', user?.id);
      if (error) {
        console.error(error);
      } else {
        const admissionTickets = data.filter((ticket: Ticket) => ticket.category === 'ADMISSION');
        const otherTickets = data.filter((ticket: Ticket) => ticket.category !== 'ADMISSION');
        setAdmissionTickets(admissionTickets);
        setOtherTickets(otherTickets);
      }
    };

    fetchTickets();
  }, []);
  return (
    <SafeAreaView className='flex'>
      <View className='w-3/4 mx-auto mt-4'>
        <SegmentedControl
          values={['Admission', 'Other']}
          selectedIndex={0}
          fontStyle={{ fontWeight: '800', fontSize: 16 }}
          onChange={(event) => {
            setSelectedSegment(event.nativeEvent.selectedSegmentIndex);
          }}
          appearance='dark'
        />
      </View>
      <ScrollView className='flex'>
        <View className='flex p-4 items-center justify-center'>
          {selectedSegment === 0 ? (
            <View className='flex my-6 gap-4'>
              <View className='flex items-center justify-center rounded-lg overflow-hidden'>
                <QRCode
                  size={deviceWidth * 0.8}
                  value={admissionTickets[0]?.id}
                  color='purple'
                  enableLinearGradient={true}
                  linearGradient={['rgb(255,20,147)', 'rgb(255,192,203)']}
                  // gradientDirection={['170', '150', '130', '110']}
                />
              </View>
              <View className='flex'>
                <Text className='text-white text-lg font-bold'>Event: {admissionTickets[0]?.event_name}</Text>
                <Text className='text-white text-lg font-bold'>Valid Date: {admissionTickets[0]?.valid_date}</Text>
                <Text className='text-white text-lg font-bold'>
                  {admissionTickets[0]?.qty} {admissionTickets.length > 1 ? 'Tickets' : 'Ticket'}
                </Text>
                <Text className='text-white text-lg font-bold'>
                  Status: {!admissionTickets[0]?.check_in_status ? 'Not Checked In' : 'Checked In'}
                </Text>
              </View>
            </View>
          ) : (
            <View className='flex my-6 gap-4'>
              <Text className='text-white text-lg font-bold'>Other Tickets</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
