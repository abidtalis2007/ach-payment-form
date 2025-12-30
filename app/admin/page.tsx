'use client';
import { useState } from 'react';

interface Submission {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  bank_name: string;
  account_holder_name: string;
  account_type: string;
  routing_number: string;
  account_number: string;
  signature_name: string;
  submitted_at: string;
  viewed: boolean;
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [viewing, setViewing] = useState<Submission | null>(null);
  const [showAccount, setShowAccount] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState('');

  const fetchSubmissions = async (pw: string) => {
    const res = await fetch('/api/submissions', { headers: { 'Authorization': `Bearer ${pw}` } });
    if (res.ok) {
      const data = await res.json();
      setSubmissions(data.submissions);
      return true;
    }
    return false;
  };

  const handleLogin = async () => {
    if (await fetchSubmissions(password)) {
      setAuthenticated(true);
    } else {
      alert('Invalid password');
    }
  };

  const markViewed = async (id: string) => {
    await fetch('/api/submissions', {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${password}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    setSubmissions(s => s.map(x => x.id === id ? { ...x, viewed: true } : x));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this submission?')) return;
    await fetch(`/api/submissions?id=${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${password}` } });
    setSubmissions(s => s.filter(x => x.id !== id));
    setViewing(null);
  };

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
          <h1 className="text-xl font-bold mb-4">Admin Access</h1>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} placeholder="Enter admin password" className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4" />
          <button onClick={handleLogin} className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">Login</button>
        </div>
      </div>
    );
  }

  if (viewing) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => setViewing(null)} className="text-gray-600 mb-4">← Back to list</button>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold">{viewing.company_name}</h2>
              <button onClick={() => handleDelete(viewing.id)} className="text-red-600 text-sm">🗑 Delete</button>
            </div>
            <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg mb-4">
              <div><p className="text-xs text-gray-500">Contact</p><p className="font-medium">{viewing.contact_name}</p></div>
              <div><p className="text-xs text-gray-500">Email</p><p className="font-medium">{viewing.email}</p></div>
              <div><p className="text-xs text-gray-500">Phone</p><p className="font-medium">{viewing.phone}</p></div>
              <div><p className="text-xs text-gray-500">Submitted</p><p className="font-medium">{new Date(viewing.submitted_at).toLocaleString()}</p></div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg mb-4">
              <p className="text-xs text-blue-600 font-semibold mb-3">BANK DETAILS</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div><p className="text-xs text-gray-500">Bank</p><p className="font-medium">{viewing.bank_name}</p></div>
                <div><p className="text-xs text-gray-500">Account Holder</p><p className="font-medium">{viewing.account_holder_name}</p></div>
                <div><p className="text-xs text-gray-500">Type</p><p className="font-medium capitalize">{viewing.account_type}</p></div>
                <div>
                  <p className="text-xs text-gray-500">Routing Number</p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono font-medium">{viewing.routing_number}</p>
                    <button onClick={() => copyText(viewing.routing_number, 'routing')} className="text-blue-600 text-sm">{copied === 'routing' ? '✓' : '📋'}</button>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs text-gray-500">Account Number</p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono font-medium">{showAccount[viewing.id] ? viewing.account_number : '••••••••' + viewing.account_number.slice(-4)}</p>
                    <button onClick={() => setShowAccount(s => ({ ...s, [viewing.id]: !s[viewing.id] }))} className="text-blue-600 text-sm">{showAccount[viewing.id] ? '🙈' : '👁'}</button>
                    {showAccount[viewing.id] && <button onClick={() => copyText(viewing.account_number, 'account')} className="text-blue-600 text-sm">{copied === 'account' ? '✓' : '📋'}</button>}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-xs text-green-600 font-semibold mb-2">SIGNATURE</p>
              <p className="text-2xl italic">{viewing.signature_name}</p>
              <p className="text-xs text-gray-500 mt-1">{new Date(viewing.submitted_at).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold">ACH Submissions</h1>
          <div className="flex gap-3">
            <button onClick={() => fetchSubmissions(password)} className="text-gray-600">🔄 Refresh</button>
            <button onClick={() => { setAuthenticated(false); setPassword(''); }} className="text-gray-600">Logout</button>
          </div>
        </div>
        {submissions.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center text-gray-500">No submissions yet</div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {submissions.map(s => (
                  <tr key={s.id} className={!s.viewed ? 'bg-blue-50/50' : ''}>
                    <td className="px-6 py-4"><p className="font-medium">{s.company_name}</p><p className="text-sm text-gray-500">{s.contact_name}</p></td>
                    <td className="px-6 py-4"><p>{s.bank_name}</p><p className="text-sm text-gray-500">****{s.account_number.slice(-4)}</p></td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(s.submitted_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">{!s.viewed ? <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">New</span> : <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">Viewed</span>}</td>
                    <td className="px-6 py-4"><button onClick={() => { setViewing(s); markViewed(s.id); }} className="text-blue-600 text-sm font-medium">View →</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
