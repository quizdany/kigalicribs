export default function DashboardPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Welcome to your Dashboard</h1>
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-green-800 mb-2">Login Successful!</h2>
          <p className="text-green-700">You have successfully logged into your KigaliCribs account.</p>
        </div>
      </div>
    </div>
  );
}
