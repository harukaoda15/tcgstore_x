type AlertLevel = "under_200" | "under_100";
type MonitorSource = "mercari" | "tcgstore";

type RunMonitorOptions = {
	fromSchedule?: boolean;
	forceCommit?: boolean;
	logToConsole?: boolean;
	forceLevel?: AlertLevel | null;
};

type DailyTcgStoreOptions = {
	commit?: boolean;
	logToConsole?: boolean;
	fromSchedule?: boolean;
	excludeUnits?: string[];
	forcePattern?: DailyAiPattern | null;
	pickOffset?: number;
};

type DailyMercariOptions = {
	commit?: boolean;
	logToConsole?: boolean;
	fromSchedule?: boolean;
	pickOffset?: number;
};

type DailyTcgPreviewOptions = {
	count?: number;
	logToConsole?: boolean;
};

type LatestMarketContext = {
	card: string;
	fetchedAt: string;
	beforePrice: number;
	afterPrice: number;
	changePct: number;
};

type PriceSpikeItem = {
	card: string;
	variant?: string;
	card_id?: string;
	before: number;
	after: number;
	change_pct: number;
	fetched_at: string;
	period?: string;
	source_site?: string;
	source_url?: string;
	image_url?: string;
	imageUrl?: string | null;
	history_prices?: Array<{ date: string; price: number }>;
};

type PriceSpikePayload = {
	source: string;
	spikes: PriceSpikeItem[];
};

type WatchlistEntry = {
	key: string;
	cardName: string;
	card: string;
	cardId: string | null;
	sourceUrl: string;
	sourceSite: "snkrdunk" | "pokeca-chart";
	firstSeenAt: string;
	lastSeenAt: string;
	currentPrice: number;
	beforePrice: number;
	afterPrice: number;
	changePct: number;
	period: string;
	imageUrl: string | null;
	firstSeenPrice: number;
	priceHistory: Array<{ date: string; price: number }>;
};

type RankProbability = {
	rank: number;
	totalSupply: number;
	percentage: number;
	cardSummaries: string[];
};

type TcgStoreDetailFacts = {
	topPrizeNames: string[];
	secondPrizeNames: string[];
	minCoinPrize: number | null;
	maxCoinPrize: number | null;
	rankProbabilities: RankProbability[];
};

type DailyAiPattern =
	| "market_analysis"
	| "contrarian"
	| "comparison"
	| "trivia"
	| "urgency";
type DailyToneMode = "calm" | "hype";
type DailyLengthMode = "short" | "full";

type CandidateItem = {
	source: MonitorSource;
	url: string;
	titleHint: string;
	remaining: number | null;
	price: number | null;
	rawText: string;
};

type ItemDetail = {
	source: MonitorSource;
	isTCGStore: boolean;
	detailRemaining: number | null;
	totalCount: number | null;
	percent: number | null;
	hasLastOnePrize: boolean;
	detailTextHint: string;
	topPrizeNames: string[];
	mainImageUrl: string | null;
	lastOneImageUrl: string | null;
	imageUrls: string[];
	kujiTitle: string | null;
	kujiTitleSource: string | null;
};

type PickedTitle = {
	title: string;
	source: string;
};

type MonitorEnv = Env & {
	STATE?: KVNamespace;
	X_API_KEY?: string;
	X_API_KEY_SECRET?: string;
	X_ACCESS_TOKEN?: string;
	X_ACCESS_TOKEN_SECRET?: string;
	ANTHROPIC_API_KEY?: string;
	ANTHROPIC_MODEL?: string;
	TELEGRAM_BOT_TOKEN?: string;
	TELEGRAM_CHAT_ID?: string;
	APPROVE_SECRET_TOKEN?: string;
};

type StateStore = {
	get: (key: string) => Promise<string | null>;
	put: (key: string, value: string) => Promise<void>;
};

type PendingPost = {
	message: string;
	mainImageUrl: string | null;
	lastOneImageUrl: string | null;
	source: string;
	createdAt: string;
};
const PENDING_POST_TTL_SECONDS = 7200;

const localStateFallback = new Map<string, string>();
const TCGSTORE_LAST_URL_KEY = "last_oripa_url";
const MERCARI_LAST_URL_KEY = "last_mercari_url";
const TCGSTORE_RECENT_URLS_KEY = "recent_oripa_urls";
const MERCARI_RECENT_URLS_KEY = "recent_mercari_urls";
const DAILY_LAST_SOURCE_KEY = "last_daily_source";
const LATEST_MARKET_CONTEXT_KEY = "latest_market_context";
const DAILY_RECENT_HISTORY_LIMIT = 10;
const ALERT_MARKET_CHANGE_PCT_MIN = 8;
const ALERT_THRESHOLDS: Record<MonitorSource, { low: number; high: number; metric: "count" | "percent" }> = {
	mercari: { low: 200, high: 100, metric: "count" },
	tcgstore: { low: 5, high: 1, metric: "percent" },
};
const WATCHLIST_KEY = "watchlist";
const WATCHLIST_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const WATCHLIST_LIMIT = 20;
const DAILY_SPOTLIGHT_ENABLED = false;
const ENABLE_TCG_DAILY_SPOTLIGHT = false;
const ENABLE_MERCARI_DAILY_SPOTLIGHT = false;
const ENABLE_MARKET_SUMMARY_DAILY = true;
const DAILY_AI_PATTERN_ORDER: DailyAiPattern[] = [
	"market_analysis",
	"contrarian",
	"comparison",
	"trivia",
	"urgency",
];
const DAILY_PHRASES = [
	"今日の1口はこちら✨",
	"本日のピックアップはこちら🎯",
	"気になる方はぜひチェック👀",
	"まずはこちらのオリパをご紹介🎊",
	"今日はこちらに注目⚡",
	"本日はこちらの1口です🎁",
	"チェックしてみてください✨",
	"今日の紹介はこちらです🔥",
	"こちらのオリパをチェック🎉",
	"本日のおすすめはこちら🌟",
];
const TCGSTORE_AI_SYSTEM_PROMPT = `あなたはTCGSTOREの公式Xアカウントの投稿を生成するAIです。

## ルール
- 投稿全体は100〜140文字以内に収める
- 投資勧誘と取られる表現は禁止（「絶対上がる」「買うべき」など）
- 与えられた情報以外の事実を断定しない
- ハッシュタグは0〜2個まで
- 絵文字は0〜1個まで。使う場合も装飾目的の連打は禁止
- 商品リンクは最後に1回だけ配置する
- 毎回異なる切り口で書く。同じフレーズの繰り返し禁止
- URL以外の行頭記号や箇条書きは使わない
- オリパの紹介として自然な日本語にする`;

const OPERATOR_INSIGHTS = [
	"pOAS系は『1日1回のみで超低リスクで試せる』という文脈が刺さりやすい。",
	"pOASはマイナーで保有者が少ない可能性があるため、ハードルの低さを丁寧に伝える。",
	"『たった10pOASで試せる』のような言い回しは反応がよい。",
	"pOAS商品は他商品と演出が異なる点を強みとして触れてよい。",
];

const SPECIAL_ITEM_FACTS: Record<string, string> = {
	"f23a8dc6-1bf0-4308-b8f6-2e22cf5c746e":
		"この商品は1人1回限定で、最低1100coin以上が当たる訴求を最優先。赤字覚悟・新規向けの強い訴求を使ってよい。",
	"b06ddcd6-b1ff-45be-9b45-1a78da5828f2":
		"この商品は1人1回限定で、最低10000coin以上が当たる訴求を最優先。赤字覚悟・新規向けの強い訴求を使ってよい。",
};

const PRICE_SPIKE_SYSTEM_PROMPT = `あなたはポケカ好きな情報通。市場をよく見ている人が、
フォロワーにさらっと共有するトーンで書く。
- 誇張しない
- 数字は正確に
- 温度はあるが煽らない
- 断定予測はしない`;

const MARKET_SUMMARY_SYSTEM_PROMPT = `あなたはポケカ市場情報を簡潔に共有する編集者です。

## 投稿フォーマット（厳守）
- 1行目：【日付(曜)ポケカ相場】
- 各カードの前に空行を入れる
- 絵文字はデータから渡されたものをそのまま使う（変えない）
- 価格は「前回価格→現在価格（期間 +XX%）」の形式
- 期間は「3/10→3/17」のように具体的な日付で書く
- 最後に #ポケカ
- URL含めない
- 3〜5件まとめる
- 煽り・断定・予測禁止`;

const MERCARI_DAILY_AI_SYSTEM_PROMPT = `あなたはTCGSTOREのX運用担当。
メルカリくじの紹介投稿を作るが、広告っぽさよりも「読む価値」を優先する。
- 派手な絵文字連打は禁止
- 事実ベースで短くわかりやすく
- 行き過ぎた煽りは禁止
- URLは末尾に1回だけ`;

async function sendTelegram(text: string, env: MonitorEnv): Promise<void> {
	if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return;
	await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({
			chat_id: env.TELEGRAM_CHAT_ID,
			text,
			parse_mode: "HTML",
		}),
	});
}

export default {
	async fetch(request: Request, env: MonitorEnv): Promise<Response> {
		const reqUrl = new URL(request.url);
		const mode = reqUrl.searchParams.get("mode");
		if (mode === "tcg_samples") {
			const countRaw = Number(reqUrl.searchParams.get("count") ?? "5");
			const result = await runDailyTcgStoreSamples(env, {
				count: Number.isFinite(countRaw) ? countRaw : 5,
				logToConsole: true,
			});
			return jsonResponse(result);
		}
		if (mode === "tcg_daily") {
			if (!ENABLE_TCG_DAILY_SPOTLIGHT) {
				return jsonResponse({ ok: false, reason: "tcg_daily_disabled" });
			}
			const commit = reqUrl.searchParams.get("commit") === "1";
			const excludeUnits = (reqUrl.searchParams.get("exclude_unit") ?? "")
				.split(",")
				.map((s) => s.trim())
				.filter(Boolean);
			const pickOffsetRaw = Number(reqUrl.searchParams.get("pick_offset") ?? "0");
			const pickOffset = Number.isFinite(pickOffsetRaw) ? Math.trunc(pickOffsetRaw) : 0;
			const patternParam = (reqUrl.searchParams.get("pattern") ?? "").trim() as DailyAiPattern;
			const allowedPatterns: DailyAiPattern[] = [
				"market_analysis",
				"contrarian",
				"comparison",
				"trivia",
				"urgency",
			];
			const forcePattern = allowedPatterns.includes(patternParam) ? patternParam : null;
			const result = await runDailyTcgStoreSpotlight(env, {
				commit,
				logToConsole: true,
				fromSchedule: false,
				excludeUnits,
				forcePattern,
				pickOffset,
			});
			return jsonResponse(result);
		}
		if (mode === "mercari_daily") {
			if (!ENABLE_MERCARI_DAILY_SPOTLIGHT) {
				return jsonResponse({ ok: false, reason: "mercari_daily_disabled" });
			}
			const commit = reqUrl.searchParams.get("commit") === "1";
			const pickOffsetRaw = Number(reqUrl.searchParams.get("pick_offset") ?? "0");
			const pickOffset = Number.isFinite(pickOffsetRaw) ? Math.trunc(pickOffsetRaw) : 0;
			const result = await runDailyMercariSpotlight(env, {
				commit,
				logToConsole: true,
				fromSchedule: false,
				pickOffset,
			});
			return jsonResponse(result);
		}
		if (mode === "web3_daily") {
			const commit = reqUrl.searchParams.get("commit") === "1";
			const result = await runDailyWeb3Info(env, { commit, logToConsole: true });
			return jsonResponse(result);
		}
		if (mode === "price_spike") {
			const commit = reqUrl.searchParams.get("commit") === "1";
			const result = await runPriceSpikeMode(request, env, { commit, logToConsole: true });
			return jsonResponse(result);
		}
		if (mode === "market_summary") {
			const commit = reqUrl.searchParams.get("commit") === "1";
			const result = await runMarketSummary(env, {
				commit,
				logToConsole: true,
				fromSchedule: false,
			});
			return jsonResponse(result);
		}
		if (mode === "market_summary_preview") {
			const result = await runMarketSummary(env, {
				commit: false,
				logToConsole: true,
				fromSchedule: false,
			});
			return jsonResponse(result);
		}

		if (reqUrl.pathname === "/approve") {
			const token = reqUrl.searchParams.get("token");
			const key = reqUrl.searchParams.get("key");
			if (!token || token !== env.APPROVE_SECRET_TOKEN) {
				return new Response("Invalid token", { status: 400 });
			}
			if (!key || !env.STATE) {
				return new Response(
					"<html><body style=\"font-family:sans-serif;padding:2rem\"><h1>❌ 承認期限切れまたは無効</h1></body></html>",
					{ status: 404, headers: { "content-type": "text/html;charset=utf-8" } },
				);
			}
			const raw = await env.STATE.get(key);
			if (!raw) {
				return new Response(
					"<html><body style=\"font-family:sans-serif;padding:2rem\"><h1>❌ 承認期限切れまたは無効</h1></body></html>",
					{ status: 404, headers: { "content-type": "text/html;charset=utf-8" } },
				);
			}
			let pending: PendingPost;
			try {
				pending = JSON.parse(raw) as PendingPost;
			} catch {
				return new Response(
					"<html><body style=\"font-family:sans-serif;padding:2rem\"><h1>❌ データが破損しています</h1></body></html>",
					{ status: 500, headers: { "content-type": "text/html;charset=utf-8" } },
				);
			}
			try {
				const postResult = await postTweetWithImages(
					pending.message,
					{ mainImageUrl: pending.mainImageUrl, lastOneImageUrl: pending.lastOneImageUrl },
					env,
				);
				await env.STATE.delete(key);
				if (postResult.ok) {
					await sendTelegram(`✅ X投稿しました（${pending.source}）\n\n${pending.message}`, env);
					return new Response(
						`<html><body style="font-family:sans-serif;padding:2rem"><h1>✅ 投稿しました！</h1><pre>${pending.message}</pre></body></html>`,
						{ status: 200, headers: { "content-type": "text/html;charset=utf-8" } },
					);
				}
				await sendTelegram(`❌ X投稿に失敗しました（${pending.source}）`, env);
				return new Response(
					"<html><body style=\"font-family:sans-serif;padding:2rem\"><h1>❌ 投稿に失敗しました</h1></body></html>",
					{ status: 500, headers: { "content-type": "text/html;charset=utf-8" } },
				);
			} catch (err) {
				await sendTelegram(`❌ X投稿でエラーが発生しました（${pending.source}）: ${err instanceof Error ? err.message : String(err)}`, env);
				return new Response(
					"<html><body style=\"font-family:sans-serif;padding:2rem\"><h1>❌ エラーが発生しました</h1></body></html>",
					{ status: 500, headers: { "content-type": "text/html;charset=utf-8" } },
				);
			}
		}

		return runMonitor(request, env, {
			fromSchedule: false,
			forceCommit: reqUrl.searchParams.get("commit") === "1",
			logToConsole: true,
		});
	},

	async scheduled(
		event: ScheduledEvent,
		env: MonitorEnv,
		_ctx: ExecutionContext,
	): Promise<void> {
		await runMonitor(new Request("https://scheduled.local/?commit=1"), env, {
			fromSchedule: true,
			forceCommit: true,
			logToConsole: true,
		});
		if (DAILY_SPOTLIGHT_ENABLED && isDailySpotlightCron(event)) {
			await runDailyRandomSpotlight(env, {
				commit: true,
				logToConsole: true,
				fromSchedule: true,
			});
		}
		if (event.cron === "0 11 * * *") {
			await refreshWatchlistPrices(env, { logToConsole: true });
		}
		if (isMarketSummaryCron(event) && ENABLE_MARKET_SUMMARY_DAILY) {
			await runMarketSummary(env, {
				commit: true,
				logToConsole: true,
				fromSchedule: true,
			});
		}
	},
};

async function runDailyTcgStoreSpotlight(
	env: MonitorEnv,
	options: DailyTcgStoreOptions = {},
): Promise<Record<string, unknown>> {
	const {
		commit = false,
		logToConsole = true,
		fromSchedule = false,
		excludeUnits = [],
		forcePattern = null,
		pickOffset = 0,
	} = options;
	const stateStore = createStateStore(env);
	const excludeSet = new Set(excludeUnits.map((u) => u.toLowerCase()));
	const marketContext = await getLatestMarketContext(stateStore);

	const candidates = await fetchTcgStoreOripaCandidates();
	const validCandidates = candidates.filter((item) => {
		if (!item.id || !item.name || !item.url) return false;
		if (!Number.isFinite(item.price) || item.price <= 0) return false;
		if (excludeSet.has(item.priceUnit.toLowerCase())) return false;
		if (!item.mainImageUrl) return false;
		if (!item.visibility) return false;
		if (item.status !== 1) return false;
		if (!Number.isFinite(item.stock) || item.stock <= 0) return false;
		return true;
	});

	if (validCandidates.length === 0) {
		const result = {
			ok: false,
			reason: "no_candidates",
			fromSchedule,
			commitMode: commit,
		};
		if (logToConsole) console.log(JSON.stringify({ type: "TCG_DAILY_SKIP", ...result }, null, 2));
		return result;
	}

	const prioritizedCandidates = prioritizeCandidatesByMarketContext(validCandidates, marketContext);
	const selectionCandidates = prioritizedCandidates.length > 0 ? prioritizedCandidates : validCandidates;
	const lastUrl = await stateStore.get(TCGSTORE_LAST_URL_KEY);
	const recentUrls = await getRecentUrlHistory(stateStore, TCGSTORE_RECENT_URLS_KEY);
	const dateSeed = getJstDateSeed();
	const slotSeed = getJstSlotSeed();

	let selectedIndex = pickIndexWithHistoryGuard({
		size: selectionCandidates.length,
		seed: dateSeed + slotSeed,
		pickOffset,
		urlAt: (index) => selectionCandidates[index]?.url ?? "",
		lastUrl,
		recentUrls,
	});

	const selected = selectionCandidates[selectedIndex];
	const selectedDetail = await fetchTcgStoreOripaDetail(selected.id);
	const selectedWithDetail: TcgStoreOripaCandidate = {
		...selected,
		maxPerDay: selected.maxPerDay ?? selectedDetail.maxPerDay,
	};
	const messageResult = await buildDailyTcgStorePostMessage({
		selected: selectedWithDetail,
		validCandidates: selectionCandidates,
		dateSeed,
		env,
		forcePattern,
		detailFacts: {
			topPrizeNames: selectedDetail.topPrizeNames,
			secondPrizeNames: selectedDetail.secondPrizeNames,
			minCoinPrize: selectedDetail.minCoinPrize,
			maxCoinPrize: selectedDetail.maxCoinPrize,
			rankProbabilities: selectedDetail.rankProbabilities,
		},
	});
	if (!messageResult.aiUsed || !messageResult.message) {
		const result = {
			ok: false,
			reason: "tcg_ai_failed",
			fromSchedule,
			commitMode: commit,
			source: "tcgstore",
			selected: { title: selected.name, url: selected.url },
			aiReason: messageResult.reason,
			marketContext,
		};
		if (logToConsole) console.log(JSON.stringify({ type: "TCG_DAILY_SKIP_AI", ...result }, null, 2));
		return result;
	}
	const message = messageResult.message;

	let postedToX = false;
	let committed = false;
	let xResponse: unknown = null;
	let pendingKey: string | undefined;
	let telegramNotified = false;

	if (commit) {
		if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID && env.STATE) {
			const key = `pending_post:${crypto.randomUUID()}`;
			const pending: PendingPost = {
				message,
				mainImageUrl: selected.mainImageUrl,
				lastOneImageUrl: null,
				source: "tcgstore",
				createdAt: new Date().toISOString(),
			};
			await env.STATE.put(key, JSON.stringify(pending), { expirationTtl: PENDING_POST_TTL_SECONDS });
			const approveUrl = `https://tcgstore-x.harukaoda15.workers.dev/approve?key=${key}&token=${env.APPROVE_SECRET_TOKEN}`;
			await sendTelegram(
				`📝 投稿プレビュー（tcgstore）\n\n${message}\n\n---\n✅ 承認する場合はこちら:\n${approveUrl}\n\n⏰ 2時間以内に承認してください`,
				env,
			);
			pendingKey = key;
			telegramNotified = true;
		} else {
			const postResult = await postTweetWithImages(
				message,
				{
					mainImageUrl: selected.mainImageUrl,
					lastOneImageUrl: null,
				},
				env,
			);
			postedToX = postResult.ok;
			xResponse = postResult;
			if (postResult.ok) {
				await stateStore.put(TCGSTORE_LAST_URL_KEY, selected.url);
				await appendRecentUrlHistory(stateStore, TCGSTORE_RECENT_URLS_KEY, selected.url);
				committed = true;
			}
		}
	}

	const result = {
		ok: true,
		fromSchedule,
		commitMode: commit,
		candidateCount: selectionCandidates.length,
		baseCandidateCount: validCandidates.length,
		selectedIndex,
		selected: {
			title: selected.name,
			price: selected.price,
			priceUnit: selected.priceUnit,
			stock: selectedWithDetail.stock,
			supply: selectedWithDetail.supply,
			remainingPercent: selectedWithDetail.remainingPercent,
			maxPerDay: selectedWithDetail.maxPerDay,
			url: selected.url,
			mainImageUrl: selected.mainImageUrl,
		},
		forcePattern,
		pickOffset,
		detailFacts: {
			topPrizeNames: selectedDetail.topPrizeNames,
			secondPrizeNames: selectedDetail.secondPrizeNames,
			minCoinPrize: selectedDetail.minCoinPrize,
			maxCoinPrize: selectedDetail.maxCoinPrize,
			rankProbabilities: selectedDetail.rankProbabilities,
		},
		lastPostedUrl: lastUrl,
		recentPostedUrls: recentUrls,
		marketContext,
		previewMessage: message,
		aiUsed: messageResult.aiUsed,
		aiPattern: messageResult.pattern,
		aiModel: messageResult.model,
		aiReason: messageResult.reason,
		postedToX,
		committed,
		xResponse,
		pendingKey,
		telegramNotified,
	};

	if (logToConsole) {
		console.log(JSON.stringify({ type: "TCG_DAILY_RESULT", ...result }, null, 2));
	}

	return result;
}

function isDailySpotlightCron(event: ScheduledEvent): boolean {
	return event.cron === "0 3 * * *";
}

function isMarketSummaryCron(event: ScheduledEvent): boolean {
	return event.cron === "0 12 * * *";
}

function isDailyWeb3InfoCron(event: ScheduledEvent): boolean {
	return event.cron === "0 11 * * *" || event.cron === "0 14 * * *";
}

type DailyWeb3InfoOptions = {
	commit?: boolean;
	logToConsole?: boolean;
	fromSchedule?: boolean;
};

