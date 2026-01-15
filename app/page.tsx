import { getSheetData, getPemasukanData } from '../lib/sheets';
import DashboardClient from './DashboardClient';
import { ThemeSwitcher } from './components/ThemeSwitcher';

// Atur revalidate agar data di-refresh setiap 10 menit
export const revalidate = 600;

export default async function HomePage() {
  // Ambil kedua data secara paralel agar lebih cepat
  const [data, pemasukanData] = await Promise.all([
    getSheetData(),
    getPemasukanData()
  ]);

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <div className="container mx-auto p-4 md:p-8">
        
        <header className="mb-8 flex justify-between items-center">
          <div className="text-left">
            <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400 dark:from-blue-400 dark:to-teal-300">
              Dashboard Kreator
            </h1>
            <p className="text-lg mt-2 text-gray-600 dark:text-gray-400">
              Omset naik, koko pun senang
            </p>
          </div>
          <ThemeSwitcher />
        </header>
        
        {/* Kirim kedua data ke komponen client */}
        <DashboardClient 
          initialData={data} 
          initialPemasukanData={pemasukanData} 
        />
      </div>
    </main>
  );
}