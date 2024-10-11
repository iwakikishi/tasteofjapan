import { gql } from '@apollo/client';

export const GET_PRODUCT_BY_ID = gql`
  query GetProductById($id: ID!) {
    product(id: $id) {
      id
      title
      description
      handle
      images(first: 1) {
        edges {
          node {
            url
            altText
          }
        }
      }
      media(first: 10) {
        edges {
          node {
            ... on MediaImage {
              id
              image {
                originalSrc
                altText
              }
            }
            ... on Video {
              id
              sources {
                url
                mimeType
              }
            }
            ... on ExternalVideo {
              id
              embedUrl
            }
            ... on Model3d {
              id
              sources {
                url
                mimeType
              }
            }
          }
        }
      }
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      variants(first: 100) {
        edges {
          node {
            id
            title
            price {
              amount
              currencyCode
            }
            quantityAvailable
          }
        }
      }
    }
  }
`;

export const GET_COLLECTION_BY_ID = gql`
  query GetCollectionById($id: ID!) {
    collection(id: $id) {
      id
      title
      handle
      image {
        url
        altText
      }
      products(first: 10) {
        edges {
          node {
            id
            title
            description
            vendor
            images(first: 1) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  }
`;

export const GET_PRODUCT_AND_COLLECTIONS = gql`
  query GetProductAndCollections($productId: ID!, $collectionIds: [ID!]!) {
    product(id: $productId) {
      id
      title
      description
      handle
      images(first: 10) {
        edges {
          node {
            url
            altText
          }
        }
      }
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      variants(first: 100) {
        edges {
          node {
            id
            title
            price {
              amount
              currencyCode
            }
            quantityAvailable
          }
        }
      }
    }
    collections: nodes(ids: $collectionIds) {
      ... on Collection {
        id
        handle
        products(first: 100) {
          edges {
            node {
              id
              title
              description
              images(first: 1) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              variants(first: 100) {
                edges {
                  node {
                    id
                    title
                    price {
                      amount
                      currencyCode
                    }
                    quantityAvailable
                  }
                }
              }   
            }
          }
        }
      }
    }
  }
`;

export const GET_CHECKOUT_BY_ID = gql`
  query getCheckoutById($checkoutId: ID!) {
    node(id: $checkoutId) {
      ... on Checkout {
        id
        totalPriceV2 {
          amount
          currencyCode
        }
        subtotalPriceV2 {
          amount
          currencyCode
        }
        totalTaxV2 {
          amount
          currencyCode
        }
        lineItems(first: 250) {
          edges {
            node {
              id
              title
              variant {
                id
                title
                sku
                product {
                  id
                  title
                  tags
                  priceRange {
                    minVariantPrice {
                      amount
                      currencyCode
                    }
                  }
                  images(first: 1) {
                    edges {
                      node {
                        url
                        altText
                      }
                    }
                  }
                  collections(first: 10) {
                    edges {
                      node {
                        id
                        title
                      }
                    }
                  }
                }
              }
              quantity
              customAttributes {
                key
                value
              }
            }
          }
        }
      }
    }
  }
`;

export const GET_ORDER_BY_ID = gql`
  query GetOrderById($id: ID!) {
    order(id: $id) {
      id
      totalPriceV2 {
        amount
        currencyCode
      }
      lineItems(first: 10) {
        edges {
          node {
            title
            quantity
            variant {
              price {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  }
`;

export const GET_CUSTOMER_BY_EMAIL = gql`
  query GetCustomerByEmail($email: String!) {
    customers(first: 1, query: $email) {
      edges {
        node {
          id
          email
          firstName
          lastName
        }
      }
    }
  }
`;

export const GET_ORDERS_BY_IDS = gql`
  query GetOrdersByIds($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Order {
        id
        name
        totalPriceV2 {
          amount
          currencyCode
        }
        financialStatus
        lineItems(first: 5) {
          edges {
            node {
              title
              quantity
            }
          }
        }
      }
    }
  }
`;

export const GET_CUSTOMER_ORDERS = gql`
  query GetCustomerOrders($customerId: ID!, $first: Int!) {
    customer(id: $customerId) {
      id
      displayName
      orders(first: $first, sortKey: CREATED_AT, reverse: true) {
        edges {
          node {
            id
            name
            createdAt
            displayFinancialStatus
            totalPriceSet {
              shopMoney {
                amount
                currencyCode
              }
            }
            lineItems(first: 5) {
              edges {
                node {
                  title
                  quantity
                }
              }
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

