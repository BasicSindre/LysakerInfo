import { useEffect, useRef, useState } from 'react';
import { fetchDepartures } from '../services/entur';
import { useRowFit } from '../hooks/useRowFit';
import { RailIcon } from './Icons';
import { STRINGS } from '../services/i18n.js';

const ENV_STOP_ID = import.meta.env.VITE_STOPPLACE_ID || 'NSR:StopPlace:58856';
const CLIENT = import.meta.env.VITE_ET_CLIENT_NAME || 'lysaker-info';

const CACHE_KEY = "departuresCache";
const NORMAL_INTERVAL = 60 * 1000;
const BACKOFF_STEPS = [5000, 15000, 30000];

const localeFor = (lang) => (lang === "en" ? "en-GB" : "no-NO");
const fmtTimeFactory = (lang, clock24) => (t) =>
  new Date(t).toLocaleTimeString(localeFor(lang), {
    hour: "2-digit",
    minute: "2-digit",
    hour12: !clock24
  });

const minutesDiff = (from, to) => Math.round((to - from) / 60000);

function lineClass(code) {
  if (!code) return "line-default";
  const c = code.toUpperCase();
  if (["L1"].includes(c)) return "line-L1";
  if (["L2"].includes(c)) return "line-L2";
  if (["L12"].includes(c)) return "line-L12";
  if (["L13"].includes(c)) return "line-L13";
  if (["L14"].includes(c)) return "line-L14";
  if (["R10"].includes(c)) return "line-R10";
  if (["R11"].includes(c)) return "line-R11";
  return "line-default";
}

export default function DeparturesPanel({
  language = "no",
  overrideStopPlaceId,
  clock24 = true,
  onCacheChange,
  onFetchingChange
}) {
  const S = STRINGS[language] || STRINGS.no;
  const fmtTime = fmtTimeFactory(language, clock24);

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [lastUpdatedTs, setLastUpdatedTs] = useState(null);
  const [isCache, setIsCache] = useState(false);

  const [bodyRef, rowsThatFit, measure] = useRowFit();

  const nowRef = useRef(new Date());
  const [, setTick] = useState(0);
  useEffect(() => {
    const secId = setInterval(() => { nowRef.current = new Date(); }, 1000);
    const renderId = setInterval(() => setTick(t => (t + 1) % 1_000_000), 10 * 1000);
    return () => { clearInterval(secId); clearInterval(renderId); };
  }, []);

  useEffect(() => {
    let alive = true;
    let failCount = 0;
    let timeoutId = null;
    const STOP_ID = overrideStopPlaceId || ENV_STOP_ID;

    const poll = async () => {
      if (!alive) return;
      try {
        onFetchingChange?.(true);
        setError(null);

        const json = await fetchDepartures({
          stopPlaceId: STOP_ID,
          clientName: CLIENT,
          timeRangeSec: 3 * 3600,
          num: 60
        });

        if (!alive) return;

        const parsedData = json?.data ? json.data : json;
        setData(parsedData);
        setLastUpdatedTs(Date.now());
        setIsCache(false);
        onCacheChange?.(false);

        localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: parsedData }));

        requestAnimationFrame(measure);
        failCount = 0;
        timeoutId = setTimeout(poll, NORMAL_INTERVAL);
      } catch (e) {
        if (!alive) return;
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { ts, data } = JSON.parse(cached);
          setData(data);
          setLastUpdatedTs(ts);
          setIsCache(true);
          onCacheChange?.(true);
        } else {
          setError((e && e.message) || S.error);
          onCacheChange?.(false);
        }
        requestAnimationFrame(measure);
        const delay = BACKOFF_STEPS[Math.min(failCount, BACKOFF_STEPS.length - 1)];
        failCount++;
        timeoutId = setTimeout(poll, delay);
      } finally {
        onFetchingChange?.(false);
      }
    };

    poll();
    return () => { alive = false; if (timeoutId) clearTimeout(timeoutId); };
  }, [measure, overrideStopPlaceId, onCacheChange, onFetchingChange, language, clock24]);

  let calls = data?.data?.stopPlace?.estimatedCalls ?? [];

  // ✅ Filtrer kun tog
  calls = calls.filter(c =>
    (c.serviceJourney?.journeyPattern?.line?.transportMode || "").toLowerCase() === "rail"
  );

  const items = calls.slice(0, rowsThatFit || 10);
  const now = nowRef.current;

  const updatedLabel = lastUpdatedTs
    ? `${(S.updated || "Updated")} ${fmtTime(lastUpdatedTs)}${isCache ? " (cache)" : ""}`
    : "";

  return (
    <section className="card">
      <div className="card-header">
        <h2>{S.departures}</h2>
        <div className="updated">{updatedLabel}</div>
      </div>

      <div ref={bodyRef} className="panel-body">
        <div className="list">
          {!data && !error && <div className="loading">{S.loadingDepartures}</div>}
          {error && <div className="error">{error}</div>}
          {data && calls.length === 0 && <div className="error">{S.noDepartures}</div>}

          {items.map((c, idx) => {
            const line = c.serviceJourney?.journeyPattern?.line;
            const code = (line?.publicCode || line?.name || '—').toString();
            const dest = c.destinationDisplay?.frontText || '—';
            const aimed = c.aimedDepartureTime ? new Date(c.aimedDepartureTime) : null;
            const expected = c.expectedDepartureTime ? new Date(c.expectedDepartureTime) : aimed;
            const delayed = aimed && expected && expected.getTime() !== aimed.getTime();
            const mins = expected ? minutesDiff(now, expected) : null;

            return (
              <div className="row" key={idx}>
                <div className="icon" aria-hidden="true"><RailIcon mode="rail" size={28} /></div>

                {delayed ? (
                  <div className="time-col">
                    <div className="time time-aimed strike">{aimed ? fmtTime(aimed) : '—'}</div>
                    <div className="time-expected">{expected ? fmtTime(expected) : '—'}</div>
                  </div>
                ) : (
                  <div className="time">{expected ? fmtTime(expected) : '—'}</div>
                )}

                <div className={`line-pill ${lineClass(code)}`} title={`Linje ${code}`}>{code}</div>

                <div>
                  <div className="title">{dest}</div>
                  <div className="meta">{mins != null ? `${mins} min` : '—'}</div>
                </div>

                <div>
                  {delayed
                    ? <span className="badge warn">{S.delayed}</span>
                    : <span className="badge ok">{S.ontime}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