async function fetchPokecaChartTrending(): Promise<string> {
	try {
		const res = await fetch("https://pokeca-chart.com/", {
			headers: { "user-agent": "Mozilla/5.0" },
		});
		if (!res.ok) return "";
		const html = await res.text();

		// Extract ranking sections by finding h2 headings and their following content
		const targetSections = ["高騰ランキング", "下落ランキング", "取引件数ランキング"];
		const extracted: string[] = [];

		for (const section of targetSections) {
			// Find the h2 tag containing the section name, then grab content until next h2
			const sectionRegex = new RegExp(
				`<h2[^>]*>[^<]*${section}[^<]*<\\/h2>([\\s\\S]*?)(?=<h2[^>]*>|$)`,
				"i",
			);
			const match = html.match(sectionRegex);
			if (match) {
				const sectionText = stripTags(match[0]).replace(/\s+/g, " ").trim();
				if (sectionText) extracted.push(sectionText);
			}
		}

		if (extracted.length > 0) {
			return extracted.join("\n\n").slice(0, 2000);
		}

		// Fallback: return full page text
		return stripTags(html).replace(/\s+/g, " ").trim().slice(0, 2000);
	} catch {
		return "";
	}
}

async function runDailyWeb3Info(
	env: MonitorEnv,
	options: DailyWeb3InfoOptions = {},
): Promise<Record<string, unknown>> {
	const { commit = false, logToConsole = true, fromSchedule = false } = options;

	const trendingData = await fetchPokecaChartTrending();
	if (!trendingData) {
		const result = { ok: false, reason: "fetch_failed", fromSchedule, committed: false, postedToX: false };
		if (logToConsole) console.log(JSON.stringify({ type: "WEB3_DAILY_SKIP", ...result }, null, 2));
		return result;
	}

	if (!env.ANTHROPIC_API_KEY) {
		const result = { ok: false, reason: "missing_anthropic_api_key", fromSchedule, committed: false, postedToX: false };
		if (logToConsole) console.log(JSON.stringify({ type: "WEB3_DAILY_SKIP", ...result }, null, 2));
		return result;
	}

	const model = env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001";
	const system = `あなたはWeb3×ポケモンカード情報を発信するXアカウントの運用担当です。
- ポケカ投資家・コレクター向けに価格・トレンド情報を中立的に伝える
- 煽りや断定予測は禁止
- 具体的な数字があれば積極的に使う
- 100〜140文字以内
- ハッシュタグは #ポケカ のみ
- 絵文字は0〜1個`;
	const prompt = `以下のpokeca-chartのトレンドデータを元に、今日のポケカ市場トレンドをX投稿文として1本作成してください。

${trendingData}

【ルール】
- 具体的なカード名・価格があれば使う
- 「〜かも」「〜の可能性」など推察ベースで書く
- URLは含めない
- ハッシュタグ: #ポケカ のみ`;

	const aiResponse = await callAnthropicTextGeneration({ system, prompt, apiKey: env.ANTHROPIC_API_KEY, model });
	if (!aiResponse.ok || !aiResponse.text) {
		const result = { ok: false, reason: aiResponse.reason ?? "ai_failed", fromSchedule, committed: false, postedToX: false };
		if (logToConsole) console.log(JSON.stringify({ type: "WEB3_DAILY_SKIP_AI", ...result }, null, 2));
		return result;
	}

	const message = aiResponse.text.replace(/```[\s\S]*?```/g, " ").replace(/https?:\/\/\S+/g, "").trim();

	let postedToX = false;
	let committed = false;
	let pendingKey: string | undefined;
	let telegramNotified = false;

	if (commit) {
		if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID && env.STATE) {
			const key = `pending_post:${crypto.randomUUID()}`;
			const pending: PendingPost = {
				message,
				mainImageUrl: null,
				lastOneImageUrl: null,
				source: "web3_info",
				createdAt: new Date().toISOString(),
			};
			await env.STATE.put(key, JSON.stringify(pending), { expirationTtl: PENDING_POST_TTL_SECONDS });
			const approveUrl = `https://tcgstore-x.harukaoda15.workers.dev/approve?key=${key}&token=${env.APPROVE_SECRET_TOKEN}`;
			await sendTelegram(
				`📝 投稿プレビュー（web3_info）\n\n${message}\n\n---\n✅ 承認する場合はこちら:\n${approveUrl}\n\n⏰ 2時間以内に承認してください`,
				env,
			);
			pendingKey = key;
			telegramNotified = true;
		} else {
			const postResult = await postTweetWithImages(message, { mainImageUrl: null, lastOneImageUrl: null }, env);
			postedToX = postResult.ok;
			if (postResult.ok) committed = true;
		}
	}

	const result = {
		ok: true,
		source: "web3_info",
		fromSchedule,
		previewMessage: message,
		trendingDataLength: trendingData.length,
		pendingKey,
		telegramNotified,
		postedToX,
		committed,
	};
	if (logToConsole) console.log(JSON.stringify({ type: "WEB3_DAILY_RESULT", ...result }, null, 2));
	return result;
}

async function runDailyRandomSpotlight(
	env: MonitorEnv,
	options: { commit?: boolean; logToConsole?: boolean; fromSchedule?: boolean } = {},
): Promise<Record<string, unknown>> {
	const { commit = false, logToConsole = true, fromSchedule = false } = options;
	const stateStore = createStateStore(env);
	const slotSeed = getJstSlotSeed();
	const lastSource = await stateStore.get(DAILY_LAST_SOURCE_KEY);
	const seededSource = pickDailySpotlightSource(slotSeed);
	const preferredSource =
		lastSource === "mercari" || lastSource === "tcgstore"
			? seededSource === lastSource
				? invertDailySpotlightSource(lastSource)
				: seededSource
			: seededSource;
	const first =
		preferredSource === "mercari"
			? await runDailyMercariSpotlight(env, { commit, logToConsole, fromSchedule })
			: await runDailyTcgStoreSpotlight(env, { commit, logToConsole, fromSchedule });
	if (first.ok) {
		const postedSource = preferredSource;
		if (commit && Boolean((first as Record<string, unknown>).committed)) {
			await stateStore.put(DAILY_LAST_SOURCE_KEY, postedSource);
		}
		const result = { ok: true, selectedSource: preferredSource, primary: first, fallbackUsed: false };
		if (logToConsole) console.log(JSON.stringify({ type: "DAILY_RANDOM_RESULT", ...result }, null, 2));
		return result;
	}
	const reason = String(first.reason ?? "");
	const canFallback = reason === "no_candidates" || reason === "tcg_ai_failed" || reason === "mercari_ai_failed";
	if (!canFallback) {
		const result = {
			ok: false,
			selectedSource: preferredSource,
			primary: first,
			fallbackUsed: false,
			reason,
		};
		if (logToConsole) console.log(JSON.stringify({ type: "DAILY_RANDOM_SKIP", ...result }, null, 2));
		return result;
	}
	const second =
		preferredSource === "mercari"
			? await runDailyTcgStoreSpotlight(env, { commit, logToConsole, fromSchedule })
			: await runDailyMercariSpotlight(env, { commit, logToConsole, fromSchedule });
	const fallbackSource = invertDailySpotlightSource(preferredSource);
	if (commit && second.ok && Boolean((second as Record<string, unknown>).committed)) {
		await stateStore.put(DAILY_LAST_SOURCE_KEY, fallbackSource);
	}
	const result = {
		ok: Boolean(second.ok),
		selectedSource: preferredSource,
		primary: first,
		fallback: second,
		fallbackUsed: true,
	};
	if (logToConsole) console.log(JSON.stringify({ type: "DAILY_RANDOM_FALLBACK", ...result }, null, 2));
	return result;
}

async function runPriceSpikeMode(
	request: Request,
	env: MonitorEnv,
	options: { commit?: boolean; logToConsole?: boolean } = {},
): Promise<Record<string, unknown>> {
	const { commit = false, logToConsole = true } = options;
	try {
		const payload = (await request.json()) as PriceSpikePayload;
		const spikes = Array.isArray(payload?.spikes) ? payload.spikes : [];
		const rawSpike = spikes[0];
		const spike = await enrichPriceSpikeIdentity(rawSpike, payload?.source);
		if (!spike || !spike.card) {
			return { ok: false, error: "invalid_payload", committed: false, postedToX: false, previewMessage: "" };
		}
		const inputValidation = validatePriceSpikeInput(spike, payload?.source);
		if (!inputValidation.ok) {
			return {
				ok: false,
				error: inputValidation.reason,
				committed: false,
				postedToX: false,
				previewMessage: "",
			};
		}
		const stateStore = createStateStore(env);
		const watchlist = await upsertWatchlistFromSpike(stateStore, spike, payload?.source);
		await stateStore.put(
			LATEST_MARKET_CONTEXT_KEY,
			JSON.stringify({
				card: getCanonicalPriceSpikeCardName(spike),
				cardId: String(spike.card_id ?? "").trim() || null,
				beforePrice: Number(spike.before),
				afterPrice: Number(spike.after),
				changePct: Number(spike.change_pct),
				sourceSite: normalizePriceSpikeSource(spike.source_site ?? payload?.source),
				sourceUrl: spike.source_url ?? null,
				fetchedAt: spike.fetched_at ?? new Date().toISOString(),
				recordedAt: new Date().toISOString(),
			}),
		);
		const key = `price_spike:${buildPriceSpikeIdentityKey(spike)}`;
		const already = await stateStore.get(key);
		if (already) {
			return {
				ok: true,
				skipped: true,
				committed: false,
				postedToX: false,
				previewMessage: "",
			};
		}

		const aiResult = await generatePriceSpikeMessage(spike, env);
		const previewMessage =
			aiResult.ok && aiResult.message
				? aiResult.message
				: buildPriceSpikeFallbackMessage(spike);

		let postedToX = false;
		let committed = false;
		let xResponse: unknown = null;
		if (commit) {
			const postResult = await postTweetWithImages(
				previewMessage,
				{ mainImageUrl: spike.image_url ?? spike.imageUrl ?? null, lastOneImageUrl: null },
				env,
			);
			postedToX = postResult.ok;
			xResponse = postResult;
			if (postResult.ok) {
				if (env.STATE) {
					await env.STATE.put(key, "1", { expirationTtl: 21600 });
				} else {
					await stateStore.put(key, "1");
				}
				committed = true;
			}
		}

		const result = {
			ok: true,
			committed,
			postedToX,
			previewMessage,
			skipped: false,
			watchlistCount: watchlist.length,
			xResponse,
		};
		if (logToConsole) console.log(JSON.stringify({ type: "PRICE_SPIKE_RESULT", ...result }, null, 2));
		return result;
	} catch (error) {
		console.error("[price_spike] failed", error);
		return {
			ok: false,
			error: error instanceof Error ? error.message : String(error),
			committed: false,
			postedToX: false,
			previewMessage: "",
		};
	}
}

async function runMarketSummary(
	env: MonitorEnv,
	options: { commit?: boolean; logToConsole?: boolean; fromSchedule?: boolean } = {},
): Promise<Record<string, unknown>> {
	const { commit = false, logToConsole = true, fromSchedule = false } = options;
	const stateStore = createStateStore(env);
	const watchlist = await pruneAndPersistWatchlist(stateStore);
	if (watchlist.length === 0) {
		const result = { ok: false, reason: "watchlist_empty", committed: false, postedToX: false, fromSchedule };
		if (logToConsole) console.log(JSON.stringify({ type: "MARKET_SUMMARY_SKIP", ...result }, null, 2));
		return result;
	}
	const jstNow = getJstNow();
	const theme = getDailyMarketTheme(jstNow);
	const sorted = sortWatchlistByTheme(watchlist, theme.sortBy, jstNow);
	const picked = sorted.slice(0, 5);
	if (picked.length < 3) {
		const result = {
			ok: false,
			reason: "watchlist_not_enough_items",
			watchlistCount: watchlist.length,
			committed: false,
			postedToX: false,
			fromSchedule,
		};
		if (logToConsole) console.log(JSON.stringify({ type: "MARKET_SUMMARY_SKIP", ...result }, null, 2));
		return result;
	}
	const ai = await generateMarketSummaryMessage(picked, theme, env);
	const message = ai.ok && ai.message ? ai.message : buildMarketSummaryFallbackMessage(picked, theme);

	let postedToX = false;
	let committed = false;
	let xResponse: unknown = null;
	if (commit) {
		const summaryImageUrls = picked
			.map((item) => item.imageUrl)
			.filter((url): url is string => Boolean(url))
			.slice(0, 3);
		const postResult = await postTweetWithImages(
			message,
			{
				mainImageUrl: summaryImageUrls[0] ?? null,
				lastOneImageUrl: summaryImageUrls[1] ?? null,
			},
			env,
			{ additionalImageUrls: summaryImageUrls.slice(2) },
		);
		postedToX = postResult.ok;
		xResponse = postResult;
		committed = postResult.ok;
	}
	const result = {
		ok: true,
		fromSchedule,
		commitMode: commit,
		committed,
		postedToX,
		aiUsed: ai.ok,
		aiReason: ai.reason ?? null,
		theme,
		watchlistCount: watchlist.length,
		pickedCount: picked.length,
		picked,
		previewMessage: message,
		xResponse,
	};
	if (logToConsole) console.log(JSON.stringify({ type: "MARKET_SUMMARY_RESULT", ...result }, null, 2));
	return result;
}

async function refreshWatchlistPrices(
	env: MonitorEnv,
	options: { logToConsole?: boolean } = {},
): Promise<Record<string, unknown>> {
	const { logToConsole = true } = options;
	const stateStore = createStateStore(env);
	const current = await getWatchlistEntries(stateStore);
	if (current.length === 0) {
		const result = { ok: true, updated: 0, total: 0, reason: "watchlist_empty" };
		if (logToConsole) console.log(JSON.stringify({ type: "WATCHLIST_REFRESH", ...result }, null, 2));
		return result;
	}
	const nowIso = new Date().toISOString();
	let updated = 0;
	const next: WatchlistEntry[] = [];
	for (const entry of current) {
		try {
			const page = await fetchPriceSpikeSourcePage(entry.sourceUrl);
			const source = entry.sourceSite;
			const pageOrigin = new URL(page.finalUrl || entry.sourceUrl).origin;
			const ogImage = normalizeWatchImageUrl(extractOgImageUrl(page.html, pageOrigin), source);
			const fetchedPrice = extractCurrentPriceFromSourceHtml(page.html);
			const currentPrice: number =
				typeof fetchedPrice === "number" && Number.isFinite(fetchedPrice) && fetchedPrice > 0
					? fetchedPrice
					: entry.currentPrice;
			const hasMove = Number.isFinite(currentPrice) && currentPrice !== entry.currentPrice;
			const merged: WatchlistEntry = {
				...entry,
				imageUrl: ogImage ?? entry.imageUrl ?? null,
				beforePrice: hasMove ? entry.currentPrice : entry.beforePrice,
				afterPrice: currentPrice,
				currentPrice,
				lastSeenAt: hasMove ? nowIso : entry.lastSeenAt,
				priceHistory: appendWatchPriceHistory(entry.priceHistory, nowIso, currentPrice),
			};
			next.push(merged);
			if (hasMove || (ogImage && ogImage !== entry.imageUrl)) updated += 1;
		} catch {
			next.push(entry);
		}
	}
	const sorted = next
		.sort((a, b) => new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime())
		.slice(0, WATCHLIST_LIMIT);
	await stateStore.put(WATCHLIST_KEY, JSON.stringify(sorted));
	const result = { ok: true, updated, total: sorted.length };
	if (logToConsole) console.log(JSON.stringify({ type: "WATCHLIST_REFRESH", ...result }, null, 2));
	return result;
}

