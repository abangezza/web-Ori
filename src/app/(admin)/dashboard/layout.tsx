'use client';

import { SessionProvider } from "next-auth/react";
import React from "react";
import Navbar from "./navbar";
import Sidebar from "./sidebar";


export default function AdminLayout({children}: {children: React.ReactNode}) {


  return (
    <div className="">
<SessionProvider>
  
    <div className="">
    <Sidebar ></Sidebar> 
    </div>
     <Navbar></Navbar>
     <div className='ml-70 mr-6 mt-8'>
    <div>{children}</div>
    
      </div> 
      
      </SessionProvider>
    </div>
  )
};