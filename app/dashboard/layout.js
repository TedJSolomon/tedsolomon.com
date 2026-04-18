import DashboardSidebar from '../components/DashboardSidebar';

export const metadata = {
  title: 'Dashboard — Ted Solomon',
};

export default function DashboardLayout({ children }) {
  return (
    <div className="db-layout">
      <DashboardSidebar />
      <main className="db-main">
        {children}
      </main>
    </div>
  );
}
