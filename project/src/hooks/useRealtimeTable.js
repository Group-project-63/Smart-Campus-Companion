import { useEffect, useState, useRef } from 'react';
import { supabase } from '../services/supabase';

// Generic hook to subscribe to a table and return live rows.
// table: string, filter: { column, value } optional to restrict
export default function useRealtimeTable(table, opts = {}) {
  const { match = null, select = '*', order = null } = opts;
  const [rows, setRows] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const channelRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const loadInitial = async () => {
      try {
        let q = supabase.from(table).select(select);
        if (match && match.column && typeof match.value !== 'undefined') {
          q = q.eq(match.column, match.value);
        }
        if (order && order.column) {
          q = q.order(order.column, { ascending: !!order.ascending });
        }
        const { data, error } = await q;
        if (error) throw error;
        if (mounted) {
          setRows(data || []);
          setLoaded(true);
        }
      } catch (err) {
        console.error('useRealtimeTable initial load failed:', err);
      }
    };

    loadInitial();

    // Subscribe to changes
    const chan = supabase.channel(`public:${table}`);
    channelRef.current = chan;

    chan.on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
      const record = payload.record;
      const type = payload.eventType;
      setRows((prev) => {
        try {
          if (type === 'INSERT') return [record, ...prev];
          if (type === 'DELETE') return prev.filter((r) => r.id !== record.id);
          if (type === 'UPDATE') return prev.map((r) => (r.id === record.id ? record : r));
        } catch (e) {
          console.error('realtime apply failed', e);
        }
        return prev;
      });
    }).subscribe();

    return () => {
      mounted = false;
      try { chan.unsubscribe(); } catch (e) {}
    };
  }, [table, match ? JSON.stringify(match) : null, select, order ? JSON.stringify(order) : null]);

  return [rows, loaded];
}
