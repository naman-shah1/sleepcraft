export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface Product {
  id: string;
  name: string;
  price?: number; // fallback for backwards compatibility
  mrp?: number;   // backend returns this
  category: string;
  description: string;
  image?: string;
  image_url?: string; // backend returns this
  discount?: number;
  in_stock?: boolean;
}

export interface CartItem {
  id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
}

export interface WishlistItem {
  id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  product_category: string;
  image?: string;
  in_stock: boolean;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    tokens: AuthTokens;
  };
  message?: string;
}

export interface CartResponse {
  success: boolean;
  data?: {
    cart_items: CartItem[];
    total_amount: number;
    item_count: number;
  };
  message?: string;
}

export interface WishlistResponse {
  success: boolean;
  data?: {
    wishlist_items: WishlistItem[];
    item_count: number;
  };
  message?: string;
}

export interface ProductsResponse {
  success: boolean;
  data?: {
    featured_products: Product[];
    categories: string[];
  };
  message?: string;
}

export interface SearchResponse {
  success: boolean;
  data?: {
    query: string;
    products: Product[];
    total_results: number;
    page: number;
    per_page: number;
    has_next: boolean;
    has_prev: boolean;
  };
  message?: string;
}

export interface ContactPageResponse {
  success: boolean;
  data?: {
    page: string;
    message: string;
  };
}

export interface PrivacyPageResponse {
  success: boolean;
  data?: {
    page: string;
    message: string;
  };
}

export interface TermsPageResponse {
  success: boolean;
  data?: {
    page: string;
    message: string;
  };
}

export interface SizeGuidePageResponse {
  success: boolean;
  data?: {
    page: string;
    message: string;
  };
}
