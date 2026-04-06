/*
  To huanli233,
  
  这是一个小小的纪念页面，记录了你在GitHub上的点点滴滴。虽然我们无法改变结局，但希望在这个页面里，你的努力和热情能被更多人看到和记住。

  你是一个才华横溢的开发者，创造了许多优秀的软件，影响了安卓手表生态。我们为你感到骄傲，也为失去你而感到痛心。
  
  愿这个页面能成为一个小小的纪念馆，让更多人了解你，记住你。再见了，愿花与美梦常与你相伴。
*/

import React, { useState, useEffect } from 'react';
import { experimental_extendTheme as extendTheme, CssVarsProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppBar, Toolbar, Typography, Box, Container, Link, Skeleton, Divider } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import './App.css';

// 判断今天是否是纪念日
async function checkMemorialDay() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  // 2月10日
  if (month === 2 && day === 10) return true;

  // 2026年2月16日
  if (year === 2026 && month === 2 && day === 16) return true;

  // 调API查假期信息
  try {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const res = await fetch(`https://timor.tech/api/holiday/info/${dateStr}`);
    if (res.ok) {
      const data = await res.json();
      const typeName = data.type?.name || '';

      // 中元节
      const lunar = data.lunar || '';
      if (lunar.includes('七月') && lunar.includes('十五')) return true;

      // 清明节
      if (typeName.includes('清明')) return true;
    }
  } catch {
    // API挂了用本地表
  }

  // 本地清明假期表
  const qingming = {
    2024: [[4, 4], [4, 5], [4, 6]],
    2025: [[4, 4], [4, 5], [4, 6]],
    2026: [[4, 4], [4, 5], [4, 6]],
    2027: [[4, 4], [4, 5], [4, 6]],
    2028: [[4, 4], [4, 5], [4, 6]],
  };
  const qm = qingming[year];
  if (qm && qm.some(d => month === d[0] && day === d[1])) return true;

  // 本地中元节表
  const zhongyuan = {
    2024: [8, 18], 2025: [9, 6], 2026: [8, 27],
    2027: [8, 16], 2028: [9, 3], 2029: [8, 24],
    2030: [8, 13], 2031: [9, 1], 2032: [8, 21],
    2033: [8, 10], 2034: [8, 30], 2035: [8, 19],
  };
  const zy = zhongyuan[year];
  if (zy && month === zy[0] && day === zy[1]) return true;

  return false;
}

// API失败时的兜底数据
const FALLBACK_USER = {
  login: 'huanli233',
  name: 'huanli233',
  bio: 'ε(*･ω･)_/ﾟ:･☆\n烂尾偷懒王 抱歉w',
  avatar_url: 'https://avatars.githubusercontent.com/u/76041494?v=4',
  html_url: 'https://github.com/huanli233',
  public_repos: 67,
  followers: 82,
  following: 43,
  created_at: '2020-12-15T09:49:12Z',
  updated_at: '2026-01-06T16:13:37Z',
};

// 请求失败回退
async function fetchJSON(url, fallback) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return fallback;
  }
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return '今天';
  if (days === 1) return '昨天';
  if (days < 30) return `${days} 天前`;
  if (days < 365) return `${Math.floor(days / 30)} 个月前`;
  return `${Math.floor(days / 365)} 年前`;
}

function formatDate(dateStr) {
  if (!dateStr) return '未知';
  const d = new Date(dateStr);
  return d.toLocaleString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const theme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        background: { default: '#fffef9', paper: '#fffef9' },
        text: { primary: '#1a1a1a', secondary: '#666' },
      },
    },
    dark: {
      palette: {
        background: { default: '#0d0d0d', paper: '#0d0d0d' },
        text: { primary: '#e0e0e0', secondary: '#888' },
      },
    },
  },
  typography: {
    fontFamily: '"Noto Sans SC", system-ui, -apple-system, sans-serif',
  },
  shape: { borderRadius: 0 },
});

