/**
 * Utility to check admin status and debug
 */

export const checkAdminStatus = (user: any) => {
  console.log('🔍 Admin Check Debug:');
  console.log('User:', user);
  console.log('User role:', user?.role);
  console.log('Is admin?', user?.role === 'admin');
  return user?.role === 'admin';
};
