import useDocumentTitle from '../hooks/useDocumentTitle';

export default function LandingPage() {
  useDocumentTitle('Dashboard')

  return <div className="p-8 text-2xl font-bold">Owner Dashboard</div>;
}