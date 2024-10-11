import { Text, ScrollView, TouchableOpacity, View } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import ReadMore from '@fawazahmed/react-native-read-more';
import { useQuery } from '@apollo/client';
import { GET_COLLECTION_BY_ID } from '@/graphql/queries';

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

export default function PreOrderHorizontalScrollView({ category }: { category: string }) {
  const router = useRouter();
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
      {data?.map((product) => (
        <TouchableOpacity key={product.node.id} className='w-[70vw] h-auto rounded-xl overflow-hidden pl-4' onPress={() => onPressProduct(product)}>
          {product.node.images && product.node.images.edges[0] && (
            <View className='flex w-full relative'>
              <Image source={product.node.images.edges[0].node.url} contentFit='cover' style={{ width: '100%', height: 180, borderRadius: 10 }} />
              <View className='absolute top-0 right-0 bg-red-500 px-4 py-1 rounded-bl-lg'>
                <Text className='text-white font-NotoSansBold text-md'>1000 pts</Text>
              </View>
            </View>
          )}
          <View className='flex mt-2 gap-1'>
            <Text className='text-white text-lg font-NotoSansBold'>{product.node.title}</Text>
            <ReadMore numberOfLines={2} style={{ color: 'white', fontFamily: 'NotoSans', fontSize: 13 }}>
              {product.node.description}
            </ReadMore>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