function MemorialOverlay() {
  if (typeof window === 'undefined') return null;
  return (
    <style>{`
      html {
        filter: grayscale(100%) !important;
        -webkit-filter: grayscale(100%) !important;
      }
    `}</style>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [repos, setRepos] = useState([]);
  const [stats, setStats] = useState(null);
  const [lastPush, setLastPush] = useState(null);
  const [lastCommit, setLastCommit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMemorialDay, setIsMemorialDay] = useState(false);

  useEffect(() => {
    checkMemorialDay().then((val) => {
      setIsMemorialDay(val);
      if (val && typeof document !== 'undefined') {
        document.documentElement.style.filter = 'grayscale(100%)';
      }
    });

    (async () => {
      const [userData, reposData, eventsData] = await Promise.all([
        fetchJSON('https://api.github.com/users/huanli233', FALLBACK_USER),
        fetchJSON('https://api.github.com/users/huanli233/repos?per_page=100&sort=updated', []),
        fetchJSON('https://api.github.com/users/huanli233/events?per_page=100', []),
      ]);

      setUser(userData || FALLBACK_USER);

      const owned = (reposData || [])
        .filter(r => !r.fork);
      setRepos(owned);

      // 算下总star和fork数
      const totalStars = owned.reduce((s, r) => s + r.stargazers_count, 0);
      const totalForks = owned.reduce((s, r) => s + r.forks_count, 0);
      setStats({ totalStars, totalForks });

      // events里有最近推送时间
      const pushEvent = (eventsData || []).find(e => e.type === 'PushEvent');
      if (pushEvent) {
        setLastPush(pushEvent.created_at);
      }

      // 拿最新仓库抓develop分支commit
      if (owned.length > 0) {
        const latest = [...owned].sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))[0];
        if (!lastPush) {
          setLastPush(latest.pushed_at);
        }

        const commitRes = await fetchJSON(
          `https://api.github.com/repos/${latest.owner.login}/${latest.name}/commits?per_page=1&sha=develop`,
          null
        );

        if (commitRes?.length > 0) {
          const c = commitRes[0];
          setLastCommit({
            sha: c.sha?.substring(0, 7),
            message: c.commit?.message || '',
            url: c.html_url,
            repo: latest.full_name,
            time: c.commit?.author?.date || c.commit?.committer?.date,
            author: c.commit?.author?.name || c.author?.login || latest.owner.login,
          });
        } else {
          // develop不存在试默认分支
          const defaultRes = await fetchJSON(
            `https://api.github.com/repos/${latest.owner.login}/${latest.name}/commits?per_page=1`,
            null
          );
          if (defaultRes?.length > 0) {
            const c = defaultRes[0];
            setLastCommit({
              sha: c.sha?.substring(0, 7),
              message: c.commit?.message || '',
              url: c.html_url,
              repo: latest.full_name,
              time: c.commit?.author?.date || c.commit?.committer?.date,
              author: c.commit?.author?.name || c.author?.login || latest.owner.login,
            });
          } else {
            setLastCommit({
              sha: '',
              message: '',
              repo: latest.full_name,
              time: latest.pushed_at,
              author: user?.login || 'huanli233',
              url: latest.html_url,
            });
          }
        }
      }

      setLoading(false);
    })();
  }, []);

  const sortedRepos = [...repos].sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));
  const topRepos = sortedRepos.slice(0, 8);

  return (
    <CssVarsProvider theme={theme}>
      <CssBaseline />

      {isMemorialDay && <MemorialOverlay />}

      {/* 纪念日横幅 */}
      {isMemorialDay && (
        <Box
          sx={{
            bgcolor: '#7c7c7cff',
            borderBottom: '1px solid',
            borderColor: 'divider',
            py: 2,
            px: 2,
            textAlign: 'center',
          }}
        >
          <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500}}>
            今日为纪念日 · 再见，愿逝者安息，生者安康
          </Typography>
        </Box>
      )}

      <AppBar position="static" color="transparent" sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar sx={{ minHeight: 56 }}>
          <Typography variant="body1" sx={{ fontWeight: 600, flexGrow: 1 }}>
            remember-huanli233
          </Typography>
          <Link href="https://github.com/huanli233" target="_blank" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <GitHubIcon sx={{ fontSize: 18 }} />
            <Typography variant="caption">huanli233</Typography>
          </Link>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 6 }}>
        {/* 讣告 */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', letterSpacing: 0.5 }}>
            以下内容转自 Sky Wear
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, mt: 1, mb: 2, lineHeight: 1.4 }}>
            再见，愿花与美梦常与你相伴
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.9, whiteSpace: 'pre-line' }}>
{`我们怀着沉痛的心情告知大家：

我们的朋友huanli233因深受心理问题困扰，于 2026 年 2 月 10 日选择结束自己的生命。

他是一位优秀的开发者，开发了多款影响安卓手表生态的软件，包括 WeichatPro、XTCBOT、SystemPlus、灵应用商店、BiliZepam 等。

我们痛惜失去一位年轻而有才华的伙伴。愿他在另一个世界卸下所有重担，获得安宁。`}
          </Typography>
        </Box>

        {/* GitHub数据 */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
            GitHub 统计
          </Typography>

          <Box sx={{ display: 'flex', gap: 4, mb: 4, flexWrap: 'wrap' }}>
            <StatBlock label="仓库" value={loading ? null : (user?.public_repos || 0)} />
            <StatBlock label="关注者" value={loading ? null : (user?.followers || 0)} />
            <StatBlock label="Stars" value={loading ? null : stats?.totalStars} />
            <StatBlock label="最后推送" value={loading ? null : (lastPush ? timeAgo(lastPush) : '未知')} />
          </Box>

          {/* 最后一次commit详情 */}
          {lastCommit && (
            <Box sx={{ mb: 4, py: 2, px: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                最后一次提交
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                {lastCommit.sha && (
                  <Typography
                    component="span"
                    variant="body2"
                    sx={{ fontFamily: 'monospace', color: 'text.secondary' }}
                  >
                    {lastCommit.sha}
                  </Typography>
                )}
                {lastCommit.message && (
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {lastCommit.message}
                  </Typography>
                )}
                {!lastCommit.message && lastCommit.sha && (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    （无法获取提交信息）
                  </Typography>
                )}
              </Box>
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {lastCommit.author} · {lastCommit.time ? formatDate(lastCommit.time) : '未知'}
                </Typography>
                {lastCommit.repo && (
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {lastCommit.repo}
                  </Typography>
                )}
                {lastCommit.url && (
                  <Link href={lastCommit.url} target="_blank" underline="hover" variant="caption">
                    查看 commit
                  </Link>
                )}
              </Box>
            </Box>
          )}

          {/* 贡献图 */}
          <Box sx={{ mb: 4 }}>
            <img
              src="https://ghchart.rshah.org/huanli233"
              alt="GitHub 贡献图"
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </Box>

          {/* 仓库列表 */}
          {topRepos.length > 0 && (
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                项目
              </Typography>
              {topRepos.map((repo) => (
                <Box
                  key={repo.name}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    py: 1,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Link
                    href={repo.html_url}
                    target="_blank"
                    underline="hover"
                    sx={{ color: 'text.primary', fontWeight: 500 }}
                  >
                    {repo.name}
                  </Link>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    {repo.language && (
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {repo.language}
                      </Typography>
                    )}
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {repo.stargazers_count}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                      {timeAgo(repo.pushed_at)}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* 底部 */}
        <Box sx={{ textAlign: 'center', pt: 4, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            数据来源 GitHub API
          </Typography>
        </Box>
      </Container>
    </CssVarsProvider>
  );
}

function StatBlock({ label, value }) {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.2, fontVariantNumeric: 'tabular-nums' }}>
        {value == null ? <Skeleton width={40} /> : value}
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
    </Box>
  );
}
