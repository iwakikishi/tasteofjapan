import { Text, ScrollView, TouchableOpacity, View } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCart } from '@/context/CartContext';
import ReadMore from '@fawazahmed/react-native-read-more';
import { useQuery } from '@apollo/client';
import { GET_COLLECTION_BY_ID } from '@/graphql/queries';
import Ionicons from '@expo/vector-icons/Ionicons';

interface PriceRange {
  minVariantPrice: {
    amount: string;
    currencyCode: string;
  };
}

interface Product {
  __typename: 'Product';
  id: string;
  title: string;
  description: string;
  vendor: string;
  images: Image;
  priceRange: PriceRange;
}

interface ProductEdge {
  __typename: 'ProductEdge';
  node: Product;
}

export default function PreOrderHorizontalScrollView({
  category,
  color,
  pl,
  price,
}: {
  category: string;
  color: string;
  pl: number;
  price: boolean;
}) {
  const router = useRouter();
  const { tempCart } = useCart();
  const [data, setData] = useState<ProductEdge[]>([]);

  const {
    data: collectionData,
    loading,
    error,
  } = useQuery(GET_COLLECTION_BY_ID, {
    variables: { id: category === 'Food' ? 'gid://shopify/Collection/331376853167' : 'gid://shopify/Collection/331631657135' },
  });

  const updateProductData = useCallback(() => {
    if (collectionData?.collection?.products?.edges) {
      setData(collectionData.collection.products.edges);
    }
  }, [collectionData]);

  useEffect(() => {
    updateProductData();
  }, [updateProductData]);

  if (error) {
    console.error(error);
    return null;
  }

  const onPressProduct = (product: ProductEdge) => {
    router.navigate({
      pathname: '/product-detail',
      params: { productId: product.node.id },
    });
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className='flex mt-5'>
      <View className='flex flex-row gap-4 pl-4'>
        {data?.map((product) => {
          const quantityOfProduct = tempCart.lineItems.reduce((total, item) => {
            if (item.productId === product.node.id) {
              return total + item.quantity;
            }
            return total;
          }, 0);
          return (
            <TouchableOpacity
              key={product.node.id}
              className={`flex w-[240px] rounded-xl overflow-hidden ${color && 'bg-white'} ${color && 'pb-2'} `}
              onPress={() => onPressProduct(product)}>
              {product.node.images && product.node.images.edges[0] && (
                <View className='flex w-full relative'>
                  <Image
                    source={product.node.images.edges[0].node.url}
                    contentFit='cover'
                    style={{
                      width: '100%',
                      height: 150,
                      borderRadius: 10,
                      borderBottomLeftRadius: color ? 0 : 10,
                      borderBottomRightRadius: color ? 0 : 10,
                    }}
                  />
                  <View className='absolute top-0 right-0 bg-red-500/80 px-4 py-1 rounded-bl-xl'>
                    <Text className='text-white font-NotoSansBold text-md'>1000 pts</Text>
                  </View>
                </View>
              )}
              <View className={`flex mt-2 gap-1 ${color && 'px-2'}`}>
                <Text className={`text-${color ? 'black' : 'white'} text-lg font-NotoSansBold`} numberOfLines={2}>
                  {product.node.title}
                </Text>
                <ReadMore numberOfLines={2} style={{ color: color ? 'black' : 'white', fontFamily: 'NotoSans', fontSize: 13 }}>
                  {product.node.description}
                </ReadMore>
                {price && (
                  <View className='flex-row justify-between items-baseline mt-2'>
                    <Text className='text-slate-700 text-lg font-NotoSansBold'>
                      ${parseFloat(product.node.priceRange.minVariantPrice.amount).toFixed(2)}
                    </Text>
                    {quantityOfProduct > 0 && (
                      <View className={`flex-row px-2 py-0.5 bg-red-600 rounded-full justify-between items-center`}>
                        <Ionicons name='cart' color='white' size={18} />
                        <Text className='text-white text-md font-NotoSansBold'> {quantityOfProduct}</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}
