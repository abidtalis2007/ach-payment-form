'use client';
import { useSearchParams } from 'next/navigation';

export default function SuccessPage() {
  const params = useSearchParams();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
          ✓
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h1>
        <p className="text-gray-600 mb-6">
          Your ACH payment setup has been submitted successfully.
        </p>
        <div className="bg-gray-50 rounded-lg p-4 text-left text-sm">
          <p className="text-gray-600">Company: <strong>{params.get('company')}</strong></p>
          <p className="text-gray-600">Bank: <strong>{params.get('bank')}</strong></p>
          <p className="text-gray-600">Account: <strong>****{params.get('last4')}</strong></p>
          <p className="text-gray-600">Signed by: <strong>{params.get('name')}</strong></p>
        </div>
      </div>
    </div>
  );
}
