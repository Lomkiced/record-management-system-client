import { createContext, useContext, useEffect, useState } from 'react';

const BrandingContext = createContext();

export const BrandingProvider = ({ children }) => {
  const [branding, setBranding] = useState({
    systemName: 'DOST-RMS',
    orgName: 'Department of Science and Technology',
    welcomeMsg: 'Sign in to access the system.',
    logoUrl: null,
    loginBgUrl: null,
    primaryColor: '#4f46e5',
    secondaryColor: '#0f172a'
  });
  const [loading, setLoading] = useState(true);

  // Apply Theme Colors
  const applyTheme = (brandData) => {
    if (!brandData) return;
    const root = document.documentElement;
    root.style.setProperty('--color-primary', brandData.primaryColor);
    root.style.setProperty('--color-secondary', brandData.secondaryColor);
  };

  const loadBrand = async () => {
    try {
      // 🛡️ TIMESTAMP FIX: Forces browser to ignore old cache
      const timestamp = new Date().getTime();
      const res = await fetch(`http://localhost:5000/api/settings?t=${timestamp}`, {
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      if (!res.ok) throw new Error("Failed to fetch settings");

      const data = await res.json();
      
      if (data) {
        const getUrl = (path) => path ? `http://localhost:5000${path}` : null;
        
        const newBrand = {
          systemName: data.system_name || 'DOST-RMS',
          orgName: data.org_name || 'Department of Science and Technology',
          welcomeMsg: data.welcome_msg || 'Sign in to access the system.',
          // Append timestamp to images so they refresh instantly
          logoUrl: getUrl(data.logo_url) ? `${getUrl(data.logo_url)}?t=${timestamp}` : null,
          loginBgUrl: getUrl(data.login_bg_url) ? `${getUrl(data.login_bg_url)}?t=${timestamp}` : null,
          primaryColor: data.primary_color || '#4f46e5',
          secondaryColor: data.secondary_color || '#0f172a'
        };

        setBranding(newBrand);
        applyTheme(newBrand);
      }
    } catch (err) {
      console.error("Branding Load Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBrand(); }, []);

  return (
    <BrandingContext.Provider value={{ branding, loading, refreshBranding: loadBrand }}>
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = () => useContext(BrandingContext);