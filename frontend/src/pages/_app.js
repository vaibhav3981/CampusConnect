import "@/styles/globals.css";
import { Inter } from 'next/font/google';
import { Layout } from "@/components/Layout";
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export default function App({ Component, pageProps }) {
  return (
    <div className={`${inter.variable} font-sans`}>
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#18181b',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
          },
          success: {
            iconTheme: { primary: '#4ade80', secondary: '#18181b' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#18181b' },
          },
        }}
      />
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </div>
  );
}
