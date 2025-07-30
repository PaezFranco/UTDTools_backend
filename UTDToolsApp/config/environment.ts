// // config/environment.ts
// export const API_CONFIG = {
//   BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://192.168.100.18:3000',
//   ENDPOINTS: {
//     MOBILE_LOGIN: '/api/students/mobile-login',
//     STUDENT_BY_EMAIL: '/api/students/by-email',
//     ACTIVE_LOANS: '/api/loans/active',
//     BASIC_LOANS_TEST: '/api/loans/basic-test',
//     TOOLS_PUBLIC: '/api/tools/public/inventory',
//     TOOLS_SEARCH: '/api/tools/students/search',
//     TOOLS_BY_CATEGORY: '/api/tools/students/category'
//   }
// };

// export const API_CONFIG = {
//   BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://192.168.100.18:3000',
//   ENDPOINTS: {
//     MOBILE_LOGIN: '/api/students/mobile-login',
//     MOBILE_REGISTER: '/api/students/mobile/register',
//     STUDENT_BY_EMAIL: '/api/students/by-email',
//     ACTIVE_LOANS: '/api/loans/active',
//     LOAN_HISTORY: '/api/loans/history',
//     BASIC_LOANS_TEST: '/api/loans/basic-test',
//     TOOLS_PUBLIC: '/api/tools/public/inventory',
//     TOOLS_SEARCH: '/api/tools/students/search',
//     TOOLS_BY_CATEGORY: '/api/tools/students/category'
//   }
// }

export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://192.168.100.18:3000',
  ENDPOINTS: {
    MOBILE_LOGIN: '/api/students/mobile-login',
    MOBILE_REGISTER: '/api/students/mobile/register',
    FORGOT_PASSWORD: '/api/students/forgot-password',
    STUDENT_BY_EMAIL: '/api/students/by-email',
    ACTIVE_LOANS: '/api/loans/active',
    LOAN_HISTORY: '/api/loans/history',
    BASIC_LOANS_TEST: '/api/loans/basic-test',
    TOOLS_PUBLIC: '/api/tools/public/inventory',
    TOOLS_SEARCH: '/api/tools/students/search',
    TOOLS_BY_CATEGORY: '/api/tools/students/category'
  }
};