import { View, Dimensions } from 'react-native';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import LottieView from 'lottie-react-native';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useQuery } from '@apollo/client';
import { GET_CHECKOUT_BY_ID } from '@/graphql/queries';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase-client';

const deviceWidth = Dimensions.get('window').width;

export default function ThanksScreen() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const { cart, setCart, setTempCart } = useCart();
  const animation = useRef<LottieView>(null);

  const { error, data } = useQuery(GET_CHECKOUT_BY_ID, {
    variables: { checkoutId: cart.checkoutId || '' },
    skip: !cart.checkoutId,
  });

  if (error) console.error('Error fetching checkout data:', error);

  const lineItems = useMemo(() => data?.node?.lineItems?.edges?.map((edge: any) => edge.node) || [], [data]);
  const filterItemsByTag = useCallback(
    (items: any[], tag: string) => items.filter((item: any) => (item.variant.product.tags || []).includes(tag)),
    []
  );
  const admissionItems = useMemo(() => filterItemsByTag(lineItems, 'Admission Tickets'), [filterItemsByTag, lineItems]);
  const yokochoItems = useMemo(() => filterItemsByTag(lineItems, 'Yokocho Tickets'), [filterItemsByTag, lineItems]);
  const goodieBagItems = useMemo(() => filterItemsByTag(lineItems, 'goodie_bag'), [filterItemsByTag, lineItems]);

  const resetCart = useCallback(() => {
    setCart({ checkoutId: '', lineItems: [], webUrl: '' });
    setTempCart({ lineItems: [] });
  }, [setCart, setTempCart]);

  const navigateToHome = useCallback(() => {
    router.replace('/(tabs)/(tab1)');
  }, [router]);

  useEffect(() => {
    let isMounted = true;

    // const createTickets = (item: any, category: string) => {
    //   const baseTicket = {
    //     user_id: user?.id,
    //     checkout_id: cart.checkoutId,
    //     product_id: item.variant.product.id,
    //     variant_id: item.variant.id,
    //     title: item.title,
    //     variant_title: item.variant.title,
    //     event_name: 'ARZ-DEC-2024',
    //     check_in_status: 'NONE',
    //     category,
    //   };

    //   return Array(item.quantity)
    //     .fill(null)
    //     .map(() => {
    //       if (category === 'ADMISSION TICKETS') {
    //         return { ...baseTicket, valid_date: item.variant.title === '12/14 (Saturday)' ? '2024-12-14' : '2024-12-15' };
    //       } else if (category === 'YOKOCHO TICKETS') {
    //         return { ...baseTicket, valid_date: item.variant.title === 'December 14th (Saturday) after 1pm' ? '2024-12-14' : '2024-12-15' };
    //       }
    //       return baseTicket;
    //     });
    // };

    const registerTicketsAndAddPoints = async () => {
      try {
        const startTime = Date.now();

        // const allTickets = [
        //   ...admissionItems.flatMap((item) => createTickets(item, 'ADMISSION TICKETS')),
        //   ...yokochoItems.flatMap((item) => createTickets(item, 'YOKOCHO TICKETS')),
        //   ...goodieBagItems.flatMap((item) => createTickets(item, 'GOODIE BAG')),
        // ];

        const totalPoints = lineItems.reduce((total: number, item: any) => total + item.quantity, 0) * 1000;

        const { error: pointError } = await supabase
          .from('user_profiles')
          .update({ points: (user?.points ?? 0) + totalPoints })
          .eq('id', user?.id);

        if (pointError) throw pointError;

        setUser((prevUser) => (prevUser ? { ...prevUser, points: (prevUser.points ?? 0) + totalPoints } : null));

        // const [ticketResult, pointResult] = await Promise.all([
        //   supabase.from('tickets').insert(allTickets),
        //   supabase
        //     .from('user_profiles')
        //     .update({ points: (user?.points ?? 0) + totalPoints })
        //     .eq('id', user?.id),
        // ]);

        // if (ticketResult.error) throw ticketResult.error;
        // if (pointResult.error) throw pointResult.error;

        // console.log('All tickets registered:', ticketResult.data);
        // console.log('Points added to user:', pointResult.data);

        if (admissionItems.length > 0 && user) {
          setUser({ ...user, hasTickets: true });
        }

        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(2500 - elapsedTime, 0);

        if (isMounted) {
          resetCart();
          setTimeout(navigateToHome, remainingTime);
        }
      } catch (error) {
        console.error('Error in registration process:', error);
      }
    };

    if (admissionItems.length > 0 || yokochoItems.length > 0 || goodieBagItems.length > 0) {
      registerTicketsAndAddPoints();
    } else if (isMounted) {
      resetCart();
      const timer = setTimeout(navigateToHome, 2500);
      return () => clearTimeout(timer);
    }

    return () => {
      isMounted = false;
    };
  }, [admissionItems, yokochoItems, goodieBagItems, cart.checkoutId, user?.id, resetCart, navigateToHome, lineItems]);

  return (
    <View className='flex-1 items-center justify-center bg-white'>
      <LottieView
        autoPlay
        ref={animation}
        style={{
          width: deviceWidth - 50,
          height: deviceWidth - 50,
          backgroundColor: '#fff',
        }}
        source={require('@/assets/lottie/thanks-animation.json')}
      />
    </View>
  );
}
