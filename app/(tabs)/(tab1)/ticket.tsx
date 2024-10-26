import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import {
  Alert,
  Dimensions,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Client from 'shopify-buy';
import { useQuery } from '@apollo/client';
import { useCart } from '@/context/CartContext';

import { GET_PRODUCT_AND_COLLECTIONS } from '@/graphql/queries';
import PreOrderHorizontalScrollView from '@/components/PreOrderHorizontalScrollView';

// インターフェースの定義は変更なし
interface Variant {
  id: string;
  title: string;
  price: {
    amount: string;
    currencyCode: string;
  };
}

interface YokochoTicket {
  images: {
    edges: Array<{
      node: {
        url: string;
      };
    }>;
  };
  title: string;
  priceRange: {
    minVariantPrice: {
      amount: string;
    };
  };
  description: string;
}

interface GoodieBag {
  images: {
    edges: Array<{
      node: {
        url: string;
      };
    }>;
  };
  title: string;
  priceRange: {
    minVariantPrice: {
      amount: string;
    };
  };
  description: string;
}

interface Ticket {
  valid_date: string;
}

interface HasTickets {
  initial_valid_dates: string[];
  current_valid_dates: string[];
}

const client = Client.buildClient({
  domain: process.env.EXPO_PUBLIC_SHOPIFY_STORE_DOMAIN,
  storefrontAccessToken: process.env.EXPO_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
});

const deviceWidth: number = Dimensions.get('window').width;

export default function TicketScreen() {
  const { user } = useAuth();
  const { setCart, tempCart, setTempCart } = useCart();
  const { colors } = useTheme();
  const router = useRouter();
  const [showLoading, setShowLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedYokochoTicket, setSelectedYokochoTicket] = useState<YokochoTicket | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [yokochoTickets, setYokochoTickets] = useState<any[]>([]);
  const [goodieBags, setGoodieBags] = useState<any[]>([]);

  const scrollViewRef = useRef<ScrollView | null>(null);

  const saturdayTicketQuantity = useMemo(
    () => tempCart.lineItems.find((item) => item.variantId === 'gid://shopify/ProductVariant/44301267566767')?.quantity || 0,
    [tempCart]
  );

  const sundayTicketQuantity = useMemo(
    () => tempCart.lineItems.find((item) => item.variantId === 'gid://shopify/ProductVariant/44301267599535')?.quantity || 0,
    [tempCart]
  );

  // 入場チケットがカートに入っているかどうかを判断
  const isAdmissionTicketInCart = useMemo(
    () => saturdayTicketQuantity > 0 || sundayTicketQuantity > 0,
    [saturdayTicketQuantity, sundayTicketQuantity]
  );
  const SATURDAY_TICKET_VARIANT_ID = 'gid://shopify/ProductVariant/44301267566767';
  const SUNDAY_TICKET_VARIANT_ID = 'gid://shopify/ProductVariant/44301267599535';

  let TICKET_VALID_DATE: string[] = user?.ticketDates ?? [];
  const saturdayTicketInCart = tempCart.lineItems.some((item) => item.variantId === SATURDAY_TICKET_VARIANT_ID);
  const sundayTicketInCart = tempCart.lineItems.some((item) => item.variantId === SUNDAY_TICKET_VARIANT_ID);

  if (saturdayTicketInCart && !TICKET_VALID_DATE.includes('2024-12-14')) {
    TICKET_VALID_DATE.push('2024-12-14');
  }
  if (sundayTicketInCart && !TICKET_VALID_DATE.includes('2024-12-15')) {
    TICKET_VALID_DATE.push('2024-12-15');
  }

  const { loading, error, data } = useQuery(GET_PRODUCT_AND_COLLECTIONS, {
    variables: {
      productId: 'gid://shopify/Product/8059502919855',
      collectionIds: ['gid://shopify/Collection/331752865967', 'gid://shopify/Collection/331631657135'],
    },
    skip: yokochoTickets.length !== 0 && goodieBags.length !== 0,
    onError: (error) => {
      console.error('GraphQL Error:', error);
    },
  });

  useEffect(() => {
    if (data?.product) {
      setVariants(data.product.variants.edges.map((edge: any) => edge.node));
    }
    if (data?.collections) {
      const yokochoCollection = data.collections.find((collection: any) => collection.handle === 'tickets-yokocho');
      const goodieBagsCollection = data.collections.find((collection: any) => collection.handle === 'goodie-bags');

      if (yokochoCollection) {
        setYokochoTickets(
          yokochoCollection.products.edges.map((edge: any) => ({
            ...edge.node,
            quantity: tempCart.lineItems.find((item) => item.variantId === edge.node.variants.edges[0].node.id)?.quantity || 0,
          }))
        );
      }

      if (goodieBagsCollection) {
        setGoodieBags(goodieBagsCollection.products.edges.map((edge: any) => edge.node));
      }
    }
  }, [data, tempCart]);

  const cartItemCount = useMemo(() => tempCart.lineItems.reduce((total, item) => total + item.quantity, 0), [tempCart]);

  // CartItem update
  const updateCartItem = useCallback(
    (productId: string, variantId: string, quantity: number, validDate: string) => {
      setTempCart((prevCart) => {
        const updatedLineItems = prevCart.lineItems.filter((item) => item.variantId !== variantId);
        if (quantity > 0) {
          updatedLineItems.push({ productId, variantId, quantity, validDate });
        }
        return { ...prevCart, lineItems: updatedLineItems };
      });
    },
    [setTempCart]
  );

  const onPressAdd = useCallback(
    (index: number) => {
      const productId = 'gid://shopify/Product/8059502919855';
      const variantId = variants[index].id;
      const validDate = index === 0 ? '2024-12-14' : '2024-12-15';
      const currentQuantity = index === 0 ? saturdayTicketQuantity : sundayTicketQuantity;
      updateCartItem(productId, variantId, currentQuantity + 1, validDate);
    },
    [saturdayTicketQuantity, sundayTicketQuantity, variants, updateCartItem]
  );

  const onPressRemove = useCallback(
    (index: number) => {
      const productId = 'gid://shopify/Product/8059502919855';
      const variantId = variants[index].id;
      const validDate = index === 0 ? '2024-12-14' : '2024-12-15';
      const currentQuantity = index === 0 ? saturdayTicketQuantity : sundayTicketQuantity;
      if (currentQuantity === 1 && !user?.ticketDates?.includes(validDate)) {
        const hasSameValidDate = tempCart.lineItems.some((item) => item.validDate === validDate);

        if (hasSameValidDate) {
          Alert.alert('Warning', 'If you remove this admission ticket, all items for the same date will be lost. Are you sure you want to proceed?', [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'OK',
              onPress: () => handleDeleteSameDayTicket(validDate),
            },
          ]);
          return;
        }
      }
      updateCartItem(productId, variantId, Math.max(currentQuantity - 1, 0), validDate);
    },
    [saturdayTicketQuantity, sundayTicketQuantity, variants, updateCartItem]
  );

  const handleDeleteSameDayTicket = useCallback(
    (validDate: string) => {
      const lineItems = tempCart.lineItems.filter((item) => item.validDate !== validDate);
      setTempCart({ ...tempCart, lineItems });
    },
    [tempCart, setTempCart]
  );

  const createCheckout = async () => {
    const lineItems = tempCart.lineItems;
    try {
      const checkout = await client.checkout.create({
        lineItems: lineItems
          .map((item) => {
            if (item.quantity !== 0) {
              return {
                variantId: item.variantId,
                quantity: item.quantity,
              };
            }
            return null;
          })
          .filter((item) => item !== null),
        email: user?.email,
        allowPartialAddresses: true,
        customAttributes: [
          { key: 'customerId', value: user?.shopifyCustomerId || '' },
          { key: 'userId', value: user?.id || '' },
        ],
      });

      setCart(() => ({
        checkoutId: checkout.id,
        lineItems: checkout.lineItems,
        webUrl: checkout.webUrl,
      }));
    } catch (error) {
      console.error('Checkout creation failed:', error);
      if (error instanceof Error && error.message.includes('Network request faile')) {
        console.log('Retrying checkout creation...');
        await createCheckout();
      }
    } finally {
      setShowLoading(false);
    }
  };

  const onPressBuy = useCallback(async () => {
    if (!user?.id) {
      router.push('/order-confirmation');
    } else {
      // setShowLoading(true);
      // try {
      //   await createCheckout();
      // } catch (error) {
      //   console.error('Checkout creation failed:', error);
      //   if (error instanceof Error && error.message.includes('Network request faile')) {
      //     console.log('Retrying checkout creation...');
      //     await createCheckout();
      //   }
      // } finally {
      //   router.push('/order-confirmation');
      //   setShowLoading(false);
      // }
      router.push('/order-confirmation');
    }
  }, []);

  const closeModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  if (loading || showLoading) {
    return (
      <View className='flex-1 bg-black justify-center items-center'>
        <ActivityIndicator size='large' color='white' />
      </View>
    );
  }

  if (error) return <Text className='text-white'>Error: {error.message}</Text>;

  const onPressProduct = (productId: string) => {
    router.push({
      pathname: '/product-detail',
      params: { productId },
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View className='flex-1 relative'>
        <ScrollView ref={scrollViewRef} className='flex' showsVerticalScrollIndicator={false} style={{ backgroundColor: '#fff1ec' }}>
          <View className='flex-1 w-full bg-white'>
            <Image
              source={'https://cdn.shopify.com/s/files/1/0663/3209/8735/files/tixx_74d625df-efe0-4faf-bac0-c0b055cbaaf2.jpg?v=1725003897'}
              style={{ width: deviceWidth, height: 'auto', aspectRatio: 3 / 2 }}
              contentFit='contain'
              transition={1000}
            />
          </View>

          {/* ADMISSION FEE */}
          <View className='flex p-6'>
            <View className='flex'>
              <Text className='text-md font-NotoSans'>
                1-Day Ticket Admission for Taste of Japan.&nbsp; *Valid for only ONE of the two days (Dec. 14 OR Dec. 15). *PURCHASE EARLY BIRD
                TICKETS and GET 1 SPIN on the Garapon! "Garapon" is a traditional Japanese wheel of fortune. Spin the garapon and win special prizes!
              </Text>
            </View>
            <View className='flex '>
              <View className='flex'>
                <View className='flex py-6'>
                  <View className='flex'>
                    <Text className='text-slate-700 font-bold text-xl'>12/14 SATURDAY</Text>
                    <View className='flex-row border border-slate-700 rounded-lg p-4 items-center mt-3'>
                      <View className='flex-1'>
                        <Text className='text-slate-700 font-bold text-xl'>ADMISSION FEE</Text>
                        <Text className='text-slate-700 text-md'>$10 / per ticket</Text>
                      </View>
                      <View className='flex-row rounded-full w-1/3 h-10 bg-white items-center justify-between px-3'>
                        <TouchableOpacity className='items-center justify-center' onPress={() => onPressRemove(0)}>
                          <Ionicons name='remove' color='black' size={18} />
                        </TouchableOpacity>
                        <View className='items-center justify-center'>
                          <Text className='text-black text-xl font-bold text-center'>{saturdayTicketQuantity}</Text>
                        </View>
                        <TouchableOpacity className='items-center justify-center' onPress={() => onPressAdd(0)}>
                          <Ionicons name='add' color='black' size={18} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>

                {/* 12/15 SUNDAY */}
                <View className='flex mt-4'>
                  <Text className='text-slate-700 font-bold text-xl'>12/15 SUNDAY</Text>
                  <View className='flex-row border border-slate-700 rounded-lg p-4 items-center mt-3'>
                    <View className='flex-1'>
                      <Text className='text-slate-700 font-bold text-xl'>ADMISSION FEE</Text>
                      <Text className='text-slate-700 text-md'>$10 / per ticket</Text>
                    </View>
                    <View className='flex-row rounded-full w-1/3 h-10 bg-white items-center justify-between px-3'>
                      <TouchableOpacity className='items-center justify-center' onPress={() => onPressRemove(1)}>
                        <Ionicons name='remove' color='black' size={18} />
                      </TouchableOpacity>
                      <View className='items-center justify-center'>
                        <Text className='text-black text-xl font-bold text-center'>{sundayTicketQuantity}</Text>
                      </View>
                      <TouchableOpacity className='items-center justify-center' onPress={() => onPressAdd(1)}>
                        <Ionicons name='add' color='black' size={18} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* BUNDLES */}
          <View className={`${isAdmissionTicketInCart || user?.hasTickets ? 'opacity-100' : 'opacity-50'} mt-6 gap-12`}>
            {/* YOKOCHO TICKET */}
            {/* <View className='flex p-6'>
            <Text className='text-slate-700 font-NotoSansBold text-2xl'>YOKOCHO TICKET</Text>
            <Text className='text-slate-700 font-NotoSans text-md mt-1'>Japanese craft beer & sake, shochu</Text>
            <View className='flex-row justify-between gap-3 mt-4'>
              {yokochoTickets?.map((product: any) => {
                const quantityOfProduct = tempCart.lineItems.reduce((total, item) => {
                  if (item.productId === product.id) {
                    return total + item.quantity;
                  }
                  return total;
                }, 0);
                return (
                  <View key={product.id} className='items-center justify-center' style={{ width: (deviceWidth - 54) / 2 }}>
                    <TouchableOpacity className='w-full' onPress={() => onPressProduct(product.id)}>
                      <Image source={product.images.edges[0].node.url} contentFit='cover' style={{ width: '100%', height: 200, borderRadius: 10 }} />
                      <Text className='text-slate-700 text-md font-NotoSansBold mt-2'>{product.title}</Text>
                      <View className='flex-row justify-between items-center'>
                        <Text className='text-slate-700 text-lg font-NotoSansBold mt-2'>
                          ${parseFloat(product.priceRange.minVariantPrice.amount).toFixed(2)}
                        </Text>
                        {quantityOfProduct > 0 && (
                          <View className={`flex-row px-2 py-0.5 bg-red-600 rounded-full justify-between items-center`}>
                            <Ionicons name='cart' color='white' size={18} />
                            <Text className='text-white text-md font-NotoSansBold'> {quantityOfProduct}</Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </View> */}

            {/* FOOD PRE-ORDER */}
            <View className='flex'>
              <View className='flex px-6'>
                <Text className='text-slate-700 font-NotoSansBold text-2xl'>FOOD PRE-ORDER</Text>
                <Text className='text-slate-700 font-NotoSans text-md mt-1'>Order in advance & earn extra points. Skip the line!</Text>
              </View>
              <PreOrderHorizontalScrollView category='Food' color='white' pl={0} price={true} />
            </View>

            {/* GOODIE BAG */}
            <View className='flex px-6'>
              <Text className='text-slate-700 font-NotoSansBold text-2xl'>GOODIE BAG</Text>
              <Text className='text-slate-700 font-NotoSans text-md mt-1'>
                Includes: Taste of Japan T-shirt Chicken Teriyaki Meal Snacks Drink Tote bag Sponsored Goodies
              </Text>
              <View className='flex-row justify-between gap-3 mt-8'>
                {goodieBags?.map((product: any) => {
                  const quantityOfProduct = tempCart.lineItems.reduce((total, item) => {
                    if (item.productId === product.id) {
                      return total + item.quantity;
                    }
                    return total;
                  }, 0);
                  return (
                    <View key={product.id} className='items-center justify-center relative' style={{ width: (deviceWidth - 54) / 2 }}>
                      <TouchableOpacity className='w-full bg-white rounded-xl overflow-hidden' onPress={() => onPressProduct(product.id)}>
                        <Image
                          source={product.images.edges[0].node.url}
                          contentFit='cover'
                          style={{ width: '100%', height: 200, borderRadius: 10, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
                        />
                        <View className='absolute top-0 right-0 bg-red-500/80 px-4 py-1 rounded-bl-2xl'>
                          <Text className='text-white font-NotoSansBold text-md'>1000 pts</Text>
                        </View>
                        <View className='flex p-2'>
                          <Text className='text-slate-700 text-md font-NotoSansBold'>{product.title}</Text>
                          <View className='flex-row justify-between items-baseline mt-2'>
                            <Text className='text-slate-700 text-lg font-NotoSansBold'>
                              ${parseFloat(product.priceRange.minVariantPrice.amount).toFixed(2)}
                            </Text>
                            {quantityOfProduct > 0 && (
                              <View className={`flex-row px-2 py-0.5 bg-red-600 rounded-full justify-between items-center`}>
                                <Ionicons name='cart' color='white' size={18} />
                                <Text className='text-white text-md font-NotoSansBold'> {quantityOfProduct}</Text>
                              </View>
                            )}
                          </View>
                        </View>
                      </TouchableOpacity>
                      {/* <View className='flex-row rounded-full w-full h-10 bg-white items-center justify-between px-4 mt-4'>
                      <TouchableOpacity
                        className='items-center justify-center'
                        onPress={() => onPressRemoveGoodieBag(product.id, product.variants.edges[0].node.id)}
                        disabled={!isAdmissionTicketInCart}>
                        <Ionicons name='remove' color='black' size={18} />
                      </TouchableOpacity>
                      <View className='items-center justify-center'>
                        <Text className='text-black text-xl font-bold text-center'>
                          {tempCart.lineItems.find((cartItem) => cartItem.variantId === product.variants.edges[0].node.id)?.quantity || 0}
                        </Text>
                      </View>
                      <TouchableOpacity
                        className='items-center justify-center'
                        onPress={() => onPressAddGoodieBag(product.id, product.variants.edges[0].node.id)}
                        disabled={!isAdmissionTicketInCart}>
                        <Ionicons name='add' color='black' size={18} />
                      </TouchableOpacity>
                    </View> */}
                    </View>
                  );
                })}
              </View>
            </View>

            <View className='h-20' />
          </View>
        </ScrollView>
        {/* Next Button */}
        <View className='flex w-full bg-white absolute bottom-0 px-4 py-3 justify-center items-center'>
          <TouchableOpacity
            className={`${tempCart.lineItems.length ? 'bg-red-600' : 'bg-[#fff1ec]'} py-3 items-center justify-center rounded-md w-full`}
            onPress={tempCart.lineItems.length ? onPressBuy : () => scrollViewRef.current?.scrollTo({ y: 0, animated: true })}>
            <Text
              className={`${tempCart.lineItems.length ? 'text-white' : 'text-black'} text-center ${
                tempCart.lineItems.length ? 'text-xl' : 'text-lg'
              } font-NotoSansBold`}>
              {tempCart.lineItems.length ? `View cart (${cartItemCount})` : 'Please select admission tickets'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <Modal animationType='fade' transparent={true} visible={modalVisible} onRequestClose={closeModal}>
        <TouchableWithoutFeedback onPress={closeModal} style={{ flex: 1 }}>
          <View className='flex-1 bg-black bg-opacity-90 justify-center'>
            {selectedYokochoTicket && (
              <View className='flex-col p-6 gap-3'>
                <Image
                  source={selectedYokochoTicket.images.edges[0].node.url}
                  contentFit='cover'
                  style={{ width: '100%', height: 300, borderRadius: 5 }}
                />
                <Text className='text-white text-2xl font-NotoSansBold'>{selectedYokochoTicket.title}</Text>
                <Text className='text-white text-xl font-NotoSansBold'>
                  ${parseFloat(selectedYokochoTicket.priceRange.minVariantPrice.amount).toFixed(2)}
                </Text>
                <Text className='text-white text-lg font-NotoSans'>{selectedYokochoTicket.description}</Text>
              </View>
            )}
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}
