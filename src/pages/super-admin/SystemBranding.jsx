import { Image as ImageIcon, LayoutTemplate, Palette, RefreshCw, Save, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useBranding } from '../../context/BrandingContext';

const SystemBranding = () => {
  const { branding, refreshBranding } = useBranding(); // Get the refresh function
  const [form, setForm] = useState(branding);
  const [logoFile, setLogoFile] = useState(null);
  const [bgFile, setBgFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [previewLogo, setPreviewLogo] = useState(branding.logoUrl);
  const [previewBg, setPreviewBg] = useState(branding.loginBgUrl);

  useEffect(() => {
    setForm(branding);
    setPreviewLogo(branding.logoUrl);
    setPreviewBg(branding.loginBgUrl);
  }, [branding]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e, setFile, setPreview) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const formData = new FormData();
    formData.append('system_name', form.systemName);
    formData.append('org_name', form.orgName);
    formData.append('welcome_msg', form.welcomeMsg);
    formData.append('primary_color', form.primaryColor);
    formData.append('secondary_color', form.secondaryColor);
    if (logoFile) formData.append('logo', logoFile);
    if (bgFile) formData.append('bg', bgFile);

    try {
        const token = localStorage.getItem('dost_token');
        const res = await fetch('http://localhost:5000/api/settings', {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
            body: formData
        });

        if (res.ok) {
            await refreshBranding(); // <--- CRITICAL: Updates the sidebar instantly
            alert("Updated Successfully!");
        } else {
            alert("Update Failed");
        }
    } catch (err) {
        alert("Connection Error");
    } finally {
        setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
        {/* HEADER */}
        <div className="flex justify-between items-end">
            <div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">System Branding</h1>
                <p className="text-slate-500 font-medium">Customize the look and feel of the portal.</p>
            </div>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50">
                {saving ? <RefreshCw className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                {saving ? 'Applying...' : 'Save Changes'}
            </button>
        </div>

        {/* EDITOR CONTROLS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                
                {/* IDENTITY */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><LayoutTemplate className="w-5 h-5 text-blue-500" /> Identity</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-xs font-bold text-slate-500 uppercase">System Name</label><input name="systemName" value={form.systemName} onChange={handleChange} className="w-full border rounded-lg p-3 font-bold text-slate-700" /></div>
                        <div><label className="text-xs font-bold text-slate-500 uppercase">Organization</label><input name="orgName" value={form.orgName} onChange={handleChange} className="w-full border rounded-lg p-3 font-bold text-slate-700" /></div>
                        <div className="col-span-2"><label className="text-xs font-bold text-slate-500 uppercase">Welcome Message</label><input name="welcomeMsg" value={form.welcomeMsg} onChange={handleChange} className="w-full border rounded-lg p-3 text-slate-700" /></div>
                    </div>
                </div>

                {/* COLORS */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Palette className="w-5 h-5 text-purple-500" /> Colors</h3>
                    <div className="flex gap-6">
                        <div><label className="text-xs font-bold text-slate-500 uppercase block mb-1">Primary</label><div className="flex items-center gap-2"><input type="color" name="primaryColor" value={form.primaryColor} onChange={handleChange} className="w-10 h-10 rounded cursor-pointer" /><span className="text-sm font-mono bg-slate-100 px-2 py-1 rounded">{form.primaryColor}</span></div></div>
                        <div><label className="text-xs font-bold text-slate-500 uppercase block mb-1">Secondary</label><div className="flex items-center gap-2"><input type="color" name="secondaryColor" value={form.secondaryColor} onChange={handleChange} className="w-10 h-10 rounded cursor-pointer" /><span className="text-sm font-mono bg-slate-100 px-2 py-1 rounded">{form.secondaryColor}</span></div></div>
                    </div>
                </div>

                {/* ASSETS */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><ImageIcon className="w-5 h-5 text-emerald-500" /> Assets</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center">
                            <input type="file" id="logo" className="hidden" onChange={(e) => handleFileChange(e, setLogoFile, setPreviewLogo)} />
                            <label htmlFor="logo" className="cursor-pointer text-sm font-bold text-blue-600 block"><Upload className="w-6 h-6 mx-auto mb-2 text-slate-400" /> Upload Logo</label>
                        </div>
                        <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center">
                            <input type="file" id="bg" className="hidden" onChange={(e) => handleFileChange(e, setBgFile, setPreviewBg)} />
                            <label htmlFor="bg" className="cursor-pointer text-sm font-bold text-blue-600 block"><Upload className="w-6 h-6 mx-auto mb-2 text-slate-400" /> Upload BG</label>
                        </div>
                    </div>
                </div>
            </div>

            {/* PREVIEW */}
            <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Preview</h3>
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl bg-slate-900 flex items-center justify-center border-4 border-slate-800">
                    {previewBg && <img src={previewBg} className="absolute inset-0 w-full h-full object-cover opacity-40" />}
                    <div className="relative z-10 w-3/4 bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20 text-center">
                        <div className="w-12 h-12 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mb-3 flex items-center justify-center shadow-lg" style={{ background: `linear-gradient(to right, ${form.primaryColor}, ${form.secondaryColor})` }}>
                            {previewLogo && <img src={previewLogo} className="w-8 h-8 object-contain" />}
                        </div>
                        <h2 className="text-white font-bold">{form.systemName}</h2>
                        <div className="mt-4 h-8 w-full rounded bg-blue-600 shadow-lg" style={{ background: `linear-gradient(to right, ${form.primaryColor}, ${form.secondaryColor})` }}></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default SystemBranding;