import { gql } from '@apollo/client';

export const CREATE_CUSTOMER = gql`
  mutation CreateCustomer($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
        email
        acceptsMarketing
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

export const DELETE_CUSTOMER = gql`
  mutation DeleteCustomer($id: ID!) {
    customerDelete(id: $id) {
      deletedCustomerId
      userErrors {
        field
        message
      }
    }
  }
`;

export const UPDATE_CUSTOMER = gql`
  mutation UpdateCustomer($input: CustomerInput!) {
    customerUpdate(input: $input) {
      customer {
        id
        firstName
        lastName
        email
        metafields(first: 10) {
          edges {
            node {
              id
              namespace
              key
              value
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const UPDATE_LINE_ITEM_QUANTITY = gql`
  mutation UpdateLineItemQuantity($checkoutId: ID!, $lineItems: [CheckoutLineItemUpdateInput!]!) {
    checkoutLineItemsUpdate(checkoutId: $checkoutId, lineItems: $lineItems) {
      checkout {
        id
        lineItems(first: 250) {
          edges {
            node {
              id
              title
              quantity
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const REMOVE_LINE_ITEM = gql`
  mutation RemoveLineItem($checkoutId: ID!, $lineItemIds: [ID!]!) {
  checkoutLineItemsRemove(checkoutId: $checkoutId, lineItemIds: $lineItemIds) {
    checkout {
      id
      lineItems(first: 250) {
        edges {
          node {
            id
            title
            quantity
          }
        }
      }
    }
    userErrors {
      field
      message
    }
  }
}
`;

export const COMPLETE_CHECKOUT = gql`
  mutation completeCheckout($checkoutId: ID!) {
    checkoutComplete(checkoutId: $checkoutId) {
      checkout {
        id
        completedAt
        order {
          id
          orderNumber
          totalPriceV2 {
            amount
            currencyCode
          }
        }
      }
      checkoutUserErrors {
        code
        field
        message
      }
    }
  }
`;

export const GET_CUSTOMER_ACCESS_TOKEN = gql`
  mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;