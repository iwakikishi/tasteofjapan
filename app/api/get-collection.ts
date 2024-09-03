export async function getCollection(collectionHandle: string) {
  if (!collectionHandle) {
    throw new Error('コレクションハンドルが必要です');
  }

  try {
    const response = await fetch(`https://${process.env.SHOPIFY_STORE_DOMAIN}/api/2023-10/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || '',
      },
      body: JSON.stringify({
        query: `
          query getCollection($handle: String!) {
            collection(handle: $handle) {
              id
              title
              description
              products(first: 10) {
                edges {
                  node {
                    id
                    title
                    description
                    priceRange {
                      minVariantPrice {
                        amount
                      }
                    }
                    images(first: 1) {
                      edges {
                        node {
                          url
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        `,
        variables: {
          handle: collectionHandle,
        },
      }),
    });

    const data = await response.json();

    if (data.errors) {
      throw new Error(data.errors[0].message);
    }
    console.log(data.data.collection);
    return data.data.collection;
  } catch (error) {
    console.error('Shopifyからのデータ取得に失敗しました:', error);
    throw new Error('データ取得中にエラーが発生しました');
  }
}

