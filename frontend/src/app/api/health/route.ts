import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'production',
    service: 'RepairX Frontend',
    features: {
      'customer-portal': 'operational',
      'admin-dashboard': 'operational',
      'technician-mobile': 'operational',
      'business-management': 'operational'
    }
  });
}