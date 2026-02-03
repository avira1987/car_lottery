import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import faMessages from '../messages/fa.json';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }
  
  // Use static import instead of dynamic import
  const messages = locale === 'fa' ? faMessages : faMessages;
  
  return {
    locale,
    messages,
  };
});