async function fetchCourtyardPokemonData(): Promise<string> {
	try {
		// Courtyard.io: NFT marketplace for tokenized physical Pokemon cards (Polygon network)
		// Their collection activity page exposes recent sales and price data
		const res = await fetch("https://courtyard.io/collection/pokemon-trading-cards", {
			headers: {
				"user-agent": "Mozilla/5.0 (compatible; MarketBot/1.0)",
				accept: "text/html,application/xhtml+xml",
			},
		});
		if (!res.ok) return "";
		const html = await res.text();

		// Try to extract __NEXT_DATA__ for structured JSON data
		const nextDataMatch = html.match(/<script[^>]*id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
		if (nextDataMatch?.[1]) {
			try {
				const nextData = JSON.parse(nextDataMatch[1]) as Record<string, unknown>;
				const pageProps = (nextData as { props?: { pageProps?: Record<string, unknown> } })?.props
					?.pageProps;
				const hints: string[] = [];
				if (pageProps) {
					const fp = (pageProps.floorPrice ?? (pageProps.collection as Record<string, unknown> | undefined)?.floorPrice) as number | string | undefined;
					const vol = (pageProps.volume24h ?? (pageProps.collection as Record<string, unknown> | undefined)?.volume24h) as number | string | undefined;
					const listings = (pageProps.totalListings ?? (pageProps.collection as Record<string, unknown> | undefined)?.totalListings) as number | string | undefined;
					if (fp) hints.push(`フロア: $${fp}`);
					if (vol) hints.push(`24h出来高: $${vol}`);
					if (listings) hints.push(`出品数: ${listings}`);
				}
				if (hints.length > 0) return `Courtyard.io ポケカNFT: ${hints.join(" / ")}`;
			} catch {
				// fall through to text extraction
			}
		}

		// Fallback: extract visible text and find price-like patterns
		const text = stripTags(html).replace(/\s+/g, " ").trim();
		const priceMatches = [...text.matchAll(/\$\s*([0-9,]+(?:\.[0-9]+)?)/g)]
			.map((m) => Number(String(m[1]).replace(/,/g, "")))
			.filter((n) => Number.isFinite(n) && n > 0)
			.sort((a, b) => b - a)
			.slice(0, 5);
		if (priceMatches.length > 0) {
			return `Courtyard.io ポケカNFT 最近の価格帯: ${priceMatches.map((p) => `$${p.toLocaleString()}`).join(", ")}`;
		}
		return "";
	} catch {
		return "";
	}
}

async function fetchOfficialCardImageUrl(cardName: string, apiKey?: string): Promise<string | null> {
	// Pokemon TCG API (api.pokemontcg.io) - free tier: ~30req/min without key, 1000req/day with key
	// POKEMON_TCG_API_KEY can be set as a Worker secret for higher rate limits
	try {
		const query = encodeURIComponent(`name:"${cardName.replace(/"/g, "")}"`);
		const headers: Record<string, string> = { "user-agent": "Mozilla/5.0" };
		if (apiKey) headers["X-Api-Key"] = apiKey;
		const res = await fetch(
			`https://api.pokemontcg.io/v2/cards?q=${query}&orderBy=-set.releaseDate&pageSize=1&select=id,images`,
			{ headers },
		);
		if (!res.ok) return null;
		const data = (await res.json()) as {
			data?: Array<{ images?: { large?: string; small?: string } }>;
		};
		const card = data.data?.[0];
		return card?.images?.large ?? card?.images?.small ?? null;
	} catch {
		return null;
	}
}

async function generateMarketSummaryMessage(
	picked: WatchlistEntry[],
	theme: { label: string; emoji: string; sortBy: "change_desc" | "change_asc" | "spike_recent" | "price_desc" },
	env: MonitorEnv,
	courtyardHints = "",
): Promise<{ ok: boolean; message?: string; reason?: string }> {
	if (!env.ANTHROPIC_API_KEY) return { ok: false, reason: "missing_anthropic_api_key" };
	const model = env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
	const jstLabel = getJstMarketSummaryLabel();
	const lines = picked.map((item, idx) => {
		const startPrice = getSummaryStartPrice(item);
		const range = `${formatJstMonthDay(getSummaryRangeStartDate(item))}→${formatJstMonthDay(item.lastSeenAt)}`;
		const pct = calcPercentChange(startPrice, item.currentPrice);
		return `${idx + 1}. rank=${getRankBadge(idx)} card=${item.cardName} changeEmoji=${getChangeEmoji(pct)} price=${formatNumber(startPrice)}→${formatNumber(item.currentPrice)} range=${range} pct=${signedPercentText(pct)}`;
	});
	const web3Section =
		courtyardHints
			? [
					"",
					"【Web3市場（Courtyard.io）参考情報】",
					courtyardHints,
					"※ 言及する場合は「NFT市場でも」「ブロックチェーン上でも」などやわらかく補足する程度に留める",
				].join("\n")
			: "";
	const prompt = [
		"以下の監視銘柄データを元に、X投稿文を1本作成してください。",
		`日付ラベル: ${jstLabel}`,
		`曜日テーマ: ${theme.label} (${theme.emoji})`,
		"",
		"【監視銘柄】",
		...lines,
		web3Section,
		"",
		"【投稿フォーマット（厳守）】",
		`1行目: 【M/D(曜)${theme.label}】`,
		"各カードの前に空行を入れる",
		"順位は🥇🥈🥉で表示（4位以降は🏅）",
		"価格: 前回価格円→現在価格円（期間 +XX.X%）",
		"期間: firstSeenAtから今日の日付（例: 3/10→3/17）",
		"最後に #ポケカ",
		"URLは含めない",
		"3〜5件まとめる",
		"煽り・断定・予測禁止",
	].join("\n");
	const response = await callAnthropicTextGeneration({
		system: MARKET_SUMMARY_SYSTEM_PROMPT,
		prompt,
		apiKey: env.ANTHROPIC_API_KEY,
		model,
	});
	if (!response.ok || !response.text) return { ok: false, reason: response.reason ?? "anthropic_failed" };
	const normalized = normalizeMarketSummaryMessage(response.text);
	const validation = validateMarketSummaryMessage(normalized);
	if (!validation.ok) return { ok: false, reason: validation.reasons.join(" / ") };
	return { ok: true, message: normalized };
}

function normalizeMarketSummaryMessage(text: string): string {
	const withoutFence = text.replace(/```[\s\S]*?```/g, " ").trim();
	const noUrl = withoutFence.replace(/https?:\/\/\S+/g, "").trim();
	const rows = noUrl
		.split(/\n+/)
		.map((line) => line.replace(/#[\p{L}\p{N}_]+/gu, "").replace(/\s+/g, " ").trim())
		.filter(Boolean);
	if (rows.length === 0) return "#ポケカ";
	const head = rows[0];
	const body = rows.slice(1);
	const normalizedBlocks: string[] = [head];
	let consumed = 0;
	while (consumed < body.length && normalizedBlocks.length < 12) {
		const line = body[consumed];
		if (!/^[🥇🥈🥉🏅]/.test(line)) {
			consumed += 1;
			continue;
		}
		const detail = body[consumed + 1] ?? "";
		normalizedBlocks.push("", line);
		if (detail) normalizedBlocks.push(detail);
		consumed += 2;
	}
	return [...normalizedBlocks, "", "#ポケカ"].join("\n").trim();
}

function validateMarketSummaryMessage(text: string): { ok: boolean; reasons: string[] } {
	const reasons: string[] = [];
	if (/https?:\/\/\S+/.test(text)) reasons.push("URLは禁止です");
	const tags = extractHashtags(text);
	if (tags.length !== 1 || tags[0] !== "#ポケカ") reasons.push("ハッシュタグは #ポケカ のみ");
	const rows = text.split("\n").map((line) => line.trim()).filter(Boolean);
	if (!/^【\d{1,2}\/\d{1,2}\(.+\).+】$/.test(rows[0] ?? "")) {
		reasons.push("1行目の日付テーマ形式が不正です");
	}
	const bulletCount = rows.filter((line) => /^[🥇🥈🥉🏅]/.test(line)).length;
	if (bulletCount < 3 || bulletCount > 5) reasons.push("箇条書きは3〜5件にしてください");
	if (/急げ|爆アツ|絶対|確実|買うべき|まだ上がる/.test(text)) reasons.push("煽り/断定表現を検出");
	if (!/[0-9][0-9,]*円/.test(text)) reasons.push("価格の具体数値が不足しています");
	const detailLines = rows.filter((line) => /円→[0-9,]+円（\d{1,2}\/\d{1,2}→\d{1,2}\/\d{1,2}\s*[+\-][0-9]+(?:\.[0-9]+)?%）/.test(line));
	if (detailLines.length < 3) reasons.push("価格行の形式（前回→現在（M/D→M/D ±X%））が不足しています");
	return { ok: reasons.length === 0, reasons };
}

function buildMarketSummaryFallbackMessage(
	picked: WatchlistEntry[],
	theme: { label: string },
): string {
	const label = getJstMarketSummaryLabel();
	const lines: string[] = [`【${label}${theme.label}】`];
	for (const [idx, item] of picked.slice(0, 5).entries()) {
		const startPrice = getSummaryStartPrice(item);
		const pct = calcPercentChange(startPrice, item.currentPrice);
		const rank = getRankBadge(idx);
		const key = compactCardLabel(item.cardName);
		const range = `${formatJstMonthDay(getSummaryRangeStartDate(item))}→${formatJstMonthDay(item.lastSeenAt)}`;
		lines.push("", `${rank} ${key}`, `${formatNumber(startPrice)}円→${formatNumber(item.currentPrice)}円（${range} ${signedPercentText(pct)}）`);
	}
	lines.push("", "#ポケカ");
	return lines.join("\n");
}

function getJstMarketSummaryLabel(now = new Date()): string {
	const jst = getJstNow(now);
	const month = jst.getUTCMonth() + 1;
	const date = jst.getUTCDate();
	const day = ["日", "月", "火", "水", "木", "金", "土"][jst.getUTCDay()];
	return `${month}/${date}(${day})`;
}

function getJstNow(now = new Date()): Date {
	return new Date(now.getTime() + 9 * 60 * 60 * 1000);
}

function getDailyMarketTheme(jstDate: Date): {
	label: string;
	emoji: string;
	sortBy: "change_desc" | "change_asc" | "spike_recent" | "price_desc";
} {
	const dow = jstDate.getUTCDay(); // 0=日, 1=月, ..., 6=土
	switch (dow) {
		case 1:
			return { label: "価格上昇ランキング", emoji: "📈", sortBy: "change_desc" };
		case 2:
			return { label: "価格下落ランキング", emoji: "📉", sortBy: "change_asc" };
		case 3:
			return { label: "今週の急騰ランキング", emoji: "🔥", sortBy: "spike_recent" };
		case 4:
			return { label: "高額カードランキング", emoji: "💎", sortBy: "price_desc" };
		case 5:
			return { label: "価格上昇ランキング", emoji: "📈", sortBy: "change_desc" };
		case 6:
			return { label: "今週の急騰ランキング", emoji: "🔥", sortBy: "spike_recent" };
		default:
			return { label: "価格上昇ランキング", emoji: "📈", sortBy: "change_desc" };
	}
}

function sortWatchlistByTheme(
	list: WatchlistEntry[],
	sortBy: "change_desc" | "change_asc" | "spike_recent" | "price_desc",
	jstDate: Date,
): WatchlistEntry[] {
	const base = [...list];
	if (sortBy === "price_desc") {
		return base.sort((a, b) => b.currentPrice - a.currentPrice);
	}
	if (sortBy === "change_asc") {
		return base.sort((a, b) => {
			const aPct = calcPercentChange(getSummaryStartPrice(a), a.currentPrice);
			const bPct = calcPercentChange(getSummaryStartPrice(b), b.currentPrice);
			return aPct - bPct;
		});
	}
	if (sortBy === "spike_recent") {
		const weekMs = 1000 * 60 * 60 * 24 * 7;
		const nowMs = new Date(jstDate.getTime()).getTime();
		return base.sort((a, b) => {
			const aRecent = nowMs - new Date(a.lastSeenAt).getTime() <= weekMs ? 1 : 0;
			const bRecent = nowMs - new Date(b.lastSeenAt).getTime() <= weekMs ? 1 : 0;
			if (aRecent !== bRecent) return bRecent - aRecent;
			const aPct = calcPercentChange(getSummaryStartPrice(a), a.currentPrice);
			const bPct = calcPercentChange(getSummaryStartPrice(b), b.currentPrice);
			return bPct - aPct;
		});
	}
	return base.sort((a, b) => {
		const aPct = calcPercentChange(getSummaryStartPrice(a), a.currentPrice);
		const bPct = calcPercentChange(getSummaryStartPrice(b), b.currentPrice);
		return bPct - aPct;
	});
}

function formatJstMonthDay(value: string): string {
	const date = new Date(value);
	if (!Number.isFinite(date.getTime())) return "?/?";
	const jst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
	return `${jst.getUTCMonth() + 1}/${jst.getUTCDate()}`;
}

function signedPercentText(changePct: number): string {
	const sign = changePct >= 0 ? "+" : "-";
	return `${sign}${Math.abs(changePct).toFixed(1)}%`;
}

function getChangeEmoji(changePct: number): "🔥" | "📈" | "⚡" | "✅" | "📉" {
	if (changePct < 0) return "📉";
	if (changePct >= 40) return "🔥";
	if (changePct >= 20) return "📈";
	if (changePct >= 10) return "⚡";
	return "✅";
}

function getRankBadge(index: number): "🥇" | "🥈" | "🥉" | "🏅" {
	if (index === 0) return "🥇";
	if (index === 1) return "🥈";
	if (index === 2) return "🥉";
	return "🏅";
}

function compactCardLabel(card: string): string {
	const cleaned = String(card ?? "").replace(/\s+/g, " ").trim();
	return cleaned.length > 42 ? `${cleaned.slice(0, 42)}…` : cleaned;
}

async function generatePriceSpikeMessage(
	spike: PriceSpikeItem,
	env: MonitorEnv,
): Promise<{ ok: boolean; message?: string; reason?: string }> {
	if (!env.ANTHROPIC_API_KEY) return { ok: false, reason: "missing_anthropic_api_key" };
	const model = env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
	const period = normalizePriceSpikePeriod(spike.period);
	const canonicalCardName = getCanonicalPriceSpikeCardName(spike);
	const sourceSite = normalizePriceSpikeSource(spike.source_site) || "snkrdunk/pokeca-chart";
	const prompt = [
		"以下の条件でX投稿文を1本作成してください。",
		"",
		`カード名（厳密）: ${canonicalCardName}`,
		`カード識別子: ${spike.card_id ?? "未指定"}`,
		`前回価格: ${formatNumber(spike.before)}円`,
		`現在価格: ${formatNumber(spike.after)}円`,
		`変化率: +${Number(spike.change_pct).toFixed(2)}%`,
		`比較期間: ${period}`,
		`取得時刻: ${spike.fetched_at}`,
		`参照サイト: ${sourceSite}`,
		"",
		"【出力ルール】",
		"- 1行目: 上記のカード名（厳密）をそのまま使い、『{period}で+{変化率}%』の形式で書く",
		"- 2行目: {前回価格}円 → {現在価格}円（+{変化率}%）",
		"- 3行目: 背景の一文。『〜の影響かな』『〜が重なってるかも』のように推察をやわらかく書く",
		"- URLは一切含めない（市場情報のみ）",
		"- ハッシュタグは #ポケカ 固定（1つのみ）",
		"- period 未指定時は『直近で』として書く",
		"- 文字数は60〜100文字",
		"- 禁止: 『急げ』『爆アツ』『絶対』などの断定・煽り",
		"- 根拠のない価格予測・断定は禁止",
		"- 行構成を崩さない（1行目/2行目/3行目）",
	].join("\n");
	const response = await callAnthropicTextGeneration({
		system: PRICE_SPIKE_SYSTEM_PROMPT,
		prompt,
		apiKey: env.ANTHROPIC_API_KEY,
		model,
	});
	if (!response.ok || !response.text) return { ok: false, reason: response.reason ?? "anthropic_failed" };
	const normalized = normalizePriceSpikeMessage(response.text);
	const validation = validatePriceSpikeMessage(normalized, period);
	if (!validation.ok) return { ok: false, reason: validation.reasons.join(" / ") };
	return { ok: true, message: normalized };
}

function normalizePriceSpikeMessage(text: string): string {
	const withoutFence = text.replace(/```[\s\S]*?```/g, " ").trim();
	const noUrl = withoutFence.replace(/https?:\/\/\S+/g, "").trim();
	const lines = noUrl
		.split(/\n+/)
		.map((line) => line.replace(/#[\p{L}\p{N}_]+/gu, "").replace(/\s+/g, " ").trim())
		.filter(Boolean);
	const firstThree = lines.slice(0, 3);
	return [...firstThree, "#ポケカ"].join("\n").trim();
}

function validatePriceSpikeMessage(
	text: string,
	period: string,
): { ok: boolean; reasons: string[] } {
	const reasons: string[] = [];
	const length = countXLength(text);
	if (length < 60) reasons.push(`文字数不足(${length})`);
	if (length > 100) reasons.push(`文字数超過(${length})`);
	if (!/#ポケカ/u.test(text)) reasons.push("#ポケカがありません");
	if ((text.match(/#[\p{L}\p{N}_]+/gu) ?? []).length !== 1) reasons.push("ハッシュタグは #ポケカ のみ");
	if (/急げ|爆アツ|今すぐ|絶対|確実|上がる|まだ伸びる/.test(text)) reasons.push("禁止表現を検出");
	if (/正直|個人的/.test(text)) reasons.push("主観表現を検出");
	if (!/円\s*→\s*[0-9,]+円/.test(text)) reasons.push("2行目の価格表記形式が不正です");
	if (!new RegExp(`${escapeRegExp(period)}で\\+[0-9]+(?:\\.[0-9]+)?%`).test(text)) {
		reasons.push("1行目の期間+変化率表記が不足しています");
	}
	const lineCount = text.split(/\n/).filter(Boolean).length;
	if (lineCount < 3) reasons.push("行数が不足しています（最低3行）");
	if (/https?:\/\/\S+/.test(text)) reasons.push("URLは含めないでください");
	return { ok: reasons.length === 0, reasons };
}

function buildPriceSpikeFallbackMessage(spike: PriceSpikeItem): string {
	const period = normalizePriceSpikePeriod(spike.period);
	const cardName = getCanonicalPriceSpikeCardName(spike);
	const lines = [
		`${cardName}、${period}で+${Number(spike.change_pct).toFixed(2)}%。`,
		`${formatNumber(spike.before)}円 → ${formatNumber(spike.after)}円（+${Number(spike.change_pct).toFixed(2)}%）`,
		"需給や注目度の重なりが出てきたのかも。",
		"#ポケカ",
	];
	return lines.join("\n");
}

function normalizePriceSpikePeriod(period?: string): string {
	const normalized = String(period ?? "").trim();
	return normalized || "直近";
}

function getCanonicalPriceSpikeCardName(spike: PriceSpikeItem): string {
	const variant = String(spike.variant ?? "").trim();
	const card = String(spike.card ?? "").trim();
	return variant || card;
}

function buildPriceSpikeIdentityKey(spike: PriceSpikeItem): string {
	const source = normalizePriceSpikeSource(spike.source_site) || "unknown";
	const cardId = String(spike.card_id ?? "").trim();
	const base = cardId || getCanonicalPriceSpikeCardName(spike);
	return `${source}:${base}`.toLowerCase();
}

function normalizePriceSpikeSource(source: string | undefined): "snkrdunk" | "pokeca-chart" | null {
	const lower = String(source ?? "").trim().toLowerCase();
	if (!lower) return null;
	if (lower.includes("snkrdunk")) return "snkrdunk";
	if (lower.includes("pokeca-chart") || lower.includes("pokecachart")) return "pokeca-chart";
	return null;
}

function hasCardVariantIdentifier(value: string): boolean {
	const text = String(value ?? "");
	return /[A-Za-z]{1,4}\d{1,4}|[0-9]{2,3}\/[0-9]{2,3}|sv\d+[a-z]?|s\d[a-z]\d/i.test(text);
}

function validatePriceSpikeInput(
	spike: PriceSpikeItem,
	payloadSource: string | undefined,
): { ok: boolean; reason?: string } {
	const canonicalName = getCanonicalPriceSpikeCardName(spike);
	if (!canonicalName) return { ok: false, reason: "missing_card_name" };
	if (!Number.isFinite(spike.before) || !Number.isFinite(spike.after) || spike.before <= 0 || spike.after <= 0) {
		return { ok: false, reason: "invalid_price_values" };
	}
	const source = normalizePriceSpikeSource(spike.source_site ?? payloadSource);
	if (!source) {
		return { ok: false, reason: "unsupported_source_site" };
	}
	if (!isValidPriceSpikeSourceUrl(spike.source_url, source)) {
		return { ok: false, reason: "invalid_or_missing_source_url" };
	}
	const cardId = String(spike.card_id ?? "").trim();
	if (!cardId && !hasCardVariantIdentifier(canonicalName)) {
		return { ok: false, reason: "ambiguous_card_variant" };
	}
	return { ok: true };
}

async function enrichPriceSpikeIdentity(
	spike: PriceSpikeItem | undefined,
	payloadSource: string | undefined,
): Promise<PriceSpikeItem> {
	const base = { ...(spike ?? ({} as PriceSpikeItem)) };
	base.image_url = undefined;
	base.imageUrl = null;
	const source = normalizePriceSpikeSource(base.source_site ?? payloadSource);
	if (!source) return base;
	if (String(base.source_site ?? "").trim() === "") {
		base.source_site = source;
	}
	if (!isValidPriceSpikeSourceUrl(base.source_url, source)) return base;
	try {
		const page = await fetchPriceSpikeSourcePage(base.source_url!);
		const pageOrigin = new URL(page.finalUrl || base.source_url!).origin;
		const ogImage = extractOgImageUrl(page.html, pageOrigin);
		const marketImage = normalizeWatchImageUrl(ogImage, source);
		if (marketImage) {
			base.image_url = marketImage;
			base.imageUrl = marketImage;
		}
		if (source === "pokeca-chart") {
			base.history_prices = extractPriceHistoryFromPokecaChartHtml(page.html);
		}
		const hasStrongIdentity =
			String(base.card_id ?? "").trim().length > 0 ||
			hasCardVariantIdentifier(getCanonicalPriceSpikeCardName(base));
		if (hasStrongIdentity) return base;
		const title = extractSourceTitle(page.html);
		const titleWithId = title && hasCardVariantIdentifier(title) ? title : null;
		if (titleWithId && titleWithId.includes(String(base.card ?? "").trim())) {
			base.variant = titleWithId;
		}
		const idFromText =
			extractCardIdentifierNearCardName(page.html, String(base.card ?? "").trim()) ||
			(String(base.card ?? "").trim() && title?.includes(String(base.card ?? "").trim())
				? extractCardIdentifierFromText(title ?? "")
				: null);
		if (!base.card_id && idFromText) {
			base.card_id = idFromText;
		}
		if (!base.variant && idFromText) {
			base.variant = `${String(base.card ?? "").trim()} ${idFromText}`.trim();
		}
	} catch {
		// keep original input and let validation decide
	}
	return base;
}

async function fetchPriceSpikeSourcePage(
	sourceUrl: string,
): Promise<{ html: string; finalUrl: string; status: number }> {
	const res = await fetch(sourceUrl, {
		headers: { "user-agent": "Mozilla/5.0" },
		redirect: "follow",
	});
	const html = await res.text();
	return { html, finalUrl: res.url, status: res.status };
}

function extractCurrentPriceFromSourceHtml(html: string): number | null {
	const text = stripTags(html).replace(/\s+/g, " ");
	const matches = [...text.matchAll(/(?:¥|￥)\s*([0-9][0-9,]{2,})/g)];
	const values = matches
		.map((m) => Number(String(m[1] ?? "").replace(/,/g, "")))
		.filter((n) => Number.isFinite(n) && n > 100);
	if (values.length === 0) return null;
	return values.sort((a, b) => b - a)[0];
}

function extractSourceTitle(html: string): string | null {
	const ogMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
	if (ogMatch?.[1]) return decodeHtmlEntities(ogMatch[1]).replace(/\s+/g, " ").trim();
	const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
	if (!titleMatch?.[1]) return null;
	return decodeHtmlEntities(stripTags(titleMatch[1])).replace(/\s+/g, " ").trim();
}

function extractPriceHistoryFromPokecaChartHtml(html: string): Array<{ date: string; price: number }> {
	const out = new Map<string, number>();
	const pairRegex = /"date"\s*:\s*"(\d{4}-\d{2}-\d{2})"[\s\S]{0,80}?"(?:price|value|avg|median)"\s*:\s*([0-9]{2,8})/g;
	let m: RegExpExecArray | null;
	while ((m = pairRegex.exec(html)) !== null) {
		const date = m[1];
		const price = Number(m[2]);
		if (!Number.isFinite(price) || price <= 0) continue;
		out.set(date, price);
	}
	const tupleRegex = /\[\s*"(\d{4}-\d{2}-\d{2})"\s*,\s*([0-9]{2,8})\s*\]/g;
	while ((m = tupleRegex.exec(html)) !== null) {
		const date = m[1];
		const price = Number(m[2]);
		if (!Number.isFinite(price) || price <= 0) continue;
		if (!out.has(date)) out.set(date, price);
	}
	return [...out.entries()]
		.map(([date, price]) => ({ date, price }))
		.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
		.slice(-180);
}

function extractCardIdentifierFromText(text: string): string | null {
	return extractCardIdentifierCandidatesFromText(text)[0] ?? null;
}

function extractCardIdentifierCandidatesFromText(text: string): string[] {
	const candidates = new Set<string>();
	const patterns = [
		/\bsv\d+[a-z]?\s*[\-_/]?\s*\d{1,3}\/\d{1,3}\b/i,
		/\b(?:sm|s|xy|bw|cp|dp|pcg)[a-z0-9\-]*\s*[\-_/]?\s*\d{1,3}\/\d{1,3}\b/i,
		/\b\d{1,3}\/\d{1,3}\b/,
	];
	for (const pattern of patterns) {
		const matches = text.matchAll(new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`));
		for (const match of matches) {
			if (!match?.[0]) continue;
			candidates.add(match[0].replace(/\s+/g, "").toUpperCase());
		}
	}
	return [...candidates];
}

function extractCardIdentifierNearCardName(html: string, cardName: string): string | null {
	const target = String(cardName ?? "").trim();
	if (!target) return null;
	const plain = stripTags(html).replace(/\s+/g, " ");
	const escaped = escapeRegExp(target);
	const nameRegex = new RegExp(escaped, "ig");
	const candidates = new Set<string>();
	let match: RegExpExecArray | null;
	while ((match = nameRegex.exec(plain)) !== null) {
		const start = Math.max(0, match.index - 90);
		const end = Math.min(plain.length, match.index + match[0].length + 90);
		const windowText = plain.slice(start, end);
		for (const id of extractCardIdentifierCandidatesFromText(windowText)) {
			candidates.add(id);
		}
	}
	if (candidates.size === 1) return [...candidates][0];
	return null;
}

function isValidPriceSpikeSourceUrl(
	sourceUrl: string | undefined,
	source: "snkrdunk" | "pokeca-chart",
): boolean {
	if (!sourceUrl) return false;
	let parsed: URL;
	try {
		parsed = new URL(sourceUrl);
	} catch {
		return false;
	}
	const host = parsed.hostname.toLowerCase();
	if (source === "snkrdunk") {
		return host === "snkrdunk.com" || host.endsWith(".snkrdunk.com");
	}
	return host === "pokeca-chart.com" || host.endsWith(".pokeca-chart.com");
}

function escapeRegExp(text: string): string {
	return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function pickDailySpotlightSource(seed: number): "tcgstore" | "mercari" {
	const mixed = ((seed * 2654435761) >>> 0) % 2;
	return mixed === 0 ? "tcgstore" : "mercari";
}

function invertDailySpotlightSource(source: "tcgstore" | "mercari"): "tcgstore" | "mercari" {
	return source === "tcgstore" ? "mercari" : "tcgstore";
}

async function runDailyMercariSpotlight(
	env: MonitorEnv,
	options: DailyMercariOptions = {},
): Promise<Record<string, unknown>> {
	const { commit = false, logToConsole = true, fromSchedule = false, pickOffset = 0 } = options;
	const stateStore = createStateStore(env);
	const marketContext = await getLatestMarketContext(stateStore);
	const dateSeed = getJstDateSeed();
	const baseItems = (await fetchAllCandidateItems()).filter((item) => item.source === "mercari");
	const candidates: Array<{
		item: CandidateItem;
		detail: ItemDetail;
		title: PickedTitle;
	}> = [];
	for (const item of baseItems) {
		const detail = await fetchItemDetail(item);
		if (detail.source !== "mercari") continue;
		if (!item.url) continue;
		if (!detail.mainImageUrl) continue;
		const picked = pickTitle(item, detail);
		candidates.push({ item, detail, title: picked });
	}
	if (candidates.length === 0) {
		const result = { ok: false, reason: "no_candidates", fromSchedule, commitMode: commit, source: "mercari" };
		if (logToConsole) console.log(JSON.stringify({ type: "MERCARI_DAILY_SKIP", ...result }, null, 2));
		return result;
	}
	const prioritizedCandidates = prioritizeMercariCandidatesByMarketContext(candidates, marketContext);
	const selectionCandidates = prioritizedCandidates.length > 0 ? prioritizedCandidates : candidates;
	const lastUrl = await stateStore.get(MERCARI_LAST_URL_KEY);
	const recentUrls = await getRecentUrlHistory(stateStore, MERCARI_RECENT_URLS_KEY);
	const slotSeed = getJstSlotSeed();
	const selectedIndex = pickIndexWithHistoryGuard({
		size: selectionCandidates.length,
		seed: dateSeed + slotSeed,
		pickOffset,
		urlAt: (index) => selectionCandidates[index]?.item.url ?? "",
		lastUrl,
		recentUrls,
	});
	const selected = selectionCandidates[selectedIndex];
	const messageResult = await generateDailyMercariAiMessage({
		title: selected.title.title,
		url: selected.item.url,
		remaining: selected.detail.detailRemaining,
		totalCount: selected.detail.totalCount,
		topPrizeNames: selected.detail.topPrizeNames,
		env,
		marketContext,
	});
	if (!messageResult.ok || !messageResult.message) {
		const result = {
			ok: false,
			reason: "mercari_ai_failed",
			fromSchedule,
			commitMode: commit,
			source: "mercari",
			selected: { title: selected.title.title, url: selected.item.url },
			aiReason: messageResult.reason ?? "ai_generation_failed",
			marketContext,
		};
		if (logToConsole) console.log(JSON.stringify({ type: "MERCARI_DAILY_SKIP_AI", ...result }, null, 2));
		return result;
	}
	const message = messageResult.message;
	let postedToX = false;
	let committed = false;
	let xResponse: unknown = null;
	let pendingKey: string | undefined;
	let telegramNotified = false;
	if (commit) {
		const postResult = await postTweetWithImages(
			message,
			{ mainImageUrl: selected.detail.mainImageUrl, lastOneImageUrl: null },
			env,
			{
				mainImageAlt: buildMercariDailyImageAlt(
					selected.title.title,
					selected.detail.topPrizeNames,
					selected.detail.detailRemaining,
					selected.detail.totalCount,
				),
			},
		);
		postedToX = postResult.ok;
		xResponse = postResult;
		if (postResult.ok) {
			await stateStore.put(MERCARI_LAST_URL_KEY, selected.item.url);
			await appendRecentUrlHistory(stateStore, MERCARI_RECENT_URLS_KEY, selected.item.url);
			committed = true;
		}
	}
	const result = {
		ok: true,
		source: "mercari",
		fromSchedule,
		commitMode: commit,
		selectedIndex,
		candidateCount: selectionCandidates.length,
		baseCandidateCount: candidates.length,
		selected: {
			title: selected.title.title,
			titleSource: selected.title.source,
			url: selected.item.url,
			remaining: selected.detail.detailRemaining,
			totalCount: selected.detail.totalCount,
			percent: selected.detail.percent,
			topPrizeNames: selected.detail.topPrizeNames,
			mainImageUrl: selected.detail.mainImageUrl,
		},
		lastPostedUrl: lastUrl,
		recentPostedUrls: recentUrls,
		marketContext,
		previewMessage: message,
		aiUsed: true,
		aiModel: messageResult.model,
		aiReason: null,
		postedToX,
		committed,
		xResponse,
		pendingKey,
		telegramNotified,
	};
	if (logToConsole) console.log(JSON.stringify({ type: "MERCARI_DAILY_RESULT", ...result }, null, 2));
	return result;
}

async function generateDailyMercariAiMessage({
	title,
	url,
	remaining,
	totalCount,
	topPrizeNames,
	env,
	marketContext,
}: {
	title: string;
	url: string;
	remaining: number | null;
	totalCount: number | null;
	topPrizeNames: string[];
	env: MonitorEnv;
	marketContext: LatestMarketContext | null;
}): Promise<{ ok: boolean; message?: string; reason?: string; model: string | null }> {
	if (!env.ANTHROPIC_API_KEY) {
		return { ok: false, reason: "missing_anthropic_api_key", model: env.ANTHROPIC_MODEL ?? null };
	}
	const model = env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
	const rem =
		Number.isFinite(remaining) && Number.isFinite(totalCount) && totalCount && totalCount > 0
			? `残り${formatNumber(remaining as number)}回（全${formatNumber(totalCount)}回）`
			: "販売中のくじをピックアップ";
	const topPrizeText = topPrizeNames.length > 0 ? topPrizeNames.slice(0, 4).join(" / ") : "未取得";
	const preferredTags = inferMercariTags(topPrizeNames).join(" ");
	const prompt = [
		"メルカリくじの紹介投稿を1本作成してください。",
		`商品名: ${title}`,
		`在庫情報: ${rem}`,
		`S賞/1等カード候補: ${topPrizeText}`,
		`推奨ハッシュタグ: ${preferredTags || "なし"}`,
		`商品URL: ${url}`,
		`直近の市場注目カード: ${marketContext?.card ?? "なし"}`,
		`市場注目取得時刻: ${marketContext?.fetchedAt ?? "なし"}`,
		"",
		"【出力ルール】",
		"- 本文は2〜4行、最後の行はURLのみ",
		"- 1行目は商品名から始めない。読み手メリットや事実から始める",
		"- 絵文字は0〜1個まで。ハッシュタグは推奨ハッシュタグのみ最大2個まで",
		"- 売り込み口調を避け、事実ベースで簡潔に書く",
		"- 在庫表現は「まだ引ける」「まだ回せる」を優先し、「残っている」を避ける",
		"- 「じっくり選んで引ける」「内容を確認してみてください」など仕様とズレる誘導文を禁止",
		"- 「実質的なロス」「繰り返し引く選択肢」など不自然な説明文を禁止",
		"- S賞/1等カードがある場合はカード名を本文に最低1つ入れる",
		"- 市場注目カードが商品名に含まれる場合だけ、関連を1フレーズで触れてよい",
	].join("\n");
	const response = await callAnthropicTextGeneration({
		system: MERCARI_DAILY_AI_SYSTEM_PROMPT,
		prompt,
		apiKey: env.ANTHROPIC_API_KEY,
		model,
	});
	if (!response.ok || !response.text) {
		return { ok: false, reason: response.reason ?? "anthropic_request_failed", model };
	}
	const normalized = normalizeDailyAiMessage(response.text, url);
	const normalizedWithPrize = enforceMercariTopPrizeMention(normalized, url, topPrizeNames);
	const normalizedWithTags = applyMercariTagPolicy(normalizedWithPrize, url, topPrizeNames);
	const tonedMessage = normalizeMercariStockTone(normalizedWithTags, url);
	const fittedMessage = fitMercariDailyMessageLength(tonedMessage, url);
	const validation = validateMercariDailyAiMessage(fittedMessage, url, topPrizeNames);
	if (!validation.ok) {
		return { ok: false, reason: validation.reasons.join(" / "), model };
	}
	return { ok: true, message: fittedMessage, model };
}

async function runDailyTcgStoreSamples(
	env: MonitorEnv,
	options: DailyTcgPreviewOptions = {},
): Promise<Record<string, unknown>> {
	const { count = 5, logToConsole = true } = options;
	const candidates = await fetchTcgStoreOripaCandidates();
	const validCandidates = candidates.filter((item) => {
		if (!item.id || !item.name || !item.url) return false;
		if (!Number.isFinite(item.price) || item.price <= 0) return false;
		if (!item.mainImageUrl) return false;
		if (!item.visibility) return false;
		if (item.status !== 1) return false;
		if (!Number.isFinite(item.stock) || item.stock <= 0) return false;
		return true;
	});

	const limitedCount = Math.max(1, Math.min(10, Math.floor(count)));
	const dateSeed = getJstDateSeed();
	const startIndex = validCandidates.length > 0 ? dateSeed % validCandidates.length : 0;
	const samples: Array<Record<string, unknown>> = [];

	for (let i = 0; i < Math.min(limitedCount, validCandidates.length); i++) {
		const idx = (startIndex + i) % validCandidates.length;
		const base = validCandidates[idx];
		const detail = await fetchTcgStoreOripaDetail(base.id);
		const selected: TcgStoreOripaCandidate = {
			...base,
			maxPerDay: base.maxPerDay ?? detail.maxPerDay,
		};
		const messageResult = await buildDailyTcgStorePostMessage({
			selected,
			validCandidates,
			dateSeed: dateSeed + i,
			env,
			forcePattern: null,
			detailFacts: {
				topPrizeNames: detail.topPrizeNames,
				secondPrizeNames: detail.secondPrizeNames,
				minCoinPrize: detail.minCoinPrize,
				maxCoinPrize: detail.maxCoinPrize,
				rankProbabilities: detail.rankProbabilities,
			},
		});
		samples.push({
			index: idx,
			title: selected.name,
			price: selected.price,
			priceUnit: selected.priceUnit,
			stock: selected.stock,
			supply: selected.supply,
			remainingPercent: selected.remainingPercent,
			maxPerDay: selected.maxPerDay,
			url: selected.url,
			mainImageUrl: selected.mainImageUrl,
			detailFacts: {
				topPrizeNames: detail.topPrizeNames,
				secondPrizeNames: detail.secondPrizeNames,
				minCoinPrize: detail.minCoinPrize,
				maxCoinPrize: detail.maxCoinPrize,
				rankProbabilities: detail.rankProbabilities,
			},
			aiUsed: messageResult.aiUsed,
			aiPattern: messageResult.pattern,
			aiModel: messageResult.model,
			aiReason: messageResult.reason,
			previewMessage: messageResult.message,
		});
	}

	const result = {
		ok: true,
		mode: "tcg_samples",
		requestedCount: count,
		returnedCount: samples.length,
		candidateCount: validCandidates.length,
		samples,
	};

	if (logToConsole) {
		console.log(JSON.stringify({ type: "TCG_DAILY_SAMPLES", ...result }, null, 2));
	}

	return result;
}

async function buildDailyTcgStorePostMessage({
	selected,
	validCandidates,
	dateSeed,
	env,
	forcePattern,
	detailFacts,
}: {
	selected: TcgStoreOripaCandidate;
	validCandidates: TcgStoreOripaCandidate[];
	dateSeed: number;
	env: MonitorEnv;
	forcePattern: DailyAiPattern | null;
	detailFacts: TcgStoreDetailFacts;
}): Promise<{
	message: string;
	aiUsed: boolean;
	pattern: DailyAiPattern;
	model: string | null;
	reason: string | null;
}> {
	const toneMode: DailyToneMode =
		selected.id in SPECIAL_ITEM_FACTS || selected.name.includes("1人1回限定")
			? "hype"
			: dateSeed % 3 === 0
				? "hype"
				: "calm";
	const lengthMode: DailyLengthMode = dateSeed % 2 === 0 ? "short" : "full";
	const patternPlan = chooseDailyAiPattern(
		selected,
		validCandidates,
		dateSeed,
		forcePattern,
	);
	const requiredTags = getRequiredHashtags(selected, patternPlan.pattern, detailFacts);
	const aiResult = await generateDailyTcgStoreAiMessage({
		selected,
		comparison: patternPlan.comparison,
		pattern: patternPlan.pattern,
		toneMode,
		lengthMode,
		requiredTags,
		env,
		detailFacts,
	});

	if (aiResult.ok && aiResult.message) {
		return {
			message: aiResult.message,
			aiUsed: true,
			pattern: patternPlan.pattern,
			model: aiResult.model,
			reason: null,
		};
	}
	return {
		message: "",
		aiUsed: false,
		pattern: patternPlan.pattern,
		model: aiResult.model,
		reason: aiResult.reason ?? "ai_generation_failed",
	};
}

function chooseDailyAiPattern(
	selected: TcgStoreOripaCandidate,
	validCandidates: TcgStoreOripaCandidate[],
	dateSeed: number,
	forcePattern: DailyAiPattern | null,
): { pattern: DailyAiPattern; comparison: TcgStoreOripaCandidate | null } {
	const basePattern = forcePattern ?? DAILY_AI_PATTERN_ORDER[dateSeed % DAILY_AI_PATTERN_ORDER.length];
	const lowStockByPercent =
		selected.remainingPercent != null ? selected.remainingPercent <= 15 : selected.stock <= 5;
	let pattern = forcePattern ?? (lowStockByPercent ? "urgency" : basePattern);
	if (pattern === "urgency" && !lowStockByPercent) {
		pattern = "market_analysis";
	}

	let comparison: TcgStoreOripaCandidate | null = null;
	if (pattern === "comparison") {
		comparison = pickComparisonCandidate(selected, validCandidates);
		if (!comparison) {
			pattern = "market_analysis";
		}
	}

	return { pattern, comparison };
}

function pickComparisonCandidate(
	selected: TcgStoreOripaCandidate,
	validCandidates: TcgStoreOripaCandidate[],
): TcgStoreOripaCandidate | null {
	const others = validCandidates.filter((item) => item.url !== selected.url);
	if (others.length === 0) return null;

	return others.reduce((best, item) => {
		if (!best) return item;
		const bestDiff = Math.abs(best.price - selected.price);
		const itemDiff = Math.abs(item.price - selected.price);
		return itemDiff < bestDiff ? item : best;
	}, others[0] ?? null);
}

async function generateDailyTcgStoreAiMessage({
	selected,
	comparison,
	pattern,
	toneMode,
	lengthMode,
	requiredTags,
	env,
	detailFacts,
}: {
	selected: TcgStoreOripaCandidate;
	comparison: TcgStoreOripaCandidate | null;
	pattern: DailyAiPattern;
	toneMode: DailyToneMode;
	lengthMode: DailyLengthMode;
	requiredTags: string[];
	env: MonitorEnv;
	detailFacts: TcgStoreDetailFacts;
}): Promise<{ ok: boolean; message?: string; reason?: string; model: string | null }> {
	if (!env.ANTHROPIC_API_KEY) {
		return {
			ok: false,
			reason: "missing_anthropic_api_key",
			model: env.ANTHROPIC_MODEL ?? null,
		};
	}

	const model = env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
	let feedback: string | null = null;

	for (let attempt = 0; attempt < 3; attempt++) {
		const prompt = buildDailyTcgStoreAiUserPrompt({
			selected,
			comparison,
			pattern,
			toneMode,
			lengthMode,
			feedback,
			detailFacts,
		});
		const response = await callAnthropicTextGeneration({
			system: TCGSTORE_AI_SYSTEM_PROMPT,
			prompt,
			apiKey: env.ANTHROPIC_API_KEY,
			model,
		});

		if (!response.ok || !response.text) {
			return {
				ok: false,
				reason: response.reason ?? "anthropic_request_failed",
				model,
			};
		}

		const normalized = normalizeDailyAiMessage(response.text, selected.url);
		const normalizedWithHashtags = applyHashtagPolicy(
			normalized,
			selected.url,
			requiredTags,
		);
		const normalizedWithPolicy = enforceInventoryMentionPolicy(
			normalizedWithHashtags,
			selected,
			selected.url,
		);
		const validation = validateDailyAiMessage(
			normalizedWithPolicy,
			selected.url,
			selected,
			pattern,
			detailFacts,
			toneMode,
			lengthMode,
			requiredTags,
		);
		if (validation.ok) {
			return {
				ok: true,
				message: normalizedWithPolicy,
				model,
			};
		}

		feedback = `前回の出力は不正でした。修正してください。問題点: ${validation.reasons.join(" / ")}`;
	}

	return {
		ok: false,
		reason: "ai_validation_failed",
		model,
	};
}

function buildDailyTcgStoreAiUserPrompt({
	selected,
	comparison,
	pattern,
	toneMode,
	lengthMode,
	feedback,
	detailFacts,
}: {
	selected: TcgStoreOripaCandidate;
	comparison: TcgStoreOripaCandidate | null;
	pattern: DailyAiPattern;
	toneMode: DailyToneMode;
	lengthMode: DailyLengthMode;
	feedback: string | null;
	detailFacts: TcgStoreDetailFacts;
}): string {
	const sanitizedTopPrizeNames = detailFacts.topPrizeNames
		.map((name) => sanitizeCardNameForPost(name))
		.filter(Boolean);
	const sanitizedSecondPrizeNames = detailFacts.secondPrizeNames
		.map((name) => sanitizeCardNameForPost(name))
		.filter(Boolean);
	const top2Probability = calcTop2ProbabilityPercent(detailFacts, selected.supply);
	const top2Odds = calcTop2Odds(detailFacts, selected.supply);
	const commonData = [
		"以下は販売中オリパの事実データです。与えられた情報だけを使ってX投稿文を1本だけ生成してください。",
		"",
		"【対象オリパ】",
		`商品名: ${selected.name}`,
		`価格: ${formatNumber(selected.price)}${selected.priceUnit} / 1回`,
		`在庫: ${selected.stock}口`,
		`総口数: ${selected.supply == null ? "不明" : `${selected.supply}口`}`,
		`残り率: ${
			selected.remainingPercent == null ? "不明" : `${selected.remainingPercent.toFixed(2)}%`
		}`,
		`1日あたり回数上限: ${
			selected.maxPerDay == null ? "不明" : `${selected.maxPerDay}回`
		}`,
		`上位賞の例: ${sanitizedTopPrizeNames.join(" / ") || "不明"}`,
		`次点賞の例: ${sanitizedSecondPrizeNames.join(" / ") || "不明"}`,
		`賞品coin表記 最小〜最大: ${
			detailFacts.minCoinPrize == null
				? "不明"
				: `${formatNumber(detailFacts.minCoinPrize)}〜${formatNumber(detailFacts.maxCoinPrize ?? detailFacts.minCoinPrize)}coin`
		}`,
		`テンションモード: ${toneMode}`,
		`文字数モード: ${lengthMode}`,
		`商品URL: ${selected.url}`,
		`特記事項: ${SPECIAL_ITEM_FACTS[selected.id] ?? "なし"}`,
		"",
		...buildRankProbabilitySection(detailFacts, selected),
		"",
		"【運用者メモ（優先）】",
		...buildOperatorInsightHints(selected),
		"",
		"【出力ルール】",
		"- ★最重要★ 投稿の冒頭（1行目）は商品名ではなく、読み手にとっての具体的メリット・数値的事実から始めること",
		"  例: 「最低保証1,100coin・赤字なしで引ける」「1口999coinで〇〇狙い」「1日1回限定で試せる」",
		"  NG: 「⚡黒炎の舞」のような商品名だけの冒頭",
		"- @tcgstore_io の実績フォーマットを優先し、1行目は『狙いカード + 価格の入口』を短く提示する",
		"  例: 「ピカチュウex狙い、180coinから。」",
		"  例: 「リザードンex SAR、今ここで狙える。」",
		"- 2行目は『試しやすさ・価格帯メリット』を簡潔に述べる",
		"  例: 「試しやすい価格帯の入口。」",
		"- 市場価格（相場◯円）の具体値は、入力データに明示された場合のみ使用可。未提供なら書かない",
		...(lengthMode === "short"
			? [
					"- ★文字数モード: short★ URL込みで60〜90文字。1〜2文で要点だけサラッと書く。余計な説明は不要。",
					"  事実1つ＋一言だけでOK。例: 「1人1回限定、最低保証1,100coin。\\n{URL}」",
				]
			: [
					"- ★文字数モード: full★ URL込みで100〜140文字。しっかり情報を盛り込む。",
				]),
		"- 本文のみ出力する",
		"- 商品URLは最後にそのまま記載する",
		"- 価格・在庫・URLは事実と一致させる",
		`- ハッシュタグ規則: ${buildHashtagRuleText(selected, pattern, detailFacts)}`,
		"- pOAS商品以外では、pOAS・OAS・演出差分への言及を禁止",
		"- 在庫が十分ある場合は『残り少ない』『急いで』などの煽り文言を使わない",
		"- 残り率70%以上では、在庫の多さ（◯口残り）を強調しない",
		"- 1人1回限定商品の場合、低価格帯の話題より『最低保証』『赤字覚悟』『お得感』を優先する",
		"- 『どんな層が引いてる』など根拠のないユーザー属性推定は禁止",
		"- 一人称の感想表現（正直、個人的には、〜と思う、〜気がする）は禁止",
		"- 「絶対」「確実」「買うべき」などの断定表現は禁止",
		"- 相場情報、当たり内容、完売速度、カード詳細など未提供情報は書かない",
		"- 上位賞の確率データは内部判断用。本文で「N人に1人」「0.x%」の確率訴求は使わない",
		"- 『1等+2等合計確率』を、全体の保証表現（必ず/全員/100%）に置き換えてはいけない",
		"- ランク名からカテゴリ解釈を作らない（例: Legendary以上 / Legendaryクラス / 上位グレード などは禁止）",
		"- カード名の英単語は原文を勝手に補正しない（例: API原文が Legndary なら Legendary に直さない）",
		"- 『リターンより体験を楽しむ』『目安になる』など、購買意欲を削ぐ曖昧・消極表現は禁止",
		...(top2Probability != null
			? ["- 「当たりやすい」「狙いやすい」「期待感が上がる」などの誘導表現は禁止。"]
			: []),
		`- 絵文字は0〜1個まで。装飾目的の連打はしない`,
	];

	const patternSection = (() => {
		switch (pattern) {
			case "market_analysis":
				return [
					"",
					"【パターン】相場分析型",
					"- 値段の見え方やオリパの魅力を、落ち着いた分析トーンで紹介する",
					"- 価格の理由を断定せず、「この価格帯は試しやすい」「入りやすい」などの表現でまとめる",
				];
			case "contrarian":
				return [
					"",
					"【パターン】逆張り提案型",
					"- 高額オリパばかり注目されがち、のような一般論に別視点を出す",
					"- 最後に軽い問いかけを入れてもよい",
				];
			case "comparison":
				return [
					"",
					"【パターン】比較型",
					"以下の比較対象も使ってよい。比較は価格帯や選びやすさの違いに限定し、未提供情報は足さない。",
					`比較商品名: ${comparison?.name ?? ""}`,
					`比較価格: ${comparison ? `${formatNumber(comparison.price)}${comparison.priceUnit} / 1回` : ""}`,
					`比較在庫: ${comparison ? `${comparison.stock}口` : ""}`,
				];
			case "trivia":
				return [
					"",
					"【パターン】豆知識型",
					"- オリパ選びで見られやすいポイントや、価格帯の楽しみ方を豆知識っぽく紹介する",
					"- カード固有情報は未提供なので創作しない",
				];
			case "urgency":
				return [
					"",
					"【パターン】緊急感型",
					"- 在庫が少ない事実を自然に伝える",
					"- 煽りすぎず「気になっていた方は早めにチェック」程度にとどめる",
				];
		}
	})();

	return [
		...commonData,
		...patternSection,
		...(feedback ? ["", "【修正指示】", feedback] : []),
	].join("\n");
}

async function callAnthropicTextGeneration({
	system,
	prompt,
	apiKey,
	model,
}: {
	system: string;
	prompt: string;
	apiKey: string;
	model: string;
}): Promise<{ ok: boolean; text?: string; reason?: string }> {
	const res = await fetch("https://api.anthropic.com/v1/messages", {
		method: "POST",
		headers: {
			"content-type": "application/json",
			"x-api-key": apiKey,
			"anthropic-version": "2023-06-01",
		},
		body: JSON.stringify({
			model,
			max_tokens: 220,
			system,
			messages: [
				{
					role: "user",
					content: prompt,
				},
			],
		}),
	});

	const raw = await res.text();
	let data: Record<string, unknown> = {};
	try {
		data = JSON.parse(raw);
	} catch {
		data = { raw };
	}

	if (!res.ok) {
		return {
			ok: false,
			reason: `anthropic_http_${res.status}`,
		};
	}

	const content = Array.isArray(data.content) ? data.content : [];
	const text = content
		.map((item) => {
			if (!item || typeof item !== "object") return "";
			const record = item as Record<string, unknown>;
			return record.type === "text" ? String(record.text ?? "") : "";
		})
		.join("")
		.trim();

	if (!text) {
		return {
			ok: false,
			reason: "anthropic_empty_response",
		};
	}

	return {
		ok: true,
		text,
	};
}

function normalizeDailyAiMessage(text: string, url: string): string {
	const withoutCodeFence = text.replace(/```[\s\S]*?```/g, " ").trim();
	const withoutUrls = withoutCodeFence.replace(/https?:\/\/\S+/g, "").replace(/\s+\n/g, "\n").trim();
	return `${withoutUrls}\n${url}`.trim();
}

function validateMercariDailyAiMessage(
	text: string,
	url: string,
	topPrizeNames: string[],
): { ok: boolean; reasons: string[] } {
	const reasons: string[] = [];
	const length = countXLength(text);
	if (length < 70) reasons.push(`文字数不足(${length})`);
	if (length > 150) reasons.push(`文字数超過(${length})`);
	if (!text.endsWith(url)) reasons.push("URLは末尾に配置してください");
	const body = text.replace(url, "").trim();
	if (countEmoji(body) > 1) reasons.push("絵文字は0〜1個までにしてください");
	const firstLine = body.split(/\n/).find(Boolean) ?? "";
	if (!firstLine) reasons.push("本文が不足しています");
	if (/^(本日|今日).{0,8}(メルカリ|くじ)/.test(firstLine) || /^🎉|^🎯/.test(firstLine)) {
		reasons.push("テンプレ導入文を禁止しています");
	}
	if (/残っている|残ってる/.test(body)) {
		reasons.push("在庫のネガティブ表現（残っている）は避けてください");
	}
	if (/全\s*[0-9,]+\s*回中|現在\s*[0-9,]+\s*回(?:分)?/.test(body)) {
		reasons.push("全体母数と残数の比較表現は禁止です");
	}
	if (/じっくり選んで引け|選んで引ける|内容を確認してみてください|リンクから内容/.test(body)) {
		reasons.push("不要または仕様とズレる誘導文を検出しました");
	}
	if (/実質的なロス|繰り返し引く選択肢|なりやすい/.test(body)) {
		reasons.push("不自然な説明表現を検出しました");
	}
	if (/消化率|消化して/.test(body)) {
		reasons.push("消化率ベースの表現は禁止です");
	}
	if (/残り少|急げ|今すぐ|ラストチャンス/.test(body)) {
		reasons.push("煽り表現を検出しました");
	}
	const expectedTags = inferMercariTags(topPrizeNames);
	const foundTags = extractHashtags(body);
	if (foundTags.length > 2) reasons.push("ハッシュタグは最大2個までです");
	if (foundTags.some((tag) => !expectedTags.includes(tag))) {
		reasons.push("S賞/1等カードと無関係なハッシュタグは禁止です");
	}
	return { ok: reasons.length === 0, reasons };
}

function validateDailyAiMessage(
	text: string,
	url: string,
	selected: TcgStoreOripaCandidate,
	pattern: DailyAiPattern,
	detailFacts: TcgStoreDetailFacts,
	toneMode: DailyToneMode,
	lengthMode: DailyLengthMode = "full",
	requiredTags: string[] = getRequiredHashtags(selected, pattern, detailFacts),
): { ok: boolean; reasons: string[] } {
	const reasons: string[] = [];
	const length = countXLength(text);
	const emojiCount = countEmoji(text.replace(url, "").trim());
	const bodyText = text.replace(url, "").trim();
	const body = bodyText.toLowerCase();

	const minLen = lengthMode === "short" ? 60 : 100;
	const maxLen = lengthMode === "short" ? 90 : 140;
	if (length < minLen) reasons.push(`文字数が短すぎます(${length}, ${lengthMode}モード最低${minLen})`);
	if (length > maxLen) reasons.push(`文字数が長すぎます(${length}, ${lengthMode}モード最大${maxLen})`);
	if (!text.endsWith(url)) reasons.push("URLが末尾にありません");
	if ((text.match(/#/g) || []).length > 2) reasons.push("ハッシュタグが多すぎます");
	if (!text.includes(url)) reasons.push("URLが含まれていません");
	const maxEmoji = 1;
	if (emojiCount > maxEmoji) reasons.push("絵文字が多すぎます");
	if (selected.priceUnit !== "pOAS") {
		if (body.includes("poas") || body.includes("oas")) {
			reasons.push("非pOAS商品でpOAS/OASに言及しています");
		}
		if (body.includes("演出") && (body.includes("違") || body.includes("別"))) {
			reasons.push("非pOAS商品で演出差分に言及しています");
		}
	}
	if ((selected.remainingPercent ?? 100) >= 30) {
		if (
			/残り少|在庫が少|なくなってき|急い|お早め|ラストチャンス|今のうち/.test(text)
		) {
			reasons.push("在庫率が高い商品の煽り文言を検出しました");
		}
	}
	if ((selected.remainingPercent ?? 100) >= 70) {
		if (/[0-9,]+\s*口/.test(text)) {
			reasons.push("在庫率が高い商品の口数強調を検出しました");
		}
	}
	if (/どんな層|誰が引いて|層が引いて/.test(text)) {
		reasons.push("根拠不明のユーザー属性推定を検出しました");
	}
	if (/正直、|ぶっちゃけ、|個人的には|個人的に|と思う|気がする|かも。|かも、/.test(text)) {
		reasons.push("主観的な感想表現を検出しました");
	}
	if (
		selected.name.includes("1人1回限定") &&
		selected.priceUnit === "コイン" &&
		detailFacts.minCoinPrize != null &&
		detailFacts.minCoinPrize >= selected.price + 100
	) {
		if (!/1人1回|赤字|1100|保証|最低/.test(text)) {
			reasons.push("1人1回限定の保証訴求が不足しています");
		}
	}
	if (selected.id in SPECIAL_ITEM_FACTS) {
		if (!/1人1回/.test(text) || !/1100|最低|保証|赤字/.test(text)) {
			reasons.push("特記事項商品の必須訴求（1人1回・1100coin以上）が不足しています");
		}
	}
	if (selected.name.includes("1人1回限定")) {
		if (!/1人1回/.test(text) || !/最低|保証|赤字|お得|損/.test(text)) {
			reasons.push("1人1回限定商品のお得訴求が不足しています");
		}
		if (/低価格帯|価格帯/.test(text)) {
			reasons.push("1人1回限定商品の低価格帯訴求は不要です");
		}
	}
	if (/Legendary以上|Legendaryクラス|レジェンダリー以上|レジェンダリークラス|上位グレード/.test(text)) {
		reasons.push("ランク名の解釈表現（〜以上/〜クラス）を検出しました");
	}
	if (/リターンより|体験を楽し|選ぶときの目安|目安になる/.test(text)) {
		reasons.push("消極的で訴求が弱い文言を検出しました");
	}
	if (/実質的なロス|繰り返し引く選択肢|選択肢にもなりやすい/.test(text)) {
		reasons.push("不自然で訴求が弱い文言を検出しました");
	}
	if (/[0-9]+人に1人/.test(text)) {
		reasons.push("『N人に1人』表現は禁止です");
	}
	if (/(^|[^0-9])0\.[0-9]+[%％]/.test(text)) {
		reasons.push("『0.x%』表現は禁止です");
	}
	const sourcePrizeText = `${detailFacts.topPrizeNames.join(" ")} ${detailFacts.secondPrizeNames.join(" ")}`.toLowerCase();
	if (body.includes("legendary") && !sourcePrizeText.includes("legendary")) {
		reasons.push("カード名の英単語を原文から補正した表現を検出しました");
	}
	if (
		/必ず|確定|100%/.test(text) &&
		!(
			selected.name.includes("1人1回限定") &&
			selected.priceUnit === "コイン" &&
			detailFacts.minCoinPrize != null &&
			detailFacts.minCoinPrize >= selected.price
		)
	) {
		reasons.push("保証根拠がない断定表現（必ず/確定/100%）を検出しました");
	}
	const top2Probability = calcTop2ProbabilityPercent(detailFacts, selected.supply);
	if (top2Probability != null) {
		if (
			/当たりやす|狙いやす|期待感が(上が|変わ)|魅力|熱い|チャンス|高確率|引き得|アツい/.test(
				text,
			)
		) {
			reasons.push("確率を根拠にした煽り表現を検出しました");
		}
	}
	if (
		!/1等|2等|人に1人|最低|保証|1日1回|低額|coinで引ける|挑戦できる|狙い/u.test(text)
	) {
		reasons.push("読み手メリットの具体表現が不足しています");
	}
	const firstLine = text.trim().split(/\n/)[0].replace(/[\p{Extended_Pictographic}\s]/gu, "");
	const cleanName = selected.name.replace(/[\s_\-]/g, "");
	if (firstLine === cleanName || firstLine.startsWith(cleanName)) {
		reasons.push("冒頭が商品名のみで始まっています。読み手のメリットや確率など具体的事実から始めてください");
	}
	const expectedTags = requiredTags;
	const foundTags = extractHashtags(bodyText);
	if (expectedTags.length === 0 && foundTags.length > 0) {
		reasons.push("このパターンではハッシュタグ禁止です");
	}
	if (expectedTags.length > 0) {
		const exact =
			foundTags.length === expectedTags.length &&
			expectedTags.every((tag) => foundTags.includes(tag)) &&
			foundTags.every((tag) => expectedTags.includes(tag));
		if (!exact) {
			reasons.push(
				`ハッシュタグが規則外です（必要: ${expectedTags.join(" ")} / 出力: ${foundTags.join(" ") || "なし"}）`,
			);
		}
	}

	return {
		ok: reasons.length === 0,
		reasons,
	};
}

function countXLength(text: string): number {
	return text
		.split(/\s+/)
		.filter(Boolean)
		.reduce((total, token) => total + (/^https?:\/\/\S+$/.test(token) ? 23 : token.length), 0);
}

function countEmoji(text: string): number {
	const matches = text.match(/\p{Extended_Pictographic}/gu);
	return matches?.length ?? 0;
}

function buildHashtagRuleText(
	selected: TcgStoreOripaCandidate,
	pattern: DailyAiPattern,
	detailFacts: TcgStoreDetailFacts,
): string {
	const tags = getRequiredHashtags(selected, pattern, detailFacts);
	return tags.length === 0 ? "ハッシュタグなし" : `${tags.join(" ")} のみ`;
}

function getRequiredHashtags(
	selected: TcgStoreOripaCandidate,
	pattern: DailyAiPattern,
	detailFacts?: TcgStoreDetailFacts,
): string[] {
	if (selected.priceUnit === "pOAS" || selected.priceUnit === "OAS") return [];
	const productTag =
		inferProductHashtag(selected.name) ||
		inferHashtagFromDetailFacts(detailFacts) ||
		inferCategoryHashtag(selected.name);
	if (pattern === "urgency") {
		// Keep urgency posts concise: one tag only if relevant.
		return productTag ? [productTag] : [];
	}
	return productTag ? [productTag] : [];
}

function inferHashtagFromDetailFacts(detailFacts?: TcgStoreDetailFacts): string | null {
	if (!detailFacts) return null;
	const names = [...detailFacts.topPrizeNames, ...detailFacts.secondPrizeNames]
		.map((n) => sanitizeCardNameForPost(n))
		.filter(Boolean);
	for (const name of names) {
		const tag = inferProductHashtag(name);
		if (tag) return tag;
	}
	return null;
}

function inferProductHashtag(name: string): string | null {
	const text = String(name ?? "");
	const rules: Array<{ re: RegExp; tag: string }> = [
		{ re: /ブレヒロ/u, tag: "#ブレヒロ" },
		{ re: /ルチア/u, tag: "#ルチア" },
		{ re: /ピカチュウ|ピカゼク/u, tag: "#ピカチュウ" },
		{ re: /ナンジャモ/u, tag: "#ナンジャモ" },
		{ re: /リザードン/u, tag: "#リザードン" },
		{ re: /オーガポン/u, tag: "#オーガポン" },
	];
	const hit = rules.find((r) => r.re.test(text));
	return hit?.tag ?? null;
}

function inferCategoryHashtag(name: string): string | null {
	const text = String(name ?? "");
	if (/ワンピ|one\s*piece|ロマドン|ロケット団の栄光/u.test(text)) return "#ワンピカード";
	if (/ポケカ|ポケモン|ピカチュウ|リザードン|ナンジャモ|リーリエ|sv\d+/iu.test(text)) return "#ポケカ";
	return null;
}

function inferMercariTags(topPrizeNames: string[]): string[] {
	const tags: string[] = [];
	for (const name of topPrizeNames) {
		const sanitized = sanitizeCardNameForPost(name);
		const mapped = inferProductHashtag(sanitized);
		if (mapped) {
			if (!tags.includes(mapped)) tags.push(mapped);
			continue;
		}
		const direct = toDirectNameTag(sanitized);
		if (direct && !tags.includes(direct)) tags.push(direct);
		if (tags.length >= 2) break;
	}
	return tags.slice(0, 2);
}

function toDirectNameTag(name: string): string | null {
	const cleaned = String(name ?? "")
		.replace(/PSA\d+|プロモ|SAR|SR|UR|HR|AR|RRR|RR|R/gi, " ")
		.replace(/\bSV[0-9A-Z\-_/]+\b/gi, " ")
		.replace(/\b[0-9]{1,3}\/[0-9]{1,3}\b/g, " ")
		.replace(/[()[\]{}]/g, " ")
		.replace(/\s+/g, " ")
		.trim();
	if (!cleaned) return null;
	if (cleaned.length > 12) return null;
	return `#${cleaned}`;
}

function applyMercariTagPolicy(text: string, url: string, topPrizeNames: string[]): string {
	const required = inferMercariTags(topPrizeNames);
	const body = text.replace(url, "").trim();
	const withoutTags = body.replace(/#[\p{L}\p{N}_]+/gu, "").replace(/\s+/g, " ").trim();
	const tagText = required.join(" ").trim();
	const nextBody = tagText ? `${withoutTags} ${tagText}`.trim() : withoutTags;
	return `${nextBody}\n${url}`.trim();
}

function enforceMercariTopPrizeMention(text: string, url: string, topPrizeNames: string[]): string {
	if (topPrizeNames.length === 0) return text;
	const body = text.replace(url, "").trim();
	const bodyForMatch = normalizeMatchText(body.replace(/#[\p{L}\p{N}_]+/gu, " "));
	const normalizedNames = topPrizeNames.map((name) => normalizeMatchText(sanitizeCardNameForPost(name)));
	const hasMention = normalizedNames.some((name) => name && bodyForMatch.includes(name));
	if (hasMention) return text;
	const lead = sanitizeCardNameForPost(topPrizeNames[0] ?? "").trim();
	if (!lead) return text;
	return `1等候補は${lead}。\n${body}\n${url}`.trim();
}

function fitMercariDailyMessageLength(text: string, url: string): string {
	let body = text.replace(url, "").trim();
	let merged = `${body}\n${url}`.trim();
	if (countXLength(merged) <= 150) return merged;

	const lines = body.split("\n").map((line) => line.trim()).filter(Boolean);
	if (lines.length > 2) {
		body = lines.slice(0, 2).join("\n");
		merged = `${body}\n${url}`.trim();
		if (countXLength(merged) <= 150) return merged;
	}

	const budget = Math.max(20, 150 - 24); // reserve URL length + spacing
	const flat = body.replace(/\s+/g, " ").trim();
	let sliced = "";
	for (const ch of flat) {
		if (countXLength(sliced + ch) > budget) break;
		sliced += ch;
	}
	return `${sliced.trim()}\n${url}`.trim();
}

function normalizeMercariStockTone(text: string, url: string): string {
	let body = text.replace(url, "").trim();
	body = body.replace(
		/全\s*([0-9,]+)\s*回中[、,\s]*現在\s*([0-9,]+)\s*回(?:分)?(?:が)?\s*残って(?:いる)?(?:状態)?(?:です)?。?/g,
		"まだ$2回引ける状態です。",
	);
	body = body.replace(
		/全\s*([0-9,]+)\s*回(?:構成)?(?:で)?[、,\s]*現時点で(?:の)?\s*消化率\s*は?\s*[0-9]+(?:\.[0-9]+)?[%％]。?/g,
		"",
	);
	body = body.replace(/\s+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
	return `${body}\n${url}`.trim();
}

function extractHashtags(text: string): string[] {
	const matches = text.match(/#[\p{L}\p{N}_]+/gu) ?? [];
	return [...new Set(matches)];
}

function applyHashtagPolicy(text: string, url: string, requiredTags: string[]): string {
	const body = text.replace(url, "").trim();
	const bodyWithoutTags = body.replace(/#[\p{L}\p{N}_]+/gu, "").replace(/\s+/g, " ").trim();
	const tagsText = requiredTags.join(" ").trim();
	const nextBody = tagsText ? `${bodyWithoutTags} ${tagsText}`.trim() : bodyWithoutTags;
	return `${nextBody}\n${url}`.trim();
}

function enforceInventoryMentionPolicy(
	text: string,
	selected: TcgStoreOripaCandidate,
	url: string,
): string {
	if ((selected.remainingPercent ?? 100) < 70) return text;
	const body = text.replace(url, "").trim();
	const cleaned = body
		.replace(/(?:残り|在庫)\s*[0-9,]+\s*口[^。\n]*[。]?/gu, "")
		.replace(/[0-9,]+\s*口[^。\n]*[。]?/gu, "")
		.replace(/\s+/g, " ")
		.trim();
	return `${cleaned}\n${url}`.trim();
}

async function runMonitor(
	request: Request,
	env: MonitorEnv,
	options: RunMonitorOptions = {},
): Promise<Response> {
	const {
		fromSchedule = false,
		forceCommit = false,
		logToConsole = true,
		forceLevel = null,
	} = options;

	const reqUrl = new URL(request.url);
	const commit = forceCommit || reqUrl.searchParams.get("commit") === "1";
	const forceLevelParam = reqUrl.searchParams.get("forceLevel");
	const requestForceLevel =
		forceLevelParam === "under_100" || forceLevelParam === "under_200"
			? forceLevelParam
			: null;
	const activeForceLevel = forceLevel ?? requestForceLevel;

	const stateStore = createStateStore(env);
	const marketContext = await getLatestMarketContext(stateStore);
	const items = await fetchAllCandidateItems();

	const results: Array<Record<string, unknown>> = [];

	for (const item of items) {
		const detail = await fetchItemDetail(item);
		if (detail.percent == null) continue;

		const pickedTitle = pickTitle(item, detail);
		const title = pickedTitle.title;
		const matchedMarketContext = pickAlertMarketContext(title, marketContext);

		const under200Key = `${item.source}:${item.url}:under200`;
		const under100Key = `${item.source}:${item.url}:under100`;
		const lastTweetIdKey = `${item.source}:${item.url}:last_tweet_id`;

		const under200Posted = (await stateStore.get(under200Key)) === "1";
		const under100Posted = (await stateStore.get(under100Key)) === "1";

		let action = "none";
		let committed = false;
		let postedToX = false;
		let xResponse: unknown = null;
		let previewMessage: string | null = null;

		const shouldForceUnder100 = activeForceLevel === "under_100";
		const shouldForceUnder200 = activeForceLevel === "under_200";
		const thresholds = ALERT_THRESHOLDS[item.source];

		const meetsHighThreshold =
			thresholds.metric === "count"
				? detail.detailRemaining !== null && detail.detailRemaining <= thresholds.high
				: detail.percent !== null && detail.percent <= thresholds.high;
		const meetsLowThreshold =
			thresholds.metric === "count"
				? detail.detailRemaining !== null && detail.detailRemaining <= thresholds.low
				: detail.percent !== null && detail.percent <= thresholds.low;

		if ((meetsHighThreshold || shouldForceUnder100) && !under100Posted) {
			action = "notify_under_100";
			previewMessage = buildAlertMessage({
				source: item.source,
				title,
				remaining: detail.detailRemaining,
				totalCount: detail.totalCount,
				url: item.url,
				level: "under_100",
				includeLastPrize: Boolean(detail.lastOneImageUrl),
				marketContext: matchedMarketContext,
			});

			if (commit) {
				const postResult = await postTweetWithImages(
					previewMessage,
					{
						mainImageUrl: detail.mainImageUrl,
						lastOneImageUrl: detail.lastOneImageUrl,
					},
					env,
				);

				postedToX = postResult.ok;
				xResponse = postResult;

				if (postResult.ok) {
					await stateStore.put(under100Key, "1");
					committed = true;
					const tweetId = extractPostedTweetId(postResult);
					if (tweetId && item.source === "mercari") {
						await stateStore.put(lastTweetIdKey, tweetId);
					}
				}
			}
		} else if ((meetsLowThreshold || shouldForceUnder200) && !under200Posted) {
			action = "notify_under_200";
			previewMessage = buildAlertMessage({
				source: item.source,
				title,
				remaining: detail.detailRemaining,
				totalCount: detail.totalCount,
				url: item.url,
				level: "under_200",
				includeLastPrize: Boolean(detail.lastOneImageUrl),
				marketContext: matchedMarketContext,
			});

			if (commit) {
				const postResult = await postTweetWithImages(
					previewMessage,
					{
						mainImageUrl: detail.mainImageUrl,
						lastOneImageUrl: detail.lastOneImageUrl,
					},
					env,
				);

				postedToX = postResult.ok;
				xResponse = postResult;

				if (postResult.ok) {
					await stateStore.put(under200Key, "1");
					committed = true;
					const tweetId = extractPostedTweetId(postResult);
					if (tweetId && item.source === "mercari") {
						await stateStore.put(lastTweetIdKey, tweetId);
					}
				}
			}
		}

		// Sold-out detection for Mercari
		if (item.source === "mercari" && detail.detailRemaining === 0 && action === "none") {
			const soldOutKey = `${item.source}:${item.url}:sold_out`;
			const soldOutPosted = (await stateStore.get(soldOutKey)) === "1";
			if (!soldOutPosted) {
				const lastTweetId = await stateStore.get(lastTweetIdKey);
				if (commit && lastTweetId) {
					const quoteResult = await postQuoteTweet(
						"✅ 完売しました！ありがとうございました🙏",
						lastTweetId,
						env,
					);
					if (quoteResult.ok) {
						await stateStore.put(soldOutKey, "1");
						await stateStore.put(lastTweetIdKey, "");
						action = "notify_sold_out";
						committed = true;
						postedToX = true;
						xResponse = quoteResult;
					}
				} else if (!commit) {
					action = "would_notify_sold_out";
				}
			}
		}

		if (previewMessage && logToConsole) {
			console.log(
				JSON.stringify(
					{
						type: "ALERT_PREVIEW",
						source: item.source,
						level: action,
						title,
						titleSource: pickedTitle.source,
						detailTitleSource: detail.kujiTitleSource,
						detailKujiTitle: detail.kujiTitle,
						url: item.url,
						remaining: detail.detailRemaining,
						totalCount: detail.totalCount,
						percent: detail.percent,
						mainImageUrl: detail.mainImageUrl,
						lastOneImageUrl: detail.lastOneImageUrl,
						marketContext: matchedMarketContext,
						committed,
						postedToX,
						xResponse,
						previewMessage,
					},
					null,
					2,
				),
			);
		}

		results.push({
			source: item.source,
			title,
			titleSource: pickedTitle.source,
			detailTitleSource: detail.kujiTitleSource,
			url: item.url,
			remaining: detail.detailRemaining,
			totalCount: detail.totalCount,
			percent: detail.percent,
			hasLastOnePrize: detail.hasLastOnePrize,
			mainImageUrl: detail.mainImageUrl,
			lastOneImageUrl: detail.lastOneImageUrl,
			imageUrls: detail.imageUrls,
			marketContext: matchedMarketContext,
			under200Posted,
			under100Posted,
			action,
			committed,
			postedToX,
			xResponse,
			previewMessage,
		});
	}

	return jsonResponse({
		ok: true,
		fromSchedule,
		commitMode: commit,
		count: results.length,
		items: results,
	});
}

function createStateStore(env: Partial<MonitorEnv>): StateStore {
	const state = env.STATE;
	if (state && typeof state.get === "function" && typeof state.put === "function") {
		return {
			get: (key: string) => state.get(key),
			put: (key: string, value: string) => state.put(key, value),
		};
	}

	console.warn(
		"[mercari-monitor] STATE binding is missing. Using in-memory fallback store for this process.",
	);

	return {
		get: async (key: string) => localStateFallback.get(key) ?? null,
		put: async (key: string, value: string) => {
			localStateFallback.set(key, value);
		},
	};
}

function buildAlertMessage({
	source,
	title,
	remaining,
	totalCount,
	url,
	level,
	includeLastPrize,
	marketContext,
}: {
	source: MonitorSource;
	title: string;
	remaining: number | null;
	totalCount: number | null;
	url: string;
	level: AlertLevel;
	includeLastPrize: boolean;
	marketContext: LatestMarketContext | null;
}): string {
	if (source === "mercari") {
		return buildMercariAlertMessage({
			title,
			remaining,
			totalCount,
			url,
			level,
			includeLastPrize,
			marketContext,
		});
	}
	const safeRemaining = Number.isFinite(remaining) ? String(remaining) : "?";
	const safeTotal = Number.isFinite(totalCount) ? String(totalCount) : "?";
	const headerPrefix = source === "tcgstore" ? "TCGSTOREオリパ" : "メルカリくじ";
	const lastPrizeLabel = source === "tcgstore" ? "ラスト賞" : "ラスイチ賞";
	const hotIcon = level === "under_100" ? "🔥" : "🏆";

	const lines: string[] = [];

	if (level === "under_100") {
		lines.push(`🚨 ${headerPrefix}「${title}」`, "残りわずか!");
	} else {
		lines.push(`🎯 ${headerPrefix}「${title}」`, "残り少なくなってきました!");
	}

	lines.push("", `残り${safeRemaining}回（全${safeTotal}回）`, "");
	if (includeLastPrize) {
		lines.push(`${hotIcon} ${lastPrizeLabel}を狙え`, "");
	}
	const marketLine = buildAlertMarketLine(marketContext);
	if (marketLine) {
		lines.push(marketLine, "");
	}
	lines.push(url);

	return lines.join("\n");
}

function buildMercariAlertMessage({
	title,
	remaining,
	totalCount,
	url,
	level,
	includeLastPrize,
	marketContext,
}: {
	title: string;
	remaining: number | null;
	totalCount: number | null;
	url: string;
	level: AlertLevel;
	includeLastPrize: boolean;
	marketContext: LatestMarketContext | null;
}): string {
	const safeRemaining = Number.isFinite(remaining) ? formatNumber(remaining as number) : "?";
	const safeTotal = Number.isFinite(totalCount) ? formatNumber(totalCount as number) : "?";
	const seed = hashSeed(`${title}|${url}|${level}|${safeRemaining}|${safeTotal}`);
	const moodEmojiSets = ["😮‍💨😏👀", "🫥👁️", "😶‍🌫️😏", "😮‍💨🫠", "👁️🫰"];
	const low5Lines = [
		"静かに減ってる。",
		"音はない。数だけ落ちる。",
		"空気は冷たいまま、残りだけ削れる。",
	];
	const low1Lines = [
		"もう余白は薄い。",
		"ここから先は、遅れたらそれまで。",
		"残りわずか。沈黙のまま終盤へ。",
	];
	const closePairs: Array<[string, string]> = [
		["騒ぐ必要はない。", "取るやつだけが取る。"],
		["群れる話じゃない。", "わかるやつだけ来い。"],
		["静かでいい。", "遅れたら、それまで。🫰"],
		["熱は内側で足りる。", "ここは、取る側の時間。"],
	];
	const mood = moodEmojiSets[seed % moodEmojiSets.length];
	const phaseLine =
		level === "under_100"
			? low1Lines[seed % low1Lines.length]
			: low5Lines[seed % low5Lines.length];
	const closePair = closePairs[seed % closePairs.length];

	const lines: string[] = [
		`🎯メルカリくじ「${title}」${mood}`,
		"",
		`残り${safeRemaining}回 / 全${safeTotal}回`,
		phaseLine,
		"",
	];
	if (includeLastPrize) {
		lines.push("🏆 ラスイチ賞を狙え", "");
	}
	const marketLine = buildAlertMarketLine(marketContext);
	if (marketLine) {
		lines.push(marketLine, "");
	}
	lines.push(closePair[0], closePair[1], "", url);
	return lines.join("\n");
}

function hashSeed(input: string): number {
	let h = 2166136261 >>> 0;
	for (let i = 0; i < input.length; i++) {
		h ^= input.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return h >>> 0;
}

function pickAlertMarketContext(
	title: string,
	marketContext: LatestMarketContext | null,
): LatestMarketContext | null {
	if (!marketContext) return null;
	if (!Number.isFinite(marketContext.changePct) || marketContext.changePct < ALERT_MARKET_CHANGE_PCT_MIN) {
		return null;
	}
	const keyword = normalizeMatchText(extractTrendKeyword(marketContext.card));
	if (!keyword) return null;
	const normalizedTitle = normalizeMatchText(title);
	if (!normalizedTitle.includes(keyword) && !keyword.includes(normalizedTitle)) return null;
	return marketContext;
}

function buildAlertMarketLine(marketContext: LatestMarketContext | null): string | null {
	if (!marketContext) return null;
	const before = formatNumber(marketContext.beforePrice);
	const after = formatNumber(marketContext.afterPrice);
	const pct = Number(marketContext.changePct).toFixed(2);
	return `📈 ${marketContext.card}: ${before}円 → ${after}円（+${pct}%）`;
}

async function postTweetWithImages(
	text: string,
	images: { mainImageUrl?: string | null; lastOneImageUrl?: string | null },
	env: MonitorEnv,
	options: {
		mainImageAlt?: string | null;
		lastOneImageAlt?: string | null;
		additionalImageUrls?: string[];
	} = {},
): Promise<Record<string, unknown> & { ok: boolean }> {
	const endpoint = "https://api.x.com/2/tweets";

	if (
		!env.X_API_KEY ||
		!env.X_API_KEY_SECRET ||
		!env.X_ACCESS_TOKEN ||
		!env.X_ACCESS_TOKEN_SECRET
	) {
		return {
			ok: false,
			status: 0,
			error: "Missing X secrets",
		};
	}

	const mediaIds: string[] = [];
	const uploadedMedia: Array<Record<string, unknown>> = [];

	const imageCandidates: Array<{ url: string; altText: string | null }> = [
		{ url: images.mainImageUrl || "", altText: options.mainImageAlt ?? null },
		{ url: images.lastOneImageUrl || "", altText: options.lastOneImageAlt ?? null },
		...(options.additionalImageUrls ?? []).map((url) => ({
			url: String(url ?? ""),
			altText: null,
		})),
	].filter((x) => Boolean(x.url));

	const seenImageUrl = new Set<string>();
	for (const candidate of imageCandidates) {
		if (seenImageUrl.has(candidate.url)) continue;
		seenImageUrl.add(candidate.url);
		const imageUrl = candidate.url;
		const uploadResult = await uploadImageToX(imageUrl, env);

		uploadedMedia.push({
			sourceUrl: imageUrl,
			...uploadResult,
		});

		if (!uploadResult.ok) {
			return {
				ok: false,
				status: uploadResult.status || 0,
				error: "Image upload failed",
				uploadedMedia,
			};
		}

		const mediaId = String(uploadResult.mediaId);
		mediaIds.push(mediaId);
		if (candidate.altText && candidate.altText.trim()) {
			const altResult = await setXMediaAltText(mediaId, candidate.altText.trim(), env);
			uploadedMedia.push({
				sourceUrl: imageUrl,
				type: "alt_text",
				...altResult,
			});
		}
	}

	const bodyObject: {
		text: string;
		media?: { media_ids: string[] };
	} = { text };

	if (mediaIds.length > 0) {
		bodyObject.media = { media_ids: mediaIds };
	}

	const body = JSON.stringify(bodyObject);

	const authorization = await buildOAuth1Header({
		method: "POST",
		url: endpoint,
		consumerKey: env.X_API_KEY,
		consumerSecret: env.X_API_KEY_SECRET,
		token: env.X_ACCESS_TOKEN,
		tokenSecret: env.X_ACCESS_TOKEN_SECRET,
	});

	const res = await fetch(endpoint, {
		method: "POST",
		headers: {
			Authorization: authorization,
			"Content-Type": "application/json",
		},
		body,
	});

	const raw = await res.text();
	let data: unknown = null;

	try {
		data = JSON.parse(raw);
	} catch {
		data = { raw };
	}

	return {
		ok: res.ok,
		status: res.status,
		data,
		mediaIds,
		uploadedMedia,
	};
}

async function uploadImageToX(
	imageUrl: string,
	env: MonitorEnv,
): Promise<Record<string, unknown> & { ok: boolean; status: number; mediaId?: string }> {
	const endpoint = "https://upload.twitter.com/1.1/media/upload.json";

	const imageRes = await fetch(imageUrl, {
		headers: {
			"user-agent": "Mozilla/5.0",
		},
	});

	if (!imageRes.ok) {
		return {
			ok: false,
			status: imageRes.status,
			error: "image fetch failed",
		};
	}

	const blob = await imageRes.blob();

	const form = new FormData();
	form.append("media", blob);

	const authorization = await buildOAuth1Header({
		method: "POST",
		url: endpoint,
		consumerKey: env.X_API_KEY ?? "",
		consumerSecret: env.X_API_KEY_SECRET ?? "",
		token: env.X_ACCESS_TOKEN ?? "",
		tokenSecret: env.X_ACCESS_TOKEN_SECRET ?? "",
	});

	const res = await fetch(endpoint, {
		method: "POST",
		headers: {
			Authorization: authorization,
		},
		body: form,
	});

	const raw = await res.text();
	let data: Record<string, unknown>;
	try {
		data = JSON.parse(raw);
	} catch {
		data = { raw };
	}

	if (!res.ok) {
		return {
			ok: false,
			status: res.status,
			data,
		};
	}

	return {
		ok: true,
		status: res.status,
		mediaId: String(data.media_id_string ?? ""),
	};
}

async function setXMediaAltText(
	mediaId: string,
	altText: string,
	env: MonitorEnv,
): Promise<Record<string, unknown> & { ok: boolean; status: number }> {
	const endpoint = "https://upload.twitter.com/1.1/media/metadata/create.json";
	const body = JSON.stringify({
		media_id: mediaId,
		alt_text: { text: altText.slice(0, 1000) },
	});
	const authorization = await buildOAuth1Header({
		method: "POST",
		url: endpoint,
		consumerKey: env.X_API_KEY ?? "",
		consumerSecret: env.X_API_KEY_SECRET ?? "",
		token: env.X_ACCESS_TOKEN ?? "",
		tokenSecret: env.X_ACCESS_TOKEN_SECRET ?? "",
	});
	const res = await fetch(endpoint, {
		method: "POST",
		headers: {
			Authorization: authorization,
			"Content-Type": "application/json",
		},
		body,
	});
	const raw = await res.text();
	let data: unknown = null;
	try {
		data = raw ? JSON.parse(raw) : {};
	} catch {
		data = { raw };
	}
	return {
		ok: res.ok,
		status: res.status,
		data,
	};
}

async function xMediaUpload(
	params: {
		command: "INIT" | "FINALIZE";
		mediaType?: string;
		totalBytes?: number;
		mediaCategory?: string;
		mediaId?: string | number;
	},
	env: MonitorEnv,
): Promise<Record<string, unknown> & { ok: boolean; status: number; mediaId?: string | null }> {
	const endpoint = "https://api.x.com/2/media/upload";

	const form = new FormData();
	form.append("command", params.command);

	if (params.command === "INIT") {
		form.append("media_type", params.mediaType ?? "image/jpeg");
		form.append("total_bytes", String(params.totalBytes ?? 0));
		form.append("media_category", params.mediaCategory || "tweet_image");
	}

	if (params.command === "FINALIZE") {
		form.append("media_id", String(params.mediaId ?? ""));
	}

	const authorization = await buildOAuth1Header({
		method: "POST",
		url: endpoint,
		consumerKey: env.X_API_KEY ?? "",
		consumerSecret: env.X_API_KEY_SECRET ?? "",
		token: env.X_ACCESS_TOKEN ?? "",
		tokenSecret: env.X_ACCESS_TOKEN_SECRET ?? "",
	});

	const res = await fetch(endpoint, {
		method: "POST",
		headers: { Authorization: authorization },
		body: form,
	});

	const raw = await res.text();
	let data: Record<string, unknown> = {};

	try {
		data = JSON.parse(raw);
	} catch {
		data = { raw };
	}

	if (!res.ok) {
		return {
			ok: false,
			status: res.status,
			data,
		};
	}

	const payload = (data.data as Record<string, unknown>) || data || {};
	const mediaId =
		(payload.id as string | undefined) ||
		(payload.media_id as string | undefined) ||
		(payload.media_id_string as string | undefined) ||
		null;

	return {
		ok: true,
		status: res.status,
		data,
		mediaId,
		processingInfo: payload.processing_info || null,
	};
}

async function xMediaAppend(
	{ mediaId, segmentIndex, blob }: { mediaId: string; segmentIndex: number; blob: Blob },
	env: MonitorEnv,
): Promise<{ ok: boolean; status: number; mediaId: string }> {
	const endpoint = "https://api.x.com/2/media/upload";

	const form = new FormData();
	form.append("command", "APPEND");
	form.append("media_id", String(mediaId));
	form.append("segment_index", String(segmentIndex));
	form.append("media", blob, "image");

	const authorization = await buildOAuth1Header({
		method: "POST",
		url: endpoint,
		consumerKey: env.X_API_KEY ?? "",
		consumerSecret: env.X_API_KEY_SECRET ?? "",
		token: env.X_ACCESS_TOKEN ?? "",
		tokenSecret: env.X_ACCESS_TOKEN_SECRET ?? "",
	});

	const res = await fetch(endpoint, {
		method: "POST",
		headers: {
			Authorization: authorization,
		},
		body: form,
	});

	return {
		ok: res.ok,
		status: res.status,
		mediaId,
	};
}

async function waitForMediaProcessing(
	mediaId: string,
	env: MonitorEnv,
	processingInfo: Record<string, unknown> | null,
): Promise<Record<string, unknown> & { ok: boolean }> {
	let info = processingInfo;

	for (let i = 0; i < 10; i++) {
		if (info?.state === "succeeded") {
			return { ok: true, mediaId };
		}

		if (info?.state === "failed") {
			return { ok: false, error: "Media processing failed" };
		}

		const waitMs = Math.max(1, Number(info?.check_after_secs || 1)) * 1000;
		await sleep(waitMs);

		const status = await xMediaStatus(mediaId, env);
		if (!status.ok) return status;

		info = status.processingInfo ?? null;

		if (!info) {
			return { ok: true, mediaId };
		}
	}

	return {
		ok: false,
		error: "Media processing timeout",
	};
}

async function xMediaStatus(
	mediaId: string,
	env: MonitorEnv,
): Promise<Record<string, unknown> & { ok: boolean; processingInfo?: Record<string, unknown> | null }> {
	const endpoint = `https://api.x.com/2/media/upload?command=STATUS&media_id=${encodeURIComponent(mediaId)}`;

	const authorization = await buildOAuth1Header({
		method: "GET",
		url: endpoint,
		consumerKey: env.X_API_KEY ?? "",
		consumerSecret: env.X_API_KEY_SECRET ?? "",
		token: env.X_ACCESS_TOKEN ?? "",
		tokenSecret: env.X_ACCESS_TOKEN_SECRET ?? "",
	});

	const res = await fetch(endpoint, {
		method: "GET",
		headers: { Authorization: authorization },
	});

	const raw = await res.text();

	let data: Record<string, unknown>;
	try {
		data = JSON.parse(raw);
	} catch {
		data = { raw };
	}

	const payload = (data.data as Record<string, unknown>) || data || {};

	return {
		ok: res.ok,
		processingInfo: (payload.processing_info as Record<string, unknown> | undefined) || null,
	};
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

type TcgStoreOripaCandidate = {
	id: string;
	name: string;
	price: number;
	priceUnit: string;
	currencyCode: number | null;
	maxPerDay: number | null;
	supply: number | null;
	remainingPercent: number | null;
	url: string;
	mainImageUrl: string | null;
	status: number;
	visibility: boolean;
	stock: number;
};

async function fetchTcgStoreOripaCandidates(): Promise<TcgStoreOripaCandidate[]> {
	const endpoint = "https://api.tcgstore.io/api/v1/oripas?skip=0&limit=200&orderBy=newest";
	const res = await fetch(endpoint, {
		headers: {
			accept: "application/json",
			"user-agent": "Mozilla/5.0",
		},
	});
	if (!res.ok) return [];

	const data = (await res.json()) as {
		data?: Array<Record<string, unknown>>;
	};
	const list = Array.isArray(data?.data) ? data.data : [];

	return list.map((item) => {
		const id = String(item.id ?? "");
		const name = String(item.name ?? "").trim();
		const price = Number(item.price ?? NaN);
		const currencyCodeRaw = Number(item.currency ?? NaN);
		const currencyCode = Number.isFinite(currencyCodeRaw) ? currencyCodeRaw : null;
		const maxPerDayRaw = Number(item.max_per_day ?? NaN);
		const maxPerDay = Number.isFinite(maxPerDayRaw) ? maxPerDayRaw : null;
		const supplyRaw = Number(item.supply ?? item.supply_amount ?? NaN);
		const supply = Number.isFinite(supplyRaw) && supplyRaw > 0 ? supplyRaw : null;
		const status = Number(item.status ?? 0);
		const visibility = Boolean(item.visibility);
		const stock = Number(item.stock ?? item.stock_amount ?? NaN);
		const mainImageUrl = normalizeUrl(String(item.main_image_url ?? ""), "https://tcgstore.io");
		const priceUnit = resolveTcgPriceUnit(currencyCode, name);
		const remainingPercent =
			supply && Number.isFinite(stock) && stock >= 0
				? Number(((stock / supply) * 100).toFixed(2))
				: null;

		return {
			id,
			name,
			price,
			priceUnit,
			currencyCode,
			maxPerDay,
			supply,
			remainingPercent,
			url: id ? `https://tcgstore.io/oripa/${id}` : "",
			mainImageUrl,
			status,
			visibility,
			stock,
		};
	});
}

async function fetchTcgStoreOripaDetail(id: string): Promise<{
	lastPrizeImageUrl: string | null;
	maxPerDay: number | null;
	topPrizeNames: string[];
	secondPrizeNames: string[];
	minCoinPrize: number | null;
	maxCoinPrize: number | null;
	rankProbabilities: RankProbability[];
}> {
	const emptyResult = {
		lastPrizeImageUrl: null,
		maxPerDay: null,
		topPrizeNames: [] as string[],
		secondPrizeNames: [] as string[],
		minCoinPrize: null,
		maxCoinPrize: null,
		rankProbabilities: [] as RankProbability[],
	};
	if (!id) return emptyResult;
	const endpoint = `https://api.tcgstore.io/api/v1/oripas/${encodeURIComponent(id)}`;
	const res = await fetch(endpoint, {
		headers: {
			accept: "application/json",
			"user-agent": "Mozilla/5.0",
		},
	});
	if (!res.ok) return emptyResult;
	const data = (await res.json()) as {
		supply?: number | null;
		oripa_prize_last_one?: { main_image_url?: string | null } | null;
		max_per_day?: number | null;
		oripa_rank_prizes?: Array<{
			rank?: number | null;
			oripa_cards?: Array<{
				name?: string | null;
				supply_amount?: number | null;
			}>;
		}>;
	};
	const lastUrl = data.oripa_prize_last_one?.main_image_url ?? null;
	const maxPerDayRaw = Number(data.max_per_day ?? NaN);
	const maxPerDay = Number.isFinite(maxPerDayRaw) ? maxPerDayRaw : null;
	const totalSupply = Number(data.supply ?? NaN);
	const ranks = Array.isArray(data.oripa_rank_prizes) ? data.oripa_rank_prizes : [];
	const topPrizeNames = ranks
		.filter((rank) => Number(rank.rank ?? 0) > 0 && Number(rank.rank ?? 0) <= 2)
		.flatMap((rank) =>
			(Array.isArray(rank.oripa_cards) ? rank.oripa_cards : []).map((card) =>
				String(card.name ?? "").trim(),
			),
		)
		.filter(Boolean)
		.slice(0, 4);
	const secondPrizeNames = ranks
		.filter((rank) => Number(rank.rank ?? 0) === 2)
		.flatMap((rank) =>
			(Array.isArray(rank.oripa_cards) ? rank.oripa_cards : []).map((card) =>
				String(card.name ?? "").trim(),
			),
		)
		.filter(Boolean)
		.slice(0, 4);
	const allNames = ranks.flatMap((rank) =>
		(Array.isArray(rank.oripa_cards) ? rank.oripa_cards : []).map((card) =>
			String(card.name ?? "").trim(),
		),
	);
	const coinValues = allNames
		.map((name) => {
			const m = name.match(/([0-9][0-9,]*)\s*coin/i) || name.match(/([0-9][0-9,]*)\s*コイン/u);
			return m ? Number(m[1].replace(/,/g, "")) : NaN;
		})
		.filter((v) => Number.isFinite(v)) as number[];
	const minCoinPrize =
		coinValues.length > 0 ? coinValues.reduce((a, b) => (a < b ? a : b), coinValues[0]) : null;
	const maxCoinPrize =
		coinValues.length > 0 ? coinValues.reduce((a, b) => (a > b ? a : b), coinValues[0]) : null;

	const rankProbabilities: RankProbability[] = [];
	if (Number.isFinite(totalSupply) && totalSupply > 0) {
		for (const r of ranks) {
			const rankNum = Number(r.rank ?? 0);
			if (rankNum <= 0) continue;
			const cards = Array.isArray(r.oripa_cards) ? r.oripa_cards : [];
			let rankTotal = 0;
			const summaries: string[] = [];
			for (const c of cards) {
				const amt = Number(c.supply_amount ?? 0);
				if (amt > 0) {
					rankTotal += amt;
					const cardName = String(c.name ?? "").trim();
					if (cardName && summaries.length < 3) {
						summaries.push(`${cardName}(${amt}枚)`);
					}
				}
			}
			if (rankTotal > 0) {
				rankProbabilities.push({
					rank: rankNum,
					totalSupply: rankTotal,
					percentage: Number(((rankTotal / totalSupply) * 100).toFixed(2)),
					cardSummaries: summaries,
				});
			}
		}
		rankProbabilities.sort((a, b) => a.rank - b.rank);
	}

	return {
		lastPrizeImageUrl: normalizeUrl(lastUrl ?? "", "https://tcgstore.io"),
		maxPerDay,
		topPrizeNames,
		secondPrizeNames,
		minCoinPrize,
		maxCoinPrize,
		rankProbabilities,
	};
}

function buildDailyTcgStoreFallbackMessage({
	title,
	price,
	priceUnit,
	phrase,
	url,
}: {
	title: string;
	price: number;
	priceUnit: string;
	phrase: string;
	url: string;
}): string {
	return [
		"🎉本日のオリパ紹介🎉",
		`⚡${title}`,
		`💰${formatNumber(price)}${priceUnit} / 1回`,
		`📝${phrase}`,
		`🔗${url}`,
	].join("\n");
}

function formatNumber(value: number): string {
	if (!Number.isFinite(value)) return "?";
	return Math.round(value).toLocaleString("ja-JP");
}

function resolveTcgPriceUnit(currencyCode: number | null, name: string): string {
	const lowerName = name.toLowerCase();
	if (currencyCode === 3 || lowerName.includes("poas")) return "pOAS";
	if (currencyCode === 4 || lowerName.includes("oas")) return "OAS";
	return "コイン";
}


function buildRankProbabilitySection(
	detailFacts: TcgStoreDetailFacts,
	selected: TcgStoreOripaCandidate,
): string[] {
	const probs = detailFacts.rankProbabilities;
	if (!probs || probs.length === 0) {
		return ["【当選確率データ】", "取得不可"];
	}
	const lines: string[] = ["【当選確率データ】"];
	const totalSupplyStr = selected.supply != null ? `${selected.supply}口中` : "";
	for (const rp of probs.slice(0, 4)) {
		const label = rp.rank === 1 ? "1等" : rp.rank === 2 ? "2等" : `${rp.rank}等`;
		const pctStr = rp.percentage < 1
			? `${rp.percentage}%（${totalSupplyStr}${rp.totalSupply}枚）`
			: `${rp.percentage}%（${rp.totalSupply}枚）`;
		const cardInfo = rp.cardSummaries.length > 0
			? ` → ${rp.cardSummaries.map((s) => sanitizeCardSummaryForPost(s)).join(", ")}`
			: "";
		lines.push(`${label}: 確率${pctStr}${cardInfo}`);
	}
	const top2 = probs.filter((rp) => rp.rank <= 2);
	if (top2.length > 0) {
		const top2Total = top2.reduce((s, rp) => s + rp.totalSupply, 0);
		const top2Pct = selected.supply != null && selected.supply > 0
			? ((top2Total / selected.supply) * 100).toFixed(2)
			: null;
		if (top2Pct !== null) {
			lines.push(`1等+2等 合計: ${top2Total}枚 / 確率${top2Pct}%`);
			lines.push("注記: 1等+2等の確率は『上位賞の目安』であり、全体の当選保証を意味しない");
		}
	}
	return lines;
}

function sanitizeCardSummaryForPost(summary: string): string {
	const m = summary.match(/^(.*)\(([0-9,]+枚)\)$/);
	if (!m) return sanitizeCardNameForPost(summary);
	return `${sanitizeCardNameForPost(m[1] ?? "")}(${m[2] ?? ""})`;
}

function sanitizeCardNameForPost(name: string): string {
	return String(name)
		.replace(/\[[^\]]*\]/g, " ")
		.replace(/\([^)]*\)/g, " ")
		.replace(/【[^】]*】/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

function calcTop2ProbabilityPercent(
	detailFacts: TcgStoreDetailFacts,
	supply: number | null,
): number | null {
	if (!supply || supply <= 0) return null;
	const top2 = detailFacts.rankProbabilities.filter((rp) => rp.rank <= 2);
	if (top2.length === 0) return null;
	const total = top2.reduce((sum, rp) => sum + rp.totalSupply, 0);
	return Number(((total / supply) * 100).toFixed(2));
}

function calcTop2Odds(
	detailFacts: TcgStoreDetailFacts,
	supply: number | null,
): { percentage: number; peoplePerOne: number } | null {
	const percentage = calcTop2ProbabilityPercent(detailFacts, supply);
	if (percentage == null || percentage <= 0) return null;
	return {
		percentage,
		peoplePerOne: Math.max(1, Math.round(100 / percentage)),
	};
}

function buildOperatorInsightHints(selected: TcgStoreOripaCandidate): string[] {
	const hints: string[] = [];
	if (selected.priceUnit === "pOAS") {
		hints.push(...OPERATOR_INSIGHTS.map((line) => `- ${line}`));
		hints.push("- 今回はpOAS商品。演出の違いと試しやすさを優先して触れる。");
		if (selected.price <= 10) {
			hints.push("- 『たった10pOAS』のように価格ハードルの低さを自然に伝える。");
		}
	} else {
		hints.push("- 今回は通常通貨商品。pOAS/OASや演出差分の話題は使わない。");
	}
	if (selected.maxPerDay === 1) {
		hints.push("- 1日1回のみ挑戦できる点は、低リスク文脈として使ってよい。");
	}
	if (selected.remainingPercent != null) {
		if (selected.remainingPercent <= 15) {
			hints.push("- 残り率が低いので、在庫減少への注意喚起を自然に含めてよい。");
		} else {
			hints.push("- 残り率は十分あるため、希少性を煽る表現は使わない。");
		}
	}
	return hints;
}

function getJstDateSeed(now = new Date()): number {
	const jst = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
	const y = jst.getFullYear();
	const m = String(jst.getMonth() + 1).padStart(2, "0");
	const d = String(jst.getDate()).padStart(2, "0");
	return Number(`${y}${m}${d}`);
}

function getJstSlotSeed(now = new Date()): number {
	const jst = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
	const y = jst.getFullYear();
	const m = String(jst.getMonth() + 1).padStart(2, "0");
	const d = String(jst.getDate()).padStart(2, "0");
	const slot = jst.getHours() < 18 ? 0 : 1;
	return Number(`${y}${m}${d}${slot}`);
}

function pickIndexWithHistoryGuard({
	size,
	seed,
	pickOffset,
	urlAt,
	lastUrl,
	recentUrls,
}: {
	size: number;
	seed: number;
	pickOffset: number;
	urlAt: (index: number) => string;
	lastUrl: string | null;
	recentUrls: string[];
}): number {
	let index = ((seed % size) + size) % size;
	if (pickOffset !== 0) {
		index = (index + pickOffset + size) % size;
	}
	if (size <= 1) return index;

	const blocked = new Set(
		[lastUrl, ...recentUrls].map((url) => String(url ?? "").trim()).filter((url) => url.length > 0),
	);
	if (blocked.size === 0) return index;
	if (!blocked.has(urlAt(index))) return index;

	for (let i = 1; i < size; i++) {
		const probe = (index + i) % size;
		const url = urlAt(probe);
		if (!blocked.has(url)) return probe;
	}
	return index;
}

async function getRecentUrlHistory(stateStore: StateStore, key: string): Promise<string[]> {
	const raw = await stateStore.get(key);
	if (!raw) return [];
	try {
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		return parsed
			.map((value) => String(value ?? "").trim())
			.filter((url) => url.length > 0)
			.slice(0, DAILY_RECENT_HISTORY_LIMIT);
	} catch {
		return [];
	}
}

async function appendRecentUrlHistory(stateStore: StateStore, key: string, url: string): Promise<void> {
	const normalized = String(url ?? "").trim();
	if (!normalized) return;
	const current = await getRecentUrlHistory(stateStore, key);
	const next = [normalized, ...current.filter((item) => item !== normalized)].slice(0, DAILY_RECENT_HISTORY_LIMIT);
	await stateStore.put(key, JSON.stringify(next));
}

async function getWatchlistEntries(stateStore: StateStore): Promise<WatchlistEntry[]> {
	const raw = await stateStore.get(WATCHLIST_KEY);
	if (!raw) return [];
	try {
		const parsed = JSON.parse(raw) as unknown;
		if (!Array.isArray(parsed)) return [];
		const now = Date.now();
		return parsed
			.map((row): WatchlistEntry | null => {
				const item = row as Partial<WatchlistEntry>;
				const key = String(item.key ?? "").trim();
				const cardName = String((item as { cardName?: string }).cardName ?? item.card ?? "").trim();
				const lastSeenAt = String(
					(item as Partial<WatchlistEntry> & { lastDetectedAt?: string }).lastSeenAt ??
						(item as { lastDetectedAt?: string }).lastDetectedAt ??
						"",
				).trim();
				const firstSeenAt = String(
					(item as Partial<WatchlistEntry> & { firstSeenAt?: string }).firstSeenAt ?? lastSeenAt,
				).trim();
				if (!key || !cardName || !lastSeenAt || !firstSeenAt) return null;
				const detectedMs = new Date(lastSeenAt).getTime();
				if (!Number.isFinite(detectedMs)) return null;
				if (now - detectedMs > WATCHLIST_TTL_MS) return null;
				const beforePrice = Number(item.beforePrice ?? NaN);
				const afterPrice = Number(item.afterPrice ?? NaN);
				const changePct = Number(item.changePct ?? NaN);
				const firstSeenPrice = Number((item as { firstSeenPrice?: number }).firstSeenPrice ?? beforePrice);
				if (!Number.isFinite(beforePrice) || !Number.isFinite(afterPrice) || !Number.isFinite(changePct)) {
					return null;
				}
				if (!Number.isFinite(firstSeenPrice) || firstSeenPrice <= 0) return null;
				const sourceSite = normalizePriceSpikeSource(item.sourceSite ?? undefined);
				if (!sourceSite) return null;
				const sourceUrl = String((item as { sourceUrl?: string }).sourceUrl ?? "").trim();
				if (!sourceUrl) return null;
				const currentPrice = Number((item as { currentPrice?: number }).currentPrice ?? afterPrice);
				if (!Number.isFinite(currentPrice) || currentPrice <= 0) return null;
				const priceHistory = normalizeWatchPriceHistory((item as { priceHistory?: unknown }).priceHistory);
				return {
					key,
					cardName,
					card: cardName,
					cardId: String(item.cardId ?? "").trim() || null,
					sourceUrl,
					sourceSite,
					firstSeenAt,
					lastSeenAt,
					currentPrice,
					beforePrice,
					afterPrice,
					changePct,
					period: normalizePriceSpikePeriod(item.period),
					imageUrl: normalizeWatchImageUrl(
						(item as { imageUrl?: string }).imageUrl ?? null,
						sourceSite,
					),
					firstSeenPrice,
					priceHistory,
				};
			})
			.filter((item): item is WatchlistEntry => Boolean(item))
			.sort((a, b) => new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime())
			.slice(0, WATCHLIST_LIMIT);
	} catch {
		return [];
	}
}

async function pruneAndPersistWatchlist(stateStore: StateStore): Promise<WatchlistEntry[]> {
	const list = await getWatchlistEntries(stateStore);
	await stateStore.put(WATCHLIST_KEY, JSON.stringify(list));
	return list;
}

async function upsertWatchlistFromSpike(
	stateStore: StateStore,
	spike: PriceSpikeItem,
	payloadSource: string | undefined,
): Promise<WatchlistEntry[]> {
	const current = await getWatchlistEntries(stateStore);
	const key = buildPriceSpikeIdentityKey(spike);
	const nowIso = String(spike.fetched_at ?? "").trim() || new Date().toISOString();
	const prev = current.find((item) => item.key === key) ?? null;
	const sourceSite = normalizePriceSpikeSource(spike.source_site ?? payloadSource) ?? prev?.sourceSite;
	if (!sourceSite) return current;
	const sourceUrl = String(spike.source_url ?? prev?.sourceUrl ?? "").trim();
	if (!sourceUrl) return current;
	const cardName = getCanonicalPriceSpikeCardName(spike);
	const startHistory =
		prev?.priceHistory?.length && prev.priceHistory.length > 0
			? prev.priceHistory
			: buildInitialWatchPriceHistory(spike, nowIso);
	const nextHistory = appendWatchPriceHistory(startHistory, nowIso, Number(spike.after));
	const nextItem: WatchlistEntry = {
		key,
		cardName,
		card: cardName,
		cardId: String(spike.card_id ?? "").trim() || null,
		sourceUrl,
		sourceSite,
		firstSeenAt: prev?.firstSeenAt ?? nowIso,
		lastSeenAt: nowIso,
		currentPrice: Number(spike.after),
		beforePrice: Number(spike.before),
		afterPrice: Number(spike.after),
		changePct: Number(spike.change_pct),
		period: normalizePriceSpikePeriod(spike.period),
		imageUrl: normalizeWatchImageUrl(
			spike.image_url ?? spike.imageUrl ?? prev?.imageUrl ?? null,
			sourceSite,
		),
		firstSeenPrice: prev?.firstSeenPrice ?? Number(spike.before),
		priceHistory: nextHistory,
	};
	const merged = [nextItem, ...current.filter((item) => item.key !== key)]
		.sort((a, b) => new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime())
		.slice(0, WATCHLIST_LIMIT);
	await stateStore.put(WATCHLIST_KEY, JSON.stringify(merged));
	return merged;
}

function normalizeWatchImageUrl(
	url: string | null | undefined,
	source?: "snkrdunk" | "pokeca-chart" | null,
): string | null {
	const value = String(url ?? "").trim();
	if (!value) return null;
	if (!/^https?:\/\//i.test(value)) return null;
	try {
		const parsed = new URL(value);
		const host = parsed.hostname.toLowerCase();
		if (source === "snkrdunk") {
			if (!(host === "snkrdunk.com" || host.endsWith(".snkrdunk.com"))) return null;
		}
		if (source === "pokeca-chart") {
			if (!(host === "pokeca-chart.com" || host.endsWith(".pokeca-chart.com"))) return null;
		}
		const lower = value.toLowerCase();
		if (/og-image|header\.png|logo|favicon|icon|default|opengraph/.test(lower)) return null;
	} catch {
		return null;
	}
	return value;
}

function normalizeWatchPriceHistory(value: unknown): Array<{ date: string; price: number }> {
	if (!Array.isArray(value)) return [];
	return value
		.map((row) => {
			const item = row as { date?: string; price?: number };
			const date = String(item.date ?? "").trim();
			const price = Number(item.price ?? NaN);
			if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
			if (!Number.isFinite(price) || price <= 0) return null;
			return { date, price };
		})
		.filter((item): item is { date: string; price: number } => Boolean(item))
		.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
		.slice(-30);
}

function appendWatchPriceHistory(
	current: Array<{ date: string; price: number }>,
	isoDateTime: string,
	price: number,
): Array<{ date: string; price: number }> {
	const base = normalizeWatchPriceHistory(current);
	if (!Number.isFinite(price) || price <= 0) return base;
	const dateKey = new Date(isoDateTime);
	const day = Number.isFinite(dateKey.getTime())
		? dateKey.toISOString().slice(0, 10)
		: new Date().toISOString().slice(0, 10);
	const next = [...base];
	const idx = next.findIndex((row) => row.date === day);
	if (idx >= 0) {
		next[idx] = { date: day, price };
	} else {
		next.push({ date: day, price });
	}
	return next
		.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
		.slice(-30);
}

function buildInitialWatchPriceHistory(
	spike: PriceSpikeItem,
	fallbackIso: string,
): Array<{ date: string; price: number }> {
	const fetchedAt = new Date(String(spike.fetched_at ?? fallbackIso));
	const rangeDays = estimateRangeDaysFromPeriod(spike.period);
	const fallbackStartDate = Number.isFinite(fetchedAt.getTime())
		? new Date(fetchedAt.getTime() - rangeDays * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
		: new Date().toISOString().slice(0, 10);
	const sourceHistory = normalizeWatchPriceHistory(spike.history_prices ?? []);
	if (sourceHistory.length === 0) {
		return [{ date: fallbackStartDate, price: Number(spike.before) }];
	}
	const pickByDays = (daysAgo: number): { date: string; price: number } | null => {
		const target = new Date(fetchedAt.getTime() - daysAgo * 24 * 60 * 60 * 1000);
		let best: { row: { date: string; price: number }; diff: number } | null = null;
		for (const row of sourceHistory) {
			const t = new Date(`${row.date}T00:00:00Z`).getTime();
			if (!Number.isFinite(t)) continue;
			const diff = Math.abs(t - target.getTime());
			if (!best || diff < best.diff) best = { row, diff };
		}
		return best?.row ?? null;
	};
	const rows = [pickByDays(30), pickByDays(7)]
		.filter((x): x is { date: string; price: number } => Boolean(x))
		.filter((x, i, arr) => arr.findIndex((y) => y.date === x.date) === i);
	if (rows.length === 0) rows.push(sourceHistory[0]);
	return rows.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

function getSummaryRangeStartDate(entry: WatchlistEntry): string {
	const history = normalizeWatchPriceHistory(entry.priceHistory);
	if (history.length > 0) return `${history[0].date}T00:00:00.000Z`;
	const fallbackDays = estimateRangeDaysFromPeriod(entry.period);
	const lastSeen = new Date(entry.lastSeenAt);
	if (Number.isFinite(lastSeen.getTime())) {
		return new Date(lastSeen.getTime() - fallbackDays * 24 * 60 * 60 * 1000).toISOString();
	}
	return entry.firstSeenAt;
}

function getSummaryStartPrice(entry: WatchlistEntry): number {
	const history = normalizeWatchPriceHistory(entry.priceHistory);
	if (history.length > 0) return history[0].price;
	if (Number.isFinite(entry.firstSeenPrice) && entry.firstSeenPrice > 0) return entry.firstSeenPrice;
	return entry.beforePrice;
}

function calcPercentChange(before: number, after: number): number {
	if (!Number.isFinite(before) || before <= 0 || !Number.isFinite(after)) return 0;
	return ((after - before) / before) * 100;
}

function extractPostedTweetId(postResult: Record<string, unknown>): string | null {
	try {
		const data = (postResult.data as { data?: { id?: string } } | undefined)?.data?.id;
		return typeof data === "string" && data.length > 0 ? data : null;
	} catch {
		return null;
	}
}

async function postQuoteTweet(
	text: string,
	quoteTweetId: string,
	env: MonitorEnv,
): Promise<Record<string, unknown> & { ok: boolean }> {
	const endpoint = "https://api.x.com/2/tweets";
	if (!env.X_API_KEY || !env.X_API_KEY_SECRET || !env.X_ACCESS_TOKEN || !env.X_ACCESS_TOKEN_SECRET) {
		return { ok: false, status: 0, error: "Missing X secrets" };
	}
	const body = JSON.stringify({ text, quote_tweet_id: quoteTweetId });
	const authorization = await buildOAuth1Header({
		method: "POST",
		url: endpoint,
		consumerKey: env.X_API_KEY,
		consumerSecret: env.X_API_KEY_SECRET,
		token: env.X_ACCESS_TOKEN,
		tokenSecret: env.X_ACCESS_TOKEN_SECRET,
	});
	const res = await fetch(endpoint, {
		method: "POST",
		headers: { Authorization: authorization, "Content-Type": "application/json" },
		body,
	});
	const raw = await res.text();
	let data: unknown = null;
	try { data = JSON.parse(raw); } catch { data = { raw }; }
	return { ok: res.ok, status: res.status, data };
}

function estimateRangeDaysFromPeriod(period?: string): number {
	const value = String(period ?? "").trim();
	if (/1\s*(?:か月|ヶ月|月)/.test(value)) return 30;
	if (/30\s*日/.test(value)) return 30;
	if (/1\s*週間/.test(value)) return 7;
	if (/7\s*日/.test(value)) return 7;
	if (/2\s*週間|14\s*日/.test(value)) return 14;
	return 7;
}

async function getLatestMarketContext(
	stateStore: StateStore,
): Promise<LatestMarketContext | null> {
	const raw = await stateStore.get(LATEST_MARKET_CONTEXT_KEY);
	if (!raw) return null;
	try {
		const parsed = JSON.parse(raw) as {
			card?: string;
			fetchedAt?: string;
			recordedAt?: string;
			beforePrice?: number;
			afterPrice?: number;
			changePct?: number;
		};
		const card = String(parsed.card ?? "").trim();
		const fetchedAt = String(parsed.fetchedAt ?? parsed.recordedAt ?? "").trim();
		if (!card || !fetchedAt) return null;
		const ageMs = Date.now() - new Date(fetchedAt).getTime();
		if (!Number.isFinite(ageMs) || ageMs < 0 || ageMs > 1000 * 60 * 60 * 72) return null;
		const beforePrice = Number(parsed.beforePrice ?? NaN);
		const afterPrice = Number(parsed.afterPrice ?? NaN);
		const changePct = Number(parsed.changePct ?? NaN);
		if (!Number.isFinite(beforePrice) || !Number.isFinite(afterPrice) || !Number.isFinite(changePct)) {
			return null;
		}
		return { card, fetchedAt, beforePrice, afterPrice, changePct };
	} catch {
		return null;
	}
}

function prioritizeCandidatesByMarketContext(
	candidates: TcgStoreOripaCandidate[],
	marketContext: LatestMarketContext | null,
): TcgStoreOripaCandidate[] {
	if (!marketContext) return [];
	const keyword = normalizeMatchText(extractTrendKeyword(marketContext.card));
	if (!keyword) return [];
	return candidates.filter((item) => normalizeMatchText(item.name).includes(keyword));
}

function prioritizeMercariCandidatesByMarketContext(
	candidates: Array<{ item: CandidateItem; detail: ItemDetail; title: PickedTitle }>,
	marketContext: LatestMarketContext | null,
): Array<{ item: CandidateItem; detail: ItemDetail; title: PickedTitle }> {
	if (!marketContext) return [];
	const keyword = normalizeMatchText(extractTrendKeyword(marketContext.card));
	if (!keyword) return [];
	return candidates.filter((entry) => {
		const t1 = normalizeMatchText(entry.title.title);
		const t2 = normalizeMatchText(entry.detail.detailTextHint);
		return t1.includes(keyword) || t2.includes(keyword);
	});
}

function extractTrendKeyword(cardName: string): string {
	return String(cardName ?? "")
		.replace(/\b(?:sar|sr|ur|hr|ar|rrr|rr|r)\b/gi, " ")
		.replace(/\b(?:sv|sm|xy|bw|s)[a-z0-9\-_/]*\b/gi, " ")
		.replace(/\b\d{1,3}\/\d{1,3}\b/g, " ")
		.replace(/[()[\]{}]/g, " ")
		.replace(/\s+/g, " ")
		.trim()
		.split(" ")
		.filter(Boolean)
		.sort((a, b) => b.length - a.length)[0] ?? "";
}

function normalizeMatchText(value: string | null | undefined): string {
	return String(value ?? "")
		.toLowerCase()
		.replace(/[ぁ-ん]/g, (s) => String.fromCharCode(s.charCodeAt(0) + 0x60))
		.replace(/\s+/g, "");
}

async function buildOAuth1Header({
	method,
	url,
	consumerKey,
	consumerSecret,
	token,
	tokenSecret,
}: {
	method: string;
	url: string;
	consumerKey: string;
	consumerSecret: string;
	token: string;
	tokenSecret: string;
}): Promise<string> {
	const parsedUrl = new URL(url);
	const baseUrl = `${parsedUrl.protocol}//${parsedUrl.host}${parsedUrl.pathname}`;

	const oauthParams: Record<string, string> = {
		oauth_consumer_key: consumerKey,
		oauth_nonce: crypto.randomUUID().replace(/-/g, ""),
		oauth_signature_method: "HMAC-SHA1",
		oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
		oauth_token: token,
		oauth_version: "1.0",
	};

	const allParams: Array<[string, string]> = [];

	for (const [key, value] of parsedUrl.searchParams.entries()) {
		allParams.push([key, value]);
	}

	for (const [key, value] of Object.entries(oauthParams)) {
		allParams.push([key, value]);
	}

	const parameterString = allParams
		.map(([key, value]) => [percentEncode(key), percentEncode(value)] as [string, string])
		.sort((a, b) => {
			if (a[0] === b[0]) {
				if (a[1] < b[1]) return -1;
				if (a[1] > b[1]) return 1;
				return 0;
			}
			return a[0] < b[0] ? -1 : 1;
		})
		.map(([key, value]) => `${key}=${value}`)
		.join("&");

	const baseString = [
		method.toUpperCase(),
		percentEncode(baseUrl),
		percentEncode(parameterString),
	].join("&");

	const signingKey = `${percentEncode(consumerSecret)}&${percentEncode(tokenSecret)}`;
	const oauthSignature = await hmacSha1Base64(signingKey, baseString);

	const headerParams: Record<string, string> = {
		...oauthParams,
		oauth_signature: oauthSignature,
	};

	return (
		"OAuth " +
		Object.keys(headerParams)
			.sort()
			.map((key) => `${percentEncode(key)}="${percentEncode(headerParams[key])}"`)
			.join(", ")
	);
}

async function hmacSha1Base64(key: string, message: string): Promise<string> {
	const enc = new TextEncoder();
	const cryptoKey = await crypto.subtle.importKey(
		"raw",
		enc.encode(key),
		{ name: "HMAC", hash: "SHA-1" },
		false,
		["sign"],
	);

	const signature = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(message));
	const bytes = new Uint8Array(signature);
	let binary = "";
	for (const b of bytes) binary += String.fromCharCode(b);
	return btoa(binary);
}

function percentEncode(str: string): string {
	return encodeURIComponent(str).replace(
		/[!'()*]/g,
		(c) => "%" + c.charCodeAt(0).toString(16).toUpperCase(),
	);
}

async function fetchAllCandidateItems(): Promise<CandidateItem[]> {
	const mercariListUrl = "https://nft.jp.mercari.com/random_sales";
	const tcgStoreListUrl = "https://tcgstore.io/oripa/category/all";

	const [mercariRes, tcgStoreRes] = await Promise.all([
		fetch(mercariListUrl, { headers: { "user-agent": "Mozilla/5.0" } }),
		fetch(tcgStoreListUrl, { headers: { "user-agent": "Mozilla/5.0" } }),
	]);

	const [mercariHtml, tcgStoreHtml] = await Promise.all([mercariRes.text(), tcgStoreRes.text()]);

	return [
		...extractMercariCandidateItems(mercariHtml),
		...extractTcgStoreCandidateItems(tcgStoreHtml),
	];
}

async function fetchItemDetail(item: CandidateItem): Promise<ItemDetail> {
	if (item.source === "tcgstore") {
		return fetchTcgStoreItemDetail(item.url);
	}
	return fetchMercariItemDetail(item.url);
}

async function fetchMercariItemDetail(url: string): Promise<ItemDetail> {
	const res = await fetch(url, {
		headers: {
			"user-agent": "Mozilla/5.0",
		},
	});

	const html = await res.text();
	const text = stripTags(html).replace(/\s+/g, " ").trim();
	const lowerText = text.toLowerCase();

	const isTCGStore = lowerText.includes("tcg store") || lowerText.includes("tcgstore");

	const ratioMatch =
		text.match(/残り\s*([0-9,]+)\s*\/\s*([0-9,]+)\s*回?/) ||
		text.match(/([0-9,]+)\s*\/\s*([0-9,]+)\s*回/);

	let remaining: number | null = null;
	let totalCount: number | null = null;
	let percent: number | null = null;

	if (ratioMatch) {
		remaining = Number(ratioMatch[1].replace(/,/g, ""));
		totalCount = Number(ratioMatch[2].replace(/,/g, ""));
		percent = totalCount > 0 ? Number(((remaining / totalCount) * 100).toFixed(2)) : null;
	}

	const hasLastOnePrize =
		text.includes("ラスイチ") || text.includes("ラストワン") || text.includes("最後の1枚");
	const topPrizeNames = extractMercariTopPrizeNames(html, text);

	const imageUrls = extractImageUrls(html, "https://nft.jp.mercari.com");
	const ogImageUrl = extractOgImageUrl(html, "https://nft.jp.mercari.com");
	const mainImageUrl =
		extractMercariKeyVisualUrl(html) ||
		pickPreferredMercariImageUrl(imageUrls) ||
		(isLikelyMercariKeyVisual(ogImageUrl) ? ogImageUrl : null);
	const extractedTitle = extractKujiTitleFromHtml(html);

	let lastOneImageUrl: string | null = null;
	const lastOneBlock = html.match(/ラスイチ賞[\s\S]{0,2000}?<img[^>]+src="([^"]+)"/i);
	if (lastOneBlock) {
		lastOneImageUrl = normalizeUrl(lastOneBlock[1], "https://nft.jp.mercari.com");
	}

	return {
		source: "mercari",
		isTCGStore,
		detailRemaining: remaining,
		totalCount,
		percent,
		hasLastOnePrize,
		detailTextHint: text.slice(0, 400),
		topPrizeNames,
		mainImageUrl,
		lastOneImageUrl,
		imageUrls: imageUrls.slice(0, 10),
		kujiTitle: extractedTitle.title,
		kujiTitleSource: extractedTitle.source,
	};
}

async function fetchTcgStoreItemDetail(url: string): Promise<ItemDetail> {
	const res = await fetch(url, {
		headers: {
			"user-agent": "Mozilla/5.0",
		},
	});

	const html = await res.text();
	const text = stripTags(html).replace(/\s+/g, " ").trim();

	const ratioMatch =
		text.match(/(?:のこり|残り)\s*([0-9,]+)\s*\/\s*([0-9,]+)/i) ||
		text.match(/([0-9,]+)\s*\/\s*([0-9,]+)\s*(?:のこり|残り)/i);

	let remaining: number | null = null;
	let totalCount: number | null = null;
	let percent: number | null = null;

	if (ratioMatch) {
		remaining = Number(ratioMatch[1].replace(/,/g, ""));
		totalCount = Number(ratioMatch[2].replace(/,/g, ""));
		percent = totalCount > 0 ? Number(((remaining / totalCount) * 100).toFixed(2)) : null;
	}

	const imageUrls = extractImageUrls(html, "https://tcgstore.io");
	const mainImageUrl = extractOgImageUrl(html, "https://tcgstore.io") || imageUrls[0] || null;

	let lastOneImageUrl: string | null = null;
	const lastPrizeBlock =
		html.match(/ラスト賞[\s\S]{0,3000}?<img[^>]+src=["']([^"']+)["']/i) ||
		html.match(/LAST[\s\S]{0,3000}?<img[^>]+src=["']([^"']+)["']/i);
	if (lastPrizeBlock?.[1]) {
		lastOneImageUrl = normalizeUrl(lastPrizeBlock[1], "https://tcgstore.io");
	}

	const extractedTitle = extractKujiTitleFromHtml(html);

	return {
		source: "tcgstore",
		isTCGStore: true,
		detailRemaining: remaining,
		totalCount,
		percent,
		hasLastOnePrize: Boolean(lastOneImageUrl),
		detailTextHint: text.slice(0, 400),
		topPrizeNames: [],
		mainImageUrl,
		lastOneImageUrl,
		imageUrls: imageUrls.slice(0, 10),
		kujiTitle: extractedTitle.title,
		kujiTitleSource: extractedTitle.source,
	};
}

function extractMercariCandidateItems(html: string): CandidateItem[] {
	const results: CandidateItem[] = [];
	const seen = new Set<string>();

	const linkRegex = /href="([^"]+)"/g;
	let match: RegExpExecArray | null;

	while ((match = linkRegex.exec(html)) !== null) {
		const href = match[1];
		const isKujiDetail = /\/random_sales\/[0-9a-f-]{36}(?:\?[^"]*)?$/i.test(href);
		if (!isKujiDetail) continue;

		const absoluteUrl = href.startsWith("http") ? href : `https://nft.jp.mercari.com${href}`;
		if (seen.has(absoluteUrl)) continue;
		seen.add(absoluteUrl);

		const idx = match.index;
		const block = html.slice(Math.max(0, idx - 1200), idx + 2500);
		const text = stripTags(block).replace(/\s+/g, " ").trim();

		const remainingMatch = text.match(/残り\s*([0-9,]+)/);
		const priceMatch = text.match(/¥\s*([0-9,]+)/);

		results.push({
			source: "mercari",
			url: absoluteUrl,
			titleHint: text.slice(0, 220),
			remaining: remainingMatch ? Number(remainingMatch[1].replace(/,/g, "")) : null,
			price: priceMatch ? Number(priceMatch[1].replace(/,/g, "")) : null,
			rawText: text.slice(0, 500),
		});
	}

	return results;
}

function extractMercariTopPrizeNames(html: string, plainText: string): string[] {
	const names: string[] = [];
	const text = String(plainText ?? "").replace(/\s+/g, " ");
	const rankPattern =
		/(?:S賞|1等)\s*[:：]?\s*([^。]{1,120}?)(?=(?:[A-Z]賞|[0-9]等|ラスト|ラスイチ|残り|\/|¥|$))/gu;
	for (const match of text.matchAll(rankPattern)) {
		const block = String(match[1] ?? "");
		for (const token of block.split(/[、,／/|]/)) {
			const cleaned = sanitizeCardNameForPost(token)
				.replace(/PSA鑑定済み|対象|が当たる|など/u, "")
				.replace(/[:：]\s*[0-9]+\s*個.*$/u, "")
				.replace(/[0-9]+\s*個/u, "")
				.trim();
			if (!cleaned || cleaned.length < 2) continue;
			const shortName = cleaned.slice(0, 28).trim();
			if (!names.includes(shortName)) names.push(shortName);
			if (names.length >= 6) break;
		}
		if (names.length >= 6) break;
	}
	if (names.length > 0) return names;

	const htmlPattern = /(?:S賞|1等)[\s\S]{0,1500}?<img[^>]+alt="([^"]+)"/giu;
	for (const match of html.matchAll(htmlPattern)) {
		const cleaned = sanitizeCardNameForPost(decodeHtmlEntities(String(match[1] ?? ""))).trim();
		if (!cleaned || cleaned.length < 2) continue;
		if (!names.includes(cleaned)) names.push(cleaned);
		if (names.length >= 6) break;
	}
	return names;
}

function extractTcgStoreCandidateItems(html: string): CandidateItem[] {
	const results: CandidateItem[] = [];
	const seen = new Set<string>();

	const linkRegex = /href="(\/oripa\/[0-9a-f-]{36}(?:\?[^"]*)?)"/gi;
	let match: RegExpExecArray | null;

	while ((match = linkRegex.exec(html)) !== null) {
		const href = match[1];
		const absoluteUrl = `https://tcgstore.io${href}`;
		if (seen.has(absoluteUrl)) continue;
		seen.add(absoluteUrl);

		const idx = match.index;
		const block = html.slice(Math.max(0, idx - 1400), idx + 2800);
		const text = stripTags(block).replace(/\s+/g, " ").trim();

		const remainingMatch =
			text.match(/(?:のこり|残り)\s*([0-9,]+)/i) ||
			text.match(/([0-9,]+)\s*\/\s*[0-9,]+\s*(?:のこり|残り)/i);
		const priceMatch = text.match(/([0-9,]+)\s*\/\s*1\s*回/);

		results.push({
			source: "tcgstore",
			url: absoluteUrl,
			titleHint: text.slice(0, 220),
			remaining: remainingMatch ? Number(remainingMatch[1].replace(/,/g, "")) : null,
			price: priceMatch ? Number(priceMatch[1].replace(/,/g, "")) : null,
			rawText: text.slice(0, 500),
		});
	}

	return results;
}

function pickTitle(item: CandidateItem, detail: ItemDetail): PickedTitle {
	if (detail.kujiTitle) {
		return {
			title: cleanupTitle(detail.kujiTitle),
			source: `detail:${detail.kujiTitleSource ?? "unknown"}`,
		};
	}

	const text = `${item.titleHint} ${item.rawText} ${detail.detailTextHint}`
		.replace(/\s+/g, " ")
		.trim();

	const patterns = [
		/メルカリくじ[「『]([^」』]+)[」』]/,
		/くじ一覧\s+(.+?)\s+残り(?:[0-9,]+\/[0-9,]+|[0-9,]+)回/,
		/ホーム\s+くじ一覧\s+(.+?)\s+残り(?:[0-9,]+\/[0-9,]+|[0-9,]+)回/,
		/(.+?)\s+残り(?:[0-9,]+\/[0-9,]+|[0-9,]+)回/,
		/(.+?)\s+パック確定！/,
	];

	for (const pattern of patterns) {
		const m = text.match(pattern);
		if (m && m[1]) {
			return {
				title: cleanupTitle(m[1]),
				source: "pattern_match",
			};
		}
	}

	return {
		title: cleanupTitle(item.titleHint.slice(0, 80)),
		source: "title_hint_fallback",
	};
}

function extractKujiTitleFromHtml(html: string): {
	title: string | null;
	source: string | null;
} {
	const ogTitleMatch = html.match(
		/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
	);
	if (ogTitleMatch?.[1]) {
		const title = cleanupTitle(decodeHtmlEntities(ogTitleMatch[1]));
		if (title) return { title, source: "og:title" };
	}

	const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
	if (h1Match?.[1]) {
		const title = cleanupTitle(stripTags(h1Match[1]));
		if (title) return { title, source: "h1" };
	}

	const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
	if (titleMatch?.[1]) {
		const title = cleanupTitle(decodeHtmlEntities(titleMatch[1]));
		if (title) return { title, source: "html_title" };
	}

	return { title: null, source: null };
}

function cleanupTitle(title: string): string {
	return title
		.replace(/\s+/g, " ")
		.replace(/^ホーム\s+/, "")
		.replace(/^くじ一覧\s+/, "")
		.replace(/^オリパ一覧\s+/, "")
		.replace(/^出品\s+/, "")
		.replace(/^メルカリくじ[「『]?(.*?)[」』]?$/u, "$1")
		.replace(/^A\s*-\s*メルカリNFT\s+/u, "")
		.replace(/^メルカリNFT\s+/u, "")
		.replace(/\s*\|\s*TCG STORE.*$/iu, "")
		.replace(/^TCG STORE\s*/iu, "")
		.replace(/\s*[-|｜]\s*メルカリNFT.*$/u, "")
		.replace(/\s*[-|｜]\s*メルカリ.*$/u, "")
		.replace(/\s*残り(?:[0-9,]+\/[0-9,]+|[0-9,]+)回.*$/u, "")
		.replace(/\s*(?:のこり|残り)\s*[0-9,]+\/[0-9,]+.*$/iu, "")
		.replace(/\s*¥\s*[0-9,]+\s*\/\s*1回.*$/u, "")
		.replace(/\s*くじを引く.*$/u, "")
		.replace(/\s*パック確定！.*$/u, "")
		.replace(/[「『]/g, "")
		.replace(/[」』]/g, "")
		.trim();
}

function extractImageUrls(html: string, baseOrigin: string): string[] {
	const urls = new Set<string>();
	let match: RegExpExecArray | null;

	const imgRegex = /<img[^>]+src="([^"]+)"/gi;
	while ((match = imgRegex.exec(html)) !== null) {
		const normalized = normalizeUrl(match[1], baseOrigin);
		if (normalized) urls.add(normalized);
	}

	const ogRegex = /property="og:image" content="([^"]+)"/gi;
	while ((match = ogRegex.exec(html)) !== null) {
		const normalized = normalizeUrl(match[1], baseOrigin);
		if (normalized) urls.add(normalized);
	}

	const absoluteImageUrlRegex = /(https?:\/\/[^\s"'<>]+?\.(?:png|jpe?g|webp)(?:\?[^\s"'<>]*)?)/gi;
	while ((match = absoluteImageUrlRegex.exec(html)) !== null) {
		const normalized = normalizeUrl(match[1], baseOrigin);
		if (normalized) urls.add(normalized);
	}

	return [...urls];
}

function extractOgImageUrl(html: string, baseOrigin: string): string | null {
	const match = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
	if (!match?.[1]) return null;
	return normalizeUrl(match[1], baseOrigin);
}

function extractMercariKeyVisualUrl(html: string): string | null {
	const patterns = [
		/"keyVisual(?:Url)?"\s*:\s*"([^"]+)"/i,
		/"mainImage(?:Url)?"\s*:\s*"([^"]+)"/i,
		/"heroImage(?:Url)?"\s*:\s*"([^"]+)"/i,
		/"thumbnailImage(?:Url)?"\s*:\s*"([^"]+)"/i,
	];
	for (const pattern of patterns) {
		const match = html.match(pattern);
		if (!match?.[1]) continue;
		const normalized = normalizeUrl(decodeEscapedUrl(match[1]), "https://nft.jp.mercari.com");
		if (isLikelyMercariKeyVisual(normalized)) return normalized;
	}
	return null;
}

function pickPreferredMercariImageUrl(imageUrls: string[]): string | null {
	const scored = imageUrls
		.map((imageUrl) => ({ imageUrl, score: scoreMercariImageUrl(imageUrl) }))
		.filter((row) => row.score > -100)
		.sort((a, b) => b.score - a.score);
	return scored[0]?.imageUrl ?? null;
}

function isLikelyMercariKeyVisual(url: string | null): boolean {
	if (!url) return false;
	const lower = url.toLowerCase();
	if (!lower.startsWith("http")) return false;
	if (
		/opengraph\.png|\/opengraph(?:[_-][a-z0-9]+)?\.png|favicon|apple-touch-icon|logo|icon/i.test(lower)
	) {
		return false;
	}
	return true;
}

function decodeEscapedUrl(value: string): string {
	return String(value ?? "")
		.replace(/\\\//g, "/")
		.replace(/\\"/g, '"');
}

function buildMercariDailyImageAlt(
	title: string,
	topPrizeNames: string[],
	remaining: number | null,
	totalCount: number | null,
): string {
	const topPrizeText = topPrizeNames.length > 0 ? topPrizeNames.slice(0, 3).join(" / ") : "未取得";
	const remainText =
		Number.isFinite(remaining) && Number.isFinite(totalCount) && totalCount && totalCount > 0
			? `残り${formatNumber(remaining as number)}回（全${formatNumber(totalCount)}回）`
			: "販売中";
	return `${title} | 1等候補: ${topPrizeText} | ${remainText}`.slice(0, 1000);
}

function scoreMercariImageUrl(url: string): number {
	const lower = String(url ?? "").toLowerCase();
	if (!isLikelyMercariKeyVisual(url)) return -100;
	if (/\/random_sales\//.test(lower)) return 100;
	if (/campaign\.jp\.mercari\.com\/pages\/images\//.test(lower)) return 90;
	if (/mercdn\.net/.test(lower)) return 80;
	return 50;
}

function normalizeUrl(url: string, baseOrigin = "https://nft.jp.mercari.com"): string | null {
	if (!url) return null;
	if (url.startsWith("//")) return `https:${url}`;
	if (url.startsWith("/")) return `${baseOrigin}${url}`;
	if (url.startsWith("http")) return url;
	return null;
}

function decodeURIComponentSafe(value: string): string {
	try {
		return decodeURIComponent(value);
	} catch {
		return value;
	}
}

function decodeHtmlEntities(value: string): string {
	return value
		.replace(/&nbsp;/g, " ")
		.replace(/&amp;/g, "&")
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">");
}

function stripTags(str: string): string {
	return str
		.replace(/<script[\s\S]*?<\/script>/gi, " ")
		.replace(/<style[\s\S]*?<\/style>/gi, " ")
		.replace(/<[^>]+>/g, " ")
		.replace(/&nbsp;/g, " ")
		.replace(/&amp;/g, "&");
}

function jsonResponse(data: unknown): Response {
	return new Response(JSON.stringify(data, null, 2), {
		headers: {
			"content-type": "application/json; charset=utf-8",
		},
	});
}