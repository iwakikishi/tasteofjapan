import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useQuery } from '@apollo/client';
import { GET_CHECKOUT_BY_ID } from '@/graphql/queries';
import { useMutation } from '@apollo/client';
import { REMOVE_LINE_ITEM } from '@/graphql/mutations';
import Client from 'shopify-buy';
import { Image } from 'expo-image';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetBackdrop, BottomSheetBackdropProps, BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';

interface LineItem {
  id: string;
  title: string;
  quantity: number;
  variant: {
    id: string;
    title: string;
    product: {
      priceRange: {
        minVariantPrice: {
          amount: string;
        };
      };
      images: {
        edges: {
          node: {
            url: string;
          };
        }[];
      };
    };
  };
}

const client = Client.buildClient({
  domain: process.env.EXPO_PUBLIC_SHOPIFY_STORE_DOMAIN,
  storefrontAccessToken: process.env.EXPO_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
});

export default function OrderConfirmationScreen() {
  // export default function CartScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { cart, setCart, tempCart, setTempCart } = useCart();
  const { checkoutId, webUrl } = useLocalSearchParams<{ checkoutId: string; webUrl: string }>();

  const [showLoading, setShowLoading] = useState(true);
  const [checkOutUrl, setCheckOutUrl] = useState<string | null>(null);

  const snapPoints = useMemo(() => [1, '100%'], []);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const [removeLineItem] = useMutation(REMOVE_LINE_ITEM);

  const { loading, error, data, refetch } = useQuery(GET_CHECKOUT_BY_ID, {
    variables: { checkoutId: cart.checkoutId || '' },
    skip: !cart.checkoutId,
  });

  const isFocused = useIsFocused();

  useEffect(() => {
    if (!isFocused) {
      setCart({
        checkoutId: '',
        lineItems: [],
        webUrl: '',
      });
    } else {
      if (tempCart.lineItems.length > 0) {
        setShowLoading(true);
        createCheckout();
      }
    }
  }, [isFocused]);

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

  useEffect(() => {
    if (data?.node?.lineItems?.edges?.length === 0) {
      setShowLoading(false);
    }
  }, [data]);

  if (!tempCart.lineItems.length || (data?.node?.lineItems?.edges?.length === 0 && !showLoading)) {
    return (
      <View className='flex-1 items-center justify-center' style={{ backgroundColor: colors.background }}>
        <View className='-mt-20 items-center justify-center gap-2'>
          <Ionicons name='cart-outline' size={63} color={colors.headerText} />
          <Text className='text-lg font-NotoSansBold text-white'>No items in the cart</Text>
        </View>
      </View>
    );
  }

  if (loading || showLoading)
    return (
      <View className='flex-1 items-center justify-center' style={{ backgroundColor: colors.background }}>
        <ActivityIndicator size='large' color={'white'} />
      </View>
    );

  if (error) return <Text className='text-lg font-NotoSansBold text-white'>Error: {error.message}</Text>;

  const lineItems = data?.node?.lineItems?.edges?.map((edge: any) => edge.node) || [];

  if (lineItems.length === 0) {
    return (
      <View className='flex-1 items-center justify-center' style={{ backgroundColor: colors.background }}>
        <Text className='text-lg font-NotoSansBold text-white'>No items in the cart</Text>
      </View>
    );
  }

  const SATURDAY_TICKET_VARIANT_ID = 'gid://shopify/ProductVariant/44301267566767';
  const SUNDAY_TICKET_VARIANT_ID = 'gid://shopify/ProductVariant/44301267599535';

  const onPressRemove = (lineItemId: string, variantId: string) => {
    const isAdmissionTicket = variantId === SATURDAY_TICKET_VARIANT_ID || variantId === SUNDAY_TICKET_VARIANT_ID ? true : false;

    if (isAdmissionTicket) {
      const validDate = variantId === SATURDAY_TICKET_VARIANT_ID ? '2024-12-14' : '2024-12-15';
      if (user?.ticketDates?.includes(validDate)) {
        handleRemove(lineItemId, variantId);
        return;
      }
      const sameDateTickets = tempCart.lineItems.filter((item) => item.validDate === validDate);
      if (sameDateTickets.length === 1) {
        handleRemove(lineItemId, variantId);
        return;
      } else {
        Alert.alert('Oops!', 'If you remove this admission ticket, all items for the same date will be lost. Are you sure you want to proceed?', [
          { text: 'Cancel' },
          { text: 'Delete', onPress: () => handleRemoveSameDateTicket(validDate, sameDateTickets) },
        ]);
        return;
      }
    } else {
      handleRemove(lineItemId, variantId);
      return;
    }
  };

  const handleRemoveSameDateTicket = async (validDate: string, sameDateTickets: any) => {
    setShowLoading(true);
    const variantIds = sameDateTickets.map((item: any) => item.variantId);
    const lineItemIds = cart.lineItems.filter((item) => variantIds.includes(item.variant.id)).map((item) => item.id);
    try {
      const { data } = await removeLineItem({
        variables: {
          checkoutId: cart.checkoutId,
          lineItemIds,
        },
      });
      if (data?.checkoutLineItemsRemove?.checkout) {
        const { data: refetchedData } = await refetch();
        if (refetchedData?.node?.lineItems?.edges.length > 0) {
          const updatedLineItems = refetchedData.node.lineItems.edges.map((edge: any) => edge.node);
          setCart((prevCart) => {
            return {
              ...prevCart,
              lineItems: updatedLineItems,
            };
          });
          setTempCart((prevTempCart) => ({
            lineItems: prevTempCart.lineItems.filter((item) => item.validDate !== validDate),
          }));
        } else {
          setCart({
            checkoutId: '',
            lineItems: [],
            webUrl: '',
          });
          setTempCart({ lineItems: [] });
        }
      }
    } catch (error) {
      console.error('Error removing all items:', error);
    } finally {
      setShowLoading(false);
    }
  };

  const handleRemove = async (lineItemId: string, variantId: string) => {
    try {
      const { data } = await removeLineItem({
        variables: {
          checkoutId: cart.checkoutId,
          lineItemIds: [lineItemId],
        },
      });

      if (data?.checkoutLineItemsRemove?.checkout) {
        const { data: refetchedData } = await refetch();
        if (refetchedData?.node?.lineItems?.edges.length > 0) {
          const updatedLineItems = refetchedData.node.lineItems.edges.map((edge: any) => edge.node);
          setCart((prevCart) => {
            return {
              ...prevCart,
              lineItems: updatedLineItems,
            };
          });
          setTempCart((prevTempCart) => ({
            lineItems: prevTempCart.lineItems.filter((item) => item.variantId !== variantId),
          }));
        } else {
          setCart({
            checkoutId: '',
            lineItems: [],
            webUrl: '',
          });
          setTempCart({ lineItems: [] });
        }
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const renderBackdrop = (props: BottomSheetBackdropProps) => <BottomSheetBackdrop {...props} />;

  const handleCheckout = () => {
    if (!user) {
      router.navigate('/login');
    } else {
      setCheckOutUrl(cart.webUrl);
      bottomSheetModalRef?.current?.present();
    }
  };

  const handleSheetChanges = (index: number) => {
    if (index === -1) {
      bottomSheetModalRef?.current?.dismiss();
    }
  };

  const handleWebViewNavigationStateChange = (newNavState: WebViewNavigation) => {
    const { url } = newNavState;

    if (url.includes('/thank-you') || url.includes('/thank_you')) {
      bottomSheetModalRef.current?.dismiss();
      setCart({
        checkoutId: '',
        lineItems: [],
        webUrl: '',
      });
      router.replace('/thanks');
    }
    if (
      url === 'https://169cf3-1c.myshopify.com' ||
      url === 'https://169cf3-1c.myshopify.com/' ||
      url === 'https://tasteofjpn.com' ||
      url === 'https://tasteofjpn.com/'
    ) {
      console.log('Checkout canceled');
      bottomSheetModalRef.current?.dismiss();
    }
    if (
      url === 'https://169cf3-1c.myshopify.com/cart' ||
      url === 'https://169cf3-1c.myshopify.com/cart/' ||
      url === 'https://tasteofjpn.com/cart' ||
      url === 'https://tasteofjpn.com/cart/'
    ) {
      bottomSheetModalRef.current?.dismiss();
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          <View className='flex-1' style={{ backgroundColor: colors.background }}>
            <ScrollView className='flex p-6'>
              <View className='flex'>
                {/* <View className='flex-row items-center gap-2'>
                  <Ionicons name='cart-outline' size={27} color={colors.headerText} />
                  <Text className='text-3xl font-NotoSansBold text-white'>Carts</Text>
                </View> */}
                <Text className='text-3xl font-NotoSansBold text-white'>Order Summary</Text>
              </View>
              <View className='flex mt-4'>
                {lineItems.map((item: LineItem, index: number) => (
                  <View key={index} className='w-full'>
                    <View className='flex-row border-b border-gray-200 items-center justify-between py-6'>
                      <View className='flex-row flex-1 gap-3'>
                        <Image
                          source={item.variant.product.images.edges[0]?.node.url}
                          style={{ width: 50, height: 50, borderRadius: 5, marginTop: 5 }}
                        />
                        <View className='flex-1'>
                          <Text className='text-lg font-NotoSansBold text-white'>{item.title}</Text>
                          {item.variant.title !== 'Default Title' && <Text className='text-lg text-white font-NotoSans'>{item.variant.title}</Text>}
                          <Text className='text-lg text-white font-NotoSans'>
                            ${parseFloat(item.variant.product.priceRange.minVariantPrice.amount).toFixed(2)}
                          </Text>
                          <TouchableOpacity className='mt-2' onPress={() => onPressRemove(item.id, item.variant.id)}>
                            <Text className='text-sm text-red-500 font-NotoSans'>DELETE</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                      <Text className='text-lg font-NotoSansBold text-white'>x {item.quantity}</Text>
                    </View>
                  </View>
                ))}
                <View className='flex mt-4'>
                  <View className='flex-row justify-between py-1'>
                    <Text className='text-lg font-NotoSansBold text-white'>Subtotal</Text>
                    <Text className='text-lg font-NotoSansBold text-white'>US ${parseFloat(data?.node?.totalPriceV2?.amount).toFixed(2)}</Text>
                  </View>
                  <View className='flex-row justify-between py-1'>
                    <Text className='text-lg font-NotoSans text-white'>Tax will be added at checkout</Text>
                    {/* <Text className='text-lg font-NotoSansBold text-white'>${data?.node?.totalTaxV2?.amount}</Text> */}
                  </View>
                  {/* <View className='flex-row justify-between py-1'>
                    <Text className='text-lg font-NotoSansBold text-white'>Total</Text>
                    <Text className='text-lg font-NotoSansBold text-white'>${data?.node?.totalPriceV2?.amount}</Text>
                  </View> */}
                </View>
              </View>
              <View className='h-36' />
            </ScrollView>
            <View className={`w-full p-4 absolute bottom-5 left-0 bg-black`}>
              <TouchableOpacity className='w-full items-center justify-center bg-white py-3 rounded-md' onPress={handleCheckout}>
                <Text className='text-lg font-NotoSansBold text-black'>{user ? 'Checkout' : 'Login to Checkout'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
        <BottomSheetModal
          ref={bottomSheetModalRef}
          style={{ flex: 1 }}
          // handleComponent={null}
          index={1}
          snapPoints={snapPoints}
          onChange={handleSheetChanges}
          backdropComponent={renderBackdrop}>
          <View className='flex-1'>
            {checkOutUrl && (
              <WebView source={{ uri: checkOutUrl }} style={{ flex: 1 }} onNavigationStateChange={handleWebViewNavigationStateChange} />
            )}
          </View>
        </BottomSheetModal>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
