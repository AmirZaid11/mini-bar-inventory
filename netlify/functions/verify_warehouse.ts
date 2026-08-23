import { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const { warehouseId } = JSON.parse(event.body || '{}');

    if (!warehouseId || typeof warehouseId !== 'string') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Warehouse ID is required.' }),
      };
    }

    const expectedWarehouseId = process.env.WAREHOUSE_ID || 'ERNEST';
    if (warehouseId.trim().toUpperCase() !== expectedWarehouseId.toUpperCase()) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid Warehouse ID. Access denied.' }),
      };
    }

    // Config variables
    const firebaseConfig = {
      apiKey: process.env.FIREBASE_API_KEY || '',
      authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
      projectId: process.env.FIREBASE_PROJECT_ID || '',
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
      appId: process.env.FIREBASE_APP_ID || ''
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        firebaseConfig
      }),
    };
  } catch (error: any) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
