import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Finance Dashboard</h1>
        <p className="text-xl text-gray-600 mb-8">Manage your financial records and view analytics</p>
        
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Get Started</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/users" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Users
              </Link>
              <Link href="/records" className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                Records
              </Link>
              <Link href="/dashboard" className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
                Dashboard
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 text-sm text-gray-600">
          <p>Demo: Use x-user-id header for mock authentication</p>
        </div>
      </div>
    </main>
  );
