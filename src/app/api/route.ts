// src/app/api/route.ts

import { NextResponse } from 'next/server';
import connectMongo from '@/lib/conn';

export async function GET() {
  await connectMongo();
  return NextResponse.json({ message: 'GET berhasil!' });
}

export async function POST(request: Request) {
  await connectMongo();
  const data = await request.json();

  // Simpan ke database di sini...
  return NextResponse.json({ message: 'Data berhasil ditambahkan', data });
}
