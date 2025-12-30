const config = {
  // Base API URL
  // API_BASE_URL:  'http://185.105.239.235:8000',
  API_BASE_URL:  'http://127.0.0.1:8000',
  
  // API Endpoints
  endpoints: {
    // Auth
    AUTH: {
      LOGIN: '/user/signin/',
      VERIFY_OTP: '/user/signin/code/',
      REFRESH_TOKEN: '/user/token/refresh/',
      ROLE_REQUEST: '/user/role-request/',
      ROLE_STATUS: '/user/role-request/status/',
    },
    
    // Wholesaler
    WHOLESALER: {
      BASE: '/wholesaler/',
      PRODUCTS: '/wholesaler/products/',
      PRODUCT_LIST: '/wholesaler/product/list/',
      CATEGORY_PRODUCTS: '/wholesaler/product-category/',
      CATEGORY_PRODUCT_LIST: '/wholesaler/product-category/list/',
      CATEGORY_PRODUCT_ADD: '/wholesaler/product-category/add/',
      ANNOUNCEMENTS: '/wholesaler/announcements/',
    },
    
    // Seller
    SELLER: {
      BASE: '/seller/',
      SEARCH: '/seller/search/',
      BRANDS: '/seller/brands/',
      PRODUCTS: '/seller/products/',
    },

    // Product
    PRODUCT: {
      CATEGORIES: '/product/categories-list/',
      SUBCATEGORIES: '/product/subcategories/',
      SEARCH: '/product/search/',
      BRANDS: '/product/brands-list/',
      COLORS: '/product/colors-list/',
      DETAIL: '/product/detail/',
      DETAIL_SLUG: '/product/detail/slug/',
    },

    // Announcement
    ANNOUNCEMENT: {
      MESSAGES: '/announcement/messages/',
      NOTIFICATIONS: '/announcement/notifications/',
      UNREAD_COUNT: '/announcement/notifications/unread-count/',
      MARK_ALL_READ: '/announcement/notifications/mark-all-read/',
    },
    
    // Media
    MEDIA: {
      UPLOAD: '/media/upload/',
    },
  },
  
  // Helper function to get full URL
  getUrl: function(endpoint) {
    // If the endpoint already has http(s)://, return as is
    if (/^https?:\/\//.test(endpoint)) {
      return endpoint;
    }
    
    // Otherwise, prepend the base URL
    const baseUrl = this.API_BASE_URL.endsWith('/') 
      ? this.API_BASE_URL.slice(0, -1) 
      : this.API_BASE_URL;
      
    const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${baseUrl}${formattedEndpoint}`;
  },
};

export default config;
