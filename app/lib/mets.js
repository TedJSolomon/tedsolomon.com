const METS_ID = 121;
const BASE    = 'https://statsapi.mlb.com/api/v1';

function padDate(d) {
  return d.toISOString().slice(0, 10);
}

function fmtGameTime(iso) {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    const weekday = d.toLocaleString('en-US', { weekday: 'short', timeZone: 'America/New_York' });
    const date    = d.toLocaleString('en-US', { month: 'short', day: 'numeric', timeZone: 'America/New_York' });
    const time    = d.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York' });
    return `${weekday}, ${date} · ${time} ET`;
  } catch {
    return null;
  }
}

// "New York Yankees" → "Yankees", "Chicago White Sox" → "White Sox", etc.
function shortName(fullName) {
  if (!fullName) return '';
  const words = fullName.split(' ');
  if (words.length <= 2) return fullName;
  // Drop first word (city) if ≥ 3 words
  return words.slice(1).join(' ');
}

export async function fetchMets() {
  try {
    const today  = new Date();
    const past   = new Date(today); past.setDate(today.getDate() - 10);
    const future = new Date(today); future.setDate(today.getDate() + 14);
    const season = today.getFullYear();

    const [schedRes, standRes] = await Promise.all([
      fetch(
        `${BASE}/schedule?teamId=${METS_ID}&sportId=1&startDate=${padDate(past)}&endDate=${padDate(future)}&gameType=R`,
        { next: { revalidate: 1800 } }
      ),
      fetch(
        `${BASE}/standings?leagueId=104&season=${season}&standingsTypes=regularSeason`,
        { next: { revalidate: 1800 } }
      ),
    ]);

    // ── Record ──────────────────────────────────────────
    let record = null;
    if (standRes.ok) {
      const sd = await standRes.json();
      outer: for (const div of sd.records ?? []) {
        for (const tr of div.teamRecords ?? []) {
          if (tr.team?.id === METS_ID) {
            record = {
              wins:  tr.wins,
              losses: tr.losses,
              pct:   tr.leagueRecord?.pct ?? '.000',
              divisionRank: tr.divisionRank ?? '-',
              gamesBack: tr.gamesBack ?? '-',
            };
            break outer;
          }
        }
      }
    }

    // ── Games ────────────────────────────────────────────
    let lastGame = null;
    let nextGame = null;

    if (schedRes.ok) {
      const sd = await schedRes.json();
      const games = [];
      for (const dateEntry of sd.dates ?? []) {
        for (const g of dateEntry.games ?? []) {
          games.push({ dateStr: dateEntry.date, ...g });
        }
      }
      games.sort((a, b) => new Date(a.gameDate) - new Date(b.gameDate));

      const finals   = games.filter((g) => g.status?.abstractGameState === 'Final');
      const upcoming = games.filter(
        (g) => g.status?.abstractGameState === 'Preview' ||
               g.status?.abstractGameState === 'Live'
      );

      if (finals.length) {
        const g        = finals[finals.length - 1];
        const metsHome = g.teams.home.team.id === METS_ID;
        const metsScore = metsHome ? g.teams.home.score : g.teams.away.score;
        const oppScore  = metsHome ? g.teams.away.score : g.teams.home.score;
        const opp       = metsHome ? g.teams.away.team.name : g.teams.home.team.name;
        lastGame = {
          date:      g.dateStr,
          opponent:  shortName(opp),
          metsScore,
          oppScore,
          result:    metsScore > oppScore ? 'W' : 'L',
          homeAway:  metsHome ? 'vs' : '@',
        };
      }

      if (upcoming.length) {
        const g        = upcoming[0];
        const isLive   = g.status?.abstractGameState === 'Live';
        const metsHome = g.teams.home.team.id === METS_ID;
        const opp      = metsHome ? g.teams.away.team.name : g.teams.home.team.name;
        nextGame = {
          date:     g.dateStr,
          time:     fmtGameTime(g.gameDate),
          opponent: shortName(opp),
          homeAway: metsHome ? 'vs' : '@',
          isLive,
          liveScore: isLive ? {
            mets: metsHome ? g.teams.home.score : g.teams.away.score,
            opp:  metsHome ? g.teams.away.score : g.teams.home.score,
          } : null,
        };
      }
    }

    return { record, lastGame, nextGame };
  } catch (err) {
    return { error: err.message };
  }
}
