import { getSheetData } from '../lib/sheets';
import DashboardClient from './DashboardClient';
import { ThemeSwitcher } from './components/ThemeSwitcher'; // <-- Impor tombol

export const revalidate = 3600; // Re-generate halaman ini setiap 1 jam

export default async function HomePage() {
  const data = await getSheetData();

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <div className="container mx-auto p-4 md:p-8">
        
        {/* Header dengan Tombol Theme Switcher */}
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
        
        <DashboardClient initialData={data} />
      </div>
    </main>
  );
}