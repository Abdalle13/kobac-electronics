const products = [
  {
    name: 'iPhone 15 Pro Max',
    images: ['/images/iphone.jpg'],
    description: 'The ultimate iPhone with titanium design and A17 Pro chip.',
    brand: 'Apple',
    category: 'Phone',
    price: 1199.99,
    countInStock: 20,
    technicalSpecs: {
      screenSize: '6.7 inches',
      storage: '256GB',
      ram: '8GB',
      camera: '48MP Main',
    },
  },
  {
    name: 'MacBook Pro 16-inch',
    images: ['/images/macbook.jpg'],
    description: 'Supercharged by M3 Max for the ultimate pro experience.',
    brand: 'Apple',
    category: 'Laptop',
    price: 2499.99,
    countInStock: 10,
    technicalSpecs: {
      screenSize: '16.2 inches',
      storage: '1TB SSD',
      ram: '36GB',
      processor: 'Apple M3 Max',
    },
  },
  {
    name: 'Samsung Galaxy Watch 6',
    images: ['/images/watch.jpg'],
    description: 'Advanced health features and elegant design.',
    brand: 'Samsung',
    category: 'Watch',
    price: 349.99,
    countInStock: 15,
    technicalSpecs: {
      screenSize: '1.4 inches',
      battery: '425mAh',
      compatibility: 'Android',
    },
  },
];

export default products;
