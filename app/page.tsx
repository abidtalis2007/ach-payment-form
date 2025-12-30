'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const MANDATE_TEXT = `ACH DEBIT AUTHORIZATION AGREEMENT

By signing this authorization, I authorize Talis Premium Finance to initiate ACH debit entries from the bank account indicated for payment of insurance premiums and related charges.

I understand that:
- This authorization remains in effect until revoked in writing
- At least 3 business days notice is required to cancel
- Returned debits may incur fees per applicable law
- All transactions comply with NACHA Operating Rules

I certify I am authorized to sign on this account.`;

const validateRouting = (r: string) => {
  if (!/^\d{9}$/.test(r)) return false;
  const d = r.split('').map(Number);
  return (3*(d[0]+d[3]+d[6]) + 7*(d[1]+d[4]+d[7]) + 1*(d[2]+d[5]+d[8])) % 10 === 0;
};

export default function ACHForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    companyName: '', contactName: '', email: '', phone: '',
    bankName: '', accountHolderName: '', accountType: 'checking',
    routingNumber: '', accountNumber: '', confirmAccountNumber: '',
    acceptTerms: false, signatureName: '',
  });

  const update = (field: string, value: string | boolean) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: '' }));
  };

  const validate = (fields: string[]) => {
    const errs: Record<string, string> = {};
    fields.forEach(f => {
      if (f === 'email' && (!form.email || !/\S+@\S+\.\S+/.test(form.email))) errs.email = 'Valid email required';
      else if (f === 'routingNumber' && !validateRouting(form.routingNumber)) errs.routingNumber = 'Invalid routing number';
      else if (f === 'accountNumber' && !/^\d{4,17}$/.test(form.accountNumber)) errs.accountNumber = '4-17 digits required';
      else if (f === 'confirmAccountNumber' && form.accountNumber !== form.confirmAccountNumber) errs.confirmAccountNumber = 'Must match';
      else if (f === 'acceptTerms' && !form.acceptTerms) errs.acceptTerms = 'Required';
      else if (!(form as any)[f]?.toString().trim()) errs[f] = 'Required';
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = async () => {
    if (step === 1 && validate(['companyName', 'contactName', 'email', 'phone'])) {
      setStep(2);
    } else if (step === 2 && validate(['bankName', 'accountHolderName', 'routingNumber', 'accountNumber', 'confirmAccountNumber'])) {
      setStep(3);
    } else if (step === 3 && validate(['acceptTerms', 'signatureName'])) {
      setLoading(true);
      try {
        const res = await fetch('/api/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          router.push(`/success?company=${encodeURIComponent(form.companyName)}&bank=${encodeURIComponent(form.bankName)}&last4=${form.accountNumber.slice(-4)}&name=${encodeURIComponent(form.signatureName)}`);
        } else {
          alert('Submission failed. Please try again.');
        }
      } catch (err) {
        alert('Submission failed. Please try again.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Talis Premium Finance</h1>
          <p className="text-gray-500 mt-1">ACH Payment Setup</p>
        </div>

        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {step > s ? '✓' : s}
              </div>
              {s < 3 && <div className={`w-12 h-1 ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-gray-900">Your Information</h2>
              {[{f:'companyName',l:'Company / Insured Name'},{f:'contactName',l:'Contact Name'},{f:'email',l:'Email'},{f:'phone',l:'Phone'}].map(({f,l}) => (
                <div key={f}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{l}</label>
                  <input type={f==='email'?'email':f==='phone'?'tel':'text'} value={(form as any)[f]} onChange={e => update(f, e.target.value)} className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors[f] ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
                  {errors[f] && <p className="text-red-600 text-sm mt-1">{errors[f]}</p>}
                </div>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-gray-900">Bank Account</h2>
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-800">🔒 Your information is securely encrypted.</div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label><input value={form.bankName} onChange={e => update('bankName', e.target.value)} className={`w-full px-4 py-3 border rounded-lg ${errors.bankName ? 'border-red-400' : 'border-gray-300'}`} />{errors.bankName && <p className="text-red-600 text-sm mt-1">{errors.bankName}</p>}</div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name</label><input value={form.accountHolderName} onChange={e => update('accountHolderName', e.target.value)} className={`w-full px-4 py-3 border rounded-lg ${errors.accountHolderName ? 'border-red-400' : 'border-gray-300'}`} />{errors.accountHolderName && <p className="text-red-600 text-sm mt-1">{errors.accountHolderName}</p>}</div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label><div className="flex gap-3">{['checking', 'savings'].map(t => (<button key={t} type="button" onClick={() => update('accountType', t)} className={`flex-1 py-3 rounded-lg border font-medium capitalize ${form.accountType === t ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300'}`}>{t}</button>))}</div></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Routing Number</label><input value={form.routingNumber} onChange={e => update('routingNumber', e.target.value.replace(/\D/g, '').slice(0, 9))} className={`w-full px-4 py-3 border rounded-lg font-mono ${errors.routingNumber ? 'border-red-400' : 'border-gray-300'}`} placeholder="9 digits" />{errors.routingNumber && <p className="text-red-600 text-sm mt-1">{errors.routingNumber}</p>}</div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label><input type="password" value={form.accountNumber} onChange={e => update('accountNumber', e.target.value.replace(/\D/g, '').slice(0, 17))} className={`w-full px-4 py-3 border rounded-lg font-mono ${errors.accountNumber ? 'border-red-400' : 'border-gray-300'}`} />{errors.accountNumber && <p className="text-red-600 text-sm mt-1">{errors.accountNumber}</p>}</div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Confirm Account Number</label><input value={form.confirmAccountNumber} onChange={e => update('confirmAccountNumber', e.target.value.replace(/\D/g, '').slice(0, 17))} className={`w-full px-4 py-3 border rounded-lg font-mono ${errors.confirmAccountNumber ? 'border-red-400' : 'border-gray-300'}`} />{errors.confirmAccountNumber && <p className="text-red-600 text-sm mt-1">{errors.confirmAccountNumber}</p>}</div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-gray-900">Authorization</h2>
              <div className="bg-gray-50 border rounded-lg p-4 text-sm text-gray-700 max-h-40 overflow-y-auto whitespace-pre-wrap">{MANDATE_TEXT}</div>
              <label className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer ${form.acceptTerms ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} ${errors.acceptTerms ? 'border-red-400' : ''}`}><input type="checkbox" checked={form.acceptTerms} onChange={e => update('acceptTerms', e.target.checked)} className="mt-1 w-5 h-5 rounded" /><span className="text-sm">I agree to the ACH Debit Authorization Agreement</span></label>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Electronic Signature (Type Full Name)</label><input value={form.signatureName} onChange={e => update('signatureName', e.target.value)} className={`w-full px-4 py-3 border rounded-lg text-xl italic ${errors.signatureName ? 'border-red-400' : 'border-gray-300'}`} />{errors.signatureName && <p className="text-red-600 text-sm mt-1">{errors.signatureName}</p>}</div>
            </div>
          )}

          <div className="flex gap-3 mt-8">
            {step > 1 && <button onClick={() => setStep(s => s - 1)} className="flex-1 py-3 border border-gray-300 rounded-lg font-medium">Back</button>}
            <button onClick={handleNext} disabled={loading} className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">{loading ? 'Submitting...' : step === 3 ? 'Submit' : 'Continue'} →</button>
          </div>
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">🔒 Secured with 256-bit encryption</p>
      </div>
    </div>
  );
}
