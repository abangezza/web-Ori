// src/app/api/seed-user/route.ts

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectMongo from '@/lib/conn';
import User from '@/models/User';

export async function GET() {
  try {
    await connectMongo();
    console.log("MongoDB Connected");

    const users = [
      {
        username: 'farhanazziyad',
        password: await bcrypt.hash('235155', 10),
        role: 'admin',
      },
      {
        username: 'muhammadshidqy',
        password: await bcrypt.hash('b0nt0t05', 10),
        role: 'karyawan',
      },
      {
        username: 'zahranhadzami',
        password: await bcrypt.hash('JAMI12123', 10),
        role: 'karyawan',
      },
    ];

    await User.deleteMany({});
    const result = await User.insertMany(users);
    console.log("User inserted:", result);

    return NextResponse.json({ message: 'User berhasil ditambahkan' });
  } catch (error) {
    console.error("Error inserting user:", error);
    return NextResponse.json({ error: 'Gagal insert user' }, { status: 500 });
  }
}
