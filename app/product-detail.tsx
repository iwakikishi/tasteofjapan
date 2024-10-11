import React, { useCallback, useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { Text, TouchableOpacity, View, ScrollView, ActivityIndicator, SafeAreaView, StatusBar } from 'react-native';
import { VendorCarousel } from '@/components/VendorCarousel';
import { useQuery } from '@apollo/client';
import { GET_PRODUCT_BY_ID } from '@/graphql/queries';
import ReadMore from '@fawazahmed/react-native-read-more';
import Ionicons from '@expo/vector-icons/Ionicons';

type MoneyV2 = {
  amount: string;
  currencyCode: string;
};

type ProductVariant = {
  __typename: 'ProductVariant';
  id: string;
  price: MoneyV2;
  title: string;
};

type ProductVariantEdge = {
  __typename: 'ProductVariantEdge';
  node: ProductVariant;
};

type ProductVariantConnection = {
  __typename: 'ProductVariantConnection';
  edges: ProductVariantEdge[];
  quantityAvailable: number;
};

type ImageEdge = {
  node: {
    url: string;
    altText?: string;
  };
};

type ImageConnection = {
  __typename: 'ImageConnection';
  edges: ImageEdge[];
};

type Product = {
  __typename: 'Product';
  id: string;
  title: string;
  description: string;
  handle: string;
  images: ImageConnection;
  priceRange: {
    __typename: 'ProductPriceRange';
    minVariantPrice: MoneyV2;
  };
  variants: ProductVariantConnection;
};

type Variant = {
  id: string;
  title: string;
  validDate?: string;
  price: {
    amount: string;
  };
  quantityAvailable: number;
  quantityInCart: number;
};

export default function ProductDetailPage() {
  const router = useRouter();
  const { colors } = useTheme();
  const { tempCart, setTempCart } = useCart();
  const { user } = useAuth();
  const { productId } = useLocalSearchParams();

  const [variants, setVariants] = useState<Variant[]>([]);
  const [showLoading, setShowLoading] = useState(false);

  const { data, loading, error } = useQuery(GET_PRODUCT_BY_ID, {
    variables: { id: productId },
  });

  const product = data?.product;

  useEffect(() => {
    if (data && data.product && data.product.variants && data.product.variants.edges.length > 0) {
      setVariants(
        data.product.variants.edges.map((edge: any) => ({
          id: edge.node.id,
          title: edge.node.title,
          price: edge.node.price,
          quantityAvailable: edge.node.quantityAvailable,
          quantityInCart: tempCart.lineItems.find((item) => item.variantId === edge.node.id)?.quantity || 0,
          validDate: edge.node.title.includes('12/14') ? '2024-12-14' : edge.node.title.includes('12/15') ? '2024-12-15' : '',
        }))
      );
    }
  }, [data]);

  const onPressAdd = useCallback((variantId: string, quantityAvailable: number, orderQuantity: number) => {
    setVariants((prevVariants) =>
      prevVariants.map((variant) => {
        if (variant.id === variantId) {
          const newQuantityInCart = (variant.quantityInCart || 0) + 1;
          const isQuantityAvailable = variant.quantityAvailable - newQuantityInCart > 0;

          if (isQuantityAvailable) {
            return {
              ...variant,
              quantityAvailable: variant.quantityAvailable - 1,
              quantityInCart: newQuantityInCart,
            };
          }
        }
        return variant;
      })
    );
  }, []);

  const onPressRemove = useCallback((variantId: string) => {
    setVariants((prevVariants) =>
      prevVariants.map((variant) =>
        variant.id === variantId && (variant.quantityInCart || 0) > 0
          ? {
              ...variant,
              quantityAvailable: variant.quantityAvailable + 1,
              quantityInCart: (variant.quantityInCart || 0) - 1,
            }
          : variant
      )
    );
  }, []);

  interface LineItem {
    productId: string;
    variantId: string;
    quantity: number;
    validDate: string;
  }

  const onPressAddToCart = async () => {
    setTempCart((prevCart) => {
      const newLineItems = prevCart.lineItems.reduce<LineItem[]>((acc, item: LineItem) => {
        // Find a matching variant for each item in prevCart
        const matchingVariant = variants.find((v) => v.id === item.variantId);

        if (matchingVariant) {
          if (matchingVariant.quantityInCart > 0) {
            // If quantityInCart is greater than 0, update the quantity and add to the new array
            acc.push({
              variantId: item.variantId,
              quantity: matchingVariant.quantityInCart,
              productId: item.productId,
              validDate: matchingVariant.validDate ?? '',
            } as const);
          }
          // If quantityInCart is 0, this item is not added (effectively removed)
        } else {
          // If no matching variant is found, keep the item as is
          acc.push(item);
        }

        return acc;
      }, []);

      // Add items from variants that are not yet in newLineItems
      variants.forEach((variant) => {
        if (variant.quantityInCart > 0 && !newLineItems.some((item) => item.variantId === variant.id)) {
          newLineItems.push({
            productId: product.id,
            variantId: variant.id,
            quantity: variant.quantityInCart,
            validDate: variant.validDate ?? '',
          } as const);
        }
      });

      return { ...prevCart, lineItems: newLineItems };
    });
    router.back();
  };

  if (loading) return <Text className='text-white'>Loading...</Text>;
  if (error) return <Text className='text-white'>Error: {error.message}</Text>;
  if (!data || !data.product) return <Text className='text-white'>No product data available</Text>;

  if (showLoading) {
    return (
      <View className='flex-1 justify-center items-center bg-black'>
        <ActivityIndicator size='large' color='white' />
      </View>
    );
  }

  const TICKET_PRODUCT_ID = 'gid://shopify/Product/8059502919855';
  const isAdmissionTicketInCart = tempCart.lineItems.some((item) => item.productId === TICKET_PRODUCT_ID);
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

  return (
    <>
      <SafeAreaView className='flex-1' style={{ backgroundColor: colors.background }}>
        <View className='flex-1 z-50 -mt-28' style={{ backgroundColor: colors.background }}>
          <ScrollView className='flex' showsVerticalScrollIndicator={false}>
            <View className='flex flex-col gap-4'>
              <View className='flex'>
                <VendorCarousel images={product.media.edges.map((edge: any) => edge.node.image)} />
              </View>
              <View className='flex px-4 gap-4'>
                <Text className='text-white text-2xl font-NotoSansBold'>{product.title}</Text>
                <ReadMore
                  numberOfLines={3}
                  style={{ color: '#ccc', fontFamily: 'NotoSans', fontSize: 14 }}
                  seeMoreStyle={{ color: '#fff', fontFamily: 'NotoSansBold', fontSize: 14 }}
                  seeLessStyle={{ color: '#fff', fontFamily: 'NotoSansBold', fontSize: 14 }}>
                  {product.description}
                </ReadMore>
                {!user?.hasTickets && !isAdmissionTicketInCart && (
                  <Text className='text-lime-400 text-lg font-NotoSans'>
                    It appears you haven't purchased admission tickets yet. We kindly request that you obtain your tickets before proceeding.
                  </Text>
                )}
              </View>

              <View className={`flex px-4 gap-4 ${!user?.hasTickets && !isAdmissionTicketInCart ? 'opacity-40' : ''}`}>
                {variants.length === 1 ? (
                  <>
                    <Text className='text-white text-xl font-NotoSans'>${parseFloat(product.priceRange.minVariantPrice.amount).toFixed(2)}</Text>
                    {variants[0].quantityAvailable === 0 ? (
                      <Text className='text-white text-xl font-NotoSans'>Sold out</Text>
                    ) : variants[0].quantityAvailable > 0 && variants[0].quantityAvailable < 10 ? (
                      <Text className='text-white text-xl font-NotoSans'>
                        Order limit: <Text className='text-white text-xl font-bold'>{variants[0].quantityAvailable}</Text>
                      </Text>
                    ) : null}
                  </>
                ) : (
                  <View className='flex flex-col mt-5'>
                    <View className='flex-row items-center gap-2'>
                      <Ionicons name='time' color='white' size={24} />
                      <Text className='text-white text-2xl font-NotoSansBold'>Pickup Options</Text>
                    </View>
                    {variants.map((variant: Variant) => {
                      let isValid = false;
                      if (variant.title.includes('12/14') && TICKET_VALID_DATE.includes('2024-12-14')) {
                        isValid = true;
                      } else if (variant.title.includes('12/15') && TICKET_VALID_DATE.includes('2024-12-15')) {
                        isValid = true;
                      }
                      return (
                        <View
                          key={variant.id}
                          className={`flex-row justify-between items-center py-5 border-b border-slate-700 ${!isValid ? 'opacity-50' : ''}`}>
                          <View className={`w-2/3 gap-1 mr-4 ${variant.quantityAvailable === 0 ? 'opacity-50' : ''}`}>
                            <Text className='text-white text-xl font-NotoSansBold'>{variant.title}</Text>
                            <Text className='text-white text-xl font-NotoSans'>${parseFloat(variant.price.amount).toFixed(2)}</Text>
                            {variant.quantityAvailable === 0 ? (
                              <Text className='text-white text-xl font-NotoSans'>Sold out</Text>
                            ) : variant.quantityAvailable > 0 && variant.quantityAvailable < 10 ? (
                              <Text className='text-white text-xl font-NotoSans'>
                                Order limit: <Text className='text-white text-xl font-bold'>{variant.quantityAvailable}</Text>
                              </Text>
                            ) : null}
                          </View>
                          <View className='w-1/3 h-10 items-center justify-between px-3'>
                            {!variant.quantityInCart ? (
                              <TouchableOpacity
                                className={`absolute top-1/2 -translate-y-1/2 right-0 w-10 h-10 bg-white rounded-full items-center justify-center ${
                                  variant.quantityAvailable === 0 ? 'opacity-50' : ''
                                }`}
                                onPress={() => onPressAdd(variant.id, variant.quantityAvailable, variant.quantityInCart)}
                                disabled={variant.quantityAvailable === 0 || !isValid}>
                                <Ionicons name='add' color='black' size={24} />
                              </TouchableOpacity>
                            ) : (
                              <View className='w-full flex-row absolute top-1/2 -translate-y-1/2 right-0 rounded-full h-10 bg-white items-center justify-between px-3'>
                                <TouchableOpacity className='items-center justify-center' onPress={() => onPressRemove(variant.id)}>
                                  <Ionicons name={variant.quantityInCart === 1 ? 'trash-bin' : 'remove'} color='black' size={18} />
                                </TouchableOpacity>
                                <View className='items-center justify-center'>
                                  <Text className='text-black text-xl font-bold text-center'>{variant.quantityInCart}</Text>
                                </View>
                                <TouchableOpacity
                                  className={`items-center justify-center ${
                                    variant.quantityAvailable - variant.quantityInCart === 0 ? 'opacity-50' : ''
                                  }`}
                                  onPress={() =>
                                    variant.quantityAvailable - variant.quantityInCart === 0
                                      ? null
                                      : onPressAdd(variant.id, variant.quantityAvailable, variant.quantityInCart)
                                  }
                                  disabled={variant.quantityAvailable === 0 || !isValid}>
                                  <Ionicons name='add' color='black' size={18} />
                                </TouchableOpacity>
                              </View>
                            )}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            </View>
            <View className='h-36' />
          </ScrollView>
          {!user?.hasTickets && !isAdmissionTicketInCart ? (
            <View className='flex w-full bg-black absolute bottom-0 p-4 justify-center items-center'>
              <Link href='/(tabs)/(tab1)/ticket' asChild>
                <TouchableOpacity className={`bg-white animate-fade-in py-3 rounded-md w-full`}>
                  <Text className='text-slate-700 text-center text-xl font-NotoSansBold'>Find Admission Tickets</Text>
                </TouchableOpacity>
              </Link>
            </View>
          ) : (
            <View className='flex w-full bg-black absolute bottom-0 p-4 justify-center items-center'>
              <TouchableOpacity className={`bg-white animate-fade-in py-3 rounded-md w-full`} onPress={onPressAddToCart}>
                <Text className='text-slate-700 text-center text-xl font-NotoSansBold'>Add to cart</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>
    </>
  );
}
