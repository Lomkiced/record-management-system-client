import { createContext, useContext, useEffect, useState } from 'react';
import { getSystemSettings } from '../services/api';

const BrandingContext = createContext();

export const BrandingProvider = ({ children }) => {
  const [branding, setBranding] = useState({
    systemName: 'DOST-RMS',
    orgName: 'Department of Science and Technology',
    welcomeMsg: 'Sign in to access the system.',
    logoUrl: null,
    loginBgUrl: null,
    primaryColor: '#4f46e5'
  });
  const [loading, setLoading] = useState(true);

  // Define the load function so we can reuse it
  const loadBrand = async () => {
    try {
      const data = await getSystemSettings();
      if (data) {
        const cleanUrl = (path) => path ? `http://localhost:5000${path}` : null;
        
        setBranding({
          systemName: data.system_name || 'DOST-RMS',
          orgName: data.org_name || 'Department of Science and Technology',
          welcomeMsg: data.welcome_msg || 'Sign in to access the system.',
          logoUrl: cleanUrl(data.logo_url),
          loginBgUrl: cleanUrl(data.login_bg_url),
          primaryColor: data.primary_color || '#4f46e5'
        });
      }
    } catch (err) {
      console.error("Failed to load branding:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial Load
  useEffect(() => {
    loadBrand();
  }, []);

  return (
    // Expose 'refreshBranding' to the rest of the app
    <BrandingContext.Provider value={{ branding, loading, refreshBranding: loadBrand }}>
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = () => useContext(BrandingContext);