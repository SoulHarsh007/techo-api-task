# techo-api-task

[![License](https://img.shields.io/badge/License-BSD%203--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/7ab9229259fb4b92908868fb29b1434a)](https://www.codacy.com/gh/SoulHarsh007/techo-api-task/dashboard?utm_source=github.com&utm_medium=referral&utm_content=SoulHarsh007/techo-api-task&utm_campaign=Badge_Grade)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/SoulHarsh007/techo-api-task.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/SoulHarsh007/techo-api-task/context:javascript)
[![Total alerts](https://img.shields.io/lgtm/alerts/g/SoulHarsh007/techo-api-task.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/SoulHarsh007/techo-api-task/alerts/)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

## Tools used

### Fastify

fastify is used for server

### Fastify Multipart

fastify-multipart is used for handling images uploaded via /info endpoint (Reference: `PostProdInfo.ts`)

### Mongodb

native mongodb driver is used for accessing mongodb

## Programming Language

### Typescript

#### Target: ES2020

Uses ES2020 as target in tsconfig to support LTS node.js version (ESNext doesn't work well with current LTS version of node.js)

## Endpoints Description

### /info

#### Supported request types

**GET**

**Required Query Parameters**

productName - Name of the product

example url: `%Base_URL%/info?productName=Test`

**Response**

Type: json

Response body has these fields on successful request (if product was found):

result: string  
product: Object  
product.productName: string  
product.productDesc: string  
product.productQty: integer  
product.productPrice: float  
product.productImage: string

Example Response:

```json
{
  "result": "Product found!",
  "product": {
    "productName": "Test Product",
    "productDesc": "A Super Cool Test Product!",
    "productQty": 10,
    "productPrice": 10000,
    "productImage": "TestProduct.png"
  }
}
```

Response body has these fields on a failed request (if product was **NOT** found):

error: string

Example Response:

```json
{
  "error": "Product not found!"
}
```

**POST**

**Required Body Parameters**

Must be multipart request with these as text fields:  
prod_name - product name  
prod_desc - product description  
prod_quantity - product quantity (integer)  
prod_price - product price (float or integer)

and should have only one product image field with _any_ name

**Response**

Type: json

Response body has these fields on successful request (if product was added):

result: string  
product: Object  
product.productName: string  
product.productDesc: string  
product.productQty: integer  
product.productPrice: float  
product.productImage: string

Example Response:

```json
{
  "result": "Product added!",
  "product": {
    "productName": "Test Product",
    "productDesc": "A Super Cool Test Product!",
    "productQty": 10,
    "productPrice": 10000,
    "productImage": "TestProduct.png"
  }
}
```

Response body has these fields on a failed request (if product was **NOT** added due to bad input / request):

error: string

Example Response:

```json
{
  "error": "Missing Product Image"
}
```

### /cart

**Supported request types**

**GET**

**Required Query Parameters**

user: string - unique user id of the user

example url: `%Base_URL%/cart?user=007_Totally_A_Real_UUID`

**Response**

Type: json

Response body has these fields on successful request (if user's cart was found):

result: string  
cart: {  
productName: string  
productQty: integer  
}[]

Example:

```json
{
  "result": "User cart found!",
  "cart": [
    {
      "productName": "Test Product",
      "productQty": 4
    },
    {
      "productName": "Test Product 007",
      "productQty": 7
    }
  ]
}
```

Response body has these fields on a failed request (if user's cart was **NOT** found, missing user field):

error: string

```json
{
  "error": "Missing User Field!"
}
```

Response body has these fields on a failed request (if user's cart was **NOT** found, user not found):

error: string

```json
{
  "error": "User Not Found!"
}
```

**POST**

**Required Body Parameters**

Must be JSON type:

user: string - unique user id of the user  
productName: string - name of the product  
productQty: integer - quantity of product

**Response**

Type: json

Response body has these fields on successful request (if product was added to user's cart):

result: string  
cart: {  
productName: string  
productQty: integer  
}[]

Example:

```json
{
  "result": "Product added!",
  "cart": [
    {
      "productName": "Test Product",
      "productQty": 4
    },
    {
      "productName": "Test Product 007",
      "productQty": 7
    }
  ]
}
```

Response body has these fields on a failed request (if product was **NOT** added to user's cart, missing fields):

error: string

```json
{
  "error": "Missing fields!"
}
```

Response body has these fields on a failed request (if product was **NOT** added to user's cart, user not found):

error: string

```json
{
  "error": "User Not Found!"
}
```

#### Additional Information

##### Automatically adds up product quantity if same product was added to the cart again

## Tested On

### OS: Arch Linux (kernel: 5.11.14-zen1-1-zen)

### Node: 14.16.1

### Yarn: 1.22.10

### Typescript: 4.2.4

### Fastify: 3.14.2

### Fastify Multipart: 4.0.3

### Mongodb: 3.6.6
