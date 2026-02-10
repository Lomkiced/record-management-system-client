import { useCallback, useEffect, useRef, useState } from 'react';


import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import DocumentViewerModal from '../../components/registry/DocumentViewerModal';
import FilePasswordModal from '../../components/registry/FilePasswordModal';
import RecordModal from '../../components/registry/RecordModal';
import RecordTable from '../../components/registry/RecordTable';
import { useAuth } from '../../context/AuthContext';
import { useCodex } from '../../context/CodexContext';
import { useConfirmation } from '../../context/ConfirmationContext';
import { useOffices } from '../../context/OfficeContext';
import { useRegions } from '../../context/RegionContext';
import { useRegistry } from '../../context/RegistryContext';
import { deleteShelf, getShelves } from '../../services/endpoints/api';

// --- ICONS ---
const Icons = {
  Home: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  ChevronRight: () => <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>,
  Search: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>,
  Plus: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
  X: () => <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  Folder: () => <svg className="w-12 h-12 text-blue-500 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24"><path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15ZM1.5 10.146V6a3 3 0 0 1 3-3h5.379a2.25 2.25 0 0 1 1.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 0 1 3 3v1.146A4.483 4.483 0 0 0 19.5 9h-15a4.483 4.483 0 0 0-3 1.146Z" /></svg>,
  Office: () => <svg className="w-12 h-12 text-emerald-500 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24"><path d="M4 4a2 2 0 012-2h12a2 2 0 012 2v16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 3v2h4V7H7zm0 4v2h4v-2H7zm0 4v2h4v-2H7zm6-8v2h4V7h-4zm0 4v2h4v-2h-4zm0 4v2h4v-2h-4z" /></svg>,
  ORD: () => <svg className="w-12 h-12 text-slate-600 drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" /></svg>,
  FAS: () => <svg className="w-12 h-12 text-emerald-600 drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  FOS: () => <svg className="w-12 h-12 text-amber-500 drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>,
  TOS: () => <svg className="w-12 h-12 text-violet-500 drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" /></svg>,
  Codex: ({ className = "text-amber-400" }) => <svg className={`w-10 h-10 drop-shadow-sm ${className}`} fill="currentColor" viewBox="0 0 24 24"><path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15ZM1.5 10.146V6a3 3 0 0 1 3-3h5.379a2.25 2.25 0 0 1 1.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 0 1 3 3v1.146A4.483 4.483 0 0 0 19.5 9h-15a4.483 4.483 0 0 0-3 1.146Z" /></svg>,
  Lock: () => <svg className="w-12 h-12 text-red-500 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3A5.25 5.25 0 0 0 12 1.5Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" /></svg>,
  Shelf: () => <svg className="w-10 h-10 text-slate-500 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24"><path d="M3.75 3A2.25 2.25 0 0 0 1.5 5.25v2.25c0 .32.07.625.2.906a2.25 2.25 0 0 0-.2.907v2.25a2.25 2.25 0 0 0 .2.906 2.25 2.25 0 0 0-.2.907v2.25c0 1.243 1.008 2.25 2.25 2.25h16.5A2.25 2.25 0 0 0 22.5 19.5v-2.25a2.25 2.25 0 0 0-.2-.907 2.25 2.25 0 0 0 .2-.906v-2.25a2.25 2.25 0 0 0-.2-.907 2.25 2.25 0 0 0 .2-.906V5.25A2.25 2.25 0 0 0 20.25 3H3.75ZM3 17.25v-2.25c.334 0 .647-.09.912-.248a3 3 0 0 0 2.208.248c.552.12 1.133.12 1.685-.015a3 3 0 0 0 2.247.015c.574.12 1.176.12 1.75 0a3 3 0 0 0 2.248-.015c.563.123 1.155.123 1.718 0a3 3 0 0 0 2.248.015c.552.135 1.134.135 1.685 0 .736.158 1.41.076 1.999-.248v2.25H3Z" /></svg>,
  Trash: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Maintenance: () => <svg className="w-12 h-12 text-slate-400 drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.033a.75.75 0 011.08 0l4.25 4.25a.75.75 0 010 1.08l-3.033 2.496M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" /></svg>
};

const FolderColors = {
  amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', icon: 'text-amber-400', hover: 'group-hover:text-amber-700', grad: 'to-amber-500/5', ring: 'focus:ring-amber-500/20', inputBorder: 'focus:border-amber-500', indicator: 'bg-amber-400' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', icon: 'text-blue-400', hover: 'group-hover:text-blue-700', grad: 'to-blue-500/5', ring: 'focus:ring-blue-500/20', inputBorder: 'focus:border-blue-500', indicator: 'bg-blue-400' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', icon: 'text-emerald-400', hover: 'group-hover:text-emerald-700', grad: 'to-emerald-500/5', ring: 'focus:ring-emerald-500/20', inputBorder: 'focus:border-emerald-500', indicator: 'bg-emerald-400' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200', icon: 'text-rose-400', hover: 'group-hover:text-rose-700', grad: 'to-rose-500/5', ring: 'focus:ring-rose-500/20', inputBorder: 'focus:border-rose-500', indicator: 'bg-rose-400' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', icon: 'text-purple-400', hover: 'group-hover:text-purple-700', grad: 'to-purple-500/5', ring: 'focus:ring-purple-500/20', inputBorder: 'focus:border-purple-500', indicator: 'bg-purple-400' },
  slate: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', icon: 'text-slate-400', hover: 'group-hover:text-slate-700', grad: 'to-slate-500/5', ring: 'focus:ring-slate-500/20', inputBorder: 'focus:border-slate-500', indicator: 'bg-slate-400' },
  cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-200', icon: 'text-cyan-400', hover: 'group-hover:text-cyan-700', grad: 'to-cyan-500/5', ring: 'focus:ring-cyan-500/20', inputBorder: 'focus:border-cyan-500', indicator: 'bg-cyan-400' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200', icon: 'text-indigo-400', hover: 'group-hover:text-indigo-700', grad: 'to-indigo-500/5', ring: 'focus:ring-indigo-500/20', inputBorder: 'focus:border-indigo-500', indicator: 'bg-indigo-400' },
};

// --- SKELETONS ---
const GridSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="bg-white/50 border border-slate-200 p-8 rounded-2xl flex flex-col items-center gap-4 h-48 justify-center">
        <div className="w-12 h-12 bg-slate-200 rounded-lg"></div>
        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
      </div>
    ))}
  </div>
);

