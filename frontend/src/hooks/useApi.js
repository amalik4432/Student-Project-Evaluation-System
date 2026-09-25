import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";

export const useApi = (route, { params, enabled = true } = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(enabled && route));
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    if (!enabled || !route) return null;
    setLoading(true);
    setError("");
    const result = await api(route, { params });
    if (result.ok) {
      setData(result.data);
      setLoading(false);
      return result.data;
    }
    setError(result.message);
    setLoading(false);
    return null;
  }, [route, JSON.stringify(params || {}), enabled]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, loading, error, reload, setData };
};
