import { Client } from '@notionhq/client';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// 웹훅 시그니처 검증을 위한 함수
function verifyWebhookSignature(signature, body) {
  const crypto = require('crypto');
  const secret = process.env.NOTION_WEBHOOK_SECRET;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(body));
  const calculatedSignature = hmac.digest('hex');
  return signature === calculatedSignature;
}

export default async function handler(req, res) {
  // POST 요청만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // 웹훅 시그니처 검증
  const signature = req.headers['x-notion-signature'];
  if (!verifyWebhookSignature(signature, req.body)) {
    return res.status(401).json({ message: 'Invalid signature' });
  }

  try {
    // 웹훅 이벤트 처리
    const { type, payload } = req.body;

    // 데이터베이스 업데이트 이벤트인 경우에만 처리
    if (type === 'database.updated' || type === 'page.updated') {
      // 동기화 함수 실행
      await syncData();
      return res.status(200).json({ message: 'Sync completed successfully' });
    }

    return res.status(200).json({ message: 'Event received but not processed' });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 