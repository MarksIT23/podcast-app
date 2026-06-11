import { NextResponse } from 'next/server';

// In a real app this would use bcrypt against a database or environment variable
const MOCK_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export async function POST(request) {
  try {
    const { password } = await request.json();
    
    if (password === MOCK_ADMIN_PASSWORD) {
      return NextResponse.json({ success: true, token: 'mock-admin-token-xyz' });
    } else {
      return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 });
    }
  } catch (err) {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}
