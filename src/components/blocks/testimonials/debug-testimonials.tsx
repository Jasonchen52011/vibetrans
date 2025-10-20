'use client';

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

export default function DebugTestimonials({ namespace = 'GenAlphaTranslatorPage.testimonials' }) {
  const t = useTranslations(namespace as any);

  useEffect(() => {
    console.log('=== DEBUG TESTIMONIALS ===');
    console.log('Namespace:', namespace);

    try {
      // 测试各种字段
      const title = t('title');
      const subtitle = t('subtitle');
      console.log('Title:', title);
      console.log('Subtitle:', subtitle);

      // 测试 items 检查
      const firstItemName = t('items.item-1.name', { default: 'NOT_FOUND' });
      console.log('First item name:', firstItemName);

      const testItems = t.raw ? t.raw('items') : 'NO_RAW_METHOD';
      console.log('Raw items:', testItems);

      // 逐个测试每个item
      for (let i = 1; i <= 3; i++) {
        const key = `item-${i}`;
        const name = t(`items.${key}.name`, { default: `DEFAULT_${key}` });
        const role = t(`items.${key}.role`, { default: `DEFAULT_${key}` });
        const heading = t(`items.${key}.heading`, { default: `DEFAULT_${key}` });
        const content = t(`items.${key}.content`, { default: `DEFAULT_${key}` });
        const rating = String(t(`items.${key}.rating`, { default: 5 }));

        console.log(`${key}:`, {
          name,
          role,
          heading,
          content: content?.substring(0, 50) + '...',
          rating
        });
      }
    } catch (error) {
      console.error('Debug error:', error);
    }
    console.log('=== END DEBUG ===');
  }, [t, namespace]);

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <h4>Debug Testimonials</h4>
      <p>Namespace: {namespace}</p>
      <p>Check console for details</p>
    </div>
  );
}