import React, { useState } from 'react';
import { ShoppingCart, ExternalLink, Star, X } from 'lucide-react';
import styles from './ProductCard.module.css';

const DUMMY_PRODUCTS = [
  {
    id: 'p1',
    name: 'Bridgestone Potenza Sport',
    category: 'Ultra High Performance',
    price: '₹12,499',
    originalPrice: '₹15,200',
    rating: 4.8,
    reviews: 2341,
    image: '/product-tire.jpg',
    badge: 'Best Seller',
    url: 'https://www.bridgestone.com',
  },
  {
    id: 'p2',
    name: 'Bridgestone Turanza T005',
    category: 'Touring Comfort',
    price: '₹9,299',
    originalPrice: '₹11,000',
    rating: 4.7,
    reviews: 1820,
    image: '/product-tire.jpg',
    badge: 'New Arrival',
    url: 'https://www.bridgestone.com',
  },
  {
    id: 'p3',
    name: 'Bridgestone Ecopia EP300',
    category: 'Fuel Efficiency',
    price: '₹7,899',
    originalPrice: '₹9,500',
    rating: 4.6,
    reviews: 987,
    image: '/product-tire.jpg',
    badge: 'Eco Choice',
    url: 'https://www.bridgestone.com',
  },
  {
    id: 'p4',
    name: 'Bridgestone Dueler A/T',
    category: 'All-Terrain SUV',
    price: '₹16,800',
    originalPrice: '₹19,999',
    rating: 4.9,
    reviews: 3102,
    image: '/product-tire.jpg',
    badge: '16% Off',
    url: 'https://www.bridgestone.com',
  },
];

const ProductCard = ({ videoIndex = 0 }) => {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const product = DUMMY_PRODUCTS[videoIndex % DUMMY_PRODUCTS.length];

  const handleShopClick = (e) => {
    e.stopPropagation();
    window.open(product.url, '_blank', 'noopener');
  };

  const handleDismiss = (e) => {
    e.stopPropagation();
    setDismissed(true);
  };

  return (
    <div className={styles.card} onClick={(e) => e.stopPropagation()}>
      <button className={styles.dismiss} onClick={handleDismiss} aria-label="Dismiss">
        <X size={12} />
      </button>

      <span className={styles.badge}>{product.badge}</span>

      <div className={styles.imageWrapper}>
        <img className={styles.image} src={product.image} alt={product.name} draggable={false} />
      </div>

      <div className={styles.info}>
        <p className={styles.category}>{product.category}</p>
        <h4 className={styles.name}>{product.name}</h4>
        <div className={styles.rating}>
          <Star size={10} className={styles.star} />
          <span className={styles.ratingScore}>{product.rating}</span>
          <span className={styles.ratingCount}>({product.reviews.toLocaleString()})</span>
        </div>
        <div className={styles.priceRow}>
          <span className={styles.price}>{product.price}</span>
          <span className={styles.originalPrice}>{product.originalPrice}</span>
        </div>
      </div>

      <button className={styles.shopButton} onClick={handleShopClick}>
        <ShoppingCart size={13} />
        <span>Shop Now</span>
        <ExternalLink size={11} className={styles.extIcon} />
      </button>
    </div>
  );
};

export default React.memo(ProductCard);
