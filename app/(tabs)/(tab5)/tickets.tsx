import { View, Text, SafeAreaView, Dimensions, Animated, ActivityIndicator } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase-client';
import { RealtimeChannel } from '@supabase/supabase-js';
import QRCode from 'react-native-qrcode-svg';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import PagerView from 'react-native-pager-view';

type Ticket = {
  id: string;
  category: 'ADMISSION TICKETS' | 'YOKOCHO TICKETS';
  check_in_status: 'NONE' | string;
  check_in_time: string | null;
  checkout_id: string;
  created_at: string;
  event_name: string;
  note: string | null;
  product_id: string;
  title: string;
  user_id: string;
  valid_date: string | null;
  variant_id: string;
  variant_title: string;
};

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;
export default function TicketsScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();

  const [admissionTickets, setAdmissionTickets] = useState<Ticket[]>([]);
  const [otherTickets, setOtherTickets] = useState<Ticket[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);

  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('user_id', user?.id)
        .eq('event_name', 'ARZ-DEC-2024')
        .order('created_at', { ascending: false });

      console.log('Data:', data);

      if (error) throw error;
      setLoading(false);
      const categorizedTickets = data.reduce((acc: { [key: string]: Ticket[] }, ticket: Ticket) => {
        const category = ticket.category === 'ADMISSION TICKETS' ? 'admission' : 'other';
        acc[category] = [...(acc[category] || []), ticket];
        return acc;
      }, {});

      setAdmissionTickets(categorizedTickets.admission || []);
      setOtherTickets(categorizedTickets.other || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  useEffect(() => {
    fetchTickets();
    const channel = supabase
      .channel('tickets_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tickets',
          filter: `user_id=eq.${user?.id}`,
        },
        (payload) => {
          const updatedTicket = payload.new as Ticket;
          setAdmissionTickets((prev) => prev.map((ticket) => (ticket.id === updatedTicket.id ? updatedTicket : ticket)));
          setOtherTickets((prev) => prev.map((ticket) => (ticket.id === updatedTicket.id ? updatedTicket : ticket)));
        }
      )
      .subscribe((status) => {
        console.log('Subscribed to channel status:', status);
      });

    console.log('Subscribed to channel with user_id:', user?.id);

    return () => {
      console.log('Unsubscribed from channel with user_id:', user?.id);
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const renderTicket = (ticket: Ticket) => (
    <View className='flex my-4 gap-4 items-center' style={{ width: '100%', height: '90%' }}>
      <View
        className='flex items-center justify-center overflow-hidden'
        style={{
          width: deviceWidth / 1.75,
          borderColor: ticket.check_in_status === 'NONE' ? 'red' : 'lightgreen',
          borderWidth: 2,
          opacity: ticket.check_in_status === 'NONE' ? 1 : 0.2,
        }}>
        <QRCode
          size={deviceWidth / 1.75}
          value={ticket.id}
          color='black'
          enableLinearGradient={false}
          linearGradient={['rgb(255,20,147)', 'rgb(255,192,203)']}
        />
      </View>
      <View className='flex items-center justify-center mt-3'>
        <Text className='text-white text-xl text-center font-NotoSansBold'>{ticket.title}</Text>
      </View>
      <View className='flex-row items-center gap-1'>
        <Text className='text-white text-xl font-NotoSansBold'>{ticket.valid_date} </Text>
        <Text className='text-white text-lg font-NotoSans'>{ticket.event_name}</Text>
      </View>
      <Text className={`text-xl font-NotoSansBold ${ticket.check_in_status === 'NONE' ? 'text-red-500' : 'text-green-500'}`}>
        Status: {ticket.check_in_status === 'NONE' ? 'Not Checked In' : 'Checked In'}
      </Text>
      {ticket.category === 'ADMISSION TICKETS' && ticket.product_id === 'gid://shopify/Product/8059502919855' ? (
        <View className='px-2 py-1 bg-green-500 ml-2'>
          <Text className='text-white text-sm text-center font-NotoSansBold'>Early Bird</Text>
        </View>
      ) : null}
    </View>
  );

  const renderTickets = (tickets: Ticket[]) =>
    tickets.length > 0 ? (
      <View className='flex-1' style={{ height: deviceHeight * 0.9 }}>
        <PagerView
          initialPage={0}
          style={{ width: deviceWidth, height: deviceHeight * 0.8 }}
          onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}>
          {tickets.map((ticket, index) => (
            <View key={index.toString()} className='flex p-4 items-center justify-center'>
              {renderTicket(ticket)}
            </View>
          ))}
        </PagerView>
        {renderPagination(tickets)}
      </View>
    ) : loading ? (
      <View className='flex-1 items-center justify-center'>
        <ActivityIndicator size='small' color='white' />
      </View>
    ) : (
      <View className='flex-1 items-center justify-center'>
        <Text className='text-white text-lg font-bold'>No Tickets Found</Text>
      </View>
    );

  const renderPagination = (tickets: Ticket[]) => {
    return (
      <View className='flex-row h-10 justify-center items-center absolute bottom-10 left-0 right-0'>
        {tickets.map((_, i) => (
          <View key={i.toString()} className={`h-3 w-3 rounded-full mx-1 ${i === currentPage ? 'bg-white' : 'bg-gray-500'}`} />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView className='flex-1' style={{ backgroundColor: colors.background }}>
      {loading ? (
        <View className='flex-1 items-center justify-center'>
          <ActivityIndicator size='small' color='white' />
        </View>
      ) : (
        <>
          <View className='w-3/5 mx-auto mt-4' style={{ backgroundColor: colors.background }}>
            <SegmentedControl
              values={['Admission', 'Other']}
              selectedIndex={selectedSegment}
              fontStyle={{ color: 'white', fontWeight: '800', fontSize: 15 }}
              tintColor={'white'}
              appearance='dark'
              activeFontStyle={{ color: 'black', fontWeight: '800', fontSize: 15 }}
              onChange={(event) => {
                setSelectedSegment(event.nativeEvent.selectedSegmentIndex);
              }}
              // appearance='dark'
            />
          </View>
          <View className='flex-1'>{renderTickets(selectedSegment === 0 ? admissionTickets : otherTickets)}</View>
        </>
      )}
    </SafeAreaView>
  );
}
