import React, { useState } from 'react';
import { Sparkles, ShieldAlert, Cpu, Heart, Check, ArrowRight, RotateCcw } from 'lucide-react';

export default function EnterprisePage() {
  const [estimateSavedHours, setEstimateSavedHours] = useState(20);
  const [hourlyWage, setHourlyWage] = useState(45);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const [enterpriseForm, setEnterpriseForm] = useState({
    name: '',
    email: '',
    companyName: '',
    requirements: '',
    industry: 'Financial Technology'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  // Calculate annual savings live! Incredibly functional!
  const annualSavings = estimateSavedHours * 52 * hourlyWage;

  return (
    <div className="space-y-8 animate-fadeIn text-left">
      
      {/* Title Header */}
      <div className="bg-neutral-950 text-white p-8 sm:p-10 rounded-3xl space-y-3 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <span className="text-[9px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
          Flowmint Elite
        </span>
        <h2 className="text-3xl font-extrabold tracking-tight font-sans">
          Enterprise Pipeline Solutions
        </h2>
        <p className="text-[14px] text-neutral-400 font-medium max-w-xl leading-relaxed">
          Unlock tailor-made multi-agent workflows, dedicated cluster nodes, automated data residency options, and 24/7 Slack architect channels.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Enterprise consultation request wizard */}
        <div className="lg:col-span-2 bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <h4 className="text-sm font-bold text-neutral-950 font-sans">Request Architecture Assessment</h4>
          
          {isSubmitted ? (
            <div className="p-8 border border-dashed border-neutral-250 rounded-3xl text-center space-y-4 max-w-md mx-auto py-12 animate-fadeIn">
              <span className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
                ✓
              </span>
              <div>
                <h5 className="text-[14px] font-bold text-neutral-900">Consultation Request Received!</h5>
                <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed font-semibold">
                  We matched you with a specialized Solutions Architect. Check your inbox for scheduling details.
                </p>
              </div>
              <button 
                onClick={() => setIsSubmitted(false)}
                className="px-4 py-2 border border-neutral-200 text-neutral-500 text-[10px] font-bold rounded-xl hover:bg-neutral-50 transition-colors"
              >
                Reset Assessment Form
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Your Name</label>
                  <input 
                    type="text" 
                    required
                    value={enterpriseForm.name}
                    onChange={(e) => setEnterpriseForm({...enterpriseForm, name: e.target.value})}
                    placeholder="E.g. Dawit"
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-800 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Corporate Email</label>
                  <input 
                    type="email" 
                    required
                    value={enterpriseForm.email}
                    onChange={(e) => setEnterpriseForm({...enterpriseForm, email: e.target.value})}
                    placeholder="workinehamanuelsileshi@gmail.com"
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-800 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Company Name</label>
                <input 
                  type="text" 
                  required
                  value={enterpriseForm.companyName}
                  onChange={(e) => setEnterpriseForm({...enterpriseForm, companyName: e.target.value})}
                  placeholder="Flowmint Labs"
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-800 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Describe your automation challenge</label>
                <textarea 
                  rows={4}
                  required
                  value={enterpriseForm.requirements}
                  onChange={(e) => setEnterpriseForm({...enterpriseForm, requirements: e.target.value})}
                  placeholder="Explain which internal systems (CRM, ERP, Billing, Custom API) you want to interconnect..."
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs font-bold text-neutral-800 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 resize-none placeholder-neutral-400"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl cursor-pointer transition-transform duration-100 active:scale-95 shadow-sm"
              >
                Submit Consultation Request
              </button>
            </form>
          )}
        </div>

        {/* Live ROI Savings Calculator */}
        <div className="bg-neutral-50/50 border border-neutral-250 p-6 rounded-3xl space-y-5">
          <div className="space-y-1">
            <h4 className="text-[11px] font-black text-neutral-400 uppercase tracking-widest">Enterprise ROI Tool</h4>
            <h5 className="text-sm font-bold text-neutral-950">Calculate Annualized Cost Savings</h5>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-neutral-600">
                <span>Estimated Weekly Hours Saved</span>
                <span className="text-blue-600">{estimateSavedHours} hrs</span>
              </div>
              <input 
                type="range" 
                min="5" 
                max="100" 
                value={estimateSavedHours}
                onChange={(e) => setEstimateSavedHours(parseInt(e.target.value, 10))}
                className="w-full accent-blue-600 cursor-pointer mt-1"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-neutral-600">
                <span>Average Employee Cost/Hour</span>
                <span className="text-blue-600">${hourlyWage}/hr</span>
              </div>
              <input 
                type="range" 
                min="20" 
                max="200" 
                value={hourlyWage}
                onChange={(e) => setHourlyWage(parseInt(e.target.value, 10))}
                className="w-full accent-blue-600 cursor-pointer mt-1"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-150 space-y-1 text-center bg-white p-4 rounded-2xl border border-neutral-200">
            <p className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest">Calculated Annual Savings</p>
            <p className="text-2xl font-black text-blue-600">${annualSavings.toLocaleString()}</p>
            <p className="text-[9px] text-neutral-400 font-semibold">Based on 52 operational weeks</p>
          </div>
        </div>

      </div>

    </div>
  );
}
