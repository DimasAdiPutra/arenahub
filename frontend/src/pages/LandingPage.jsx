import useDocumentTitle from '../hooks/useDocumentTitle';

export default function LandingPage() {
  useDocumentTitle('Home')

  return <div className="p-8 text-2xl font-bold">⚽ Halaman Utama ArenaHub</div>;
}