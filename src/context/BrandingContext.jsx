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

  // Apply Theme to :root
  const applyTheme = (brandData) => {
    if (!brandData) return;
    const root = document.documentElement;
    root.style.setProperty('--color-primary', brandData.primaryColor);
    root.style.setProperty('--color-secondary', brandData.secondaryColor);
  };

  const loadBrand = async () => {
    try {
      // 🛡️ TIMESTAMP: Force browser to ignore cache
      const timestamp = new Date().getTime();
      const res = await fetch(`/api/settings?t=${timestamp}`, {
        headers: { 'Cache-Control': 'no-cache' }
      });

      const data = await res.json();

      if (data) {
        // Robust URL Formatter
        const getUrl = (path) => {
          if (!path) return null;
          if (path.startsWith('http')) return path; // Already absolute
          return path;   // Return relative path (Nginx/Vite handles it)
        };

        const newBrand = {
          systemName: data.system_name || 'DOST-RMS',
          orgName: data.org_name || 'Department of Science and Technology',
          welcomeMsg: data.welcome_msg || 'Sign in to access the system.',

          // Append timestamp ONLY if a URL exists
          logoUrl: data.logo_url ? `${getUrl(data.logo_url)}?t=${timestamp}` : null,
          loginBgUrl: data.login_bg_url ? `${getUrl(data.login_bg_url)}?t=${timestamp}` : null,

          primaryColor: data.primary_color || '#4f46e5',
          secondaryColor: data.secondary_color || '#0f172a'
        };

        console.log("🎨 BRANDING LOADED:", newBrand);
        setBranding(newBrand);
        applyTheme(newBrand);
      }
    } catch (err) {
      console.error("Branding Load Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial Load
  useEffect(() => { loadBrand(); }, []);

  return (
    <BrandingContext.Provider value={{ branding, loading, refreshBranding: loadBrand }}>
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = () => useContext(BrandingContext);