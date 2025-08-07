// Root layout component
import { Inter } from 'next/font/google';
import Image from 'next/image';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Baby Nurse - Social Media Dashboard',
  description: 'Automated social media content management for Baby Nurse daycare',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    <Image
                      src="/logo-30-anos.png"
                      alt="Baby Nurse Logo"
                      width={48}
                      height={48}
                      className="object-contain"
                    />
                    <div>
                      <h1 className="text-2xl font-bold text-blue-600">
                        Baby Nurse
                      </h1>
                      <div className="text-sm text-gray-500">
                        Social Media Dashboard
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-600">
                    🕐 {new Date().toLocaleDateString('pt-BR', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-white border-t mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="text-center text-sm text-gray-500">
                © 2024 Baby Nurse - Jardim Prudência, São Paulo
                <br />
                📞 (11) 5677-6432 • 🌐 babynurse.com.br
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}