const TableSkeleton = () => (
  <div className="space-y-4 animate-pulse p-6">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex gap-4">
        <div className="w-10 h-10 bg-slate-100 rounded-lg shrink-0"></div>
        <div className="flex-1 space-y-2 py-1">
          <div className="h-3 bg-slate-100 rounded w-1/4"></div>
          <div className="h-2 bg-slate-100 rounded w-1/2"></div>
        </div>
      </div>
    ))}
  </div>
);

const Registry = () => {
  const { user } = useAuth();
  const { records, pagination, fetchRecords, destroyRecord, archiveRecord, restoreRecord, loading } = useRegistry();
  const { categories } = useCodex();
  const { regions } = useRegions();

  const { getOfficesByRegion, getSubOffices } = useOffices();
  const { confirm } = useConfirmation();

  // Navigation State (4 Levels: Province -> Office -> Category -> Records)
  // Dynamic Sub-Office Support: Province -> Office -> SubOffice -> Category -> Records
  const [activeRegion, setActiveRegion] = useState(null);
  const [activeOffice, setActiveOffice] = useState(null);
  const [activeSubOffice, setActiveSubOffice] = useState(null); // For offices with sub-offices
  const [subOffices, setSubOffices] = useState([]); // List of sub-offices
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeShelf, setActiveShelf] = useState(null);
  const [shelves, setShelves] = useState([]);
  const [offices, setOffices] = useState([]);

  // Restricted Vault State
  const [inRestrictedVault, setInRestrictedVault] = useState(false);
  const [vaultUnlocked, setVaultUnlocked] = useState(false);
  const [vaultPasswordModal, setVaultPasswordModal] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('Active');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('view') || '');
  const [highlightedRecordId, setHighlightedRecordId] = useState(null);
  const autoOpenRef = useRef(false);

  // Reset auto-open flag when the target ID changes
  useEffect(() => {
    if (highlightedRecordId) autoOpenRef.current = false;
  }, [highlightedRecordId]);

  // Sync URL param to state (for deep linking from Dashboard)
  useEffect(() => {
    const viewParam = searchParams.get('view');
    if (viewParam) {
      setHighlightedRecordId(viewParam);
      setActiveRegion(null);
      setActiveOffice(null);
      setActiveCategory(null);
      setActiveShelf(null);

      // Respect vault parameter for restricted files
      const isVault = searchParams.get('vault') === 'true';
      setInRestrictedVault(isVault);
      // Only force lock if NOT in vault mode
      if (!isVault) setVaultUnlocked(false);
    }
  }, [searchParams]);

  // Clear URL param when search changes (optional, but keeps URL clean)
  useEffect(() => {
    if (searchTerm && searchTerm !== searchParams.get('view')) {
      setSearchParams({});
    }
  }, [searchTerm]);

  // --- STAFF AUTO-NAVIGATION ---
  // For Staff users, auto-navigate to their assigned office on initial page load
  const [staffAutoNavDone, setStaffAutoNavDone] = useState(false);

  // --- STAFF ACCESS CONTROL ---
  // Lock Staff users to their assigned office
  const isStaff = user?.role === 'STAFF';
  const isStaffLocked = isStaff && staffAutoNavDone; // Staff is locked after auto-navigation is complete
  const staffAssignedOfficeCode = user?.office?.toUpperCase?.() || ''; // The code Staff was assigned to

  useEffect(() => {
    const isStaff = user?.role === 'STAFF';

    // Only run once, when regions and offices are loaded, and we haven't navigated yet
    if (!isStaff || staffAutoNavDone || !regions.length) return;

    const autoNavigate = async () => {
      // 1. Find Staff's assigned region
      const staffRegion = regions.find(r => r.id == user.region_id);
      if (!staffRegion) return;

      // 2. Enter the region
      setActiveRegion(staffRegion);

      // 3. Fetch offices for that region
      const regionOffices = await getOfficesByRegion(staffRegion.id);
      setOffices(regionOffices);

      // 4. Find the staff's assigned office by code or name
      // user.office could be the office CODE (e.g., "ITSM") or full name
      const staffOfficeCode = user?.office?.toUpperCase?.() || '';
      let matchedOffice = null;
      let matchedSubOffice = null;

      // First try to match as a top-level office
      matchedOffice = regionOffices.find(o =>
        (o.code || '').toUpperCase() === staffOfficeCode ||
        (o.name || '').toUpperCase() === staffOfficeCode
      );

      // If no match, it might be a sub-office - search all offices for sub-offices
      if (!matchedOffice) {
        for (const office of regionOffices) {
          try {
            const subs = await getSubOffices(office.office_id);
            const matchedSub = subs?.find(s =>
              (s.code || '').toUpperCase() === staffOfficeCode ||
              (s.name || '').toUpperCase() === staffOfficeCode
            );
            if (matchedSub) {
              matchedOffice = office; // Parent office
              matchedSubOffice = matchedSub;
              break;
            }
          } catch (e) {
            // Continue searching
          }
        }
      }

      // 5. Auto-select the matched office
      if (matchedOffice) {
        setActiveOffice(matchedOffice);

        // Fetch sub-offices if we found a parent match
        let subs = await getSubOffices(matchedOffice.office_id) || [];

        // STAFF ACCESS CONTROL: Filter by assigned_office_ids
        if (user?.assigned_office_ids?.length > 0) {
          subs = subs.filter(s => user.assigned_office_ids.includes(s.office_id));
        }
        setSubOffices(subs);

        if (matchedSubOffice) {
          setActiveSubOffice(matchedSubOffice);
        } else if (subs.length === 1) {
          // Auto-select if only one sub-office is available
          setActiveSubOffice(subs[0]);
        }
      } else if (regionOffices.length > 0) {
        // Fallback: select first office if no match found
        setActiveOffice(regionOffices[0]);
        let subs = await getSubOffices(regionOffices[0].office_id) || [];

        // STAFF ACCESS CONTROL: Filter by assigned_office_ids
        if (user?.assigned_office_ids?.length > 0) {
          subs = subs.filter(s => user.assigned_office_ids.includes(s.office_id));
        }
        setSubOffices(subs);

        if (subs.length === 1) {
          setActiveSubOffice(subs[0]);
        }
      } else {
        // Province has NO offices configured - create virtual office for province-level access
        // This allows staff to access classification folders directly at the province level
        setActiveOffice({
          office_id: null,
          code: 'PROVINCE',
          name: `${staffRegion.name} Provincial Office`
        });
        setSubOffices([]);
        toast.info(`No offices configured in ${staffRegion.name}. Accessing province-level records.`);
      }

      setStaffAutoNavDone(true);
    };

    autoNavigate();
  }, [user, regions, staffAutoNavDone, getOfficesByRegion, getSubOffices]);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState(null);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [selectedRestrictedRecord, setSelectedRestrictedRecord] = useState(null);

  // Viewer
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerUrl, setViewerUrl] = useState('');
  const [viewerFile, setViewerFile] = useState(null);

  // --- REACTIVE FETCH ---
  // --- REACTIVE FETCH ---
  useEffect(() => {
    // Fetch if:
    // 1. Searching (Global)
    // 2. Normal Mode: specific shelf selected
    // 3. Vault Mode: Office selected (showing all restricted files in that office)

    const isSearching = searchTerm.length > 0;
    const isNormalBottom = !inRestrictedVault && activeRegion && activeOffice && activeCategory && activeShelf;
    // Vault Flow: Province -> Office -> Category -> Shelf -> Records (Full hierarchy restored)
    const isVaultBottom = inRestrictedVault && vaultUnlocked && activeRegion && activeOffice && activeCategory && activeShelf;

    if (isSearching || isNormalBottom || isVaultBottom) {
      const delayDebounceFn = setTimeout(() => {
        const params = {
          page: 1,
          status: highlightedRecordId ? 'All' : viewMode,
          search: searchTerm
        };

        if (inRestrictedVault && vaultUnlocked) {
          params.restricted_only = 'true';
          // Respect navigation filters in vault
          params.region = activeRegion?.id || '';
          params.office_id = activeOffice?.office_id || '';
          params.category = activeCategory?.name || 'All';
          params.shelf = activeShelf || '';
        } else {

          const targetOfficeId = activeSubOffice?.office_id || activeOffice?.office_id;

          params.region = activeRegion?.id || '';
          params.office_id = targetOfficeId || '';
          params.category = activeCategory?.name || 'All';
          params.shelf = activeShelf || '';
          params.restricted_only = 'false'; // Explicitly clear the flag
        }

        fetchRecords(params);
      }, 300);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchTerm, activeRegion, activeOffice, activeCategory, activeShelf, viewMode, inRestrictedVault, vaultUnlocked, highlightedRecordId]);

  // Load shelves when category changes - use useCallback to ensure latest inRestrictedVault value
  const refreshCurrentShelves = useCallback(() => {
    // FIX: Dynamic Sub-Office Detection. Do not rely on hardcoded Region 6 check.
    // If a sub-office is active, use IT. Otherwise fallback to parent office.
    const targetOfficeId = activeSubOffice?.office_id || activeOffice?.office_id;

    // Defensive check: Ensure we have the required IDs/Names before fetching
    if (activeRegion?.id && activeCategory?.name) {
      const params = {
        region_id: activeRegion.id,
        office_id: targetOfficeId || '', // Revert to empty string to match RecordModal
        category: activeCategory.name,
        restricted_only: inRestrictedVault ? 'true' : 'false'
      };

      console.log('[DEBUG] Fetching Shelves with params:', params);

      getShelves(params).then(data => {
        // console.log("Shelves Loaded:", data);
        setShelves(data);
        if (inRestrictedVault) {
          if (data.length === 0) {
            const trace = data._debug || "No Trace";
            toast.error(`No Shelves. Trace: ${trace}`);
          } else {
            toast.success(`Vault: Loaded ${data.length} Shelf(s)`);
          }
        }
      }).catch(err => {
        console.error("Shelf Load Error:", err);
        // Extract specific error message from backend if available (e.g. "Missing filters: region_id")
        const msg = err.response?.data?.message || err.message;
        toast.error("Error loading shelves: " + msg);
      });
    } else {
      // Debugging: Log why we are not fetching
      // console.log("Skipping shelf fetch. missing:", !activeRegion?.id ? 'Region ID' : '', !activeCategory?.name ? 'Category Name' : '');
      setShelves([]);
    }
  }, [activeRegion, activeOffice, activeSubOffice, activeCategory, inRestrictedVault]);

  useEffect(() => {
    refreshCurrentShelves();
  }, [refreshCurrentShelves]);

  // Load offices when region changes
  useEffect(() => {
    if (activeRegion) {
      getOfficesByRegion(activeRegion.id).then(setOffices);
    } else {
      setOffices([]);
    }
  }, [activeRegion]);

  // Navigation Handlers
  const goToRoot = () => {
    // Block Staff from navigating outside their assigned office
    if (isStaffLocked) {
      toast.error('You can only access your assigned office records');
      return;
    }
    setActiveRegion(null);
    setActiveOffice(null);
    setActiveSubOffice(null);
    setSubOffices([]);
    setActiveCategory(null);
    setActiveShelf(null);
    setSearchTerm('');
    setInRestrictedVault(false);
    setVaultUnlocked(false);
    setShelves([]); // Clear shelves
  };

  const enterRegion = async (region) => {
    // Block Staff from changing region
    if (isStaffLocked) {
      toast.error('You can only access your assigned office records');
      return;
    }

    // BLOCK OFFLINE REGIONS
    if (region.status === 'Inactive') {
      toast.error('System Under Maintenance: Access to this region is temporarily disabled.', {
        description: 'Please try again later or contact the administrator.',
        icon: <Icons.Maintenance className="w-5 h-5 text-red-500" />
      });
      return;
    }

    const rId = Number(region.id);
    setActiveRegion(region);
    setActiveOffice(null);
    setActiveSubOffice(null);
    setSubOffices([]);
    setActiveCategory(null);
    setActiveShelf(null);
    setSearchTerm('');

    // CUSTOM FLOW: La Union (3) and Ilocos Norte (1) skip the Office level
    // They go directly to Classifications (Categories)
    if ([1, 3].includes(rId)) {
      // Fetch offices for this region and auto-select the first one (or a default/virtual office)
      const regionOffices = await getOfficesByRegion(region.id);
      setOffices(regionOffices);
      if (regionOffices.length > 0) {
        // Auto-select the first office to skip the level
        setActiveOffice(regionOffices[0]);
        // CRITICAL FIX: Also fetch sub-offices for the auto-selected office
        try {
          const subs = await getSubOffices(regionOffices[0].office_id);
          setSubOffices(subs || []);
        } catch (err) {
          console.error('[Registry] Failed to fetch sub-offices for auto-selected office:', err);
          setSubOffices([]);
        }
      } else {
        // If no offices, create a virtual placeholder to allow category selection
        setActiveOffice({ office_id: null, code: 'DEFAULT', name: 'Main Office' });
        setSubOffices([]);
      }
    }
    // Other regions proceed normally to show offices first
  };

  const enterOffice = async (office) => {
    // Block Staff from changing office
    if (isStaffLocked && office.office_id !== activeOffice?.office_id) {
      toast.error('You can only access your assigned office records');
      return;
    }
    setActiveOffice(office);
    setActiveSubOffice(null);
    setActiveCategory(null);
    setActiveShelf(null);
    setViewMode('Active');
    setSearchTerm('');

    // DYNAMIC: Fetch sub-offices for ANY office (not just specific regions)
    try {
      const subs = await getSubOffices(office.office_id);

      if (subs && subs.length > 0) {
        // STAFF ACCESS CONTROL: Filter sub-offices by assigned_office_ids
        if (user?.role === 'STAFF' && user?.assigned_office_ids?.length > 0) {
          const allowedSubs = subs.filter(s => user.assigned_office_ids.includes(s.office_id));
          setSubOffices(allowedSubs);
          console.log('[Registry] STAFF filtered sub-offices:', allowedSubs.map(s => s.code || s.name));
        } else {
          setSubOffices(subs);
        }
      } else {
        setSubOffices([]);
      }
    } catch (err) {
      console.error('Failed to fetch sub-offices:', err);
      setSubOffices([]);
    }
  };

  const enterSubOffice = (subOffice) => {
    // Block Staff from changing sub-office if they're locked to a specific one
    if (isStaffLocked && activeSubOffice && subOffice.office_id !== activeSubOffice.office_id) {
      toast.error('You can only access your assigned unit records');
      return;
    }
    setActiveSubOffice(subOffice);
    setActiveCategory(null);
    setActiveShelf(null);
    setViewMode('Active');
    setSearchTerm('');
  };

  const enterCategory = (category) => {
    if (!activeRegion) return;
    // DYNAMIC: If office has sub-offices (subOffices array not empty), require activeSubOffice
    // Otherwise, require activeOffice
    // In Normal Mode, enforce drilling down to Sub-Office for cleaner filing.
    // In Restricted Vault Mode, we allow "Recursive Viewing" from Parent Office, so we bypass this check.
    if (!inRestrictedVault && subOffices.length > 0 && !activeSubOffice) return;

    // if (subOffices.length === 0 && !activeOffice) return; // REMOVED: Allow Province-Level Navigation

    setActiveCategory(category);
    setActiveShelf(null);
    setViewMode('Active');
    setSearchTerm('');
  };

  const enterShelf = (shelf) => {
    setActiveShelf(shelf);
    setViewMode('Active');
    setSearchTerm('');
  };

  const goToRegion = async () => {
    if (isStaffLocked) {
      toast.error('You can only access your assigned office records');
      return;
    }

    // For regions that auto-skip office level (La Union=3, Ilocos Norte=1), check if they have real offices
    const rId = Number(activeRegion?.id);
    if ([1, 3].includes(rId)) {
      // Fetch offices to determine behavior
      const regionOffices = await getOfficesByRegion(activeRegion.id);
      setOffices(regionOffices);

      if (regionOffices.length > 0) {
        // Has real offices - stay in region and auto-select first office
        setActiveOffice(regionOffices[0]);
        setActiveSubOffice(null);
        // CRITICAL FIX: Fetch sub-offices for the auto-selected office
        try {
          const subs = await getSubOffices(regionOffices[0].office_id);
          setSubOffices(subs || []);
        } catch (err) {
          console.error('[Registry] Failed to fetch sub-offices:', err);
          setSubOffices([]);
        }
        setActiveCategory(null);
        setActiveShelf(null);
        setSearchTerm('');
      } else {
        // No real offices (was using virtual DEFAULT) - redirect back to provinces
        setActiveRegion(null);
        setActiveOffice(null);
        setActiveSubOffice(null);
        setSubOffices([]);
        setActiveCategory(null);
        setActiveShelf(null);
        setSearchTerm('');
        setInRestrictedVault(false);
        setVaultUnlocked(false);
        setShelves([]);
        toast.info(`${activeRegion?.name} has no offices configured. Returning to provinces.`);
      }
      return;
    }

    // Default behavior for other regions - just clear navigation below region level
    setActiveOffice(null);
    setActiveSubOffice(null);
    setSubOffices([]);
    setActiveCategory(null);
    setActiveShelf(null);
    setSearchTerm('');
  };
  const goToOffice = () => {
    if (isStaffLocked && activeSubOffice) {
      // Staff can go back to office level only if they have a sub-office assigned
      // But not if they're at office level already
    }
    setActiveSubOffice(null); setActiveCategory(null); setActiveShelf(null); setSearchTerm('');
  };
  const goToSubOffice = () => { setActiveCategory(null); setActiveShelf(null); setSearchTerm(''); };
  const goToCategory = () => { setActiveShelf(null); setSearchTerm(''); };

  const goToVaultRoot = () => {
    setActiveRegion(null);
    setActiveOffice(null);
    setActiveSubOffice(null);
    setSubOffices([]);
    setActiveCategory(null);
    setActiveShelf(null);
    setSearchTerm('');
    setShelves([]);
  };

  const enterRestrictedVault = () => {
    setVaultPasswordModal(true);
  };

  const handleVaultUnlock = async (password) => {
    try {
      const token = localStorage.getItem('dost_token');
      const res = await fetch('/api/settings/vault/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (data.success) {
        setVaultUnlocked(true);
        setInRestrictedVault(true);
        setActiveRegion(null);
        setActiveOffice(null);
        setActiveCategory(null);
        setActiveShelf(null);
        setVaultPasswordModal(false);
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const toggleViewMode = (mode) => setViewMode(mode);

  // Data Filters
  const visibleRegions = regions.filter(region => {
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';
    const isRegionalAdmin = user?.role === 'ADMIN' || user?.role === 'REGIONAL_ADMIN';
    const isAssigned = region.id == user?.region_id;
    // Super Admin and Regional Admins can see ALL regions
    return (isSuperAdmin || isRegionalAdmin || isAssigned);
  });

  const getVisibleCategories = () => {
    if (!activeRegion) return [];
    return categories.filter(cat => cat.region === 'Global' || cat.region === activeRegion.name);
  };

  // Actions
  const handleDeleteShelf = async (e, shelfName) => {
    e.stopPropagation();

    const isConfirmed = await confirm({
      title: 'Delete Shelf?',
      message: `Are you sure you want to delete "${shelfName}"? Records will be moved to "Unsorted".`,
      confirmLabel: 'Delete Shelf',
      variant: 'danger',
      icon: 'trash'
    });

    if (isConfirmed) {
      try {
        await deleteShelf({
          region_id: activeRegion.id,
          office_id: activeOffice.office_id,
          category: activeCategory.name,
          shelf: shelfName
        });
        toast.success("Shelf deleted successfully");
        // Refresh shelves
        refreshCurrentShelves();
      } catch (err) {
        console.error(err);
        toast.error("Failed to delete shelf");
      }
    }
  };

  const handleArchive = async (id) => {
    const isConfirmed = await confirm({
      title: 'Archive Record?',
      message: 'This record will be moved to archives and can be restored later.',
      confirmLabel: 'Archive',
      variant: 'warning',
      icon: 'warning'
    });

    if (isConfirmed) {
      await archiveRecord(id);
      fetchRecords({ region: activeRegion?.id, office_id: activeOffice?.office_id, category: activeCategory?.name, page: 1, status: viewMode, search: searchTerm });
    }
  };

  const handleEdit = (rec) => { setRecordToEdit(rec); setIsModalOpen(true); };

  const handleOperationSuccess = async () => {
    setIsModalOpen(false);
    setRecordToEdit(null);

    // FIX: Ensure we fetch using the CURRENTLY ACTIVE sub-office if present
    const targetOfficeId = activeSubOffice?.office_id || activeOffice?.office_id || '';
    const targetRegionId = activeRegion?.id || '';
    const targetCategory = activeCategory?.name || 'All';

    console.log('[Registry] Refreshing records with:', { targetRegionId, targetOfficeId, targetCategory });

    await fetchRecords({
      region: targetRegionId,
      office_id: targetOfficeId,
      category: targetCategory,
      page: 1,
      status: viewMode,
      search: searchTerm,
      shelf: activeShelf || ''
    });

    // Also refresh shelves explicitly
    refreshCurrentShelves();
  };

  const handleViewFile = (record) => {
    if (record.is_restricted) {
      setSelectedRestrictedRecord(record);
      setPasswordModalOpen(true);
    } else {
      const url = `/api/records/stream/${record.file_path}`;
      setViewerUrl(url);
      setViewerFile(record);
      setViewerOpen(true);
    }
  };

  const handleUnlockSuccess = (filePath, accessToken) => {
    const url = `/api/records/stream/${filePath}?token=${accessToken}`;
    setViewerUrl(url);
    setViewerFile(selectedRestrictedRecord);
    setViewerOpen(true);
  };

  // Auto-trigger viewer for deep links
  useEffect(() => {
    if (highlightedRecordId && !loading && !autoOpenRef.current) {
      if (records.length > 0) {
        const target = records.find(r => r.record_id == highlightedRecordId);
        if (target) {
          toast.success("Secure Record Located. Opening Access...");
          handleViewFile(target);
          autoOpenRef.current = true;
        }
      } else {
        // Only show error if we are genuinely searching for this ID (and fetch completed empty)
        if (searchTerm === highlightedRecordId) {
          toast.error("Restricted Record Not Found (Access Denied or Deleted)");
          autoOpenRef.current = true; // Stop trying
        }
      }
    }
  }, [highlightedRecordId, records, loading, searchTerm]);

  // Determine current navigation level
  const getCurrentLevel = () => {
    // Normal Mode
    if (!inRestrictedVault) {
      if (activeShelf) return 'records';
      if (activeCategory) return 'shelves';

      // DYNAMIC: Show sub-office level if office has sub-offices
      if (activeSubOffice) return 'categories';
      if (activeOffice && subOffices.length > 0) return 'suboffices';
      if (activeOffice && subOffices.length === 0) return 'categories'; // No sub-offices, go to categories

      if (activeRegion) return 'offices';
      return 'provinces';
    }

    // Restricted Vault Mode - Now with full sub-office support
    if (activeShelf) return 'vault_records';
    if (activeCategory) return 'vault_shelves';

    // DYNAMIC: Show sub-office level if office has sub-offices (mirrors Normal Mode logic)
    if (activeSubOffice) return 'vault_categories';
    if (activeOffice && subOffices.length > 0) return 'vault_suboffices';
    if (activeOffice && subOffices.length === 0) return 'vault_categories';

    if (activeRegion) return 'vault_offices';
    return 'vault_provinces';
  };

  // Determine if we should show the table
  const showTable = (getCurrentLevel() === 'records' || getCurrentLevel() === 'vault_records' || searchTerm.length > 0);

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-500 ${inRestrictedVault ? 'bg-slate-900 selection:bg-red-500/30' : 'bg-slate-50/50 selection:bg-indigo-100 selection:text-indigo-700'}`}>

      {/* HEADER & NAVIGATION */}
      <div className={`sticky top-0 z-30 backdrop-blur-xl border-b transition-all duration-300 ${inRestrictedVault ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200/60'}`}>
        <div className="max-w-[1920px] mx-auto px-6 lg:px-10 py-4">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">

            {/* Title & Badge */}
            <div className="flex items-center gap-4 self-start lg:self-auto">
              <div className={`p-3 rounded-2xl shadow-lg transition-all ${inRestrictedVault ? 'bg-red-500/10 text-red-500 shadow-red-900/20' : 'bg-indigo-600 text-white shadow-indigo-200'}`}>
                {inRestrictedVault ? <Icons.Lock /> : <Icons.Home />}
              </div>
              <div>
                <h1 className={`text-2xl font-black tracking-tight flex items-center gap-2 ${inRestrictedVault ? 'text-white' : 'text-slate-800'}`}>
                  {inRestrictedVault ? (
                    <>Restricted<span className="text-red-500">Vault</span></>
                  ) : (
                    <>Registry<span className="text-indigo-500">.</span></>
                  )}
                </h1>
                <p className={`text-xs font-bold uppercase tracking-widest ${inRestrictedVault ? 'text-slate-500' : 'text-slate-400'}`}>
                  {getCurrentLevel().replace('vault_', '').toUpperCase().replace('_', ' ')} LEVEL
                </p>
                {/* Staff Assignment Badge */}
                {user?.role === 'STAFF' && user?.office && (
                  <div className="mt-1 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Assigned: {user.office}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Breadcrumbs / Nav Pill */}
            <nav className={`flex items-center gap-1 p-1.5 rounded-2xl border shadow-sm overflow-x-auto max-w-full no-scrollbar ${inRestrictedVault ? 'bg-slate-800/50 border-slate-700' : 'bg-white/60 border-slate-200'}`}>
              {/* National Button - Hidden for Staff */}
              {!isStaffLocked ? (
                <button
                  onClick={goToRoot}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap
                    ${getCurrentLevel().includes('provinces')
                      ? (inRestrictedVault ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-slate-800 text-white shadow-lg shadow-slate-200')
                      : (inRestrictedVault ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100')}`}
                >
                  <span>Provinces</span>
                </button>
              ) : (
                /* Staff Locked Badge */
                <span className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap bg-amber-50 text-amber-700 border border-amber-200">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Restricted View
                </span>
              )}

              {inRestrictedVault && (
                <>
                  <Icons.ChevronRight />
                  <button onClick={goToVaultRoot} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap text-red-400 hover:text-red-300 hover:bg-red-500/10`}>
                    Vault Entrance
                  </button>
                </>
              )}

              {activeRegion && (
                <>
                  <Icons.ChevronRight />
                  {!isStaffLocked ? (
                    <button
                      onClick={goToRegion}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap
                      ${getCurrentLevel().includes('offices')
                          ? (inRestrictedVault ? 'bg-red-500 text-white' : 'bg-white text-indigo-600 shadow-md')
                          : (inRestrictedVault ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-indigo-600 hover:bg-white/50')}`}
                    >
                      {activeRegion.name}
                    </button>
                  ) : (
                    <span className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold whitespace-nowrap bg-slate-100 text-slate-500 cursor-not-allowed">
                      {activeRegion.name}
                    </span>
                  )}
                </>
              )}

              {activeOffice && (
                <>
                  <Icons.ChevronRight />
                  <button
                    onClick={goToOffice}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap
                    ${(getCurrentLevel().includes('categories') && !activeSubOffice) || getCurrentLevel().includes('suboffices')
                        ? (inRestrictedVault ? 'bg-red-500 text-white' : 'bg-white text-emerald-600 shadow-md')
                        : (inRestrictedVault ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-emerald-600 hover:bg-white/50')}`}
                  >
                    {activeOffice.code}
                  </button>
                </>
              )}

              {activeSubOffice && (
                <>
                  <Icons.ChevronRight />
                  <button
                    onClick={goToSubOffice}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap
                     ${getCurrentLevel().includes('categories')
                        ? (inRestrictedVault ? 'bg-red-500 text-white' : 'bg-white text-purple-600 shadow-md')
                        : (inRestrictedVault ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-purple-600 hover:bg-white/50')}`}
                  >
                    {activeSubOffice.code}
                  </button>
                </>
              )}

              {activeCategory && (
                <>
                  <Icons.ChevronRight />
                  <button
                    onClick={goToCategory}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap
                    ${getCurrentLevel().includes('shelves')
                        ? (inRestrictedVault ? 'bg-red-500 text-white' : 'bg-white text-amber-600 shadow-md')
                        : (inRestrictedVault ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-amber-600 hover:bg-white/50')}`}
                  >
                    {activeCategory.name}
                  </button>
                </>
              )}

              {activeShelf && (
                <>
                  <Icons.ChevronRight />
                  <span className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold whitespace-nowrap cursor-default
                     ${inRestrictedVault ? 'bg-red-500/20 text-red-200 border border-red-500/30' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                    {activeShelf}
                  </span>
                </>
              )}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3 w-full lg:w-auto">
              {/* Search Bar */}
              <div className={`relative flex-1 lg:w-64 group ${inRestrictedVault ? 'text-slate-300' : 'text-slate-500'}`}>
                <div className="absolute left-3 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-indigo-500"><Icons.Search /></div>
                <input
                  type="text"
                  placeholder="Deep Search..."
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-bold outline-none border transition-all
                    ${inRestrictedVault
                      ? 'bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-600 focus:bg-slate-800 focus:border-red-500'
                      : 'bg-slate-100 border-slate-200 text-slate-700 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'}`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <button
                onClick={() => { setRecordToEdit(null); setIsModalOpen(true); }}
                className={`relative overflow-hidden px-6 py-2.5 rounded-xl font-bold text-sm shadow-xl transition-all active:scale-95 flex items-center gap-2 group whitespace-nowrap
                  ${inRestrictedVault
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white hover:shadow-red-500/30'
                    : 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-slate-300'}`}
              >
                <Icons.Plus /> <span>New File</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="flex-1 p-6 lg:p-10 max-w-[1920px] w-full mx-auto">

        {/* ANIMATED GRID CONTENT */}
        <div className="min-h-[400px] animate-fade-in-up">

          {/* LEVEL 1: PROVINCES */}
          {(getCurrentLevel() === 'provinces' || getCurrentLevel() === 'vault_provinces') && !searchTerm && (
            <>
              <SectionHeader title={inRestrictedVault ? 'Secure Provincial Vaults' : 'Select Province'} subtitle="Choose a region to access its digital registry." isDark={inRestrictedVault} />
              {loading ? <GridSkeleton /> : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {visibleRegions.map((region) => (
                    <Card
                      key={region.id}
                      label={region.name}
                      subLabel={inRestrictedVault ? 'Encrypted' : (region.status === 'Inactive' ? 'Under Maintenance' : 'Provincial Office')}
                      icon={inRestrictedVault ? <Icons.Lock /> : (region.status === 'Inactive' ? <Icons.Maintenance /> : <Icons.Folder />)}
                      variant={inRestrictedVault ? 'danger' : (region.status === 'Inactive' ? 'maintenance' : 'blue')}
                      onClick={() => enterRegion(region)}
                      isDark={inRestrictedVault}
                    />
                  ))}

                  {!inRestrictedVault && (
                    <Card
                      label="Restricted Vault"
                      subLabel="Master Password Required"
                      icon={<Icons.Lock />}
                      variant="danger-dashed"
                      onClick={enterRestrictedVault}
                    />
                  )}
                </div>
              )}
            </>
          )}

          {/* LEVEL 2: OFFICES */}
          {(getCurrentLevel() === 'offices' || getCurrentLevel() === 'vault_offices') && !searchTerm && (
            <>
              <SectionHeader title={inRestrictedVault ? 'Secure Office Access' : 'Select Office Unit'} subtitle={`Departments under ${activeRegion?.name}`} isDark={inRestrictedVault} />
              {loading ? <GridSkeleton /> : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {/* STAFF ACCESS CONTROL: Filter offices to only show assigned office */}
                  {(isStaffLocked && activeOffice
                    ? offices.filter(o => o.office_id === activeOffice.office_id)
                    : offices
                  ).map((office) => {
                    const OfficeIcon = Icons[office.code] || Icons.Office;
                    return (
                      <Card
                        key={office.office_id}
                        label={office.code}
                        subLabel={office.name}
                        icon={inRestrictedVault ? <Icons.Lock /> : <OfficeIcon />}
                        variant={inRestrictedVault ? 'danger' : 'default'}
                        onClick={() => enterOffice(office)}
                        isDark={inRestrictedVault}
                      />
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* LEVEL 2.5: SUB-OFFICES (Dynamic - Works in both Normal and Vault Mode) */}
          {(getCurrentLevel() === 'suboffices' || getCurrentLevel() === 'vault_suboffices') && !searchTerm && (
            <>
              <SectionHeader title={`Sub-Units under ${activeOffice?.code}`} subtitle="Select a specific operational unit or center." isDark={inRestrictedVault} />
              {loading ? <GridSkeleton /> : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {/* STAFF ACCESS CONTROL: Filter sub-offices based on assignment */}
                  {/* If Staff is assigned to a sub-office code, only show that one */}
                  {/* If Staff is assigned to the parent office code, they can see all sub-offices under it */}
                  {(() => {
                    // Check if Staff is assigned to the parent office
                    const isAssignedToParentOffice = isStaffLocked && activeOffice && (
                      (activeOffice.code || '').toUpperCase() === staffAssignedOfficeCode ||
                      (activeOffice.name || '').toUpperCase() === staffAssignedOfficeCode
                    );

                    // If NOT assigned to parent, filter sub-offices to only show matching sub-office
                    if (isStaffLocked && !isAssignedToParentOffice) {
                      return subOffices.filter(s =>
                        (s.code || '').toUpperCase() === staffAssignedOfficeCode ||
                        (s.name || '').toUpperCase() === staffAssignedOfficeCode
                      );
                    }
                    // If assigned to parent office OR not staff, show all sub-offices
                    return subOffices;
                  })().map((subOffice) => (
                    <Card
                      key={subOffice.office_id}
                      label={subOffice.code}
                      subLabel={subOffice.name}
                      icon={<svg className={`w-12 h-12 drop-shadow-sm ${inRestrictedVault ? 'text-red-500' : 'text-purple-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" /></svg>}
                      variant={inRestrictedVault ? 'danger' : 'purple'}
                      onClick={() => enterSubOffice(subOffice)}
                      isDark={inRestrictedVault}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* LEVEL 3: CATEGORIES */}
          {(getCurrentLevel() === 'categories' || getCurrentLevel() === 'vault_categories') && !searchTerm && (
            <>
              <SectionHeader title="Select Classification" subtitle="Filter records by series or type." isDark={inRestrictedVault} />
              {loading ? <GridSkeleton /> : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {getVisibleCategories().map((cat) => (
                    <Card
                      key={cat.category_id}
                      label={cat.name}
                      subLabel="Classification Series"
                      icon={inRestrictedVault ? <Icons.Lock /> : <Icons.Codex className={!inRestrictedVault && FolderColors[cat.color] ? FolderColors[cat.color].icon : "text-amber-400"} />}
                      variant={inRestrictedVault ? 'danger' : (cat.color || 'amber')}
                      onClick={() => enterCategory(cat)}
                      isDark={inRestrictedVault}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* LEVEL 4: SHELVES */}
          {(getCurrentLevel() === 'shelves' || getCurrentLevel() === 'vault_shelves') && !searchTerm && (
            <>
              <SectionHeader title="Physical Shelves & Boxes" subtitle="Locate physical copies of your records." isDark={inRestrictedVault} />
              {loading ? <GridSkeleton /> : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {shelves.length === 0 ? (
                    <EmptyState
                      onClick={() => enterShelf('Unsorted')}
                      label="No Shelves Created"
                      subLabel="Go to 'Unsorted' to see unfiled records."
                      isDark={inRestrictedVault}
                    />
                  ) : (
                    shelves.map((shelf) => (
                      <Card
                        key={shelf}
                        label={shelf}
                        subLabel="Storage Unit"
                        icon={inRestrictedVault ? <Icons.Lock /> : <Icons.Shelf />}
                        variant={inRestrictedVault ? 'danger' : 'slate'}
                        onClick={() => enterShelf(shelf)}
                        isDark={inRestrictedVault}
                        action={shelf !== 'Unsorted' && (
                          <button onClick={(e) => handleDeleteShelf(e, shelf)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors z-20 relative" title="Delete Shelf">
                            <Icons.Trash />
                          </button>
                        )}
                      />
                    ))
                  )}
                </div>
              )}
            </>
          )}

          {/* LEVEL 5: RECORDS TABLE */}
          {showTable && (
            <div className={`rounded-3xl shadow-xl overflow-hidden border flex flex-col animate-fade-in relative min-h-[500px]
               ${inRestrictedVault ? 'bg-slate-800 border-slate-700 shadow-black/50' : 'bg-white border-slate-200 shadow-slate-200/50'}`}>

              {/* Table Header / Toolbar */}
              {!loading && (
                <div className={`px-6 py-4 border-b flex items-center justify-between ${inRestrictedVault ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${inRestrictedVault ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                    <span className={`text-xs font-bold uppercase tracking-widest ${inRestrictedVault ? 'text-slate-400' : 'text-slate-500'}`}>
                      {records.length} {records.length === 1 ? 'Record' : 'Records'} Found
                    </span>
                  </div>
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="text-xs font-bold text-red-500 hover:text-red-600 hover:underline">
                      Clear Search
                    </button>
                  )}
                </div>
              )}

              {loading && <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm p-4"><TableSkeleton /></div>}

              <div className="overflow-x-auto flex-1">
                <RecordTable
                  records={records}
                  viewMode={viewMode}
                  onEdit={handleEdit}
                  onArchive={handleArchive}
                  onRestore={restoreRecord}
                  onDestroy={destroyRecord}
                  onView={handleViewFile}
                  highlightedRecordId={highlightedRecordId}
                  confirm={confirm}
                />
              </div>

              {/* PAGINATION */}
              <div className={`p-4 border-t flex justify-between items-center gap-4 ${inRestrictedVault ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-50/50 border-slate-100 text-slate-500'}`}>
                <span className="text-xs font-bold uppercase">Page {pagination.current} of {pagination.pages}</span>
                <div className="flex items-center gap-2">
                  <PaginationButton disabled={pagination.current === 1} onClick={() => fetchRecords({ page: pagination.current - 1, region: activeRegion?.id, office_id: activeOffice?.office_id, category: activeCategory?.name, status: viewMode, search: searchTerm, shelf: activeShelf })} label="Previous" isDark={inRestrictedVault} />
                  <PaginationButton disabled={pagination.current === pagination.pages} onClick={() => fetchRecords({ page: pagination.current + 1, region: activeRegion?.id, office_id: activeOffice?.office_id, category: activeCategory?.name, status: viewMode, search: searchTerm, shelf: activeShelf })} label="Next" isDark={inRestrictedVault} />
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* MODALS */}
      <RecordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleOperationSuccess}
        recordToEdit={recordToEdit}
        currentRegion={activeRegion}
        currentOffice={activeOffice}
        currentSubOffice={activeSubOffice}
        currentCategory={activeCategory}
        isVaultMode={inRestrictedVault}
      />
      <FilePasswordModal isOpen={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} onSuccess={handleUnlockSuccess} record={selectedRestrictedRecord} />
      <DocumentViewerModal isOpen={viewerOpen} onClose={() => setViewerOpen(false)} fileUrl={viewerUrl} record={viewerFile} />

      {/* VAULT PASSWORD MODAL */}
      {
        vaultPasswordModal && (
          <VaultPasswordModal
            onClose={() => setVaultPasswordModal(false)}
            onUnlock={handleVaultUnlock}
          />
        )
      }
    </div >
  );
};

// --- SUB-COMPONENTS for Clean Code ---

const SectionHeader = ({ title, subtitle, isDark }) => (
  <div className="mb-8 animate-fade-in-down">
    <div className="flex items-center gap-2 mb-2">
      <div className={`h-px w-8 ${isDark ? 'bg-red-500' : 'bg-indigo-500'}`}></div>
      <span className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-red-400' : 'text-indigo-500'}`}>{subtitle}</span>
    </div>
    <h2 className={`text-3xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{title}</h2>
  </div>
);

const Card = ({ label, subLabel, icon, variant = 'default', onClick, isDark, action }) => {
  // Variant Styles
  const variants = {
    default: isDark ? 'hover:bg-red-900/20 border-red-900/30' : 'hover:bg-slate-50 border-slate-100',
    blue: 'hover:bg-blue-50 border-blue-100',
    purple: isDark ? 'hover:bg-red-900/20' : 'hover:bg-purple-50 border-purple-100',
    amber: isDark ? 'hover:bg-red-900/20' : 'hover:bg-amber-50 border-amber-100',
    slate: 'hover:bg-slate-100 border-slate-200',
    danger: 'hover:bg-red-900/20 border-red-900/10 hover:border-red-800/50',
    'danger-dashed': 'border-dashed border-red-200 hover:bg-red-50 hover:border-red-300',
    maintenance: 'bg-slate-50 border-slate-200 opacity-80 cursor-not-allowed hover:bg-slate-100'
  };

  const bgClass = isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border text-slate-700';

  // Custom Color Handling for Folders
  let hoverClass = variants[variant] || variants.default;
  let customColor = null;

  if (!isDark && FolderColors[variant]) {
    const c = FolderColors[variant];
    hoverClass = `${c.border} ${c.hover.replace('text', 'border')}`;
    customColor = c;
  }

  return (
    <div onClick={onClick} className={`group relative p-8 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer transition-all duration-300 shadow-sm hover:shadow-2xl hover:-translate-y-1 overflow-hidden ${bgClass} ${hoverClass}`}>
      {action && <div className="absolute top-4 right-4">{action}</div>}

      {/* Glow Effect */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-transparent 
         ${isDark ? 'to-red-900/20' : customColor ? customColor.grad : variant === 'blue' ? 'to-blue-500/5' : variant === 'purple' ? 'to-purple-500/5' : 'to-slate-500/5'}`}></div>

      <div className="relative z-10 flex flex-col items-center text-center gap-4">
        <div className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
          {icon}
        </div>
        <div>
          <h3 className={`font-bold text-lg leading-tight group-hover:scale-105 transition-transform ${isDark ? 'group-hover:text-red-400' : customColor ? customColor.hover : 'group-hover:text-black'}`}>{label}</h3>
          <p className={`text-xs font-medium mt-1 uppercase tracking-wide opacity-60 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{subLabel}</p>
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ onClick, label, subLabel, isDark }) => (
  <div onClick={onClick} className={`col-span-full border-2 border-dashed rounded-[2rem] p-12 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-opacity-50
     ${isDark ? 'border-slate-700 bg-slate-800/50 hover:bg-slate-800' : 'border-slate-200 bg-white/50 hover:bg-white'}`}>
    <div className={`p-4 rounded-full mb-4 ${isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-400'}`}>
      <Icons.Folder />
    </div>
    <h3 className={`text-xl font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{label}</h3>
    <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{subLabel}</p>
  </div>
);

const PaginationButton = ({ disabled, onClick, label, isDark }) => (
  <button
    disabled={disabled}
    onClick={onClick}
    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed
      ${isDark
        ? 'bg-slate-700 border-slate-600 hover:bg-slate-600 text-white border'
        : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-700'}`}
  >
    {label}
  </button>
);


// Vault Password Modal Component
const VaultPasswordModal = ({ onClose, onUnlock }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const success = await onUnlock(password);
    if (!success) {
      setError('Incorrect password. Access denied.');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-zoom-in">
        <div className="bg-red-50 p-6 border-b border-red-100 flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-white text-red-600 rounded-full flex items-center justify-center mb-3 shadow-sm border border-red-100">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h3 className="text-lg font-extrabold text-slate-800">Restricted Vault</h3>
          <p className="text-xs font-medium text-red-500 uppercase mt-1">Enter Master Password</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <input type="password" autoFocus required placeholder="Enter Master Password"
              className="w-full pl-4 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-bold text-center tracking-widest"
              value={password} onChange={(e) => setPassword(e.target.value)} />
            {error && <p className="text-xs text-red-500 font-bold mt-2 text-center animate-pulse">{error}</p>}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-xl">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-3 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-lg shadow-red-200">{loading ? 'Verifying...' : 'Enter Vault'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Registry;