import { initWasm as initResvgWasm, Resvg } from "@resvg/resvg-wasm";
import resvgWasmBinary from "@resvg/resvg-wasm/index_bg.wasm";

type AlertLevel = "under_5" | "under_1";
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

type StreamScheduleOptions = {
	commit?: boolean;
	logToConsole?: boolean;
	fromSchedule?: boolean;
	targetDate?: string | null;
	daysAhead?: number | null;
	respectPostWindow?: boolean;
	force?: boolean;
	now?: Date;
};

type XAutoLikeOptions = {
	commit?: boolean;
	logToConsole?: boolean;
	fromSchedule?: boolean;
	maxLikesPerRun?: number | null;
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
	previous_fetched_at?: string;
	fetched_at: string;
	period?: string;
	source_site?: string;
	source_url?: string;
	image_url?: string;
	imageUrl?: string | null;
	history_prices?: Array<{ date: string; price: number }>;
};

type PokecaSummaryCard = {
	cardName: string;
	price: number;
	riseFallRate7: number | null;
	riseFallPrice7: number | null;
	imageUrl: string | null;
	imageR2Key?: string | null;
	url: string;
	fetchedAt: string;
};

type PokecaRankTarget = "rank_rise_7" | "rank_fall_7" | "rank_vol";

type PokecaSummarySnapshot = {
	rankTarget: PokecaRankTarget;
	cards: PokecaSummaryCard[];
	apiItemCount: number;
	snapshotFetchedAt: string;
};

type PokecaConsecutiveRankIn = {
	cardName: string;
	todayRank: number;
	yesterdayRank: number;
};

type PokecaDailyDeltaEntry = {
	cardName: string;
	todayPrice: number;
	yesterdayPrice: number;
	deltaPrice: number;
	deltaPct: number;
};

type PokecaOriginalCandidate = {
	key: string;
	label: string;
	periodLine: string;
	rows: PokecaDailyDeltaEntry[];
};

function buildPokecaCandidateFingerprint(candidate: PokecaOriginalCandidate): string {
	const rows = candidate.rows
		.slice(0, 3)
		.map((r) => `${stripPokecaCardVariant(r.cardName)}:${Math.round(r.todayPrice)}:${Math.round(r.deltaPrice)}`)
		.join("|");
	return `${candidate.key}|${candidate.periodLine}|${rows}`;
}

type StreamScheduleEntry = {
	rowNumber: number;
	dateKey: string;
	startAt: string;
	sortTimeValue: number | null;
	timeLabel: string;
	title: string;
	note: string | null;
	url: string | null;
	imageUrl: string | null;
};

type StreamScheduleParseResult = {
	ok: boolean;
	headers: string[];
	entries: StreamScheduleEntry[];
	missingHeaders: string[];
	skippedRows: Array<{ rowNumber: number; reason: string }>;
};

type TcjMarketplaceChain = "polygon" | "oasys";

type TcjMarketplaceItem = {
	id: string;
	chain: TcjMarketplaceChain;
	chainId: number | null;
	listingType: number | null;
	status: number | null;
	tokenId: string;
	createdAt: string;
	cardName: string;
	currentPrice: number | null;
	currentCurrencyId: number | null;
	mainImageUrl: string | null;
};

type TcjMarketplaceSnapshot = {
	chain: TcjMarketplaceChain;
	fetchedAt: string;
	items: TcjMarketplaceItem[];
};

type TcjMarketplaceEventKind = "listed" | "purchased";

type TcjMarketplaceEvent = {
	kind: TcjMarketplaceEventKind;
	chain: TcjMarketplaceChain;
	detectedAt: string;
	item: TcjMarketplaceItem;
};

type PokecaApiPriceInfo = {
	nPriceRecent?: number;
	fRiseFallRate7?: number;
	nRiseFallPrice7?: number;
};

type PokecaApiItem = {
	strSlug?: string;
	strName?: string;
	strImgUrl?: string;
	nVolume?: number;
	arrayPriceInfo?: Record<string, PokecaApiPriceInfo>;
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
	lastOnePrizeName: string | null;
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

type XAutoLikeState = {
	dateKey: string;
	count: number;
	likedIds: string[];
	likedAuthorIds: string[];
	aiChecks: number;
};

type MonitorEnv = Env & {
	STATE?: KVNamespace;
	POKECA_IMAGE_ARCHIVE?: R2Bucket;
	X_API_KEY?: string;
	X_API_KEY_SECRET?: string;
	X_ACCESS_TOKEN?: string;
	X_ACCESS_TOKEN_SECRET?: string;
	ANTHROPIC_API_KEY?: string;
	ANTHROPIC_MODEL?: string;
	MARKET_SUMMARY_USE_AI?: string;
	MARKET_SUMMARY_MODEL?: string;
	POKECA_ARCHIVE_IMAGES?: string;
	POKECA_SUMMARY_USE_AI?: string;
	POKECA_SUMMARY_MODEL?: string;
	POKECA_SUMMARY_TEMPLATE_IMAGE_URL?: string;
	STREAM_SCHEDULE_CSV_URL?: string;
	STREAM_SCHEDULE_POST_HOUR_JST?: string;
	STREAM_SCHEDULE_LOOKAHEAD_DAYS?: string;
	STREAM_SCHEDULE_HEADER?: string;
	STREAM_SCHEDULE_FOOTER?: string;
	STREAM_SCHEDULE_HASHTAGS?: string;
	STREAM_SCHEDULE_LINK_URL?: string;
	STREAM_SCHEDULE_IMAGE_URL?: string;
	STREAM_SCHEDULE_REMINDER_LEAD_MINUTES?: string;
	X_POST_ENABLED?: string;
	X_API_GUARD_ENABLED?: string;
	X_API_DAILY_REQUEST_LIMIT?: string;
	X_AUTO_LIKE_ENABLED?: string;
	X_AUTO_LIKE_DAILY_LIMIT?: string;
	X_AUTO_LIKE_QUERY?: string;
	X_AUTO_LIKE_MAX_PER_RUN?: string;
	X_AUTO_LIKE_AI_ENABLED?: string;
	X_AUTO_LIKE_AI_DAILY_LIMIT?: string;
	X_AUTO_LIKE_AI_MAX_PER_RUN?: string;
	X_AUTO_LIKE_AI_MODEL?: string;
	DUNE_API_KEY?: string;
	DUNE_POKEMON_SOL_ENABLED?: string;
	DUNE_POKEMON_SOL_QUERY_IDS?: string;
	DUNE_POKEMON_SOL_DASHBOARD_URL?: string;
	EBAY_APP_ID?: string;
	EBAY_CLIENT_SECRET?: string;
	EBAY_MARKETPLACE_ID?: string;
};

type StateStore = {
	get: (key: string) => Promise<string | null>;
	put: (key: string, value: string) => Promise<void>;
};

const localStateFallback = new Map<string, string>();
const TCGSTORE_LAST_URL_KEY = "last_oripa_url";
const MERCARI_LAST_URL_KEY = "last_mercari_url";
const TCGSTORE_RECENT_URLS_KEY = "recent_oripa_urls";
const MERCARI_RECENT_URLS_KEY = "recent_mercari_urls";
const DAILY_LAST_SOURCE_KEY = "last_daily_source";
const LATEST_MARKET_CONTEXT_KEY = "latest_market_context";
const FAST_MONITOR_UNTIL_KEY = "fast_monitor_until";
const POKECA_SUMMARY_DAILY_PREFIX = "pokeca_summary:";
const POKECA_SUMMARY_THEME_HISTORY_KEY = "pokeca_summary_theme_history";
const POKECA_SUMMARY_ORIGINAL_THEME_HISTORY_KEY = "pokeca_summary_original_theme_history";
const POKECA_SUMMARY_LAST_POST_FINGERPRINT_KEY = "pokeca_summary:last_post_fingerprint";
const POKECA_SUMMARY_LAST_VOL_VARIANT_KEY = "pokeca_summary:last_vol_variant";
const TCJ_MARKETPLACE_SNAPSHOT_KEY_PREFIX = "tcj_marketplace_snapshot:";
const TCJ_MARKETPLACE_PAGE_URL = "https://tcgstore.io/marketplace";
const TCJ_MARKETPLACE_CHAINS: TcjMarketplaceChain[] = ["polygon", "oasys"];
const POKECA_CHART_API_URL = "https://pokeca-chart.com/ch/api/v1/item";
const POKECA_CHART_URL_ORIGIN = "https://pokeca-chart.com/";
const POKECA_CHART_PASS_PHRASE_HEAD = "vQpUc4ej";
const POKECA_POST_RANK_LIMIT = 10;
const POKECA_SNAPSHOT_TOP_LIMIT = 50;
const POKECA_SNAPSHOT_RANK_TARGETS: PokecaRankTarget[] = ["rank_rise_7", "rank_fall_7", "rank_vol"];
const POKECA_POST_IMAGE_LIMIT = 1;
const POKECA_TWEET_TEXT_LIMIT = 280;
const POKECA_SUMMARY_RETENTION_DAYS = 90;
const X_API_GUARD_DAILY_PREFIX = "x_api_guard:";
const X_API_GUARD_PAUSED_UNTIL_KEY = "x_api_guard_paused_until";
const X_API_DEFAULT_DAILY_REQUEST_LIMIT = 40;
const X_AUTO_LIKE_STATE_PREFIX = "x_auto_like_state:";
const X_AUTO_LIKE_DEFAULT_DAILY_LIMIT = 24;
const X_AUTO_LIKE_DEFAULT_MAX_PER_RUN = 1;
const X_AUTO_LIKE_AI_DEFAULT_DAILY_LIMIT = 8;
const X_AUTO_LIKE_AI_DEFAULT_MAX_PER_RUN = 2;
const X_AUTO_LIKE_AI_DEFAULT_MODEL = "claude-3-5-haiku-latest";
const X_AUTO_LIKE_NEW_ACCOUNT_DAYS = 21;
const X_AUTO_LIKE_DEFAULT_QUERY =
	"(ポケカ OR ポケモンカード) (開封 OR 当たった OR 嬉しい OR うれしい OR 引けた OR 買えた OR ゲット) -買取 -販売 -入荷 -予約 -在庫 -PR -キャンペーン -is:retweet -is:reply lang:ja";
const X_AUTO_LIKE_POSITIVE_KEYWORDS = [
	"嬉しい",
	"うれしい",
	"神引き",
	"最高",
	"楽しい",
	"感謝",
	"ありがとうございます",
	"好き",
	"可愛い",
	"かっこいい",
	"優勝",
	"大満足",
	"届いた",
	"開封",
	"ゲット",
	"買えた",
	"当たった",
	"激アツ",
];
const X_AUTO_LIKE_NEGATIVE_KEYWORDS = [
	"高すぎ",
	"高過ぎ",
	"詐欺",
	"最悪",
	"爆死",
	"引退",
	"損した",
	"炎上",
	"偽物",
	"転売ヤー",
	"ムカつく",
	"むかつく",
	"うざい",
	"萎え",
	"しんどい",
	"苦しい",
	"きつい",
	"最悪すぎ",
	"最悪過ぎ",
];
const X_AUTO_LIKE_COMMERCIAL_KEYWORDS = [
	"買取",
	"販売",
	"入荷",
	"予約",
	"在庫",
	"宣伝",
	"PR",
	"キャンペーン",
	"プレゼント企画",
	"送料無料",
	"店舗",
	"通販",
	"鑑定品",
	"未開封BOX売",
	"オリパ販売",
];
const DUNE_POKEMON_SOL_DAILY_PREFIX = "dune_pokemontcgsol:";
const DUNE_POKEMON_SOL_LATEST_KEY = "dune_pokemontcgsol_latest";
const DUNE_POKEMON_SOL_DEFAULT_DASHBOARD_URL = "https://dune.com/zkayape/pokemontcgsol";
const DUNE_POKEMON_SOL_FALLBACK_QUERY_IDS = [5490579, 5446720, 5445642, 5732569, 5732456];
const DUNE_POKEMON_SOL_POST_TITLE = "【Web3】ポケカSOL オンチェーン活況まとめ";
const DAILY_RECENT_HISTORY_LIMIT = 10;
const ALERT_MARKET_CHANGE_PCT_MIN = 8;
const FAST_MONITOR_WINDOW_MS = 1000 * 60 * 90;
const ALERT_THRESHOLDS: Record<MonitorSource, { low: number; high: number; unit: "percent" | "count" }> = {
	mercari: { low: 200, high: 100, unit: "count" },
	tcgstore: { low: 200, high: 100, unit: "count" },
};
const WATCHLIST_KEY = "watchlist";
const WATCHLIST_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const WATCHLIST_LIMIT = 20;
const STREAM_SCHEDULE_POSTED_PREFIX = "stream_schedule_posted:";
const STREAM_SCHEDULE_REMINDER_POSTED_PREFIX = "stream_schedule_reminder_posted:";
const STREAM_SCHEDULE_DEFAULT_POST_HOUR_JST = 9;
const STREAM_SCHEDULE_DEFAULT_LOOKAHEAD_DAYS = 0;
const STREAM_SCHEDULE_DEFAULT_REMINDER_LEAD_MINUTES = 10;
const STREAM_SCHEDULE_DEFAULT_CSV_URL =
	"https://docs.google.com/spreadsheets/d/1lXDt66zqzO8HSnGPUYgS1aaU2asRfVR9ey2MJzq9N4k/edit?gid=438564440";
const STREAM_SCHEDULE_DEFAULT_LINK_URL = "https://youtube.com/@tcgverse?si=AnkkT6ku-jrOWPTj";
const STREAM_SCHEDULE_TARGET_STREAMERS: Array<{ display: string; aliases: string[] }> = [
	{ display: "えみ", aliases: ["えみ"] },
	{ display: "たまみ", aliases: ["たまみ"] },
	{ display: "りりか", aliases: ["りりか"] },
	{ display: "yu", aliases: ["yu", "yu wakabayashi"] },
];
const JST_OFFSET_MS = 9 * 60 * 60 * 1000;
const JST_WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"] as const;
const MARKET_SUMMARY_MIN_POOL = 3;
const SNKRDUNK_SEED_FALLBACK_IDS: string[] = [];
const DAILY_SPOTLIGHT_ENABLED = false;
const ENABLE_TCG_DAILY_SPOTLIGHT = false;
const ENABLE_MERCARI_DAILY_SPOTLIGHT = false;
const ENABLE_POKECA_SUMMARY_DAILY = true;
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

## アカウントのキャラクター
- ポケモンカード専門店の店員が語るトーン
- 専門的だが小難しくない。ポケカ好きの友人に話す感覚
- 売り込み感は出さない。「教えたい」「共有したい」がベース
- 「ですます」調ではなく、自然な口調。ただし丁寧さは保つ

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
const DEFAULT_MARKET_SUMMARY_MODEL = "claude-3-5-haiku-latest";
const DEFAULT_POKECA_SUMMARY_MODEL = "claude-3-5-haiku-latest";

let resvgWasmInitPromise: Promise<boolean> | null = null;
let lastPokecaCollageDebugReason: string | null = null;
let pokecaBannerFontBuffersPromise: Promise<Uint8Array[]> | null = null;

const MERCARI_DAILY_AI_SYSTEM_PROMPT = `あなたはTCGSTOREのX運用担当。
メルカリくじの紹介投稿を作るが、広告っぽさよりも「読む価値」を優先する。
- 派手な絵文字連打は禁止
- 事実ベースで短くわかりやすく
- 行き過ぎた煽りは禁止
- URLは末尾に1回だけ`;

export default {
	async fetch(request: Request, env: MonitorEnv): Promise<Response> {
		const reqUrl = new URL(request.url);
		const mode = reqUrl.searchParams.get("mode");
		if (mode === "price_spike" || mode === "price_spike_audit") {
			return jsonResponse({ ok: false, reason: "price_spike_mode_removed" });
		}
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
		if (mode === "stream_schedule_preview") {
			const daysAheadRaw = Number(reqUrl.searchParams.get("days_ahead"));
			const daysAhead = Number.isFinite(daysAheadRaw) ? Math.trunc(daysAheadRaw) : null;
			const targetDate = reqUrl.searchParams.get("target_date");
			const result = await runStreamScheduleDailyDigest(env, {
				commit: false,
				logToConsole: true,
				fromSchedule: false,
				targetDate,
				daysAhead,
			});
			return jsonResponse(result);
		}
		if (mode === "stream_schedule") {
			const commit = reqUrl.searchParams.get("commit") === "1";
			const force = reqUrl.searchParams.get("force") === "1";
			const daysAheadRaw = Number(reqUrl.searchParams.get("days_ahead"));
			const daysAhead = Number.isFinite(daysAheadRaw) ? Math.trunc(daysAheadRaw) : null;
			const targetDate = reqUrl.searchParams.get("target_date");
			const result = await runStreamScheduleDailyDigest(env, {
				commit,
				logToConsole: true,
				fromSchedule: false,
				targetDate,
				daysAhead,
				force,
			});
			return jsonResponse(result);
		}
		if (mode === "stream_schedule_reminder_preview") {
			const result = await runStreamScheduleReminder(env, {
				commit: false,
				logToConsole: true,
				fromSchedule: false,
			});
			return jsonResponse(result);
		}
		if (mode === "stream_schedule_reminder") {
			const result = await runStreamScheduleReminder(env, {
				commit: reqUrl.searchParams.get("commit") === "1",
				logToConsole: true,
				fromSchedule: false,
			});
			return jsonResponse(result);
		}
		if (mode === "tcj_marketplace_preview") {
			const result = await runTcjMarketplaceDigest(env, {
				commit: false,
				logToConsole: true,
				fromSchedule: false,
			});
			return jsonResponse(result);
		}
		if (mode === "tcj_marketplace_post") {
			const result = await runTcjMarketplaceDigest(env, {
				commit: reqUrl.searchParams.get("commit") === "1",
				logToConsole: true,
				fromSchedule: false,
			});
			return jsonResponse(result);
		}
		if (mode === "pokeca_summary") {
			const commit = reqUrl.searchParams.get("commit") === "1";
			const rank = reqUrl.searchParams.get("rank");
			const templateImageUrl = reqUrl.searchParams.get("template_image_url");
			const imagesParam = reqUrl.searchParams.get("images");
			const imageLimit =
				imagesParam == null
					? undefined
					: Math.max(0, Math.min(3, Math.trunc(Number(imagesParam))));
			const result = await runPokecaSummary(env, {
				commit,
				rank,
				imageLimit,
				templateImageUrl,
				logToConsole: true,
				fromSchedule: false,
			});
			return jsonResponse(result);
		}
		if (mode === "pokeca_summary_preview") {
			const rank = reqUrl.searchParams.get("rank");
			const templateImageUrl = reqUrl.searchParams.get("template_image_url");
			const imagesParam = reqUrl.searchParams.get("images");
			const imageLimit =
				imagesParam == null
					? undefined
					: Math.max(0, Math.min(3, Math.trunc(Number(imagesParam))));
			const result = await runPokecaSummary(env, {
				commit: false,
				rank,
				imageLimit,
				templateImageUrl,
				logToConsole: true,
				fromSchedule: false,
				preferStoredSnapshot: true,
				persistFetchedSnapshot: false,
			});
			return jsonResponse(result);
		}
		if (mode === "pokeca_summary_sample") {
			const sample = buildPokecaSummarySample();
				return jsonResponse({
					ok: true,
					mode: "pokeca_summary_sample",
					note: "X APIは使用しません。投稿フォーマットのサンプルです。",
					previewMessage: sample,
					schedule: "毎日 18:00 JST 取得 / 21:00 JST 投稿（cron: 0 9 * * * / 0 12 * * *）",
				});
			}
		if (mode === "pokeca_summary_debug") {
			const result = await runPokecaSummaryDebug();
			return jsonResponse(result);
		}
		if (mode === "x_whoami") {
			const result = await getXAuthenticatedAccount(env);
			return jsonResponse(result);
		}
		if (mode === "dune_pokeca_preview") {
			const result = await runDunePokemonSolSnapshot(env, {
				commit: false,
				logToConsole: true,
				fromSchedule: false,
			});
			return jsonResponse(result);
		}
		if (mode === "dune_pokeca_fetch") {
			const result = await runDunePokemonSolSnapshot(env, {
				commit: reqUrl.searchParams.get("commit") === "1",
				logToConsole: true,
				fromSchedule: false,
			});
			return jsonResponse(result);
		}
		if (mode === "dune_pokeca_latest") {
			const stateStore = createStateStore(env);
			const raw = await stateStore.get(DUNE_POKEMON_SOL_LATEST_KEY);
			if (!raw) return jsonResponse({ ok: false, reason: "dune_snapshot_not_found" });
			try {
				return jsonResponse({ ok: true, latest: JSON.parse(raw) });
			} catch {
				return jsonResponse({ ok: false, reason: "dune_snapshot_parse_failed" });
			}
		}
		if (mode === "dune_pokeca_post_preview") {
			const result = await runDunePokemonSolPost(env, {
				commit: false,
				logToConsole: true,
				fromSchedule: false,
			});
			return jsonResponse(result);
		}
		if (mode === "dune_pokeca_post") {
			const result = await runDunePokemonSolPost(env, {
				commit: reqUrl.searchParams.get("commit") === "1",
				logToConsole: true,
				fromSchedule: false,
			});
			return jsonResponse(result);
		}
		if (mode === "dune_pokeca_banner_preview") {
			return renderDunePokemonSolBannerPreview(env);
		}
		if (mode === "web3_ebay_schema_preview") {
			const stateStore = createStateStore(env);
			const raw = await stateStore.get(DUNE_POKEMON_SOL_LATEST_KEY);
			const latest = raw ? safeJsonParse(raw) : null;
			return jsonResponse(buildWeb3EbaySchemaPreview(env, latest));
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
		const stateStore = createStateStore(env);
		const currentMinuteUtc = new Date(event.scheduledTime).getUTCMinutes();
		const isThirtyMinuteTick = currentMinuteUtc % 30 === 0;
		const isFastWindowActive = await isFastMonitorWindowActive(stateStore);
		if (isThirtyMinuteTick || isFastWindowActive) {
			const monitorResponse = await runMonitor(new Request("https://scheduled.local/?commit=1"), env, {
				fromSchedule: true,
				forceCommit: true,
				logToConsole: true,
			});
			if (isThirtyMinuteTick) {
				try {
					const monitorResult = (await monitorResponse.clone().json()) as { fastMonitorNeeded?: boolean };
					if (monitorResult.fastMonitorNeeded) {
						await enableFastMonitorWindow(stateStore);
					} else {
						await disableFastMonitorWindow(stateStore);
					}
				} catch {
					// keep previous fast-monitor window state when response parse fails
				}
			}
		}
		if (DAILY_SPOTLIGHT_ENABLED && isDailySpotlightCron(event)) {
			await runDailyRandomSpotlight(env, {
				commit: true,
				logToConsole: true,
				fromSchedule: true,
			});
		}
		if (isStreamScheduleCron(event)) {
			await runStreamScheduleDailyDigest(env, {
				commit: true,
				logToConsole: true,
				fromSchedule: true,
				respectPostWindow: true,
				now: new Date(event.scheduledTime),
			});
		}
		if (event.cron === "0 11 * * *") {
			await refreshWatchlistPrices(env, { logToConsole: true });
		}
		if (isPokecaSummaryFetchCron(event) && ENABLE_POKECA_SUMMARY_DAILY) {
			await runPokecaSummaryDailySnapshotFetch(env, {
				logToConsole: true,
				fromSchedule: true,
			});
		}
		if (isPokecaSummaryPostCron(event) && ENABLE_POKECA_SUMMARY_DAILY) {
			await runPokecaSummary(env, {
				commit: true,
				logToConsole: true,
				fromSchedule: true,
				preferStoredSnapshot: true,
			});
		}
		if (isDunePokemonSolFetchCron(event)) {
			await runDunePokemonSolSnapshot(env, {
				commit: true,
				logToConsole: true,
				fromSchedule: true,
			});
		}
	},
};

async function isFastMonitorWindowActive(stateStore: StateStore): Promise<boolean> {
	const raw = await stateStore.get(FAST_MONITOR_UNTIL_KEY);
	if (!raw) return false;
	const until = new Date(raw);
	return Number.isFinite(until.getTime()) && until.getTime() > Date.now();
}

async function enableFastMonitorWindow(stateStore: StateStore): Promise<void> {
	const until = new Date(Date.now() + FAST_MONITOR_WINDOW_MS).toISOString();
	await stateStore.put(FAST_MONITOR_UNTIL_KEY, until);
}

async function disableFastMonitorWindow(stateStore: StateStore): Promise<void> {
	await stateStore.put(FAST_MONITOR_UNTIL_KEY, "");
}

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

	if (commit) {
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
	};

	if (logToConsole) {
		console.log(JSON.stringify({ type: "TCG_DAILY_RESULT", ...result }, null, 2));
	}

	return result;
}

function isDailySpotlightCron(event: ScheduledEvent): boolean {
	return event.cron === "0 3 * * *";
}

function isPokecaSummaryFetchCron(event: ScheduledEvent): boolean {
	return event.cron === "0 9 * * *";
}

function isPokecaSummaryPostCron(event: ScheduledEvent): boolean {
	return event.cron === "0 12 * * *";
}

function isStreamScheduleCron(event: ScheduledEvent): boolean {
	return event.cron === "0 9 * * *";
}

function isDunePokemonSolFetchCron(event: ScheduledEvent): boolean {
	return event.cron === "0 3 * * *";
}

function isDunePokemonSolEnabled(env: MonitorEnv): boolean {
	return parseBooleanEnv(env.DUNE_POKEMON_SOL_ENABLED, true);
}

function resolveDunePokemonSolDashboardUrl(env: MonitorEnv): string {
	const custom = String(env.DUNE_POKEMON_SOL_DASHBOARD_URL ?? "").trim();
	return custom || DUNE_POKEMON_SOL_DEFAULT_DASHBOARD_URL;
}

function safeJsonParse(raw: string): Record<string, unknown> | null {
	try {
		const parsed = JSON.parse(String(raw ?? ""));
		return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
	} catch {
		return null;
	}
}

function extractTcgNamesFromDuneLatest(snapshot: Record<string, unknown> | null): string[] {
	if (!snapshot) return [];
	const queries = Array.isArray(snapshot.queries) ? snapshot.queries : [];
	const out: string[] = [];
	for (const q of queries) {
		const row =
			q && typeof q === "object" ? ((q as Record<string, unknown>).sampleRow as Record<string, unknown> | null) : null;
		if (!row) continue;
		const tcg = String(row.tcg ?? "").trim();
		if (tcg) out.push(tcg);
	}
	return [...new Set(out)].slice(0, 5);
}

function buildWeb3EbaySchemaPreview(env: MonitorEnv, latest: Record<string, unknown> | null): Record<string, unknown> {
	const tcgSeeds = extractTcgNamesFromDuneLatest(latest);
	const marketplace = String(env.EBAY_MARKETPLACE_ID ?? "EBAY_US").trim() || "EBAY_US";
	const hasEbayCreds = Boolean(env.EBAY_APP_ID && env.EBAY_CLIENT_SECRET);
	return {
		ok: true,
		mode: "web3_ebay_schema_preview",
		status: {
			web3SnapshotAvailable: Boolean(latest),
			ebayCredentialsConfigured: hasEbayCreds,
		},
		schema: {
			web3_daily: {
				date_key: "YYYY-MM-DD JST",
				source: "Dune PokemonTCGSol",
				metrics: ["total_volume", "gacha_volume", "marketplace_volume", "net_revenue", "gacha_spend", "tcg"],
			},
			ebay_daily: {
				date_key: "YYYY-MM-DD JST",
				source: "eBay Browse API",
				dimensions: ["query", "marketplace_id", "condition", "currency"],
				metrics: ["result_count", "price_min", "price_p50", "price_max", "shipping_p50"],
			},
			bridge_daily: {
				date_key: "YYYY-MM-DD JST",
				keys: ["query_normalized"],
				metrics: [
					"web3_vs_ebay_price_gap_pct",
					"web3_activity_rank",
					"ebay_liquidity_signal",
					"attention_divergence_score",
				],
			},
		},
		ebay_plan: {
			api: "Browse API /item_summary/search",
			marketplace_id: marketplace,
			suggested_queries: tcgSeeds.length > 0 ? tcgSeeds : ["Pokemon card", "Pikachu Pokemon card", "Eevee ex"],
			fields_to_store: ["itemId", "title", "price.value", "price.currency", "condition", "itemWebUrl"],
			aggregation: "daily median/min/max by query",
		},
		next_steps: [
			"Set secrets: EBAY_APP_ID, EBAY_CLIENT_SECRET",
			"Add OAuth token fetch (client_credentials) and cache token in KV",
			"Run daily fetch and store ebay_daily snapshot",
			"Generate bridge_daily score and add one-line insight to Web3 post",
		],
		latest_web3: latest,
	};
}

function resolveDunePokemonSolQueryIds(env: MonitorEnv): number[] {
	const raw = String(env.DUNE_POKEMON_SOL_QUERY_IDS ?? "").trim();
	if (!raw) return [...DUNE_POKEMON_SOL_FALLBACK_QUERY_IDS];
	const ids = raw
		.split(",")
		.map((v) => Number(String(v).trim()))
		.filter((v) => Number.isFinite(v) && v > 0)
		.map((v) => Math.trunc(v));
	return [...new Set([...ids, ...DUNE_POKEMON_SOL_FALLBACK_QUERY_IDS])];
}

function getDunePokemonSolDailyKey(dateKey: string): string {
	return `${DUNE_POKEMON_SOL_DAILY_PREFIX}${dateKey}`;
}

async function fetchDuneLatestQueryResult(
	queryId: number,
	apiKey: string,
): Promise<{
	ok: boolean;
	status: number;
	rows: Array<Record<string, unknown>>;
	response?: unknown;
	error?: string;
}> {
	const endpoint = `https://api.dune.com/api/v1/query/${queryId}/results?limit=1000`;
	const res = await fetch(endpoint, {
		method: "GET",
		headers: {
			"x-dune-api-key": apiKey,
			accept: "application/json",
		},
	});
	const raw = await res.text();
	let data: unknown = null;
	try {
		data = raw ? JSON.parse(raw) : {};
	} catch {
		data = { raw };
	}
	if (!res.ok) {
		return {
			ok: false,
			status: res.status,
			rows: [],
			response: data,
			error: `dune_http_${res.status}`,
		};
	}
	const body = data as {
		result?: { rows?: Array<Record<string, unknown>> };
		rows?: Array<Record<string, unknown>>;
	};
	const rows = Array.isArray(body?.result?.rows)
		? body.result.rows
		: Array.isArray(body?.rows)
			? body.rows
			: [];
	return {
		ok: true,
		status: res.status,
		rows,
		response: data,
	};
}

async function runDunePokemonSolSnapshot(
	env: MonitorEnv,
	options: { commit?: boolean; logToConsole?: boolean; fromSchedule?: boolean } = {},
): Promise<Record<string, unknown>> {
	const { commit = false, logToConsole = true, fromSchedule = false } = options;
	const enabled = isDunePokemonSolEnabled(env);
	if (!enabled) {
		const result = { ok: false, reason: "dune_pokeca_disabled", commitMode: commit, fromSchedule };
		if (logToConsole) console.log(JSON.stringify({ type: "DUNE_POKECA_SKIP", ...result }, null, 2));
		return result;
	}
	if (!env.DUNE_API_KEY) {
		const result = { ok: false, reason: "missing_dune_api_key", commitMode: commit, fromSchedule };
		if (logToConsole) console.log(JSON.stringify({ type: "DUNE_POKECA_SKIP", ...result }, null, 2));
		return result;
	}
	const queryIds = resolveDunePokemonSolQueryIds(env);
	if (queryIds.length === 0) {
		const result = {
			ok: false,
			reason: "missing_dune_query_ids",
			commitMode: commit,
			fromSchedule,
			dashboardUrl: resolveDunePokemonSolDashboardUrl(env),
			note: "DUNE_POKEMON_SOL_QUERY_IDS にカンマ区切りで query id を設定してください",
		};
		if (logToConsole) console.log(JSON.stringify({ type: "DUNE_POKECA_SKIP", ...result }, null, 2));
		return result;
	}

	const fetchResults: Array<Record<string, unknown>> = [];
	let totalRows = 0;
	for (const queryId of queryIds) {
		const fetched = await fetchDuneLatestQueryResult(queryId, env.DUNE_API_KEY);
		totalRows += fetched.rows.length;
		fetchResults.push({
			queryId,
			ok: fetched.ok,
			status: fetched.status,
			rowCount: fetched.rows.length,
			sampleKeys: fetched.rows[0] ? Object.keys(fetched.rows[0]).slice(0, 12) : [],
			sampleRow: fetched.rows[0] ?? null,
			error: fetched.error ?? null,
		});
	}
	const successCount = fetchResults.filter((r) => r.ok === true).length;
	const now = new Date();
	const dateKey = getJstYmd(now);
	const snapshot = {
		dateKey,
		fetchedAt: now.toISOString(),
		dashboardUrl: resolveDunePokemonSolDashboardUrl(env),
		queryIds,
		successCount,
		totalQueries: queryIds.length,
		totalRows,
		queries: fetchResults,
	};

	if (commit) {
		const stateStore = createStateStore(env);
		await stateStore.put(getDunePokemonSolDailyKey(dateKey), JSON.stringify(snapshot));
		await stateStore.put(DUNE_POKEMON_SOL_LATEST_KEY, JSON.stringify(snapshot));
	}

	const result = {
		ok: successCount > 0,
		commitMode: commit,
		fromSchedule,
		committed: commit && successCount > 0,
		...snapshot,
	};
	if (logToConsole) console.log(JSON.stringify({ type: "DUNE_POKECA_RESULT", ...result }, null, 2));
	return result;
}

type DuneMetricSet = {
	volumeSol: number | null;
	txCount: number | null;
	buyerWallets: number | null;
};

type DuneMetricCard = {
	label: string;
	value: number | null;
	unit: string;
	sourceKey: string | null;
	deltaFromPrev: number | null;
};

function parseDuneNumericValue(value: unknown): number | null {
	if (typeof value === "number" && Number.isFinite(value)) return value;
	if (typeof value === "string") {
		const normalized = value.replace(/,/g, "").trim();
		if (!normalized) return null;
		const parsed = Number(normalized);
		if (Number.isFinite(parsed)) return parsed;
	}
	return null;
}

function collectDuneSampleEntries(snapshot: Record<string, unknown>): Array<{ key: string; value: number }> {
	const queries = Array.isArray(snapshot.queries) ? snapshot.queries : [];
	const out: Array<{ key: string; value: number }> = [];
	for (const query of queries) {
		const sampleRow =
			query && typeof query === "object" && (query as Record<string, unknown>).sampleRow
				? ((query as Record<string, unknown>).sampleRow as Record<string, unknown>)
				: null;
		if (!sampleRow || typeof sampleRow !== "object") continue;
		for (const [rawKey, rawValue] of Object.entries(sampleRow)) {
			const n = parseDuneNumericValue(rawValue);
			if (n == null) continue;
			out.push({ key: String(rawKey ?? "").toLowerCase(), value: n });
		}
	}
	return out;
}

function pickDuneEntryByPatterns(
	entries: Array<{ key: string; value: number }>,
	patterns: RegExp[],
	reject?: RegExp,
): { key: string; value: number } | null {
	return (
		entries.find((entry) => {
			if (!entry.key) return false;
			if (reject && reject.test(entry.key)) return false;
			return patterns.some((p) => p.test(entry.key));
		}) ?? null
	);
}

function pickDuneMetricByPatterns(
	entries: Array<{ key: string; value: number }>,
	patterns: RegExp[],
	reject?: RegExp,
): number | null {
	const hit = entries.find((entry) => {
		if (!entry.key) return false;
		if (reject && reject.test(entry.key)) return false;
		return patterns.some((p) => p.test(entry.key));
	});
	return hit ? hit.value : null;
}

function buildDuneMetricSet(snapshot: Record<string, unknown>): DuneMetricSet {
	const entries = collectDuneSampleEntries(snapshot);
	const volumeSol =
		pickDuneMetricByPatterns(
			entries,
			[/total_volume/, /gacha_volume/, /mktplace_vol/, /volume/, /\bvol\b/, /\bsol\b/, /amount/],
			/tx|transaction|count|wallet|buyer|user/,
		) ??
		null;
	const txCount =
		pickDuneMetricByPatterns(entries, [/tx/, /transaction/, /trade_count/, /trades/, /count/], /wallet|buyer|user/) ??
		null;
	const buyerWallets =
		pickDuneMetricByPatterns(entries, [/wallet/, /buyer/, /user/, /unique/], /volume|sol|amount|tx/) ?? null;
	return {
		volumeSol,
		txCount,
		buyerWallets,
	};
}

function buildDuneMetricCards(snapshot: Record<string, unknown>, metrics: DuneMetricSet): DuneMetricCard[] {
	const entries = collectDuneSampleEntries(snapshot);
	const volumeEntry =
		pickDuneEntryByPatterns(entries, [/total_volume/, /gacha_volume/, /mktplace_vol/, /\bvolume\b/, /\bvol\b/, /amount/]) ??
		null;
	const txEntry =
		pickDuneEntryByPatterns(entries, [/tx_count/, /transaction_count/, /trades/, /\btx\b/, /count/], /wallet|buyer|user/) ??
		pickDuneEntryByPatterns(entries, [/gacha_spend/]) ??
		null;
	const buyerEntry =
		pickDuneEntryByPatterns(entries, [/buyer_wallets/, /unique_wallets/, /buyers/, /wallets/, /users/, /holders/]) ?? null;

	const card1: DuneMetricCard = {
		label: "取引量",
		value: metrics.volumeSol ?? volumeEntry?.value ?? null,
		unit: "SOL",
		sourceKey: metrics.volumeSol != null ? "metrics.volumeSol" : (volumeEntry?.key ?? null),
		deltaFromPrev: null,
	};
	const card2: DuneMetricCard = txEntry
		? /tx|transaction|trades|count/.test(txEntry.key)
			? { label: "取引件数", value: txEntry.value, unit: "tx", sourceKey: txEntry.key, deltaFromPrev: null }
			: { label: "ガチャ売上", value: txEntry.value, unit: "SOL", sourceKey: txEntry.key, deltaFromPrev: null }
		: { label: "ガチャ売上", value: null, unit: "SOL", sourceKey: null, deltaFromPrev: null };
	const card3: DuneMetricCard = buyerEntry
		? /buyer|wallet|user|holder/.test(buyerEntry.key)
			? { label: "購入者数", value: buyerEntry.value, unit: "wallets", sourceKey: buyerEntry.key, deltaFromPrev: null }
			: { label: "購入者数", value: null, unit: "wallets", sourceKey: null, deltaFromPrev: null }
		: { label: "購入者数", value: null, unit: "wallets", sourceKey: null, deltaFromPrev: null };
	return [card1, card2, card3];
}

function getDuneMetricValueBySourceKey(snapshot: Record<string, unknown>, sourceKey: string | null): number | null {
	if (!sourceKey) return null;
	if (sourceKey === "metrics.volumeSol") return buildDuneMetricSet(snapshot).volumeSol;
	const entries = collectDuneSampleEntries(snapshot);
	const hit = entries.find((entry) => entry.key === sourceKey);
	return hit?.value ?? null;
}

function withDunePreviousDeltas(
	cards: DuneMetricCard[],
	previousSnapshot: Record<string, unknown> | null,
): DuneMetricCard[] {
	if (!previousSnapshot) return cards;
	return cards.map((card) => {
		const prev = getDuneMetricValueBySourceKey(previousSnapshot, card.sourceKey);
		if (card.value == null || prev == null || !Number.isFinite(card.value) || !Number.isFinite(prev)) {
			return { ...card, deltaFromPrev: null };
		}
		return { ...card, deltaFromPrev: card.value - prev };
	});
}

function formatDuneMetric(value: number | null): string {
	if (value == null || !Number.isFinite(value)) return "—";
	return formatNumber(value);
}

function formatDuneMetricCompact(value: number | null): string {
	if (value == null || !Number.isFinite(value)) return "—";
	return formatNumber(value);
}

function formatDuneMetricDelta(value: number | null, unit: string): string {
	if (value == null || !Number.isFinite(value)) return "前日比: —";
	const signed = value > 0 ? `+${formatNumber(value)}` : value < 0 ? `-${formatNumber(Math.abs(value))}` : "0";
	return `前日比: ${signed} ${unit}`;
}

function buildDunePokemonSolMessage(snapshot: Record<string, unknown>, cards: DuneMetricCard[]): string {
	const fetchedAt = String(snapshot.fetchedAt ?? "").trim();
	const dateLabel = fetchedAt ? formatJstDateLabel(new Date(fetchedAt)) : formatJstDateLabel(new Date());
	const c1 = cards[0] ?? { label: "取引量", value: null, unit: "SOL", sourceKey: null, deltaFromPrev: null };
	const c2 = cards[1] ?? { label: "取引件数", value: null, unit: "tx", sourceKey: null, deltaFromPrev: null };
	const c3 = cards[2] ?? { label: "購入者数", value: null, unit: "wallets", sourceKey: null, deltaFromPrev: null };
	const lines = [
		DUNE_POKEMON_SOL_POST_TITLE,
		`${dateLabel}（当日集計）`,
		`1. ${c1.label} ${formatDuneMetric(c1.value)} ${c1.unit}（${formatDuneMetricDelta(c1.deltaFromPrev, c1.unit).replace("前日比: ", "")}）`,
		`2. ${c2.label} ${formatDuneMetric(c2.value)} ${c2.unit}（${formatDuneMetricDelta(c2.deltaFromPrev, c2.unit).replace("前日比: ", "")}）`,
		`3. ${c3.label} ${formatDuneMetric(c3.value)} ${c3.unit}（${formatDuneMetricDelta(c3.deltaFromPrev, c3.unit).replace("前日比: ", "")}）`,
		"",
		"#ポケカ #Web3",
	];
	return lines.join("\n");
}

async function renderDunePokemonSolBanner(
	snapshot: Record<string, unknown>,
	cards: DuneMetricCard[],
): Promise<{ blob: Blob; altText: string } | null> {
	const ready = await ensureResvgWasmReady();
	if (!ready) return null;
	const fontBuffers = await loadPokecaBannerFontBuffers();
	const logoDataUrl = `data:image/svg+xml;base64,${utf8ToBase64(TCGSTORE_LOGO_SVG)}`;
	const fetchedAt = String(snapshot.fetchedAt ?? "").trim();
	const dateLabel = fetchedAt ? formatJstDateLabel(new Date(fetchedAt)) : formatJstDateLabel(new Date());
	const c1 = cards[0] ?? { label: "取引量", value: null, unit: "SOL", sourceKey: null, deltaFromPrev: null };
	const c2 = cards[1] ?? { label: "取引件数", value: null, unit: "tx", sourceKey: null, deltaFromPrev: null };
	const c3 = cards[2] ?? { label: "購入者数", value: null, unit: "wallets", sourceKey: null, deltaFromPrev: null };
	const volumeCardText = formatDuneMetricCompact(c1.value);
	const txCardText = formatDuneMetricCompact(c2.value);
	const buyersCardText = formatDuneMetricCompact(c3.value);
	const row1ValueText = `${volumeCardText} ${c1.unit}`;
	const row2ValueText = `${txCardText} ${c2.unit}`;
	const row3ValueText = `${buyersCardText} ${c3.unit}`;
	const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="817" viewBox="0 0 600 817">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="600" y2="817" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0878FF"/>
      <stop offset="52%" stop-color="#1F3DF5"/>
      <stop offset="100%" stop-color="#6B47FF"/>
    </linearGradient>
    <filter id="rowGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="12"/>
    </filter>
    <clipPath id="r1"><rect x="49" y="200" width="500" height="52"/></clipPath>
    <clipPath id="r2"><rect x="49" y="401" width="500" height="52"/></clipPath>
    <clipPath id="r3"><rect x="49" y="602" width="500" height="52"/></clipPath>
  </defs>
  <rect x="0" y="0" width="600" height="817" fill="url(#bg)"/>
  <rect x="20" y="18" width="549" height="86" rx="18" ry="18" fill="rgba(40,0,81,0.17)" stroke="rgba(255,255,255,0.36)"/>
  <text x="300" y="52" fill="#FFFFFF" text-anchor="middle" font-size="22" font-weight="700" font-family="Inter, Noto Sans CJK JP, sans-serif">${escapeXmlText(DUNE_POKEMON_SOL_POST_TITLE)}</text>
  <text x="300" y="82" fill="#FFF7D1" text-anchor="middle" font-size="15" font-weight="700" font-family="Inter, Noto Sans CJK JP, sans-serif">${escapeXmlText(`${dateLabel}（当日集計）`)}</text>
  <ellipse cx="140" cy="430" rx="130" ry="70" fill="rgba(60,176,255,0.35)" filter="url(#rowGlow)"/>
  <ellipse cx="300" cy="430" rx="130" ry="70" fill="rgba(59,73,255,0.30)" filter="url(#rowGlow)"/>
  <ellipse cx="460" cy="430" rx="130" ry="70" fill="rgba(12,138,255,0.35)" filter="url(#rowGlow)"/>
  <text x="21" y="156" fill="#FFFFFF" font-size="20" font-weight="700" font-family="Inter, Noto Sans CJK JP, sans-serif">${escapeXmlText(c1.label)}</text>
  <text x="21" y="357" fill="#FFFFFF" font-size="20" font-weight="700" font-family="Inter, Noto Sans CJK JP, sans-serif">${escapeXmlText(c2.label)}</text>
  <text x="21" y="558" fill="#FFFFFF" font-size="20" font-weight="700" font-family="Inter, Noto Sans CJK JP, sans-serif">${escapeXmlText(c3.label)}</text>
  <rect x="21" y="176" width="548" height="137" rx="18" ry="18" fill="rgba(255,255,255,0.9)"/>
  <rect x="21" y="377.5" width="548" height="137" rx="18" ry="18" fill="rgba(255,255,255,0.9)"/>
  <rect x="21" y="579" width="548" height="137" rx="18" ry="18" fill="rgba(255,255,255,0.9)"/>
  <text x="49.5" y="242" fill="#290852" font-size="48" font-weight="700" font-family="Space Mono, monospace" clip-path="url(#r1)">${escapeXmlText(row1ValueText)}</text>
  <text x="49.5" y="276" fill="#593880" font-size="14" font-weight="700" font-family="Inter, Noto Sans CJK JP, sans-serif">${escapeXmlText(formatDuneMetricDelta(c1.deltaFromPrev, c1.unit))}</text>
  <text x="49.5" y="443.5" fill="#290852" font-size="48" font-weight="700" font-family="Space Mono, monospace" clip-path="url(#r2)">${escapeXmlText(row2ValueText)}</text>
  <text x="49.5" y="478" fill="#593880" font-size="14" font-weight="700" font-family="Inter, Noto Sans CJK JP, sans-serif">${escapeXmlText(formatDuneMetricDelta(c2.deltaFromPrev, c2.unit))}</text>
  <text x="49.5" y="645" fill="#290852" font-size="48" font-weight="700" font-family="Space Mono, monospace" clip-path="url(#r3)">${escapeXmlText(row3ValueText)}</text>
  <text x="49.5" y="679.5" fill="#593880" font-size="14" font-weight="700" font-family="Inter, Noto Sans CJK JP, sans-serif">${escapeXmlText(formatDuneMetricDelta(c3.deltaFromPrev, c3.unit))}</text>
  <text x="26" y="780" fill="#FFFFFF" font-size="14" font-weight="700" font-family="Inter, Noto Sans CJK JP, sans-serif">出典: Dune / PokemonTCGSol</text>
  <image href="${logoDataUrl}" x="413" y="767" width="156" height="22"/>
</svg>`;
	try {
		const resvg = new Resvg(svg, {
			fitTo: { mode: "width", value: 600 },
			font: {
				fontBuffers,
				defaultFontFamily: "Noto Sans CJK JP",
				sansSerifFamily: "Noto Sans CJK JP",
				monospaceFamily: "Noto Sans CJK JP",
			},
		});
		const rendered = resvg.render();
		const png = rendered.asPng();
		rendered.free?.();
		resvg.free?.();
		return {
			blob: new Blob([png], { type: "image/png" }),
			altText: "Web3 ポケカSOL オンチェーン活況まとめバナー",
		};
	} catch {
		return null;
	}
}

async function runDunePokemonSolPost(
	env: MonitorEnv,
	options: { commit?: boolean; logToConsole?: boolean; fromSchedule?: boolean } = {},
): Promise<Record<string, unknown>> {
	const { commit = false, logToConsole = true, fromSchedule = false } = options;
	const stateStore = createStateStore(env);
	const snapshotResult = await getDunePokemonSolSnapshotForPost(env, { logToConsole, fromSchedule });
	if (!snapshotResult.ok || !snapshotResult.snapshot) {
		return {
			ok: false,
			reason: "dune_snapshot_unavailable",
			commitMode: commit,
			fromSchedule,
			fetchResult: snapshotResult.fetchResult ?? null,
		};
	}
	const snapshot = snapshotResult.snapshot;
	const metrics = buildDuneMetricSet(snapshot);
	const prevDateKey = getJstYmdShifted(new Date(), -1);
	const previousSnapshot = await loadDuneDailySnapshotByDateKey(stateStore, prevDateKey);
	const cards = withDunePreviousDeltas(buildDuneMetricCards(snapshot, metrics), previousSnapshot);
	const message = buildDunePokemonSolMessage(snapshot, cards);
	const banner = await renderDunePokemonSolBanner(snapshot, cards);
	let postedToX = false;
	let xResponse: unknown = null;
	if (commit) {
		const postResult = await postTweetWithImages(
			message,
			{ mainImageUrl: null, lastOneImageUrl: null },
			env,
			{
				inlineImages: banner ? [{ blob: banner.blob, altText: banner.altText }] : [],
			},
		);
		postedToX = postResult.ok;
		xResponse = postResult;
	}
	const result = {
		ok: true,
		commitMode: commit,
		fromSchedule,
		committed: commit && postedToX,
		postedToX,
		previewMessage: message,
		messageLengthWeighted: countXWeightedLength(message),
		bannerUsed: Boolean(banner),
		metrics,
		cards,
		snapshotDateKey: String(snapshot.dateKey ?? ""),
		snapshotFetchedAt: String(snapshot.fetchedAt ?? ""),
		xResponse,
	};
	if (logToConsole) console.log(JSON.stringify({ type: "DUNE_POKECA_POST_RESULT", ...result }, null, 2));
	return result;
}

async function getDunePokemonSolSnapshotForPost(
	env: MonitorEnv,
	options: { logToConsole?: boolean; fromSchedule?: boolean } = {},
): Promise<{ ok: boolean; snapshot?: Record<string, unknown>; fetchResult?: Record<string, unknown> }> {
	const { logToConsole = true, fromSchedule = false } = options;
	const stateStore = createStateStore(env);
	let snapshot: Record<string, unknown> | null = null;
	const raw = await stateStore.get(DUNE_POKEMON_SOL_LATEST_KEY);
	if (raw) {
		try {
			snapshot = JSON.parse(raw) as Record<string, unknown>;
		} catch {
			snapshot = null;
		}
	}
	if (!snapshot) {
		const fetched = await runDunePokemonSolSnapshot(env, { commit: true, logToConsole, fromSchedule });
		if (!fetched.ok) {
			return { ok: false, fetchResult: fetched };
		}
		snapshot = fetched;
	}
	return { ok: true, snapshot };
}

async function loadDuneDailySnapshotByDateKey(
	stateStore: StateStore,
	dateKey: string,
): Promise<Record<string, unknown> | null> {
	const raw = await stateStore.get(getDunePokemonSolDailyKey(dateKey));
	if (!raw) return null;
	try {
		return JSON.parse(raw) as Record<string, unknown>;
	} catch {
		return null;
	}
}

async function renderDunePokemonSolBannerPreview(env: MonitorEnv): Promise<Response> {
	const snapshotResult = await getDunePokemonSolSnapshotForPost(env, { logToConsole: true, fromSchedule: false });
	if (!snapshotResult.ok || !snapshotResult.snapshot) {
		return jsonResponse({
			ok: false,
			reason: "dune_snapshot_unavailable",
			fetchResult: snapshotResult.fetchResult ?? null,
		});
	}
	const snapshot = snapshotResult.snapshot;
	const prevDateKey = getJstYmdShifted(new Date(), -1);
	const stateStore = createStateStore(env);
	const previousSnapshot = await loadDuneDailySnapshotByDateKey(stateStore, prevDateKey);
	const cards = withDunePreviousDeltas(
		buildDuneMetricCards(snapshot, buildDuneMetricSet(snapshot)),
		previousSnapshot,
	);
	const banner = await renderDunePokemonSolBanner(snapshot, cards);
	if (!banner) {
		return jsonResponse({ ok: false, reason: "dune_banner_render_failed" });
	}
	return new Response(banner.blob, {
		headers: {
			"content-type": "image/png",
			"cache-control": "no-store",
		},
	});
}

async function runTcjMarketplaceDigest(
	env: MonitorEnv,
	options: { commit?: boolean; logToConsole?: boolean; fromSchedule?: boolean } = {},
): Promise<Record<string, unknown>> {
	const { commit = false, logToConsole = true, fromSchedule = false } = options;
	const stateStore = createStateStore(env);
	const now = new Date();
	const detectedAt = now.toISOString();

	const snapshots: TcjMarketplaceSnapshot[] = [];
	for (const chain of TCJ_MARKETPLACE_CHAINS) {
		const items = await fetchTcjMarketplaceItems(chain);
		snapshots.push({
			chain,
			fetchedAt: detectedAt,
			items,
		});
	}

	const previousSnapshots = await Promise.all(
		TCJ_MARKETPLACE_CHAINS.map((chain) => loadTcjMarketplaceSnapshot(stateStore, chain)),
	);
	const hasPrevious = previousSnapshots.every((snapshot) => Boolean(snapshot));

	const listedEvents: TcjMarketplaceEvent[] = [];
	const purchasedEvents: TcjMarketplaceEvent[] = [];
	const perChainDiff: Array<{
		chain: TcjMarketplaceChain;
		currentCount: number;
		previousCount: number;
		listedCount: number;
		purchasedCount: number;
	}> = [];

	for (const snapshot of snapshots) {
		const previous = previousSnapshots.find((item) => item?.chain === snapshot.chain) ?? null;
		const currentMap = new Map(snapshot.items.map((item) => [item.id, item] as const));
		const previousMap = new Map((previous?.items ?? []).map((item) => [item.id, item] as const));
		const listed = snapshot.items
			.filter((item) => !previousMap.has(item.id))
			.map((item) => ({ kind: "listed" as const, chain: snapshot.chain, detectedAt, item }));
		const purchased = (previous?.items ?? [])
			.filter((item) => !currentMap.has(item.id))
			.map((item) => ({ kind: "purchased" as const, chain: snapshot.chain, detectedAt, item }));
		listedEvents.push(...listed);
		purchasedEvents.push(...purchased);
		perChainDiff.push({
			chain: snapshot.chain,
			currentCount: snapshot.items.length,
			previousCount: previous?.items?.length ?? 0,
			listedCount: listed.length,
			purchasedCount: purchased.length,
		});
	}

	for (const snapshot of snapshots) {
		await saveTcjMarketplaceSnapshot(stateStore, snapshot);
	}

	if (!hasPrevious) {
		const result = {
			ok: true,
			reason: "tcj_marketplace_initial_snapshot_created",
			commitMode: commit,
			fromSchedule,
			committed: false,
			postedToX: false,
			listedCount: 0,
			purchasedCount: 0,
			eventCount: 0,
			perChain: perChainDiff,
			note: "初回実行のため、比較用スナップショットのみ保存しました。次回実行から差分投稿します。",
		};
		if (logToConsole) console.log(JSON.stringify({ type: "TCJ_MARKETPLACE_SKIP", ...result }, null, 2));
		return result;
	}

	listedEvents.sort((a, b) => compareIsoDesc(a.item.createdAt, b.item.createdAt));
	purchasedEvents.sort((a, b) => compareIsoDesc(a.item.createdAt, b.item.createdAt));
	const allEvents = [...listedEvents, ...purchasedEvents];
	if (allEvents.length === 0) {
		const result = {
			ok: true,
			reason: "tcj_marketplace_no_changes",
			commitMode: commit,
			fromSchedule,
			committed: false,
			postedToX: false,
			listedCount: 0,
			purchasedCount: 0,
			eventCount: 0,
			perChain: perChainDiff,
		};
		if (logToConsole) console.log(JSON.stringify({ type: "TCJ_MARKETPLACE_SKIP", ...result }, null, 2));
		return result;
	}

	const previewMessage = buildTcjMarketplaceDigestMessage({
		listedEvents,
		purchasedEvents,
	});
	let postedToX = false;
	let committed = false;
	let xResponse: unknown = null;
	if (commit) {
		const postResult = await postTweetWithImages(previewMessage, { mainImageUrl: null, lastOneImageUrl: null }, env);
		postedToX = postResult.ok;
		committed = postResult.ok;
		xResponse = postResult;
	}

	const result = {
		ok: true,
		commitMode: commit,
		fromSchedule,
		committed,
		postedToX,
		listedCount: listedEvents.length,
		purchasedCount: purchasedEvents.length,
		eventCount: allEvents.length,
		weightedLength: countXWeightedLength(previewMessage),
		perChain: perChainDiff,
		previewMessage,
		samples: {
			listed: listedEvents.slice(0, 5).map((event) => summarizeTcjMarketplaceEvent(event)),
			purchased: purchasedEvents.slice(0, 5).map((event) => summarizeTcjMarketplaceEvent(event)),
		},
		xResponse,
	};
	if (logToConsole) console.log(JSON.stringify({ type: "TCJ_MARKETPLACE_RESULT", ...result }, null, 2));
	return result;
}

function summarizeTcjMarketplaceEvent(event: TcjMarketplaceEvent): Record<string, unknown> {
	return {
		kind: event.kind,
		chain: event.chain,
		cardName: event.item.cardName,
		price: event.item.currentPrice,
		currencyId: event.item.currentCurrencyId,
		createdAt: event.item.createdAt,
	};
}

function buildTcjMarketplaceDigestMessage(params: {
	listedEvents: TcjMarketplaceEvent[];
	purchasedEvents: TcjMarketplaceEvent[];
}): string {
	if (params.listedEvents.length > 0) {
		const blocks: string[] = [];
		for (const event of params.listedEvents.slice(0, 3)) {
			const nextBlock = buildTcjMarketplaceListedBlock(event);
			const candidate = [...blocks, nextBlock].join("\n\n");
			const withTags = `${candidate}\n\n#TCGSTORE #NFT #ポケカ`;
			if (countXWeightedLength(withTags) > POKECA_TWEET_TEXT_LIMIT) break;
			blocks.push(nextBlock);
		}
		if (blocks.length > 0) {
			return `${blocks.join("\n\n")}\n\n#TCGSTORE #NFT #ポケカ`;
		}
	}

	const purchasedTop = params.purchasedEvents.slice(0, 3);
	if (purchasedTop.length > 0) {
		const primary = purchasedTop[0];
		const cardName = sanitizeCardNameForPost(primary.item.cardName) || "名称不明";
		const price = formatTcjMarketplacePriceLabel(primary.item.currentPrice, primary.item.currentCurrencyId) || "?";
		const chain = primary.chain === "polygon" ? "Polygon" : "HubMainet";
		const url = buildTcjMarketplaceListingUrl(primary.item);
		return [
			"🎉 購入成立",
			"",
			`「${cardName}」`,
			"",
			`💰 ${price} / ${chain}`,
			"",
			"市場が動いてます",
			`🔗 ${url}`,
			"",
			"#TCGSTORE #NFT #ポケカ",
		].join("\n");
	}
	return ["【TCJマーケットプレイス速報】", "変化は検知されませんでした", TCJ_MARKETPLACE_PAGE_URL, "#TCGSTORE #NFT #ポケカ"].join(
		"\n",
	);
}

function buildTcjMarketplaceListedBlock(event: TcjMarketplaceEvent): string {
	const cardName = sanitizeCardNameForPost(event.item.cardName) || "名称不明";
	const price = formatTcjMarketplacePriceLabel(event.item.currentPrice, event.item.currentCurrencyId) || "?";
	const chain = event.chain === "polygon" ? "Polygon" : "HubMainet";
	const url = buildTcjMarketplaceListingUrl(event.item);
	return ["🆕 新着出品", "", `「${cardName}」`, "", `💰 ${price} / ${chain}`, `🔗 ${url}`].join("\n");
}

function buildTcjMarketplaceListingUrl(item: TcjMarketplaceItem): string {
	const id = String(item.id ?? "").trim();
	if (!id) return TCJ_MARKETPLACE_PAGE_URL;
	return `${TCJ_MARKETPLACE_PAGE_URL}?listing_id=${encodeURIComponent(id)}`;
}

function formatTcjMarketplaceEventInline(event: TcjMarketplaceEvent): string {
	const chainLabel = event.chain === "polygon" ? "Polygon" : "HubMainet";
	const card = compactCardLabel(sanitizeCardNameForPost(event.item.cardName) || "名称不明");
	const priceLabel = formatTcjMarketplacePriceLabel(event.item.currentPrice, event.item.currentCurrencyId);
	return `${chainLabel}:${card}${priceLabel ? `(${priceLabel})` : ""}`;
}

function formatTcjMarketplacePriceLabel(price: number | null, currencyId: number | null): string {
	if (price == null || !Number.isFinite(price)) return "";
	const rounded = Number.isInteger(price) ? formatNumber(price) : price.toFixed(2).replace(/\.?0+$/g, "");
	const unit = resolveTcjMarketplaceCurrencyLabel(currencyId);
	return `${rounded}${unit ? ` ${unit}` : ""}`;
}

function resolveTcjMarketplaceCurrencyLabel(currencyId: number | null): string {
	if (currencyId === 5) return "USDC";
	if (currencyId === 6) return "OAS";
	return "";
}

function getTcjMarketplaceApiUrl(chain: TcjMarketplaceChain): string {
	return `https://api.tcgstore.io/api/v1/marketplace?skip=0&limit=100&orderBy=published_at&orderDirection=desc&chain_id=${encodeURIComponent(
		chain,
	)}&search=`;
}

function getTcjMarketplaceSnapshotKey(chain: TcjMarketplaceChain): string {
	return `${TCJ_MARKETPLACE_SNAPSHOT_KEY_PREFIX}${chain}`;
}

async function fetchTcjMarketplaceItems(chain: TcjMarketplaceChain): Promise<TcjMarketplaceItem[]> {
	const endpoint = getTcjMarketplaceApiUrl(chain);
	const response = await fetch(endpoint, {
		headers: {
			accept: "application/json",
			"user-agent": "Mozilla/5.0",
		},
	});
	if (!response.ok) return [];

	const data = (await response.json()) as {
		data?: Array<Record<string, unknown>>;
	};
	const list = Array.isArray(data?.data) ? data.data : [];
	return list
		.map((item) => normalizeTcjMarketplaceItem(item, chain))
		.filter((item): item is TcjMarketplaceItem => Boolean(item));
}

function normalizeTcjMarketplaceItem(
	item: Record<string, unknown>,
	chain: TcjMarketplaceChain,
): TcjMarketplaceItem | null {
	const id = String(item.id ?? "").trim();
	if (!id) return null;
	const createdAt = String(item.created_at ?? "").trim();
	if (!createdAt) return null;
	const card = item.card && typeof item.card === "object" ? (item.card as Record<string, unknown>) : {};
	const cardName = String(card.name ?? "").trim() || `Token #${String(item.token_id ?? "").trim() || "?"}`;
	const chainIdRaw = Number(item.chain_id ?? NaN);
	const listingTypeRaw = Number(item.listing_type ?? NaN);
	const statusRaw = Number(item.status ?? NaN);
	const currentPriceRaw = Number(item.current_price ?? NaN);
	const currentCurrencyIdRaw = Number(item.current_currency_id ?? NaN);
	const imageUrl = normalizeUrl(String(card.main_image_url ?? ""), "https://tcgstore.io");
	return {
		id,
		chain,
		chainId: Number.isFinite(chainIdRaw) ? chainIdRaw : null,
		listingType: Number.isFinite(listingTypeRaw) ? listingTypeRaw : null,
		status: Number.isFinite(statusRaw) ? statusRaw : null,
		tokenId: String(item.token_id ?? "").trim(),
		createdAt,
		cardName,
		currentPrice: Number.isFinite(currentPriceRaw) ? currentPriceRaw : null,
		currentCurrencyId: Number.isFinite(currentCurrencyIdRaw) ? currentCurrencyIdRaw : null,
		mainImageUrl: imageUrl,
	};
}

function compareIsoDesc(aIso: string, bIso: string): number {
	const a = new Date(aIso).getTime();
	const b = new Date(bIso).getTime();
	return b - a;
}

async function loadTcjMarketplaceSnapshot(
	stateStore: StateStore,
	chain: TcjMarketplaceChain,
): Promise<TcjMarketplaceSnapshot | null> {
	const raw = await stateStore.get(getTcjMarketplaceSnapshotKey(chain));
	if (!raw) return null;
	try {
		const parsed = JSON.parse(raw) as TcjMarketplaceSnapshot;
		if (!parsed || !Array.isArray(parsed.items) || parsed.chain !== chain) return null;
		return parsed;
	} catch {
		return null;
	}
}

async function saveTcjMarketplaceSnapshot(stateStore: StateStore, snapshot: TcjMarketplaceSnapshot): Promise<void> {
	await stateStore.put(getTcjMarketplaceSnapshotKey(snapshot.chain), JSON.stringify(snapshot));
}

async function runPokecaSummaryDailySnapshotFetch(
	env: MonitorEnv,
	options: { logToConsole?: boolean; fromSchedule?: boolean } = {},
): Promise<Record<string, unknown>> {
	const { logToConsole = true, fromSchedule = false } = options;
	const items = await fetchPokecaApiItems();
	if (items.length === 0) {
		const result = {
			ok: false,
			reason: "pokeca_snapshot_fetch_failed",
			fromSchedule,
			fetchedItems: 0,
			ranks: [],
		};
		if (logToConsole) console.log(JSON.stringify({ type: "POKECA_SUMMARY_FETCH_BATCH", ...result }, null, 2));
		return result;
	}
	const rankResults: Array<Record<string, unknown>> = [];
	for (const rankTarget of POKECA_SNAPSHOT_RANK_TARGETS) {
		const rankResult = (await runPokecaSummary(env, {
			commit: false,
			logToConsole: false,
			fromSchedule,
			rank: rankTarget,
			preferStoredSnapshot: false,
			persistSnapshotOnly: true,
			preloadedItems: items,
		})) as Record<string, unknown>;
		rankResults.push({
			rankTarget,
			ok: Boolean(rankResult.ok),
			snapshotKey: typeof rankResult.snapshotKey === "string" ? rankResult.snapshotKey : null,
			snapshotCardCount:
				typeof rankResult.snapshotCardCount === "number" ? Number(rankResult.snapshotCardCount) : null,
			reason: typeof rankResult.reason === "string" ? rankResult.reason : null,
		});
	}
	const result = {
		ok: rankResults.some((r) => r.ok === true),
		fromSchedule,
		fetchedItems: items.length,
		ranks: rankResults,
		snapshotTopLimit: POKECA_SNAPSHOT_TOP_LIMIT,
	};
	if (logToConsole) console.log(JSON.stringify({ type: "POKECA_SUMMARY_FETCH_BATCH", ...result }, null, 2));
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

async function runMarketSummary(
	env: MonitorEnv,
	options: { commit?: boolean; logToConsole?: boolean; fromSchedule?: boolean } = {},
): Promise<Record<string, unknown>> {
	const { commit = false, logToConsole = true, fromSchedule = false } = options;
	const stateStore = createStateStore(env);
	let watchlist = await pruneAndPersistWatchlist(stateStore);
	watchlist = watchlist.filter((item) => item.sourceSite === "pokeca-chart");
	const seeded = 0;
	if (watchlist.length === 0) {
		const result = {
			ok: false,
			reason: "watchlist_empty_pokeca_chart_only",
			committed: false,
			postedToX: false,
			fromSchedule,
			seeded,
		};
		if (logToConsole) console.log(JSON.stringify({ type: "MARKET_SUMMARY_SKIP", ...result }, null, 2));
		return result;
	}
	const jstNow = getJstNow();
	const theme = getDailyMarketTheme(jstNow);
	const sorted = sortWatchlistByTheme(watchlist, theme.sortBy, jstNow);
	const picked = sorted.slice(0, 5);
	const meaningfulMoves = picked.filter((item) => hasMeaningfulChangeForSummary(item)).length;
	if (meaningfulMoves < 3) {
		const result = {
			ok: false,
			reason: "market_summary_insufficient_data",
			meaningfulMoves,
			watchlistCount: watchlist.length,
			committed: false,
			postedToX: false,
			fromSchedule,
		};
		if (logToConsole) console.log(JSON.stringify({ type: "MARKET_SUMMARY_SKIP", ...result }, null, 2));
		return result;
	}
	if (picked.length < 3) {
		const result = {
			ok: false,
			reason: "watchlist_not_enough_items_pokeca_chart_only",
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
		seeded,
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

async function runStreamScheduleDailyDigest(
	env: MonitorEnv,
	options: StreamScheduleOptions = {},
): Promise<Record<string, unknown>> {
	const {
		commit = false,
		logToConsole = true,
		fromSchedule = false,
		targetDate = null,
		daysAhead = null,
		respectPostWindow = false,
		force = false,
		now = new Date(),
	} = options;
	const csvUrl = resolveStreamScheduleCsvUrl(env);
	if (!csvUrl) {
		const result = {
			ok: false,
			reason: "missing_stream_schedule_csv_url",
			fromSchedule,
			commitMode: commit,
		};
		if (logToConsole) console.log(JSON.stringify({ type: "STREAM_SCHEDULE_SKIP", ...result }, null, 2));
		return result;
	}

	const targetDateKey = targetDate
		? normalizeStreamScheduleTargetDate(targetDate)
		: getStreamScheduleTargetDateKey(now, resolveStreamScheduleLookaheadDays(env, daysAhead));
	if (!targetDateKey) {
		const result = {
			ok: false,
			reason: "invalid_stream_schedule_target_date",
			fromSchedule,
			commitMode: commit,
			targetDate,
		};
		if (logToConsole) console.log(JSON.stringify({ type: "STREAM_SCHEDULE_SKIP", ...result }, null, 2));
		return result;
	}

	const csvResponse = await fetchStreamScheduleCsv(csvUrl);
	if (!csvResponse.ok || !csvResponse.csv) {
		const result = {
			ok: false,
			reason: "stream_schedule_csv_fetch_failed",
			fromSchedule,
			commitMode: commit,
			targetDate: targetDateKey,
			csvUrl,
			status: csvResponse.status,
		};
		if (logToConsole) console.log(JSON.stringify({ type: "STREAM_SCHEDULE_SKIP", ...result }, null, 2));
		return result;
	}

	const parsed = parseStreamScheduleCsv(csvResponse.csv, now);
	if (!parsed.ok) {
		const result = {
			ok: false,
			reason: "stream_schedule_csv_invalid",
			fromSchedule,
			commitMode: commit,
			targetDate: targetDateKey,
			csvUrl,
			headers: parsed.headers,
			missingHeaders: parsed.missingHeaders,
			skippedRows: parsed.skippedRows,
		};
		if (logToConsole) console.log(JSON.stringify({ type: "STREAM_SCHEDULE_SKIP", ...result }, null, 2));
		return result;
	}

	const entries = parsed.entries.filter((entry) => entry.dateKey === targetDateKey);
	if (entries.length === 0) {
		const result = {
			ok: false,
			reason: "stream_schedule_empty_target_date",
			fromSchedule,
			commitMode: commit,
			targetDate: targetDateKey,
			csvUrl,
			totalEntries: parsed.entries.length,
		};
		if (logToConsole) console.log(JSON.stringify({ type: "STREAM_SCHEDULE_SKIP", ...result }, null, 2));
		return result;
	}

	const postHourJst = resolveStreamSchedulePostHourJst(env);
	const postAt = buildStreamSchedulePostAt(targetDateKey, postHourJst);
	const dueToPost = !respectPostWindow || force || now.getTime() >= postAt.getTime();
	const stateStore = createStateStore(env);
	const postStateKey = `${STREAM_SCHEDULE_POSTED_PREFIX}${targetDateKey}`;
	const alreadyPosted = !force && Boolean(await stateStore.get(postStateKey));
	const preview = buildStreamScheduleMessage(targetDateKey, entries, {
		headerLabel: resolveStreamScheduleHeaderLabel(env),
		footer: resolveStreamScheduleFooter(env),
		hashtags: resolveStreamScheduleHashtags(env),
		linkUrl: resolveStreamScheduleLinkUrl(env),
	});

	let postedToX = false;
	let committed = false;
	let skipped = false;
	let skipReason: string | null = null;
	let xResponse: unknown = null;
	if (commit) {
		if (alreadyPosted) {
			skipped = true;
			skipReason = "already_posted";
		} else if (!dueToPost) {
			skipped = true;
			skipReason = "not_due_yet";
		} else {
			const imageUrl = resolveStreamScheduleImageUrl(entries, env);
			const postResult = await postTweetWithImages(
				preview.message,
				{
					mainImageUrl: imageUrl,
					lastOneImageUrl: null,
				},
				env,
				{
					mainImageAlt: imageUrl ? buildStreamScheduleImageAlt(targetDateKey, entries) : null,
				},
			);
			postedToX = postResult.ok;
			xResponse = postResult;
			if (postResult.ok) {
				await stateStore.put(
					postStateKey,
					JSON.stringify({
						postedAt: now.toISOString(),
						postAt: postAt.toISOString(),
						entryCount: entries.length,
						csvUrl,
					}),
				);
				committed = true;
			} else {
				skipped = true;
				skipReason = "x_post_failed";
			}
		}
	}

	const result = {
		ok: true,
		fromSchedule,
		commitMode: commit,
		committed,
		postedToX,
		skipped,
		skipReason,
		alreadyPosted,
		dueToPost,
		targetDate: targetDateKey,
		targetDateLabel: getStreamScheduleDateLabel(targetDateKey),
		daysAhead:
			targetDate == null ? resolveStreamScheduleLookaheadDays(env, daysAhead) : null,
		postHourJst,
		postAt: postAt.toISOString(),
		csvUrl,
		entryCount: entries.length,
		displayedCount: preview.displayedCount,
		hiddenCount: preview.hiddenCount,
		includedNotes: preview.includedNotes,
		appendedUrl: preview.appendedUrl,
		weightedLength: preview.weightedLength,
		imageUrl: resolveStreamScheduleImageUrl(entries, env),
		headers: parsed.headers,
		skippedRows: parsed.skippedRows,
		entries: entries.map((entry) => ({
			rowNumber: entry.rowNumber,
			timeLabel: entry.timeLabel,
			title: entry.title,
			note: entry.note,
			url: entry.url,
			imageUrl: entry.imageUrl,
			startAt: entry.startAt,
		})),
		previewMessage: preview.message,
		xResponse,
	};
	if (logToConsole) console.log(JSON.stringify({ type: "STREAM_SCHEDULE_RESULT", ...result }, null, 2));
	return result;
}

async function runStreamScheduleReminder(
	env: MonitorEnv,
	options: StreamScheduleOptions = {},
): Promise<Record<string, unknown>> {
	const { commit = false, logToConsole = true, fromSchedule = false, now = new Date() } = options;
	const csvUrl = resolveStreamScheduleCsvUrl(env);
	if (!csvUrl) {
		const result = { ok: false, reason: "missing_stream_schedule_csv_url", fromSchedule, commitMode: commit };
		if (logToConsole) console.log(JSON.stringify({ type: "STREAM_SCHEDULE_REMINDER_SKIP", ...result }, null, 2));
		return result;
	}

	const csvResponse = await fetchStreamScheduleCsv(csvUrl);
	if (!csvResponse.ok || !csvResponse.csv) {
		const result = {
			ok: false,
			reason: "stream_schedule_csv_fetch_failed",
			fromSchedule,
			commitMode: commit,
			csvUrl,
			status: csvResponse.status,
		};
		if (logToConsole) console.log(JSON.stringify({ type: "STREAM_SCHEDULE_REMINDER_SKIP", ...result }, null, 2));
		return result;
	}

	const parsed = parseStreamScheduleCsv(csvResponse.csv, now);
	if (!parsed.ok) {
		const result = {
			ok: false,
			reason: "stream_schedule_csv_invalid",
			fromSchedule,
			commitMode: commit,
			csvUrl,
			headers: parsed.headers,
			missingHeaders: parsed.missingHeaders,
		};
		if (logToConsole) console.log(JSON.stringify({ type: "STREAM_SCHEDULE_REMINDER_SKIP", ...result }, null, 2));
		return result;
	}

	const targetDateKey = getStreamScheduleTargetDateKey(now, 0);
	const leadMinutes = resolveStreamScheduleReminderLeadMinutes(env);
	const nowMs = now.getTime();
	const imminentEntries = parsed.entries
		.filter((entry) => entry.dateKey === targetDateKey)
		.map((entry) => {
			const startMs = new Date(entry.startAt).getTime();
			const minutesUntil = Math.round((startMs - nowMs) / 60000);
			return { entry, minutesUntil };
		})
		.filter((item) => Number.isFinite(item.minutesUntil) && item.minutesUntil > 0 && item.minutesUntil <= leadMinutes)
		.sort((a, b) => a.minutesUntil - b.minutesUntil);

	if (imminentEntries.length === 0) {
		const result = {
			ok: true,
			reason: "no_imminent_stream",
			fromSchedule,
			commitMode: commit,
			csvUrl,
			targetDate: targetDateKey,
			leadMinutes,
		};
		if (logToConsole) console.log(JSON.stringify({ type: "STREAM_SCHEDULE_REMINDER_RESULT", ...result }, null, 2));
		return result;
	}

	const stateStore = createStateStore(env);
	const unpublished: Array<{ entry: StreamScheduleEntry; minutesUntil: number; key: string }> = [];
	for (const item of imminentEntries) {
		const dedupeKey = `${STREAM_SCHEDULE_REMINDER_POSTED_PREFIX}${item.entry.dateKey}:${item.entry.rowNumber}:${item.entry.startAt}`;
		const already = await stateStore.get(dedupeKey);
		if (!already) unpublished.push({ ...item, key: dedupeKey });
	}

	if (unpublished.length === 0) {
		const result = {
			ok: true,
			reason: "already_announced",
			fromSchedule,
			commitMode: commit,
			targetDate: targetDateKey,
			leadMinutes,
		};
		if (logToConsole) console.log(JSON.stringify({ type: "STREAM_SCHEDULE_REMINDER_RESULT", ...result }, null, 2));
		return result;
	}

	const picked = unpublished.slice(0, 3);
	const lines = picked.map((item) => {
		const title = sanitizeStreamScheduleSnippet(item.entry.title).replace(/配信$/u, "");
		return `${item.entry.timeLabel} ${title}がまもなく配信開始`;
	});
	if (unpublished.length > 3) lines.push(`ほか${unpublished.length - 3}枠`);
	const hashtags = resolveStreamScheduleHashtags(env);
	const linkUrl = resolveStreamScheduleLinkUrl(env);
	const messageParts = ["【まもなく配信】", ...lines];
	if (linkUrl) messageParts.push("", linkUrl);
	if (hashtags.length > 0) messageParts.push("", hashtags.join(" "));
	const message = messageParts.join("\n").trim();

	let postedToX = false;
	let committed = false;
	let xResponse: unknown = null;
	let skipReason: string | null = null;
	if (commit) {
		const postResult = await postTweetWithImages(message, { mainImageUrl: null, lastOneImageUrl: null }, env);
		xResponse = postResult;
		postedToX = postResult.ok;
		if (!postResult.ok) {
			skipReason = "x_post_failed";
		} else {
			for (const item of picked) {
				await stateStore.put(
					item.key,
					JSON.stringify({
						postedAt: now.toISOString(),
						startAt: item.entry.startAt,
						title: item.entry.title,
						timeLabel: item.entry.timeLabel,
						csvUrl,
					}),
				);
			}
			committed = true;
		}
	}

	const result = {
		ok: true,
		fromSchedule,
		commitMode: commit,
		committed,
		postedToX,
		skipReason,
		csvUrl,
		targetDate: targetDateKey,
		leadMinutes,
		entryCount: imminentEntries.length,
		newEntryCount: unpublished.length,
		displayedCount: picked.length,
		weightedLength: countXWeightedLength(message),
		previewMessage: message,
		entries: picked.map((item) => ({
			rowNumber: item.entry.rowNumber,
			timeLabel: item.entry.timeLabel,
			title: item.entry.title,
			minutesUntil: item.minutesUntil,
			startAt: item.entry.startAt,
		})),
		xResponse,
	};
	if (logToConsole) console.log(JSON.stringify({ type: "STREAM_SCHEDULE_REMINDER_RESULT", ...result }, null, 2));
	return result;
}

async function fetchStreamScheduleCsv(
	csvUrl: string,
): Promise<{ ok: boolean; status: number; csv?: string | null }> {
	try {
		const response = await fetch(csvUrl, {
			headers: {
				accept: "text/csv,text/plain;q=0.9,*/*;q=0.1",
			},
		});
		const csv = await response.text();
		return {
			ok: response.ok,
			status: response.status,
			csv: response.ok ? csv : null,
		};
	} catch {
		return {
			ok: false,
			status: 0,
			csv: null,
		};
	}
}

function parseStreamScheduleCsv(csv: string, now = new Date()): StreamScheduleParseResult {
	const records = parseCsvRecords(csv);
	if (records.length === 0) {
		return {
			ok: false,
			headers: [],
			entries: [],
			missingHeaders: ["title", "date"],
			skippedRows: [],
		};
	}

	const headers = records[0].map((value, index) => normalizeWhitespace(index === 0 ? stripBom(value) : value));
	const titleIndex = findStreamScheduleHeaderIndex(headers, ["title", "streamtitle", "配信タイトル", "タイトル", "内容"]);
	const datetimeIndex = findStreamScheduleHeaderIndex(headers, [
		"datetime",
		"startat",
		"scheduledat",
		"配信日時",
		"開始日時",
	]);
	const dateIndex = findStreamScheduleHeaderIndex(headers, ["date", "scheduleddate", "streamdate", "日付", "配信日"]);
	const timeIndex = findStreamScheduleHeaderIndex(headers, ["time", "starttime", "配信時間", "時間", "開始時間"]);
	const noteIndex = findStreamScheduleHeaderIndex(headers, [
		"note",
		"memo",
		"description",
		"details",
		"メモ",
		"備考",
		"説明",
	]);
	const urlIndex = findStreamScheduleHeaderIndex(headers, ["url", "streamurl", "link", "配信url", "配信リンク", "リンク"]);
	const imageUrlIndex = findStreamScheduleHeaderIndex(headers, [
		"imageurl",
		"image",
		"thumbnail",
		"thumb",
		"画像url",
		"画像",
		"サムネイル",
	]);
	const missingHeaders: string[] = [];
	if (titleIndex < 0) missingHeaders.push("title");
	if (datetimeIndex < 0 && dateIndex < 0) missingHeaders.push("date");

	const entries: StreamScheduleEntry[] = [];
	const skippedRows: Array<{ rowNumber: number; reason: string }> = [];
	if (missingHeaders.length > 0) {
		const matrixResult = parseStreamScheduleMatrix(records, now);
		if (matrixResult.ok) return matrixResult;
		return {
			ok: false,
			headers,
			entries,
			missingHeaders: [...missingHeaders, ...matrixResult.missingHeaders],
			skippedRows: matrixResult.skippedRows,
		};
	}

	for (let index = 1; index < records.length; index += 1) {
		const row = records[index];
		const rowNumber = index + 1;
		const title = normalizeWhitespace(row[titleIndex] ?? "");
		if (!title) continue;
		const dateText = normalizeWhitespace(
			datetimeIndex >= 0 ? row[datetimeIndex] ?? "" : row[dateIndex] ?? "",
		);
		const timeText = normalizeWhitespace(timeIndex >= 0 ? row[timeIndex] ?? "" : "");
		const parsedDateTime = parseStreamScheduleDateTime(dateText, timeText, now);
		if (!parsedDateTime.startAt) {
			skippedRows.push({ rowNumber, reason: "invalid_date_time" });
			continue;
		}
		const note = normalizeOptionalStreamScheduleField(noteIndex >= 0 ? row[noteIndex] ?? "" : "");
		const url = normalizeOptionalUrl(urlIndex >= 0 ? row[urlIndex] ?? "" : "");
		const imageUrl = normalizeOptionalUrl(imageUrlIndex >= 0 ? row[imageUrlIndex] ?? "" : "");
		entries.push({
			rowNumber,
			dateKey: getJstYmd(new Date(parsedDateTime.startAt)),
			startAt: parsedDateTime.startAt,
			sortTimeValue: parsedDateTime.sortTimeValue,
			timeLabel: parsedDateTime.timeLabel,
			title,
			note,
			url,
			imageUrl,
		});
	}

	entries.sort((a, b) => {
		if (a.dateKey !== b.dateKey) return a.dateKey.localeCompare(b.dateKey);
		const aTime = a.sortTimeValue ?? Number.MAX_SAFE_INTEGER;
		const bTime = b.sortTimeValue ?? Number.MAX_SAFE_INTEGER;
		if (aTime !== bTime) return aTime - bTime;
		return a.rowNumber - b.rowNumber;
	});

	return {
		ok: true,
		headers,
		entries,
		missingHeaders: [],
		skippedRows,
	};
}

function parseStreamScheduleMatrix(records: string[][], now = new Date()): StreamScheduleParseResult {
	const headerRowIndex = findStreamScheduleMatrixHeaderRowIndex(records);
	if (headerRowIndex < 0) {
		return {
			ok: false,
			headers: records[0] ?? [],
			entries: [],
			missingHeaders: ["matrix_date_header"],
			skippedRows: [],
		};
	}
	const dateColumns = buildStreamScheduleMatrixDateColumns(records[headerRowIndex] ?? [], now);
	if (dateColumns.length === 0) {
		return {
			ok: false,
			headers: records[headerRowIndex] ?? [],
			entries: [],
			missingHeaders: ["matrix_date_columns"],
			skippedRows: [],
		};
	}
	const streamRows = extractStreamScheduleMatrixRows(records, headerRowIndex);
	if (streamRows.length === 0) {
		return {
			ok: false,
			headers: records[headerRowIndex] ?? [],
			entries: [],
			missingHeaders: ["matrix_stream_rows"],
			skippedRows: [],
		};
	}

	const entries: StreamScheduleEntry[] = [];
	const skippedRows: Array<{ rowNumber: number; reason: string }> = [];
	for (const streamRow of streamRows) {
		for (const dateColumn of dateColumns) {
			const rawCell = normalizeWhitespace(streamRow.cells[dateColumn.columnIndex] ?? "");
			if (!rawCell) continue;
			if (!hasStreamScheduleHeartMarker(rawCell)) continue;
			const timeParts = extractStreamScheduleTimeParts(rawCell);
			const utcMs = Date.UTC(
				dateColumn.year,
				dateColumn.month - 1,
				dateColumn.day,
				(timeParts?.hour ?? 0) - 9,
				timeParts?.minute ?? 0,
				0,
			);
			const startAt = new Date(utcMs);
			if (!Number.isFinite(startAt.getTime())) {
				skippedRows.push({ rowNumber: streamRow.rowNumber, reason: "invalid_matrix_datetime" });
				continue;
			}
			entries.push({
				rowNumber: streamRow.rowNumber,
				dateKey: dateColumn.dateKey,
				startAt: startAt.toISOString(),
				sortTimeValue: timeParts ? timeParts.hour * 60 + timeParts.minute : null,
				timeLabel: timeParts
					? `${String(timeParts.hour).padStart(2, "0")}:${String(timeParts.minute).padStart(2, "0")}`
					: "時間未定",
				title: streamRow.title,
				note: null,
				url: null,
				imageUrl: null,
			});
		}
	}

	entries.sort((a, b) => {
		if (a.dateKey !== b.dateKey) return a.dateKey.localeCompare(b.dateKey);
		const aTime = a.sortTimeValue ?? Number.MAX_SAFE_INTEGER;
		const bTime = b.sortTimeValue ?? Number.MAX_SAFE_INTEGER;
		if (aTime !== bTime) return aTime - bTime;
		return a.rowNumber - b.rowNumber;
	});

	return {
		ok: entries.length > 0,
		headers: records[headerRowIndex] ?? [],
		entries,
		missingHeaders: entries.length > 0 ? [] : ["matrix_entries_empty"],
		skippedRows,
	};
}

function findStreamScheduleMatrixHeaderRowIndex(records: string[][]): number {
	for (let rowIndex = 0; rowIndex < Math.min(records.length, 15); rowIndex += 1) {
		const row = records[rowIndex] ?? [];
		const dateLikeCount = row.reduce((count, cell) => (isMonthDayCell(cell) ? count + 1 : count), 0);
		const joinedHeader = row.map((cell) => normalizeWhitespace(cell)).join(",");
		const hasStreamerHeader = /配信者|streamer/i.test(joinedHeader);
		if (dateLikeCount >= 10) return rowIndex;
		if (dateLikeCount >= 2 && hasStreamerHeader) return rowIndex;
	}
	return -1;
}

function isMonthDayCell(value: string): boolean {
	return /^(\d{1,2})\/(\d{1,2})$/.test(normalizeWhitespace(value));
}

function buildStreamScheduleMatrixDateColumns(
	headerRow: string[],
	now = new Date(),
): Array<{ columnIndex: number; year: number; month: number; day: number; dateKey: string }> {
	const columns: Array<{ columnIndex: number; month: number; day: number }> = [];
	for (let columnIndex = 0; columnIndex < headerRow.length; columnIndex += 1) {
		const cell = normalizeWhitespace(headerRow[columnIndex] ?? "");
		const match = cell.match(/^(\d{1,2})\/(\d{1,2})$/);
		if (!match) continue;
		const month = Number(match[1]);
		const day = Number(match[2]);
		if (!Number.isFinite(month) || !Number.isFinite(day)) continue;
		if (month < 1 || month > 12 || day < 1 || day > 31) continue;
		columns.push({ columnIndex, month, day });
	}
	if (columns.length === 0) return [];

	const currentYear = getJstNow(now).getUTCFullYear();
	const currentMonth = getJstNow(now).getUTCMonth() + 1;
	let year = columns[0].month > currentMonth + 2 ? currentYear - 1 : currentYear;
	let previousMonth = columns[0].month;

	return columns.map((column, index) => {
		if (index > 0 && column.month < previousMonth) year += 1;
		previousMonth = column.month;
		const dateKey = `${year}-${String(column.month).padStart(2, "0")}-${String(column.day).padStart(2, "0")}`;
		return {
			columnIndex: column.columnIndex,
			year,
			month: column.month,
			day: column.day,
			dateKey,
		};
	});
}

function extractStreamScheduleMatrixRows(
	records: string[][],
	headerRowIndex: number,
): Array<{ rowNumber: number; title: string; cells: string[] }> {
	const namedRows = extractNamedStreamScheduleRows(records, headerRowIndex);
	return namedRows;
}

function extractNamedStreamScheduleRows(
	records: string[][],
	headerRowIndex: number,
): Array<{ rowNumber: number; title: string; cells: string[] }> {
	const picked = new Map<string, { rowNumber: number; title: string; cells: string[] }>();
	for (let rowIndex = headerRowIndex + 1; rowIndex < records.length; rowIndex += 1) {
		const row = records[rowIndex] ?? [];
		const nameCol1 = normalizeWhitespace(row[1] ?? "");
		const nameCol2 = normalizeWhitespace(row[2] ?? "");
		const resolved = resolveStreamScheduleTargetStreamer(nameCol1, nameCol2);
		if (!resolved) continue;
		if (picked.has(resolved)) continue;
		picked.set(resolved, {
			rowNumber: rowIndex + 1,
			title: resolved,
			cells: row,
		});
	}
	return [...picked.values()];
}

function resolveStreamScheduleTargetStreamer(col1: string, col2: string): string | null {
	const values = [normalizeWhitespace(col1).toLowerCase(), normalizeWhitespace(col2).toLowerCase()].filter(Boolean);
	if (values.length === 0) return null;
	for (const item of STREAM_SCHEDULE_TARGET_STREAMERS) {
		for (const alias of item.aliases) {
			const key = alias.toLowerCase();
			if (values.some((value) => value.includes(key))) return item.display;
		}
	}
	return null;
}

function hasStreamScheduleHeartMarker(value: string): boolean {
	const text = String(value ?? "");
	return /[🖤❤♡♥💗💓💖💘❤️]/u.test(text);
}

function parseCsvRecords(csv: string): string[][] {
	const rows: string[][] = [];
	let row: string[] = [];
	let cell = "";
	let inQuotes = false;
	for (let index = 0; index < csv.length; index += 1) {
		const ch = csv[index];
		if (inQuotes) {
			if (ch === '"') {
				if (csv[index + 1] === '"') {
					cell += '"';
					index += 1;
				} else {
					inQuotes = false;
				}
			} else {
				cell += ch;
			}
			continue;
		}
		if (ch === '"') {
			inQuotes = true;
			continue;
		}
		if (ch === ",") {
			row.push(cell);
			cell = "";
			continue;
		}
		if (ch === "\n") {
			row.push(cell);
			rows.push(row);
			row = [];
			cell = "";
			continue;
		}
		if (ch === "\r") {
			if (csv[index + 1] === "\n") index += 1;
			row.push(cell);
			rows.push(row);
			row = [];
			cell = "";
			continue;
		}
		cell += ch;
	}
	if (cell.length > 0 || row.length > 0) {
		row.push(cell);
		rows.push(row);
	}
	return rows.filter((item, index) => index === 0 || item.some((cellValue) => String(cellValue).trim() !== ""));
}

function findStreamScheduleHeaderIndex(headers: string[], aliases: string[]): number {
	const normalizedAliases = new Set(aliases.map((alias) => normalizeStreamScheduleHeader(alias)));
	return headers.findIndex((header) => normalizedAliases.has(normalizeStreamScheduleHeader(header)));
}

function normalizeStreamScheduleHeader(value: string): string {
	return String(value ?? "")
		.trim()
		.toLowerCase()
		.replace(/[\s_\-()（）/\\:：]+/g, "");
}

function parseStreamScheduleDateTime(
	dateText: string,
	timeText: string,
	now = new Date(),
): { startAt: string | null; sortTimeValue: number | null; timeLabel: string } {
	const explicit = parseExplicitTimestamp(dateText);
	if (explicit) {
		const jst = getJstNow(explicit);
		const hour = jst.getUTCHours();
		const minute = jst.getUTCMinutes();
		return {
			startAt: explicit.toISOString(),
			sortTimeValue: hour * 60 + minute,
			timeLabel: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
		};
	}

	const dateParts = parseStreamScheduleDateParts(dateText, now);
	if (!dateParts) {
		return { startAt: null, sortTimeValue: null, timeLabel: "時間未定" };
	}
	const timeParts = extractStreamScheduleTimeParts(timeText) ?? extractStreamScheduleTimeParts(dateText);
	const utcMs = Date.UTC(
		dateParts.year,
		dateParts.month - 1,
		dateParts.day,
		(timeParts?.hour ?? 0) - 9,
		timeParts?.minute ?? 0,
		0,
	);
	return {
		startAt: new Date(utcMs).toISOString(),
		sortTimeValue: timeParts ? timeParts.hour * 60 + timeParts.minute : null,
		timeLabel: timeParts
			? `${String(timeParts.hour).padStart(2, "0")}:${String(timeParts.minute).padStart(2, "0")}`
			: "時間未定",
	};
}

function parseExplicitTimestamp(value: string): Date | null {
	const text = String(value ?? "").trim();
	if (!text || !/[tT ]/.test(text)) return null;
	if (!/(?:[zZ]|[+\-]\d{2}:?\d{2})$/.test(text)) return null;
	const parsed = new Date(text);
	return Number.isFinite(parsed.getTime()) ? parsed : null;
}

function parseStreamScheduleDateParts(
	value: string,
	now = new Date(),
): { year: number; month: number; day: number } | null {
	const source = String(value ?? "")
		.replace(/\(.+?\)/g, " ")
		.replace(/（.+?）/g, " ")
		.replace(/\s+/g, " ")
		.trim();
	if (!source) return null;
	const full = source.match(/(\d{4})[\/\-\.年]\s*(\d{1,2})[\/\-\.月]\s*(\d{1,2})/);
	if (full) {
		return {
			year: Number(full[1]),
			month: Number(full[2]),
			day: Number(full[3]),
		};
	}
	const partial = source.match(/(\d{1,2})[\/\-\.月]\s*(\d{1,2})/);
	if (partial) {
		const currentYear = getJstNow(now).getUTCFullYear();
		return {
			year: currentYear,
			month: Number(partial[1]),
			day: Number(partial[2]),
		};
	}
	return null;
}

function extractStreamScheduleTimeParts(value: string): { hour: number; minute: number } | null {
	const source = String(value ?? "").trim();
	const hhmm = source.match(/(\d{1,2}):(\d{2})/);
	if (hhmm) {
		return {
			hour: Number(hhmm[1]),
			minute: Number(hhmm[2]),
		};
	}
	const jp = source.match(/(\d{1,2})時(?:\s*(\d{1,2})分?)?/);
	if (jp) {
		return {
			hour: Number(jp[1]),
			minute: Number(jp[2] ?? 0),
		};
	}
	return null;
}

function buildStreamScheduleMessage(
	targetDateKey: string,
	entries: StreamScheduleEntry[],
	options: {
		headerLabel?: string | null;
		footer?: string | null;
		hashtags?: string[];
		linkUrl?: string | null;
	} = {},
): {
	message: string;
	weightedLength: number;
	displayedCount: number;
	hiddenCount: number;
	includedNotes: boolean;
	appendedUrl: string | null;
} {
	const headerLabel = normalizeWhitespace(options.headerLabel ?? "") || "配信予定";
	const header = `【${getStreamScheduleDateLabel(targetDateKey)} ${headerLabel}】`;
	const footer = normalizeOptionalStreamScheduleField(options.footer ?? "");
	const hashtags = Array.isArray(options.hashtags) ? options.hashtags.filter(Boolean) : [];
	const linkUrl = resolveStreamScheduleMessageLink(entries, options.linkUrl ?? null);
	const singleEntryTemplate = buildStreamScheduleSingleEntryTemplateMessage(targetDateKey, entries, {
		hashtags,
		linkUrl,
	});
	if (singleEntryTemplate && countXWeightedLength(singleEntryTemplate) <= POKECA_TWEET_TEXT_LIMIT) {
		return {
			message: singleEntryTemplate,
			weightedLength: countXWeightedLength(singleEntryTemplate),
			displayedCount: 1,
			hiddenCount: 0,
			includedNotes: false,
			appendedUrl: linkUrl,
		};
	}
	const noteModes = entries.some((entry) => entry.note) ? [false, true] : [false];
	const footerOptions = footer ? [footer, null] : [null];
	const linkOptions = linkUrl ? [linkUrl, null] : [null];

	for (const includeNotes of noteModes) {
		for (let visibleCount = entries.length; visibleCount >= 1; visibleCount -= 1) {
			const hiddenCount = entries.length - visibleCount;
			const bodyLines = buildStreamScheduleBodyLines(entries.slice(0, visibleCount), includeNotes, hiddenCount);
			for (const footerValue of footerOptions) {
				for (const linkValue of linkOptions) {
					const message = assembleStreamScheduleMessage(header, bodyLines, footerValue, linkValue, hashtags);
					const weightedLength = countXWeightedLength(message);
					if (weightedLength <= POKECA_TWEET_TEXT_LIMIT) {
						return {
							message,
							weightedLength,
							displayedCount: visibleCount,
							hiddenCount,
							includedNotes: includeNotes,
							appendedUrl: linkValue,
						};
					}
				}
			}
		}
	}

	const first = entries[0];
	const fallbackLine = buildStreamScheduleEntryLine(first, false, true);
	const fallbackMessage = assembleStreamScheduleMessage(header, [fallbackLine], null, null, hashtags);
	return {
		message: fallbackMessage,
		weightedLength: countXWeightedLength(fallbackMessage),
		displayedCount: 1,
		hiddenCount: Math.max(0, entries.length - 1),
		includedNotes: false,
		appendedUrl: null,
	};
}

function buildStreamScheduleSingleEntryTemplateMessage(
	targetDateKey: string,
	entries: StreamScheduleEntry[],
	options: {
		hashtags: string[];
		linkUrl: string | null;
	},
): string | null {
	if (entries.length !== 1) return null;
	const entry = entries[0];
	const name = sanitizeStreamScheduleSnippet(entry.title).replace(/配信$/u, "");
	if (!name) return null;
	const dateLabel = getStreamScheduleDateLabel(targetDateKey);
	const header = `【${dateLabel} ${entry.timeLabel} 配信予定】`;
	const templates = [
		`今夜は${name}が配信します✨\n何が出るかは開けてからのお楽しみ…！\nポケカ開封、ぜひ見届けてください🔥`,
		`今夜は${name}がポケカ開封ライブをお届け！🔥\n神引きはあるのか…！？\nリアルタイムで見届けてください✨`,
	];
	const pickIndex = hashForStreamTemplate(`${targetDateKey}:${name}`) % templates.length;
	const messageParts = [header, templates[pickIndex]];
	if (options.linkUrl) messageParts.push("", options.linkUrl);
	if (options.hashtags.length > 0) messageParts.push("", options.hashtags.join(" "));
	return messageParts.join("\n").trim();
}

function hashForStreamTemplate(input: string): number {
	let hash = 0;
	for (const ch of input) {
		hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
	}
	return hash;
}

function buildStreamScheduleBodyLines(
	entries: StreamScheduleEntry[],
	includeNotes: boolean,
	hiddenCount: number,
): string[] {
	const lines = entries.map((entry) => buildStreamScheduleEntryLine(entry, includeNotes, false));
	if (hiddenCount > 0) {
		lines.push(`ほか${hiddenCount}枠`);
	}
	return lines;
}

function buildStreamScheduleEntryLine(
	entry: StreamScheduleEntry,
	includeNotes: boolean,
	compact: boolean,
): string {
	const titleLimit = compact ? 26 : includeNotes ? 32 : 44;
	const noteLimit = compact ? 12 : 18;
	const title = compactStreamScheduleText(entry.title, titleLimit);
	const baseTitle = title.replace(/配信$/u, "");
	let line = `${entry.timeLabel} 本日は${baseTitle}が配信します♪`.trim();
	if (includeNotes && entry.note) {
		line += `（${compactStreamScheduleText(entry.note, noteLimit)}）`;
	}
	return line;
}

function compactStreamScheduleText(value: string, maxLen: number): string {
	const normalized = sanitizeStreamScheduleSnippet(value);
	if (normalized.length <= maxLen) return normalized;
	return `${normalized.slice(0, Math.max(1, maxLen - 1)).trimEnd()}…`;
}

function sanitizeStreamScheduleSnippet(value: string): string {
	return String(value ?? "")
		.replace(/https?:\/\/\S+/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

function assembleStreamScheduleMessage(
	header: string,
	bodyLines: string[],
	footer: string | null,
	linkUrl: string | null,
	hashtags: string[],
): string {
	const lines: string[] = [header, ...bodyLines];
	if (footer) {
		lines.push("", footer);
	}
	if (linkUrl) {
		lines.push("", linkUrl);
	}
	if (hashtags.length > 0) {
		lines.push("", hashtags.join(" "));
	}
	return lines.join("\n").trim();
}

function normalizeStreamScheduleTargetDate(value: string): string | null {
	const trimmed = String(value ?? "").trim();
	const match = trimmed.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
	if (!match) return null;
	return `${match[1]}-${String(Number(match[2])).padStart(2, "0")}-${String(Number(match[3])).padStart(2, "0")}`;
}

function getStreamScheduleTargetDateKey(now = new Date(), daysAhead = 0): string {
	const jst = getJstNow(now);
	jst.setUTCDate(jst.getUTCDate() + daysAhead);
	return `${jst.getUTCFullYear()}-${String(jst.getUTCMonth() + 1).padStart(2, "0")}-${String(
		jst.getUTCDate(),
	).padStart(2, "0")}`;
}

function buildStreamSchedulePostAt(targetDateKey: string, postHourJst: number): Date {
	const match = targetDateKey.match(/^(\d{4})-(\d{2})-(\d{2})$/);
	if (!match) return new Date(0);
	const utcMs = Date.UTC(
		Number(match[1]),
		Number(match[2]) - 1,
		Number(match[3]),
		postHourJst - 9,
		0,
		0,
	);
	return new Date(utcMs);
}

function getStreamScheduleDateLabel(targetDateKey: string): string {
	const match = targetDateKey.match(/^(\d{4})-(\d{2})-(\d{2})$/);
	if (!match) return targetDateKey;
	const utcMs = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]), -9, 0, 0);
	const jst = getJstNow(new Date(utcMs));
	return `${jst.getUTCMonth() + 1}/${jst.getUTCDate()}(${JST_WEEKDAY_LABELS[jst.getUTCDay()]})`;
}

function resolveStreamSchedulePostHourJst(env: MonitorEnv): number {
	const parsed = Number(env.STREAM_SCHEDULE_POST_HOUR_JST ?? STREAM_SCHEDULE_DEFAULT_POST_HOUR_JST);
	if (!Number.isFinite(parsed)) return STREAM_SCHEDULE_DEFAULT_POST_HOUR_JST;
	return Math.max(0, Math.min(23, Math.trunc(parsed)));
}

function resolveStreamScheduleCsvUrl(env: MonitorEnv): string {
	const raw = String(env.STREAM_SCHEDULE_CSV_URL ?? STREAM_SCHEDULE_DEFAULT_CSV_URL).trim();
	if (!raw) return "";
	const normalized = convertGoogleSheetEditUrlToCsv(raw);
	return normalizeOptionalUrl(normalized) ?? "";
}

function convertGoogleSheetEditUrlToCsv(url: string): string {
	const raw = String(url ?? "").trim();
	const match = raw.match(/https:\/\/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9-_]+)\/edit(?:\?([^#]*))?(?:#gid=(\d+))?/);
	if (!match) return raw;
	const spreadsheetId = match[1];
	const query = new URLSearchParams(match[2] ?? "");
	const gidFromQuery = query.get("gid");
	const gidFromHash = match[3] ?? null;
	const gid = gidFromQuery || gidFromHash || "0";
	return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${encodeURIComponent(gid)}`;
}

function resolveStreamScheduleLookaheadDays(env: MonitorEnv, override: number | null): number {
	const raw = override ?? Number(env.STREAM_SCHEDULE_LOOKAHEAD_DAYS ?? STREAM_SCHEDULE_DEFAULT_LOOKAHEAD_DAYS);
	if (!Number.isFinite(raw)) return STREAM_SCHEDULE_DEFAULT_LOOKAHEAD_DAYS;
	return Math.max(0, Math.min(7, Math.trunc(raw)));
}

function resolveStreamScheduleReminderLeadMinutes(env: MonitorEnv): number {
	const raw = Number(env.STREAM_SCHEDULE_REMINDER_LEAD_MINUTES ?? STREAM_SCHEDULE_DEFAULT_REMINDER_LEAD_MINUTES);
	if (!Number.isFinite(raw)) return STREAM_SCHEDULE_DEFAULT_REMINDER_LEAD_MINUTES;
	return Math.max(1, Math.min(60, Math.trunc(raw)));
}

function resolveStreamScheduleHeaderLabel(env: MonitorEnv): string | null {
	return normalizeOptionalStreamScheduleField(env.STREAM_SCHEDULE_HEADER ?? "配信時刻予定");
}

function resolveStreamScheduleFooter(env: MonitorEnv): string | null {
	return normalizeOptionalStreamScheduleField(env.STREAM_SCHEDULE_FOOTER ?? "");
}

function resolveStreamScheduleHashtags(env: MonitorEnv): string[] {
	const raw = String(env.STREAM_SCHEDULE_HASHTAGS ?? "配信予定").trim();
	if (!raw) return [];
	const tags = raw
		.split(/[,\s]+/)
		.map((tag) => tag.trim())
		.filter(Boolean)
		.map((tag) => (tag.startsWith("#") ? tag : `#${tag}`));
	return [...new Set(tags)].slice(0, 3);
}

function resolveStreamScheduleLinkUrl(env: MonitorEnv): string | null {
	return normalizeOptionalUrl(env.STREAM_SCHEDULE_LINK_URL ?? STREAM_SCHEDULE_DEFAULT_LINK_URL);
}

function resolveStreamScheduleImageUrl(entries: StreamScheduleEntry[], env: MonitorEnv): string | null {
	for (const entry of entries) {
		if (entry.imageUrl) return entry.imageUrl;
	}
	return normalizeOptionalUrl(env.STREAM_SCHEDULE_IMAGE_URL ?? "");
}

function resolvePokecaSummaryTemplateImageUrl(env: MonitorEnv, overrideUrl: string | null): string | null {
	const override = normalizeOptionalUrl(overrideUrl ?? "");
	if (override) return override;
	return normalizeOptionalUrl(env.POKECA_SUMMARY_TEMPLATE_IMAGE_URL ?? "");
}

function resolveStreamScheduleMessageLink(entries: StreamScheduleEntry[], fallbackUrl: string | null): string | null {
	if (fallbackUrl) return fallbackUrl;
	const uniqueUrls = [...new Set(entries.map((entry) => entry.url).filter((value): value is string => Boolean(value)))];
	return uniqueUrls.length === 1 ? uniqueUrls[0] : null;
}

function buildStreamScheduleImageAlt(targetDateKey: string, entries: StreamScheduleEntry[]): string {
	const parts = entries
		.slice(0, 6)
		.map((entry) => `${entry.timeLabel} ${sanitizeStreamScheduleSnippet(entry.title)}`)
		.join("。");
	return `${getStreamScheduleDateLabel(targetDateKey)}の配信予定。${parts}`.slice(0, 1000);
}

function normalizeOptionalStreamScheduleField(value: string): string | null {
	const normalized = normalizeWhitespace(String(value ?? ""));
	return normalized || null;
}

function normalizeOptionalUrl(value: string): string | null {
	const normalized = String(value ?? "").trim();
	if (!/^https?:\/\//i.test(normalized)) return null;
	return normalized;
}

function normalizeWhitespace(value: string): string {
	return String(value ?? "").replace(/\s+/g, " ").trim();
}

function stripBom(value: string): string {
	return String(value ?? "").replace(/^\uFEFF/, "");
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

function getJstYmd(now = new Date()): string {
	const jst = getJstNow(now);
	const y = String(jst.getUTCFullYear());
	const m = String(jst.getUTCMonth() + 1).padStart(2, "0");
	const d = String(jst.getUTCDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
}

function getJstYmdShifted(now: Date, offsetDays: number): string {
	const jst = getJstNow(now);
	jst.setUTCDate(jst.getUTCDate() + Math.trunc(offsetDays));
	const y = String(jst.getUTCFullYear());
	const m = String(jst.getUTCMonth() + 1).padStart(2, "0");
	const d = String(jst.getUTCDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
}

function parsePokecaRankTarget(raw: string | null | undefined): PokecaRankTarget | null {
	const value = String(raw ?? "").trim().toLowerCase();
	if (value === "rank_rise_7" || value === "rise_7") return "rank_rise_7";
	if (value === "rank_fall_7" || value === "fall_7") return "rank_fall_7";
	if (value === "rank_vol" || value === "vol") return "rank_vol";
	return null;
}

function normalizePokecaRankTarget(raw: string | null | undefined): PokecaRankTarget {
	return parsePokecaRankTarget(raw) ?? "rank_rise_7";
}

function resolvePokecaRankTarget(
	rawRank: string | null | undefined,
	_jstDate: Date,
): { rankTarget: PokecaRankTarget; rankSource: "param" | "auto_weekday" | "default" | "ai_theme" } {
	const parsed = parsePokecaRankTarget(rawRank);
	if (parsed) {
		return { rankTarget: parsed, rankSource: "param" };
	}
	return { rankTarget: "rank_vol", rankSource: "default" };
}

function isDirectionalPokecaRankTarget(rankTarget: PokecaRankTarget): boolean {
	return rankTarget === "rank_rise_7" || rankTarget === "rank_fall_7";
}

async function getPokecaThemeHistory(stateStore: StateStore): Promise<PokecaRankTarget[]> {
	const raw = await stateStore.get(POKECA_SUMMARY_THEME_HISTORY_KEY);
	if (!raw) return [];
	try {
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		return parsed
			.map((v) => parsePokecaRankTarget(String(v ?? "")))
			.filter((v): v is PokecaRankTarget => Boolean(v))
			.slice(0, 14);
	} catch {
		return [];
	}
}

async function appendPokecaThemeHistory(stateStore: StateStore, rankTarget: PokecaRankTarget): Promise<void> {
	const current = await getPokecaThemeHistory(stateStore);
	const next = [rankTarget, ...current].slice(0, 14);
	await stateStore.put(POKECA_SUMMARY_THEME_HISTORY_KEY, JSON.stringify(next));
}

async function getPokecaOriginalThemeHistory(stateStore: StateStore): Promise<string[]> {
	const raw = await stateStore.get(POKECA_SUMMARY_ORIGINAL_THEME_HISTORY_KEY);
	if (!raw) return [];
	try {
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		return parsed
			.map((v) => String(v ?? "").trim())
			.filter(Boolean)
			.slice(0, 14);
	} catch {
		return [];
	}
}

async function appendPokecaOriginalThemeHistory(stateStore: StateStore, themeKey: string): Promise<void> {
	const current = await getPokecaOriginalThemeHistory(stateStore);
	const next = [String(themeKey ?? "").trim(), ...current].filter(Boolean).slice(0, 14);
	await stateStore.put(POKECA_SUMMARY_ORIGINAL_THEME_HISTORY_KEY, JSON.stringify(next));
}

async function choosePokecaOriginalCandidateByAi(
	env: MonitorEnv,
	stateStore: StateStore,
	now: Date,
	candidates: PokecaOriginalCandidate[],
): Promise<{ ok: boolean; key?: string; reason?: string; model?: string | null }> {
	if (candidates.length === 0) return { ok: false, reason: "no_candidates", model: null };
	if (!isPokecaSummaryAiEnabled(env)) return { ok: false, reason: "pokeca_summary_ai_disabled", model: null };
	if (!env.ANTHROPIC_API_KEY) return { ok: false, reason: "missing_anthropic_api_key", model: null };
	const model = resolvePokecaSummaryModel(env);
	const history = await getPokecaOriginalThemeHistory(stateStore);
	const historyLabel = history.length > 0 ? history.join(", ") : "none";
	const dateLabel = formatJstDateLabel(now);
	const candidateBlock = candidates
		.map((c) => {
			const sample = c.rows
				.slice(0, 2)
				.map((r) => `${stripPokecaCardVariant(r.cardName)} ${formatSignedNumber(r.deltaPrice, "円")} ${formatSignedPercent(r.deltaPct)}`)
				.join(" / ");
			return `- key=${c.key} label=${c.label} sample=${sample}`;
		})
		.join("\n");
	const prompt = [
		"自前スナップショット比較の投稿テーマを1つ選んでください。",
		`日付: ${dateLabel}`,
		`直近テーマ履歴(新しい順): ${historyLabel}`,
		"",
		"候補:",
		candidateBlock,
		"",
		"ルール:",
		"- 同じキーの連投は避ける",
		"- 読者にとって変化が分かりやすいものを優先",
		"- 出力は key のみ1語",
	].join("\n");
	const response = await callAnthropicTextGeneration({
		system: "候補キーを1語で返すアシスタント。",
		prompt,
		apiKey: env.ANTHROPIC_API_KEY,
		model,
	});
	if (!response.ok || !response.text) return { ok: false, reason: response.reason ?? "anthropic_failed", model };
	const key = String(response.text).trim().split(/\s+/)[0] ?? "";
	if (!candidates.some((c) => c.key === key)) return { ok: false, reason: "ai_candidate_parse_failed", model };
	return { ok: true, key, model };
}

async function choosePokecaRankTargetByAi(
	env: MonitorEnv,
	stateStore: StateStore,
	now: Date,
): Promise<{
	ok: boolean;
	rankTarget?: PokecaRankTarget;
	reason?: string;
	model?: string | null;
	historyGuardApplied?: boolean;
}> {
	if (!isPokecaSummaryAiEnabled(env)) return { ok: false, reason: "pokeca_summary_ai_disabled", model: null };
	if (!env.ANTHROPIC_API_KEY) return { ok: false, reason: "missing_anthropic_api_key", model: null };
	const model = resolvePokecaSummaryModel(env);
	const history = await getPokecaThemeHistory(stateStore);
	const historyLabel = history.length > 0 ? history.join(", ") : "none";
	const dateLabel = formatJstDateLabel(now);
	const prompt = [
		"あなたはポケカ投稿の編集者です。",
		"今日の投稿テーマを1つ選んでください。",
		"",
		`日付: ${dateLabel}`,
		`直近テーマ履歴(新しい順): ${historyLabel}`,
		"",
		"候補キー:",
		"- rank_rise_7（7日変動の高騰）",
		"- rank_fall_7（7日変動の下落）",
		"- rank_vol（取引件数）",
		"",
		"ルール:",
		"- 同じテーマの連投は避ける",
		"- 直近7日で少ないテーマを優先",
		"- 出力は候補キー1語のみ",
	].join("\n");
	const response = await callAnthropicTextGeneration({
		system: "出力は指定キー1語のみ返すアシスタント。",
		prompt,
		apiKey: env.ANTHROPIC_API_KEY,
		model,
	});
	if (!response.ok || !response.text) return { ok: false, reason: response.reason ?? "anthropic_failed", model };
	const picked = parsePokecaRankTarget(String(response.text).trim().split(/\s+/)[0] ?? "");
	if (!picked) return { ok: false, reason: "ai_theme_parse_failed", model };
	// 直近で上昇/下落系が続いている場合は、取引件数テーマへ寄せて連投感を避ける。
	const recentDirectionalCount = history
		.slice(0, 3)
		.filter((v) => v === "rank_rise_7" || v === "rank_fall_7").length;
	if (
		recentDirectionalCount >= 2 &&
		(picked === "rank_rise_7" || picked === "rank_fall_7")
	) {
		return { ok: true, rankTarget: "rank_vol", model, historyGuardApplied: true };
	}
	return { ok: true, rankTarget: picked, model, historyGuardApplied: false };
}

function getPokecaRankLabel(rank: PokecaRankTarget): string {
	if (rank === "rank_fall_7") return "下落ランキング";
	if (rank === "rank_vol") return "市場取引件数ランキング";
	return "高騰ランキング";
}

function getPokecaRankSortValue(item: PokecaApiItem, rank: PokecaRankTarget): number {
	const priceInfo0 = item.arrayPriceInfo?.["0"];
	if (rank === "rank_fall_7") {
		const riseFall = Number(priceInfo0?.fRiseFallRate7 ?? Number.POSITIVE_INFINITY);
		return Number.isFinite(riseFall) ? riseFall : Number.POSITIVE_INFINITY;
	}
	if (rank === "rank_vol") {
		const volume = Number(item.nVolume ?? Number.NEGATIVE_INFINITY);
		return Number.isFinite(volume) ? volume : Number.NEGATIVE_INFINITY;
	}
	const riseFall = Number(priceInfo0?.fRiseFallRate7 ?? Number.NEGATIVE_INFINITY);
	return Number.isFinite(riseFall) ? riseFall : Number.NEGATIVE_INFINITY;
}

function getPokecaSummaryPrice(item: PokecaApiItem): number | null {
	const info = item.arrayPriceInfo?.["0"];
	const candidates = [info?.nPriceRecent];
	for (const c of candidates) {
		const n = Number(c ?? NaN);
		if (Number.isFinite(n) && n > 0) return n;
	}
	return null;
}

function normalizePokecaCardUrl(slug: string): string {
	const normalizedSlug = String(slug ?? "").replace(/^\/+|\/+$/g, "");
	return `${POKECA_CHART_URL_ORIGIN}${normalizedSlug}/`;
}

function compactPokecaRankCardName(cardName: string, maxLen: number): string {
	const cleaned = String(cardName ?? "").replace(/\s+/g, " ").trim();
	return cleaned.length > maxLen ? `${cleaned.slice(0, maxLen)}…` : cleaned;
}

function stripPokecaCardVariant(cardName: string): string {
	return String(cardName ?? "")
		.replace(/\s*\[[^\]]+\]\s*$/u, "")
		.replace(/\s+/g, " ")
		.trim();
}

function extractPokecaCardVariant(cardName: string): string | null {
	const m = String(cardName ?? "").match(/\[([^\]]+)\]\s*$/u);
	const value = String(m?.[1] ?? "").trim();
	return value || null;
}

function buildPokecaDisplayNames(cardNames: string[]): string[] {
	const names = cardNames.map((name) => String(name ?? ""));
	const baseCounts = new Map<string, number>();
	for (const name of names) {
		const base = stripPokecaCardVariant(name);
		baseCounts.set(base, (baseCounts.get(base) ?? 0) + 1);
	}
	return names.map((name) => {
		const base = stripPokecaCardVariant(name);
		if ((baseCounts.get(base) ?? 0) <= 1) return base;
		const variant = extractPokecaCardVariant(name);
		return variant ? `${base} [${variant}]` : base;
	});
}

function normalizePokecaCardNameForCompare(cardName: string): string {
	return stripPokecaCardVariant(cardName)
		.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
		.replace(/\s+/g, "")
		.toLowerCase();
}

function extractTopRankNamesFromMessage(message: string): string[] {
	return String(message ?? "")
		.split("\n")
		.map((line) => line.trim())
		.map((line) => {
			const matched = line.match(/^\d+\.\s+(.+?)\s+\d[\d,]*円/u);
			return matched?.[1] ?? null;
		})
		.filter((name): name is string => Boolean(name))
		.slice(0, 3)
		.map((name) => normalizePokecaCardNameForCompare(name));
}

function isXSingleWeightCodePoint(codePoint: number): boolean {
	return (
		(codePoint >= 0x0000 && codePoint <= 0x10ff) ||
		(codePoint >= 0x2000 && codePoint <= 0x200d) ||
		(codePoint >= 0x2010 && codePoint <= 0x201f) ||
		(codePoint >= 0x2032 && codePoint <= 0x2037)
	);
}

function countXWeightedLength(text: string): number {
	const source = String(text ?? "");
	const urlRegex = /https?:\/\/\S+/g;
	let total = 0;
	let cursor = 0;
	let match: RegExpExecArray | null;
	while ((match = urlRegex.exec(source)) !== null) {
		total += countXWeightedLengthWithoutUrl(source.slice(cursor, match.index));
		total += 23;
		cursor = match.index + match[0].length;
	}
	total += countXWeightedLengthWithoutUrl(source.slice(cursor));
	return total;
}

function countXWeightedLengthWithoutUrl(text: string): number {
	let total = 0;
	for (const ch of String(text ?? "")) {
		const codePoint = ch.codePointAt(0) ?? 0;
		total += isXSingleWeightCodePoint(codePoint) ? 1 : 2;
	}
	return total;
}

function buildPokecaSummarySample(): string {
	const lines: string[] = ["【ポケカ 高騰ランキング -フリマ- TOP10】"];
	lines.push("ここ一週間で、ピカチュウ系カードの高騰が目立つようです。", "");
	const samples = [
		"リーリエ [SM4+ 119/114]",
		"アセロラ [SM2+ 056/049]",
		"ルザミーネ [SM4A 055/050]",
		"マリィ [S4a 198/190]",
		"ナンジャモ [SV2D 096/071]",
		"エリカのおもてなし [SM9 107/095]",
		"シロナ [SM5M 070/066]",
		"かんこうきゃく [SM12a 192/173]",
		"ブラッキーVMAX [S6a 095/069]",
		"ピカチュウ [M 001/002]",
	];
	for (const [idx, cardName] of samples.entries()) {
		lines.push(`${idx + 1}. ${compactPokecaRankCardName(cardName, 12)}`);
	}
	lines.push("", "#ポケカ");
	return lines.join("\n");
}

function buildPokecaSummaryLead(
	cards: PokecaSummaryCard[],
	rankTarget: PokecaRankTarget,
	now = new Date(),
): string | null {
	const jst = getJstNow(now);
	const dow = jst.getUTCDay();
	if (rankTarget === "rank_rise_7") {
		const topCards = cards.slice(0, POKECA_POST_RANK_LIMIT);
		const pikachuCount = topCards.filter((card) => /ピカチュウ/i.test(card.cardName)).length;
		if (pikachuCount >= 3) {
			return "ピカチュウ系が強め。";
		}
		return "上振れ銘柄を追跡。";
	}
	if (rankTarget === "rank_fall_7") {
		return "調整幅が大きい銘柄。";
	}
	if (dow === 0) {
		return "日曜は取引集中銘柄。";
	}
	return "取引集中銘柄を確認。";
}

function formatPokecaSummaryLeadLine(text: string): string {
	const cleaned = String(text ?? "")
		.trim()
		.replace(/^ひとこと[:：]\s*/u, "")
		.replace(/^[（(]+|[）)]+$/g, "")
		.trim();
	return `（${cleaned}）`;
}

function getPokecaRankWindowLabel(rankTarget: PokecaRankTarget): string {
	if (rankTarget === "rank_rise_7" || rankTarget === "rank_fall_7") return "過去7日";
	return "当日集計";
}

function getPokecaPostTitle(
	rankTarget: PokecaRankTarget,
	now = new Date(),
	cards: PokecaSummaryCard[] = [],
): string {
	const jst = getJstNow(now);
	const variant = jst.getUTCDate() % 3;
	const topName = String(cards[0]?.cardName ?? "");
	if (rankTarget === "rank_fall_7") {
		const fallTitles = ["ポケカ下落トレンド監視", "ポケカ調整幅ウォッチ", "ポケカ下落アラート"];
		return fallTitles[variant] ?? fallTitles[0];
	}
	if (rankTarget === "rank_vol") {
		const volTitles = ["ポケカ市場取引注目ウォッチ", "ポケカ市場出来高トレンド", "ポケカ市場取引集中ランキング"];
		return volTitles[variant] ?? volTitles[0];
	}
	if (/ピカチュウ/i.test(topName)) {
		return "ポケカ上昇トレンド監視";
	}
	const riseTitles = ["ポケカ上昇トレンド監視", "ポケカ急伸ウォッチ", "ポケカ値動き上振れ速報"];
	return riseTitles[variant] ?? riseTitles[0];
}

function buildPokecaSummaryImageAlt(cardName: string): string {
	return `カード画像: ${String(cardName ?? "").trim()}`;
}

const TCGSTORE_LOGO_SVG = `<svg width="156" height="22" viewBox="0 0 156 22" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_19_5)"><path d="M33.052 21.7042V7.5543H28.3076V4.14027H41.513V7.5543H36.718V21.7042H33.052Z" fill="white"/><path d="M50.3253 22.0002C47.646 22.0002 45.4211 21.126 43.6466 19.3777C41.8721 17.6294 40.9848 15.4776 40.9848 12.9224C40.9848 10.3672 41.8721 8.21345 43.6466 6.46706C45.4211 4.71874 47.646 3.84458 50.3253 3.84458C52.3494 3.84458 54.1707 4.42479 55.7853 5.58905C57.3999 6.7514 58.4588 8.26533 58.9619 10.1289H55.0209C54.6699 9.27205 54.0537 8.58617 53.1743 8.07512C52.2968 7.56408 51.3452 7.30855 50.3253 7.30855C48.6522 7.30855 47.2872 7.84458 46.2323 8.91662C45.1773 9.98867 44.6508 11.3239 44.6508 12.9243C44.6508 14.5247 45.1773 15.8599 46.2323 16.932C47.2872 18.004 48.6503 18.5401 50.3253 18.5401C51.3452 18.5401 52.2968 18.2845 53.1743 17.7735C54.0537 17.2624 54.668 16.5785 55.0209 15.7197H58.9619C58.4607 17.5833 57.3999 19.0972 55.7853 20.2596C54.1688 21.4219 52.3494 22.004 50.3253 22.004V22.0002Z" fill="white"/><path d="M69.7632 22C67.0683 22 64.8297 21.1258 63.0474 19.3775C61.2651 17.6292 60.3739 15.4774 60.3739 12.9222C60.3739 10.367 61.2612 8.21326 63.0357 6.46686C64.8102 4.71854 67.0352 3.84438 69.7145 3.84438C71.5884 3.84438 73.3083 4.35158 74.8741 5.36599C76.438 6.3804 77.5222 7.70413 78.1267 9.33525H73.9596C73.5247 8.70893 72.9261 8.21326 72.1656 7.85206C71.4031 7.48895 70.588 7.30836 69.7183 7.30836C68.0452 7.30836 66.6803 7.84438 65.6253 8.91643C64.5704 9.98847 64.0438 11.3237 64.0438 12.9241C64.0438 14.5245 64.5704 15.8597 65.6253 16.9318C66.6803 18.0038 68.0608 18.5399 69.7671 18.5399C71.1906 18.5399 72.3333 18.1902 73.1952 17.489C74.0571 16.7877 74.5895 15.8117 74.7903 14.5572H69.342V11.1931H78.5558C78.7566 12.9414 78.6649 14.5168 78.2788 15.9174C77.8927 17.3199 77.2824 18.4534 76.4458 19.318C75.6093 20.1844 74.6206 20.8473 73.4818 21.3103C72.343 21.7733 71.1048 22.0038 69.7651 22.0038L69.7632 22Z" fill="white"/><path d="M89.7434 21.9999C87.7173 21.9999 86.0852 21.4274 84.8469 20.2804C83.6087 19.1353 82.9554 17.7943 82.8891 16.2612H86.5298C86.6643 17.0373 87.0231 17.6348 87.6101 18.0537C88.197 18.4744 88.9068 18.6838 89.7453 18.6838C90.498 18.6838 91.1084 18.5225 91.5783 18.2016C92.0463 17.8808 92.2823 17.4466 92.2823 16.9029C92.2823 15.9307 91.4867 15.2199 89.8974 14.7761L88.0137 14.2323C86.5571 13.8193 85.4202 13.1776 84.5993 12.3034C83.7783 11.4293 83.3591 10.3419 83.3435 9.03926C83.3435 7.43888 83.8875 6.17471 84.9756 5.24291C86.0637 4.31112 87.5106 3.84618 89.3183 3.84618C91.1259 3.84618 92.6235 4.38605 93.7623 5.46578C94.9011 6.54551 95.5037 7.78662 95.57 9.18912H91.9547C91.7694 8.49556 91.436 7.98643 90.9504 7.65598C90.4649 7.32553 89.9208 7.16222 89.3183 7.16222C88.6494 7.16222 88.0995 7.30631 87.6744 7.5945C87.2493 7.88268 87.0251 8.2823 87.0095 8.79335C86.9919 9.32168 87.1674 9.75012 87.536 10.0806C87.9045 10.411 88.4739 10.6819 89.2442 10.8971L91.3268 11.4658C94.4058 12.3073 95.9463 14.0806 95.9463 16.7837C95.9463 18.3015 95.373 19.5503 94.2264 20.5321C93.0798 21.5138 91.5861 22.0037 89.7453 22.0037L89.7434 21.9999Z" fill="white"/><path d="M101.191 21.7042V7.5543H96.4467V4.14027H109.652V7.5543H104.857V21.7042H101.191Z" fill="white"/><path d="M124.83 19.3412C123.03 21.1145 120.859 22.0002 118.315 22.0002C115.77 22.0002 113.598 21.1145 111.8 19.3412C110 17.5679 109.101 15.4296 109.101 12.9224C109.101 10.4152 110 8.27685 111.8 6.50356C113.6 4.73026 115.77 3.84458 118.315 3.84458C120.859 3.84458 123.03 4.73026 124.83 6.50356C126.63 8.27685 127.528 10.4171 127.528 12.9224C127.528 15.4277 126.63 17.5698 124.83 19.3412ZM114.385 16.8916C115.466 17.9887 116.774 18.5362 118.315 18.5362C119.855 18.5362 121.164 17.9887 122.244 16.8916C123.324 15.7946 123.862 14.4728 123.862 12.9224C123.862 11.372 123.322 10.0482 122.244 8.95313C121.164 7.8561 119.853 7.30855 118.315 7.30855C116.776 7.30855 115.466 7.8561 114.385 8.95313C113.305 10.0501 112.765 11.3739 112.765 12.9224C112.765 14.4709 113.305 15.7965 114.385 16.8916Z" fill="white"/><path d="M128.936 21.7041V4.14025H135.765C137.387 4.14025 138.705 4.63401 139.719 5.62344C140.732 6.61287 141.239 7.85015 141.239 9.33334C141.239 11.6427 140.016 13.1681 137.573 13.9097L143.974 21.7022H139.581L133.454 14.3055H132.575V21.7022H128.934L128.936 21.7041ZM132.575 11.2392H135.336C136.04 11.2392 136.596 11.0701 137.005 10.732C137.415 10.3939 137.621 9.92892 137.621 9.33526C137.621 8.7416 137.417 8.27666 137.005 7.93852C136.594 7.60039 136.04 7.43132 135.336 7.43132H132.575V11.2411V11.2392Z" fill="white"/><path d="M144.903 21.7042V4.14027H156V7.5543H148.543V11.1662H154.495V14.5802H148.543V18.2901H156V21.7042H144.903Z" fill="white"/><path d="M22.3291 0V22H7.22656L20.2412 10.4902H15.1064V0.0136719L2.08301 11.5332H7.22656V22H0V0H22.3291Z" fill="white"/></g><defs><clipPath id="clip0_19_5"><rect width="156" height="22" fill="white"/></clipPath></defs></svg>`;

function resolvePokecaSummaryCollageTitle(message: string, rankLabel: string): string {
	const lines = String(message ?? "")
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean)
		.filter((line) => !/^#/.test(line))
		.filter((line) => !/^\d+\./.test(line))
		.filter((line) => !/^\d{1,2}\/\d{1,2}（/.test(line));
	const picked = lines[0] ?? `${rankLabel} まとめ`;
	return picked.replace(/【|】/g, "").slice(0, 48).trim() || `${rankLabel} まとめ`;
}

function drawFittedImageToRect(
	ctx: any,
	bitmap: any,
	x: number,
	y: number,
	w: number,
	h: number,
): void {
	const sw = Number(bitmap?.width ?? bitmap?.displayWidth ?? 0);
	const sh = Number(bitmap?.height ?? bitmap?.displayHeight ?? 0);
	if (!Number.isFinite(sw) || !Number.isFinite(sh) || sw <= 0 || sh <= 0) return;
	const scale = Math.max(w / sw, h / sh);
	const dw = sw * scale;
	const dh = sh * scale;
	const dx = x + (w - dw) / 2;
	const dy = y + (h - dh) / 2;
	ctx.drawImage(bitmap, dx, dy, dw, dh);
}

async function decodeImageBitmapLike(
	res: Response,
	createImageBitmapFn: ((image: any) => Promise<any>) | undefined,
): Promise<any | null> {
	try {
		const blob = await res.blob();
		if (createImageBitmapFn) {
			return await createImageBitmapFn(blob);
		}
		const ImageDecoderCtor = (globalThis as { ImageDecoder?: any }).ImageDecoder;
		const contentType = String(res.headers.get("content-type") ?? "").toLowerCase();
		if (!ImageDecoderCtor || !contentType.startsWith("image/")) return null;
		const bytes = new Uint8Array(await blob.arrayBuffer());
		const decoder = new ImageDecoderCtor({
			data: bytes,
			type: contentType,
		});
		const frame = await decoder.decode({ frameIndex: 0 });
		return frame?.image ?? null;
	} catch {
		return null;
	}
}

async function ensureResvgWasmReady(): Promise<boolean> {
	if (resvgWasmInitPromise) return resvgWasmInitPromise;
	resvgWasmInitPromise = (async () => {
		try {
			await initResvgWasm(resvgWasmBinary as unknown as BufferSource);
			return true;
		} catch {
			return false;
		}
	})();
	return resvgWasmInitPromise;
}

async function loadPokecaBannerFontBuffers(): Promise<Uint8Array[]> {
	if (pokecaBannerFontBuffersPromise) return pokecaBannerFontBuffersPromise;
	pokecaBannerFontBuffersPromise = (async () => {
		const urls = [
			"https://raw.githubusercontent.com/google/fonts/main/ofl/inter/Inter-Bold.ttf",
			"https://raw.githubusercontent.com/google/fonts/main/ofl/spacemono/SpaceMono-Bold.ttf",
			"https://cdn.jsdelivr.net/gh/notofonts/noto-cjk@main/Sans/OTF/Japanese/NotoSansCJKjp-Regular.otf",
			"https://cdn.jsdelivr.net/gh/notofonts/noto-cjk@main/Sans/OTF/Japanese/NotoSansCJKjp-Bold.otf",
		];
		const out: Uint8Array[] = [];
		for (const u of urls) {
			try {
				const res = await fetch(u, { headers: { "user-agent": "Mozilla/5.0" } });
				if (!res.ok) continue;
				const ab = await res.arrayBuffer();
				if (ab.byteLength > 0) out.push(new Uint8Array(ab));
			} catch {
				// ignore individual font failures
			}
		}
		return out;
	})();
	return pokecaBannerFontBuffersPromise;
}

function bytesToBase64(bytes: Uint8Array): string {
	let binary = "";
	const chunkSize = 0x8000;
	for (let i = 0; i < bytes.length; i += chunkSize) {
		const chunk = bytes.subarray(i, i + chunkSize);
		for (let j = 0; j < chunk.length; j += 1) {
			binary += String.fromCharCode(chunk[j]);
		}
	}
	return btoa(binary);
}

function utf8ToBase64(value: string): string {
	const encoded = new TextEncoder().encode(value);
	return bytesToBase64(encoded);
}

async function renderPokecaBannerViaSvgResvg(
	title: string,
	cards: Array<{ url: string; cardName: string }>,
): Promise<{ blob: Blob; altText: string } | null> {
	lastPokecaCollageDebugReason = null;
	const theme = resolvePokecaBannerTheme(title);
	const picked = cards.filter((c) => c.url).slice(0, 3);
	if (picked.length === 0) {
		lastPokecaCollageDebugReason = "no_cards";
		return null;
	}
	const ready = await ensureResvgWasmReady();
	if (!ready) {
		lastPokecaCollageDebugReason = "resvg_wasm_init_failed";
		return null;
	}

	const embeddedImages: Array<{ dataUrl: string; idx: number }> = [];
	for (let i = 0; i < picked.length; i += 1) {
		try {
			const res = await fetch(picked[i].url, { headers: { "user-agent": "Mozilla/5.0" } });
			if (!res.ok) continue;
			const bytes = new Uint8Array(await res.arrayBuffer());
			if (bytes.length === 0) continue;
			const ct = String(res.headers.get("content-type") ?? "").toLowerCase();
			const mime = ct.startsWith("image/") ? ct.split(";")[0] : "image/jpeg";
			const dataUrl = `data:${mime};base64,${bytesToBase64(bytes)}`;
			embeddedImages.push({ dataUrl, idx: i });
		} catch {
			// skip broken image
		}
	}
	if (embeddedImages.length === 0) {
		lastPokecaCollageDebugReason = "all_card_image_fetch_failed";
		return null;
	}
	const fontBuffers = await loadPokecaBannerFontBuffers();

	const slots = [
		{ x: 21.5, y: 176, w: 170, h: 242 },
		{ x: 210, y: 176, w: 170, h: 242 },
		{ x: 398.5, y: 176, w: 170, h: 242 },
	];

	const clipDefs = embeddedImages
		.map(({ idx }) => {
			const s = slots[idx];
			if (!s) return "";
			return `<clipPath id="clip-${idx}"><rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" rx="12" ry="12"/></clipPath>`;
		})
		.join("");

	const cardLayers = embeddedImages
		.map(({ dataUrl, idx }) => {
			const s = slots[idx];
			if (!s) return "";
			return `<image href="${dataUrl}" x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" preserveAspectRatio="xMidYMid slice" clip-path="url(#clip-${idx})"/>`;
		})
		.join("");

	const slotRects = slots
		.map(
			(s) =>
				`<rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" rx="12" ry="12" fill="rgba(255,255,255,0.92)"/>`,
		)
		.join("");
	const logoDataUrl = `data:image/svg+xml;base64,${utf8ToBase64(TCGSTORE_LOGO_SVG)}`;

	const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="479" viewBox="0 0 600 479">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="600" y2="479" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${theme.bgStops[0]}"/>
      <stop offset="52%" stop-color="${theme.bgStops[1]}"/>
      <stop offset="100%" stop-color="${theme.bgStops[2]}"/>
    </linearGradient>
    <filter id="blur12" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="12"/>
    </filter>
    <filter id="blur14" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="14"/>
    </filter>
    <filter id="blur15" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="15"/>
    </filter>
    ${clipDefs}
  </defs>
  <rect x="0" y="0" width="600" height="479" fill="url(#bg)"/>
  <ellipse cx="50" cy="20" rx="90" ry="90" fill="${theme.glowA}" filter="url(#blur12)"/>
  <ellipse cx="345" cy="55" rx="95" ry="95" fill="${theme.glowB}" filter="url(#blur15)"/>
  <ellipse cx="235" cy="450" rx="115" ry="90" fill="${theme.glowC}" filter="url(#blur14)"/>
  <rect x="20" y="18" width="549" height="86" rx="18" ry="18" fill="${theme.headerFill}" stroke="${theme.headerStroke}"/>
  <text x="300" y="54" fill="#FFFFFF" text-anchor="middle" font-size="25" font-weight="700" font-family="Inter, Noto Sans CJK JP, sans-serif">${escapeXmlText(title || "フリマ取引件数ランキング")}</text>
  <text x="300" y="82" fill="#FFF7D1" text-anchor="middle" font-size="15" font-weight="700" font-family="Inter, Noto Sans CJK JP, sans-serif">注目カードはこちら！</text>
  <text x="76" y="162" fill="#FFFFFF" font-size="30" font-weight="700" font-family="Space Mono, monospace">1st</text>
  <text x="267.5" y="162" fill="#FFFFFF" font-size="30" font-weight="700" font-family="Space Mono, monospace">2nd</text>
  <text x="452.5" y="162" fill="#FFFFFF" font-size="30" font-weight="700" font-family="Space Mono, monospace">3rd</text>
  ${slotRects}
  ${cardLayers}
  <text x="26" y="457" fill="#FFFFFF" font-size="20" font-weight="700" font-family="Inter, Noto Sans CJK JP, sans-serif">#ポケカ</text>
  <image href="${logoDataUrl}" x="413" y="432.5" width="156" height="22"/>
</svg>`;

	try {
		const resvg = new Resvg(svg, {
			fitTo: { mode: "width", value: 600 },
			font: {
				fontBuffers,
				defaultFontFamily: "Noto Sans CJK JP",
				sansSerifFamily: "Noto Sans CJK JP",
				monospaceFamily: "Noto Sans CJK JP",
			},
		});
		const rendered = resvg.render();
		const png = rendered.asPng();
		rendered.free?.();
		resvg.free?.();
		lastPokecaCollageDebugReason = "ok";
		return {
			blob: new Blob([png], { type: "image/png" }),
			altText: `ポケカまとめコラージュ: ${title}`,
		};
	} catch {
		lastPokecaCollageDebugReason = "resvg_render_failed";
		return null;
	}
}

function escapeXmlText(value: string): string {
	return String(value ?? "")
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");
}

type PokecaBannerTheme = {
	bgStops: [string, string, string];
	glowA: string;
	glowB: string;
	glowC: string;
	headerFill: string;
	headerStroke: string;
};

function resolvePokecaBannerTheme(title: string): PokecaBannerTheme {
	const t = String(title ?? "");
	if (/(web3|オンチェーン|sol)/i.test(t)) {
		return {
			bgStops: ["#0B7BFF", "#2E5BFF", "#684BFF"],
			glowA: "rgba(117,220,255,0.35)",
			glowB: "rgba(147,179,255,0.32)",
			glowC: "rgba(120,242,255,0.24)",
			headerFill: "rgba(5,27,88,0.24)",
			headerStroke: "rgba(206,229,255,0.38)",
		};
	}
	return {
		bgStops: ["#FF732E", "#FA4573", "#5E54F2"],
		glowA: "rgba(255,242,115,0.45)",
		glowB: "rgba(89,242,255,0.35)",
		glowC: "rgba(255,115,191,0.28)",
		headerFill: "rgba(40,0,81,0.17)",
		headerStroke: "rgba(255,255,255,0.36)",
	};
}

async function buildPokecaSummaryCollageImage(
	title: string,
	cards: Array<{ url: string; cardName: string }>,
): Promise<{ blob: Blob; altText: string } | null> {
	try {
		lastPokecaCollageDebugReason = null;
		const theme = resolvePokecaBannerTheme(title);
		const OffscreenCanvasCtor = (globalThis as { OffscreenCanvas?: any }).OffscreenCanvas;
		const createImageBitmapFn = (globalThis as { createImageBitmap?: any }).createImageBitmap;
		if (!OffscreenCanvasCtor) {
			return await renderPokecaBannerViaSvgResvg(title, cards);
		}
		const picked = cards.filter((c) => c.url).slice(0, 3);
		if (picked.length === 0) {
			lastPokecaCollageDebugReason = "no_cards";
			return null;
		}
		const bitmaps: any[] = [];
		for (const item of picked) {
			const res = await fetch(item.url, { headers: { "user-agent": "Mozilla/5.0" } });
			if (!res.ok) continue;
			const bmp = await decodeImageBitmapLike(res, createImageBitmapFn);
			if (!bmp) continue;
			bitmaps.push(bmp);
		}
		if (bitmaps.length === 0) {
			lastPokecaCollageDebugReason = "all_card_image_decode_failed";
			return null;
		}

		const scale = 2;
		const sx = (v: number) => Math.round(v * scale);
		const width = sx(600);
		const height = sx(479);
		const canvas = new OffscreenCanvasCtor(width, height);
		const ctx = canvas.getContext("2d");
		if (!ctx) return null;

		const gradient = ctx.createLinearGradient(0, 0, width, height);
		gradient.addColorStop(0, theme.bgStops[0]);
		gradient.addColorStop(0.52, theme.bgStops[1]);
		gradient.addColorStop(1, theme.bgStops[2]);
		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, width, height);

		// soft glow decorations
		const glowA = ctx.createRadialGradient(sx(50), sx(20), sx(10), sx(50), sx(20), sx(120));
		glowA.addColorStop(0, theme.glowA);
		glowA.addColorStop(1, theme.glowA.replace(/[\d.]+\)\s*$/, "0)"));
		ctx.fillStyle = glowA;
		ctx.fillRect(0, 0, width, height);
		const glowB = ctx.createRadialGradient(sx(345), sx(55), sx(10), sx(345), sx(55), sx(130));
		glowB.addColorStop(0, theme.glowB);
		glowB.addColorStop(1, theme.glowB.replace(/[\d.]+\)\s*$/, "0)"));
		ctx.fillStyle = glowB;
		ctx.fillRect(0, 0, width, height);
		const glowC = ctx.createRadialGradient(sx(235), sx(560), sx(15), sx(235), sx(560), sx(140));
		glowC.addColorStop(0, theme.glowC);
		glowC.addColorStop(1, theme.glowC.replace(/[\d.]+\)\s*$/, "0)"));
		ctx.fillStyle = glowC;
		ctx.fillRect(0, 0, width, height);

		const headerX = sx(20);
		const headerY = sx(18);
		const headerW = sx(549);
		const headerH = sx(86);
		const headerR = sx(18);
		ctx.fillStyle = theme.headerFill;
		ctx.strokeStyle = theme.headerStroke;
		ctx.lineWidth = sx(1);
		roundedRectPath(ctx, headerX, headerY, headerW, headerH, headerR);
		ctx.fill();
		ctx.stroke();

		ctx.fillStyle = "#ffffff";
		ctx.font = `700 ${sx(25)}px Inter, "Noto Sans CJK JP", sans-serif`;
		ctx.textBaseline = "middle";
		ctx.textAlign = "center";
		ctx.fillText("フリマ取引件数ランキング", width / 2, sx(50));
		ctx.fillStyle = "#fff7d1";
		ctx.font = `700 ${sx(15)}px Inter, "Noto Sans CJK JP", sans-serif`;
		ctx.fillText("注目カードはこちら！", width / 2, sx(79));

		// rank labels
		ctx.fillStyle = "#ffffff";
		ctx.textAlign = "left";
		ctx.textBaseline = "top";
		ctx.font = `700 ${sx(30)}px "Space Mono", monospace`;
		ctx.fillText("1st", sx(76), sx(132));
		ctx.fillText("2nd", sx(267.5), sx(132));
		ctx.fillText("3rd", sx(452.5), sx(132));

		const slots = [
			{ x: sx(21.5), y: sx(176), w: sx(170), h: sx(242) },
			{ x: sx(210), y: sx(176), w: sx(170), h: sx(242) },
			{ x: sx(398.5), y: sx(176), w: sx(170), h: sx(242) },
		];
		for (let i = 0; i < bitmaps.length; i += 1) {
			const slot = slots[i];
			if (!slot) break;
			ctx.fillStyle = "rgba(255,255,255,0.92)";
			roundedRectPath(ctx, slot.x, slot.y, slot.w, slot.h, sx(18));
			ctx.fill();
			ctx.save();
			roundedRectPath(ctx, slot.x, slot.y, slot.w, slot.h, sx(18));
			ctx.clip();
			drawFittedImageToRect(ctx, bitmaps[i], slot.x, slot.y, slot.w, slot.h);
			ctx.restore();
		}

		// sparkles
		const dots = [
			{ x: 16, y: 138, r: 5, c: "rgba(252,230,64,0.9)" },
			{ x: 52, y: 124, r: 3, c: "rgba(89,245,255,0.9)" },
			{ x: 368, y: 128, r: 4, c: "rgba(255,148,51,0.9)" },
			{ x: 336, y: 112, r: 2.5, c: "rgba(255,255,255,0.9)" },
			{ x: 292, y: 126, r: 3.5, c: "rgba(181,255,99,0.9)" },
			{ x: 204, y: 118, r: 2.5, c: "rgba(255,191,242,0.9)" },
		];
		for (const d of dots) {
			ctx.fillStyle = d.c;
			ctx.beginPath();
			ctx.arc(sx(d.x), sx(d.y), sx(d.r), 0, Math.PI * 2);
			ctx.fill();
		}

		let logoBitmap: any = null;
		try {
			const logoBlob = new Blob([TCGSTORE_LOGO_SVG], { type: "image/svg+xml" });
			if (createImageBitmapFn) {
				logoBitmap = await createImageBitmapFn(logoBlob);
			}
		} catch {
			logoBitmap = null;
		}

		ctx.fillStyle = "#ffffff";
		ctx.textAlign = "left";
		ctx.textBaseline = "top";
		ctx.font = `700 ${sx(20)}px Inter, "Noto Sans CJK JP", sans-serif`;
		ctx.fillText("#ポケカ", sx(26), sx(432.5));
		if (logoBitmap) {
			ctx.drawImage(logoBitmap, sx(413), sx(432.5), sx(156), sx(22));
			if (typeof logoBitmap.close === "function") logoBitmap.close();
		} else {
			ctx.textAlign = "right";
			ctx.font = `700 ${sx(20)}px "Space Mono", Inter, sans-serif`;
			ctx.fillText("TCGSTORE", sx(569), sx(432.5));
		}

		const out = await canvas.convertToBlob({ type: "image/png", quality: 0.92 });
		for (const bmp of bitmaps) bmp.close();
		return {
			blob: out,
			altText: `ポケカまとめコラージュ: ${title}`,
		};
	} catch {
		lastPokecaCollageDebugReason = "offscreen_render_failed";
		return null;
	}
}

function roundedRectPath(
	ctx: any,
	x: number,
	y: number,
	w: number,
	h: number,
	r: number,
): void {
	const radius = Math.max(0, Math.min(r, Math.floor(Math.min(w, h) / 2)));
	ctx.beginPath();
	ctx.moveTo(x + radius, y);
	ctx.lineTo(x + w - radius, y);
	ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
	ctx.lineTo(x + w, y + h - radius);
	ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
	ctx.lineTo(x + radius, y + h);
	ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
	ctx.lineTo(x, y + radius);
	ctx.quadraticCurveTo(x, y, x + radius, y);
	ctx.closePath();
}

function pickPokecaConsecutiveRankIns(
	todayCards: PokecaSummaryCard[],
	yesterdayCards: PokecaSummaryCard[],
): PokecaConsecutiveRankIn[] {
	const yesterdayIndex = new Map<string, number>();
	for (const [idx, card] of yesterdayCards.entries()) {
		const key = String(card.cardName ?? "").trim();
		if (!key) continue;
		if (!yesterdayIndex.has(key)) yesterdayIndex.set(key, idx + 1);
	}
	const hits: PokecaConsecutiveRankIn[] = [];
	for (const [idx, card] of todayCards.entries()) {
		const key = String(card.cardName ?? "").trim();
		if (!key) continue;
		const yesterdayRank = yesterdayIndex.get(key);
		if (!yesterdayRank) continue;
		hits.push({
			cardName: key,
			todayRank: idx + 1,
			yesterdayRank,
		});
	}
	return hits;
}

function buildPokecaConsecutiveRankLine(
	entries: PokecaConsecutiveRankIn[],
	rankLabel: string,
): string | null {
	// 外部ランキング由来と誤解されやすいため、連続ランクイン行は一旦非表示にする。
	void entries;
	void rankLabel;
	return null;
	/*
	const rankTag = rankLabel.includes("下落")
		? "下落7日"
		: rankLabel.includes("高騰")
			? "高騰7日"
			: "取引件数";
	const header = `2日連続ランクイン[${rankTag}]`;
	if (entries.length === 0) {
		return null;
	}
	const body = entries
		.slice(0, 2)
		.map((entry) => `${stripPokecaCardVariant(entry.cardName)}(${entry.yesterdayRank}→${entry.todayRank}位)`)
		.join("、");
	return `${header}: ${body}`;
	*/
}

function formatYmdMonthDay(ymd: string): string {
	const v = String(ymd ?? "").trim();
	const m = v.match(/^(\d{4})-(\d{2})-(\d{2})$/);
	if (!m) return "?/?";
	return `${Number(m[2])}/${Number(m[3])}`;
}

function buildPokecaDailyDeltaEntries(
	todayCards: PokecaSummaryCard[],
	yesterdayCards: PokecaSummaryCard[],
	rankTarget: PokecaRankTarget,
): PokecaDailyDeltaEntry[] {
	const toNameKey = (name: string): string =>
		String(name ?? "")
			.replace(/\s+/g, " ")
			.trim()
			.toLowerCase();
	const toUrlKey = (url: string): string => {
		try {
			const u = new URL(String(url ?? ""));
			return u.pathname.replace(/^\/+|\/+$/g, "").toLowerCase();
		} catch {
			return "";
		}
	};
	const yesterdayMapByUrl = new Map<string, PokecaSummaryCard>();
	const yesterdayMapByName = new Map<string, PokecaSummaryCard>();
	for (const card of yesterdayCards) {
		if (!Number.isFinite(card.price) || card.price <= 0) continue;
		const urlKey = toUrlKey(card.url);
		if (urlKey && !yesterdayMapByUrl.has(urlKey)) yesterdayMapByUrl.set(urlKey, card);
		const nameKey = toNameKey(card.cardName);
		if (nameKey && !yesterdayMapByName.has(nameKey)) yesterdayMapByName.set(nameKey, card);
	}
	const entries: PokecaDailyDeltaEntry[] = [];
	for (const card of todayCards) {
		if (!Number.isFinite(card.price) || card.price <= 0) continue;
		const urlKey = toUrlKey(card.url);
		const nameKey = toNameKey(card.cardName);
		const y = (urlKey ? yesterdayMapByUrl.get(urlKey) : null) ?? (nameKey ? yesterdayMapByName.get(nameKey) : null);
		if (!y || !Number.isFinite(y.price) || y.price <= 0) continue;
		const deltaPrice = card.price - y.price;
		const deltaPct = calcPercentChange(y.price, card.price);
		entries.push({
			cardName: card.cardName,
			todayPrice: card.price,
			yesterdayPrice: y.price,
			deltaPrice,
			deltaPct,
		});
	}
	const sorted = [...entries].sort((a, b) => {
		if (rankTarget === "rank_fall_7") return a.deltaPrice - b.deltaPrice;
		if (rankTarget === "rank_vol") return Math.abs(b.deltaPrice) - Math.abs(a.deltaPrice);
		return b.deltaPrice - a.deltaPrice;
	});
	if (rankTarget === "rank_fall_7") return sorted.filter((x) => x.deltaPrice < 0);
	if (rankTarget === "rank_rise_7") return sorted.filter((x) => x.deltaPrice > 0);
	return sorted;
}

function buildPokecaOriginalCandidates(
	todayCards: PokecaSummaryCard[],
	yesterdayCards: PokecaSummaryCard[],
	prevDateKey: string,
	dateKey: string,
): PokecaOriginalCandidate[] {
	if (!prevDateKey || !dateKey) return [];
	const all = buildPokecaDailyDeltaEntries(todayCards, yesterdayCards, "rank_vol");
	if (all.length < 3) return [];
	const periodLine = `${formatYmdMonthDay(prevDateKey)}→${formatYmdMonthDay(dateKey)}`;
	const upAmt = [...all].filter((x) => x.deltaPrice > 0).sort((a, b) => b.deltaPrice - a.deltaPrice).slice(0, 3);
	const downAmt = [...all].filter((x) => x.deltaPrice < 0).sort((a, b) => a.deltaPrice - b.deltaPrice).slice(0, 3);
	const upPct = [...all].filter((x) => x.deltaPct > 0).sort((a, b) => b.deltaPct - a.deltaPct).slice(0, 3);
	const downPct = [...all].filter((x) => x.deltaPct < 0).sort((a, b) => a.deltaPct - b.deltaPct).slice(0, 3);
	const candidates: PokecaOriginalCandidate[] = [];
	if (upAmt.length >= 3) candidates.push({ key: "d1_up_amt", label: "前日比 上昇額ランキング TOP3", periodLine, rows: upAmt });
	if (downAmt.length >= 3) candidates.push({ key: "d1_down_amt", label: "前日比 下落額ランキング TOP3", periodLine, rows: downAmt });
	if (upPct.length >= 3) candidates.push({ key: "d1_up_pct", label: "前日比 上昇率ランキング TOP3", periodLine, rows: upPct });
	if (downPct.length >= 3) candidates.push({ key: "d1_down_pct", label: "前日比 下落率ランキング TOP3", periodLine, rows: downPct });
	return candidates;
}

function scorePokecaOriginalCandidate(
	candidate: PokecaOriginalCandidate,
	context: {
		recentThemeKeys: string[];
		lastFingerprint: string;
	},
): number {
	const rows = candidate.rows.slice(0, 3);
	if (rows.length === 0) return Number.NEGATIVE_INFINITY;

	const absDeltaYenSum = rows.reduce((sum, row) => sum + Math.abs(Number(row.deltaPrice || 0)), 0);
	const absDeltaPctSum = rows.reduce((sum, row) => sum + Math.abs(Number(row.deltaPct || 0)), 0);
	const top = Math.abs(Number(rows[0]?.deltaPrice || 0));
	const second = Math.abs(Number(rows[1]?.deltaPrice || 0));
	const third = Math.abs(Number(rows[2]?.deltaPrice || 0));
	const spread = top - third;
	const concentration = second > 0 ? top / second : top > 0 ? 2 : 0;
	const uniqueNameCount = new Set(rows.map((r) => normalizePokecaCardNameForCompare(r.cardName))).size;
	const fingerprint = buildPokecaCandidateFingerprint(candidate);

	let score = 0;
	// インパクト（価格差 + 変化率）を重視
	score += Math.log10(absDeltaYenSum + 1) * 3.2;
	score += Math.min(45, absDeltaPctSum) * 0.22;
	// 1位の突出や3位との差が明確な方を優先
	score += Math.min(6, spread / 1000);
	score += Math.min(2, Math.max(0, concentration - 1));
	// 同名だらけの読みづらさを抑制
	score += uniqueNameCount * 0.6;

	// 直近との重複を避ける（テンプレ感を減らす）
	const recent = context.recentThemeKeys.slice(0, 4);
	if (recent[0] === candidate.key) score -= 3.5;
	else if (recent.includes(candidate.key)) score -= 1.5;
	if (context.lastFingerprint && context.lastFingerprint === fingerprint) score -= 6.5;

	return score;
}

function pickPokecaOriginalCandidateByScore(
	candidates: PokecaOriginalCandidate[],
	context: {
		recentThemeKeys: string[];
		lastFingerprint: string;
	},
): PokecaOriginalCandidate | null {
	if (candidates.length === 0) return null;
	const ranked = [...candidates].sort(
		(a, b) => scorePokecaOriginalCandidate(b, context) - scorePokecaOriginalCandidate(a, context),
	);
	return ranked[0] ?? null;
}

function mergePokecaCardsUnique(cardGroups: PokecaSummaryCard[][]): PokecaSummaryCard[] {
	const keyOf = (name: string): string =>
		stripPokecaCardVariant(String(name ?? ""))
			.replace(/\s+/g, " ")
			.trim()
			.toLowerCase();
	const merged = new Map<string, PokecaSummaryCard>();
	for (const group of cardGroups) {
		for (const card of group) {
			const key = keyOf(card.cardName);
			if (!key || !Number.isFinite(card.price) || card.price <= 0) continue;
			if (!merged.has(key)) merged.set(key, card);
		}
	}
	return [...merged.values()];
}

function buildPokecaOriginalCandidateMessage(candidate: PokecaOriginalCandidate): {
	text: string;
	displayedCount: number;
	variantKey?: string;
} {
	const rows = candidate.rows.slice(0, 3);
	const displayNames = buildPokecaDisplayNames(rows.map((entry) => entry.cardName));
	const lines = [
		`【ポケカ${candidate.label}】`,
		candidate.periodLine,
		...rows.map(
			(entry, idx) =>
				`${idx + 1}. ${displayNames[idx] ?? stripPokecaCardVariant(entry.cardName)} ${formatNumber(entry.todayPrice)}円（前日比 ${formatSignedNumber(entry.deltaPrice, "円")} / ${formatSignedPercent(entry.deltaPct)}）`,
		),
		"",
		"#ポケカ",
	];
	return { text: lines.join("\n"), displayedCount: rows.length };
}

function formatJstDateLabel(now = new Date()): string {
	const jst = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
	const month = String(jst.getMonth() + 1);
	const day = String(jst.getDate());
	return `${month}/${day}`;
}

function formatSignedNumber(value: number, suffix = ""): string {
	if (!Number.isFinite(value)) return `0${suffix}`;
	if (value > 0) return `+${formatNumber(Math.round(value))}${suffix}`;
	if (value < 0) return `-${formatNumber(Math.abs(Math.round(value)))}${suffix}`;
	return `0${suffix}`;
}

function formatSignedPercent(value: number): string {
	if (!Number.isFinite(value)) return "0.00%";
	const abs = Math.abs(value).toFixed(2);
	if (value > 0) return `+${abs}%`;
	if (value < 0) return `-${abs}%`;
	return "0.00%";
}

function buildPokecaChangeText(card: PokecaSummaryCard): string | null {
	const hasPriceDelta = typeof card.riseFallPrice7 === "number" && Number.isFinite(card.riseFallPrice7);
	const hasRate = typeof card.riseFallRate7 === "number" && Number.isFinite(card.riseFallRate7);
	if (!hasPriceDelta && !hasRate) return null;
	const parts: string[] = [];
	const baseDelta = hasPriceDelta ? (card.riseFallPrice7 as number) : (card.riseFallRate7 as number);
	const direction = baseDelta > 0 ? "↗" : baseDelta < 0 ? "↘" : "→";
	if (hasPriceDelta) parts.push(formatSignedNumber(card.riseFallPrice7 as number, "円"));
	if (hasRate) parts.push(formatSignedPercent(card.riseFallRate7 as number));
	return `7日変動${direction} ${parts.join(" / ")}`;
}

function buildPokecaSummaryRankLine(
	card: PokecaSummaryCard,
	index: number,
	rankTarget: PokecaRankTarget,
	displayNameOverride?: string,
): string {
	const cardName = String(displayNameOverride ?? card.cardName ?? "").trim() || card.cardName;
	if (rankTarget === "rank_vol") {
		return `${index + 1}. ${cardName}（参考価格 ${formatNumber(card.price)}円）`;
	}
	const changeText = buildPokecaChangeText(card);
	return changeText
		? `${index + 1}. ${cardName} ${formatNumber(card.price)}円（${changeText}）`
		: `${index + 1}. ${cardName} ${formatNumber(card.price)}円`;
}

function buildPokecaSummaryMessage(
	cards: PokecaSummaryCard[],
	rankLabel: string,
	rankTarget: PokecaRankTarget,
	now = new Date(),
	options: {
		leadOverride?: string | null;
		consecutiveLine?: string | null;
	} = {},
): { text: string; displayedCount: number } {
	const fullTopCards = cards.slice(0, POKECA_POST_RANK_LIMIT);
	const lead = options.leadOverride ?? buildPokecaSummaryLead(fullTopCards, rankTarget, now);
	const consecutiveLine = String(options.consecutiveLine ?? "").trim() || null;
	const postTitle = getPokecaPostTitle(rankTarget, now, fullTopCards);
	const rankWindow = getPokecaRankWindowLabel(rankTarget);
	const dateLabel = formatJstDateLabel(now);
	const collectedLine = `${dateLabel}（${rankWindow}）`;
	const rankCountCandidates = [POKECA_POST_RANK_LIMIT, 8, 5, 4, 3].filter(
		(n, i, arr) => n > 0 && cards.length >= n && arr.indexOf(n) === i,
	);
	const templates: Array<{ includeLead: boolean; includeCollectedLine: boolean; includeConsecutiveLine: boolean }> = [
		{ includeLead: true, includeCollectedLine: true, includeConsecutiveLine: true },
		{ includeLead: true, includeCollectedLine: false, includeConsecutiveLine: true },
		{ includeLead: false, includeCollectedLine: true, includeConsecutiveLine: true },
		{ includeLead: false, includeCollectedLine: false, includeConsecutiveLine: true },
	];

	for (const rankCount of rankCountCandidates) {
		const selectedCards = cards.slice(0, rankCount);
		const header = `【${postTitle} TOP${rankCount}】`;
		for (const template of templates) {
			const lines: string[] = [header];
			if (template.includeCollectedLine) {
				lines.push(collectedLine, "");
			}
			if (template.includeConsecutiveLine && consecutiveLine) {
				lines.push(consecutiveLine, "");
			}
			if (template.includeLead && lead) {
				lines.push(formatPokecaSummaryLeadLine(lead), "");
			}
			for (const [idx, card] of selectedCards.entries()) {
				lines.push(buildPokecaSummaryRankLine(card, idx, rankTarget));
			}
			lines.push("", "#ポケカ");
			const text = lines.join("\n");
			if (countXWeightedLength(text) <= POKECA_TWEET_TEXT_LIMIT) {
				return { text, displayedCount: selectedCards.length };
			}
		}
	}

	const fallbackCount = Math.min(5, cards.length);
	const fallbackCards = cards.slice(0, fallbackCount);
	const fallbackHeader = `【${postTitle} TOP${fallbackCount}】`;
	const fallbackLines = [fallbackHeader];
	if (consecutiveLine) {
		fallbackLines.push(consecutiveLine, "");
	}
	fallbackLines.push(
		...fallbackCards.map((card, idx) => buildPokecaSummaryRankLine(card, idx, rankTarget)),
	);
	fallbackLines.push("", "#ポケカ");
	const fallbackText = fallbackLines.join("\n");
	if (countXWeightedLength(fallbackText) <= POKECA_TWEET_TEXT_LIMIT) {
		return { text: fallbackText, displayedCount: fallbackCards.length };
	}

	// 最終フォールバック:
	// 1) 期間行は必ず残す
	// 2) 高騰/下落は「上昇(下落)額」を必ず残す（可能なら率も残す）
	// 3) その上でTOP3優先で280字内に収める
	const compactChange = (
		card: PokecaSummaryCard,
		mode: "delta_rate" | "delta_only",
	): string | null => {
		const hasPriceDelta = typeof card.riseFallPrice7 === "number" && Number.isFinite(card.riseFallPrice7);
		if (!hasPriceDelta) return null;
		const delta = formatSignedNumber(card.riseFallPrice7 as number, "円");
		if (mode === "delta_only") return delta;
		const hasRate = typeof card.riseFallRate7 === "number" && Number.isFinite(card.riseFallRate7);
		if (!hasRate) return delta;
		return `${delta}/${formatSignedPercent(card.riseFallRate7 as number)}`;
	};

	const compactRankLine = (
		card: PokecaSummaryCard,
		index: number,
		mode: "delta_rate" | "delta_only",
	): string => {
		const name = stripPokecaCardVariant(card.cardName);
		if (rankTarget === "rank_vol") {
			return `${index + 1}. ${name} 参考${formatNumber(card.price)}円`;
		}
		const compact = compactChange(card, mode);
		if (compact) {
			return `${index + 1}. ${name} ${formatNumber(card.price)}円（${compact}）`;
		}
		return `${index + 1}. ${name} ${formatNumber(card.price)}円`;
	};

	const compactCountCandidates = [3, 2, 1].filter((n) => cards.length >= n);
	const compactModes: Array<"delta_rate" | "delta_only"> =
		rankTarget === "rank_vol" ? ["delta_only"] : ["delta_rate", "delta_only"];
	for (const compactMode of compactModes) {
		for (const compactCount of compactCountCandidates) {
			const compactCards = cards.slice(0, compactCount);
			const compactHeader = `【${postTitle} TOP${compactCount}】`;
			const compactLines = [
				compactHeader,
				collectedLine,
				...compactCards.map((card, idx) => compactRankLine(card, idx, compactMode)),
				"",
				"#ポケカ",
			];
			const compactText = compactLines.join("\n");
			if (countXWeightedLength(compactText) <= POKECA_TWEET_TEXT_LIMIT) {
				return { text: compactText, displayedCount: compactCards.length };
			}
		}
	}

	return { text: fallbackText, displayedCount: fallbackCards.length };
}

function buildPokecaSummaryOriginalMessage(
	cards: PokecaSummaryCard[],
	rankLabel: string,
	rankTarget: PokecaRankTarget,
	now = new Date(),
	options: {
		consecutiveLine?: string | null;
		prevCards?: PokecaSummaryCard[];
		prevDateKey?: string;
		dateKey?: string;
		volVariantOffset?: number;
	} = {},
): { text: string; displayedCount: number; variantKey?: string } {
	const orderedCards =
		rankTarget === "rank_rise_7" || rankTarget === "rank_fall_7"
			? [...cards].sort((a, b) => {
					const aDelta =
						typeof a.riseFallPrice7 === "number" && Number.isFinite(a.riseFallPrice7)
							? (a.riseFallPrice7 as number)
							: null;
					const bDelta =
						typeof b.riseFallPrice7 === "number" && Number.isFinite(b.riseFallPrice7)
							? (b.riseFallPrice7 as number)
							: null;
					if (aDelta != null && bDelta != null) {
						return rankTarget === "rank_fall_7" ? aDelta - bDelta : bDelta - aDelta;
					}
					if (aDelta != null) return -1;
					if (bDelta != null) return 1;
					const aRate =
						typeof a.riseFallRate7 === "number" && Number.isFinite(a.riseFallRate7)
							? (a.riseFallRate7 as number)
							: null;
					const bRate =
						typeof b.riseFallRate7 === "number" && Number.isFinite(b.riseFallRate7)
							? (b.riseFallRate7 as number)
							: null;
					if (aRate != null && bRate != null) {
						return rankTarget === "rank_fall_7" ? aRate - bRate : bRate - aRate;
					}
					return 0;
			  })
			: cards;
	const topCards = orderedCards.slice(0, Math.min(3, orderedCards.length));
	const displayedCount = topCards.length;
	const dateLabel = formatJstDateLabel(now);
	const collectedLine =
		rankTarget === "rank_rise_7" || rankTarget === "rank_fall_7"
			? `過去7日変動（${dateLabel}時点）`
			: `${dateLabel}（当日集計）`;
	const consecutiveLine = String(options.consecutiveLine ?? "").trim();
	const prevCards = Array.isArray(options.prevCards) ? options.prevCards : [];
	const prevDateKey = String(options.prevDateKey ?? "").trim();
	const dateKey = String(options.dateKey ?? "").trim();
	const volVariantOffset = Math.trunc(Number(options.volVariantOffset ?? 0));

	if (rankTarget === "rank_vol" && cards.length >= 3) {
		const basePool = cards.slice(0, Math.min(10, cards.length));
		const highPricePool = [...basePool].sort((a, b) => b.price - a.price).slice(0, 3);
		const lowPricePool = [...basePool].sort((a, b) => a.price - b.price).slice(0, 3);
		const variants: Array<{
			key: "trade_count" | "high_price" | "low_price";
			title: string;
			lead: string;
			rows: PokecaSummaryCard[];
		}> = [
			{
				key: "trade_count",
				title: "市場取引件数ランキング TOP3",
				lead: "👀 取引が集まった銘柄に注目",
				rows: basePool.slice(0, 3),
			},
			{
				key: "high_price",
				title: "高価格帯 取引注目 TOP3",
				lead: "💎 高価格帯で動きが目立った銘柄",
				rows: highPricePool,
			},
			{
				key: "low_price",
				title: "お手頃価格帯 取引注目 TOP3",
				lead: "🪙 手に取りやすい価格帯で動いた銘柄",
				rows: lowPricePool,
			},
		];
		const jst = getJstNow(now);
		const daySeed = jst.getUTCFullYear() * 10000 + (jst.getUTCMonth() + 1) * 100 + jst.getUTCDate();
		const selected = variants[Math.abs(daySeed + volVariantOffset) % variants.length] ?? variants[0];
		const lines = [
			`【ポケカ${selected.title}】`,
			collectedLine,
			selected.lead,
			...selected.rows.map((card) => card.cardName),
		];
		const rowNames = lines.slice(3).map((v) => String(v));
		const displayNames = buildPokecaDisplayNames(rowNames);
		const bodyLines = [
			...selected.rows.map(
				(card, idx) => `${idx + 1}. ${displayNames[idx] ?? stripPokecaCardVariant(card.cardName)} ${formatNumber(card.price)}円`,
			),
			"",
			"#ポケカ",
		];
		return { text: [...lines.slice(0, 3), ...bodyLines].join("\n"), displayedCount: selected.rows.length, variantKey: selected.key };
	}

	if (rankTarget !== "rank_vol" && prevCards.length > 0 && prevDateKey && dateKey) {
		const deltaEntries = buildPokecaDailyDeltaEntries(orderedCards, prevCards, rankTarget).slice(0, 3);
		if (deltaEntries.length >= 3) {
			const periodLine = `${formatYmdMonthDay(prevDateKey)}→${formatYmdMonthDay(dateKey)}`;
			const title =
				rankTarget === "rank_fall_7"
					? "前日比下落額ランキング TOP3"
					: "前日比上昇額ランキング TOP3";
			const displayNames = buildPokecaDisplayNames(deltaEntries.map((entry) => entry.cardName));
			const lines = [
				`【ポケカ${title}】`,
				periodLine,
				...deltaEntries.map(
					(entry, idx) =>
						`${idx + 1}. ${displayNames[idx] ?? stripPokecaCardVariant(entry.cardName)} ${formatNumber(entry.todayPrice)}円（前日比 ${formatSignedNumber(entry.deltaPrice, "円")} / ${formatSignedPercent(entry.deltaPct)}）`,
				),
				"",
				"#ポケカ",
			];
			const text = lines.join("\n");
			if (countXWeightedLength(text) <= POKECA_TWEET_TEXT_LIMIT) {
				return { text, displayedCount: deltaEntries.length };
			}
		}
	}

	const compactRankLine = (card: PokecaSummaryCard, index: number, includeRate: boolean): string => {
		const name = stripPokecaCardVariant(card.cardName);
		if (rankTarget === "rank_vol") {
			return `${index + 1}. ${name} ${formatNumber(card.price)}円`;
		}
		const hasDelta = typeof card.riseFallPrice7 === "number" && Number.isFinite(card.riseFallPrice7);
		const hasRate = typeof card.riseFallRate7 === "number" && Number.isFinite(card.riseFallRate7);
		const deltaText = hasDelta ? formatSignedNumber(card.riseFallPrice7 as number, "円") : null;
		const rateText = hasRate ? formatSignedPercent(card.riseFallRate7 as number) : null;
		if (deltaText && includeRate && rateText) {
			return `${index + 1}. ${name} ${formatNumber(card.price)}円（${deltaText}/${rateText}）`;
		}
		if (deltaText) {
			return `${index + 1}. ${name} ${formatNumber(card.price)}円（${deltaText}）`;
		}
		if (rateText) {
			return `${index + 1}. ${name} ${formatNumber(card.price)}円（${rateText}）`;
		}
		return `${index + 1}. ${name} ${formatNumber(card.price)}円`;
	};

	const fallbackTitle =
		rankTarget === "rank_fall_7"
			? "下落ランキング TOP3"
			: rankTarget === "rank_vol"
				? "取引件数ランキング TOP3"
				: "高騰ランキング TOP3";

	const lineVariants: Array<{ includeRate: boolean; includeConsecutive: boolean }> = [
		{ includeRate: true, includeConsecutive: true },
		{ includeRate: true, includeConsecutive: false },
		{ includeRate: false, includeConsecutive: false },
	];

	for (const variant of lineVariants) {
		const lines: string[] = [];
		lines.push(`【ポケカ${fallbackTitle}】`);
		lines.push(collectedLine);
		if (variant.includeConsecutive && consecutiveLine) {
			lines.push(consecutiveLine);
		}
		for (const [idx, card] of topCards.entries()) {
			lines.push(compactRankLine(card, idx, variant.includeRate));
		}
		lines.push("", "#ポケカ");
		const text = lines.join("\n");
		if (countXWeightedLength(text) <= POKECA_TWEET_TEXT_LIMIT) {
			return { text, displayedCount };
		}
	}

	const fallbackLines = [
		`【ポケカ${rankLabel}】`,
		collectedLine,
		...topCards.map((card, idx) => compactRankLine(card, idx, false)),
		"",
		"#ポケカ",
	];
	return { text: fallbackLines.join("\n"), displayedCount };
}

function hexToBytes(hex: string): Uint8Array {
	const normalized = String(hex ?? "").trim().replace(/[^0-9a-f]/gi, "");
	if (!normalized || normalized.length % 2 !== 0) return new Uint8Array();
	const out = new Uint8Array(normalized.length / 2);
	for (let i = 0; i < normalized.length; i += 2) {
		out[i / 2] = Number.parseInt(normalized.slice(i, i + 2), 16);
	}
	return out;
}

function base64ToBytes(base64: string): Uint8Array {
	const cleaned = String(base64 ?? "").trim();
	if (!cleaned) return new Uint8Array();
	const binary = atob(cleaned);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i += 1) {
		bytes[i] = binary.charCodeAt(i);
	}
	return bytes;
}

async function decryptPokecaApiPayload(
	cipherBase64: string,
	passphrase: string,
	saltHex: string,
	ivHex: string,
): Promise<string | null> {
	try {
		const encoder = new TextEncoder();
		const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(passphrase), "PBKDF2", false, [
			"deriveBits",
		]);
		const keyBits = await crypto.subtle.deriveBits(
			{
				name: "PBKDF2",
				hash: "SHA-512",
				iterations: 100,
				salt: hexToBytes(saltHex),
			},
			keyMaterial,
			256,
		);
		const aesKey = await crypto.subtle.importKey("raw", keyBits, { name: "AES-CBC" }, false, ["decrypt"]);
		const plain = await crypto.subtle.decrypt(
			{ name: "AES-CBC", iv: hexToBytes(ivHex) },
			aesKey,
			base64ToBytes(cipherBase64),
		);
		return new TextDecoder().decode(plain);
	} catch {
		return null;
	}
}

async function fetchPokecaApiItems(): Promise<PokecaApiItem[]> {
	try {
		const res = await fetch(POKECA_CHART_API_URL, {
			headers: { "user-agent": "Mozilla/5.0", referer: POKECA_CHART_URL_ORIGIN },
		});
		if (!res.ok) return [];
		const body = (await res.json()) as {
			code?: number;
			data?: { c?: string; s?: string; i?: string };
		};
		if (body.code !== 0 || !body.data?.c || !body.data?.s || !body.data?.i) return [];
		const passphrase = `${POKECA_CHART_PASS_PHRASE_HEAD}${getJstYmd()}`;
		const decrypted = await decryptPokecaApiPayload(body.data.c, passphrase, body.data.s, body.data.i);
		if (!decrypted) return [];
		const parsed = JSON.parse(decrypted) as Record<string, PokecaApiItem>;
		return Object.values(parsed ?? {});
	} catch {
		return [];
	}
}

function pickPokecaCardsFromRank(items: PokecaApiItem[], rank: PokecaRankTarget): PokecaSummaryCard[] {
	const sorted = [...items].sort((a, b) => {
		const aValue = getPokecaRankSortValue(a, rank);
		const bValue = getPokecaRankSortValue(b, rank);
		if (rank === "rank_fall_7") return aValue - bValue;
		return bValue - aValue;
	});
	const nowIso = new Date().toISOString();
	const cards: PokecaSummaryCard[] = [];
	for (const item of sorted) {
		const slug = String(item.strSlug ?? "").trim();
		const cardName = String(item.strName ?? "").trim();
		const price = getPokecaSummaryPrice(item);
		if (!slug || !cardName || price == null) continue;
		const priceInfo0 = item.arrayPriceInfo?.["0"];
		const riseFallRate7Raw = Number(priceInfo0?.fRiseFallRate7 ?? NaN);
		const riseFallRate7 = Number.isFinite(riseFallRate7Raw) ? riseFallRate7Raw : null;
		const riseFallPrice7Raw = Number(priceInfo0?.nRiseFallPrice7 ?? NaN);
		const riseFallPrice7 = Number.isFinite(riseFallPrice7Raw) ? riseFallPrice7Raw : null;
		const imageUrlRaw = String(item.strImgUrl ?? "").trim();
		const imageUrl = imageUrlRaw && /^https?:\/\//i.test(imageUrlRaw) ? imageUrlRaw : null;
		cards.push({
			cardName,
			price,
			riseFallRate7,
			riseFallPrice7,
			imageUrl,
			url: normalizePokecaCardUrl(slug),
			fetchedAt: nowIso,
		});
	}
	return cards;
}

async function runPokecaSummaryDebug(): Promise<Record<string, unknown>> {
	const items = await fetchPokecaApiItems();
	const riseCards = pickPokecaCardsFromRank(items, "rank_rise_7").slice(0, 3);
	const canvasSupport = {
		offscreenCanvas: typeof (globalThis as any).OffscreenCanvas !== "undefined",
		createImageBitmap: typeof (globalThis as any).createImageBitmap !== "undefined",
		imageDecoder: typeof (globalThis as any).ImageDecoder !== "undefined",
	};
	let collageCheck: { attempted: boolean; ok: boolean; reason?: string } = { attempted: false, ok: false };
	try {
		const testCards = riseCards
			.filter((c) => c.imageUrl)
			.slice(0, 3)
			.map((c) => ({ url: c.imageUrl as string, cardName: c.cardName }));
		if (testCards.length >= 1) {
			collageCheck.attempted = true;
			const blob = await buildPokecaSummaryCollageImage("debug", testCards);
			collageCheck.ok = Boolean(blob);
			if (!blob) collageCheck.reason = lastPokecaCollageDebugReason ?? "buildPokecaSummaryCollageImage_returned_null";
		} else {
			collageCheck.reason = "no_test_images";
		}
	} catch (e) {
		collageCheck = {
			attempted: true,
			ok: false,
			reason: e instanceof Error ? e.message : "unknown_error",
		};
	}
	return {
		ok: true,
		mode: "pokeca_summary_debug",
		apiUrl: POKECA_CHART_API_URL,
		items: items.length,
		canvasSupport,
		collageCheck,
		topRise3: riseCards.map((card, idx) => ({
			rank: idx + 1,
			cardName: card.cardName,
			price: card.price,
			url: card.url,
			imageUrl: card.imageUrl,
		})),
	};
}

function getPokecaArchiveImageExtension(contentType: string | null): string {
	const normalized = String(contentType ?? "").toLowerCase();
	if (normalized.includes("png")) return ".png";
	if (normalized.includes("webp")) return ".webp";
	if (normalized.includes("gif")) return ".gif";
	return ".jpg";
}

function makePokecaArchiveImageKey(dateKey: string, index: number, cardUrl: string): string {
	try {
		const path = new URL(cardUrl).pathname.replace(/^\/+|\/+$/g, "");
		const compactPath = path.replace(/[^a-zA-Z0-9/_-]/g, "").replace(/\//g, "_");
		const base = compactPath || `card_${index + 1}`;
		return `pokeca-summary/${dateKey}/${String(index + 1).padStart(3, "0")}_${base}`;
	} catch {
		return `pokeca-summary/${dateKey}/${String(index + 1).padStart(3, "0")}_card`;
	}
}

function getPokecaSummaryDailyKey(dateKey: string, rankTarget: PokecaRankTarget): string {
	return `${POKECA_SUMMARY_DAILY_PREFIX}${dateKey}:${rankTarget}`;
}

function isPokecaImageArchiveEnabled(env: MonitorEnv): boolean {
	return parseBooleanEnv(env.POKECA_ARCHIVE_IMAGES, true);
}

async function loadPokecaSummarySnapshot(
	stateStore: StateStore,
	dateKey: string,
	rankTarget: PokecaRankTarget,
): Promise<PokecaSummarySnapshot | null> {
	const raw = await stateStore.get(getPokecaSummaryDailyKey(dateKey, rankTarget));
	if (!raw) return null;
	try {
		const parsed = JSON.parse(raw) as Partial<PokecaSummarySnapshot>;
		if (parsed.rankTarget !== rankTarget || !Array.isArray(parsed.cards) || parsed.cards.length === 0) return null;
		const cards = parsed.cards.filter(
			(card): card is PokecaSummaryCard =>
				Boolean(card) &&
				typeof card.cardName === "string" &&
				typeof card.price === "number" &&
				typeof card.url === "string" &&
				typeof card.fetchedAt === "string",
		).slice(0, POKECA_SNAPSHOT_TOP_LIMIT);
		if (cards.length === 0) return null;
		return {
			rankTarget,
			cards,
			apiItemCount: Number(parsed.apiItemCount ?? cards.length),
			snapshotFetchedAt: String(parsed.snapshotFetchedAt ?? ""),
		};
	} catch {
		return null;
	}
}

async function loadRecentPokecaSummarySnapshotForComparison(
	stateStore: StateStore,
	now: Date,
	rankTarget: PokecaRankTarget,
	maxDaysBack = 14,
): Promise<{ dateKey: string; snapshot: PokecaSummarySnapshot } | null> {
	for (let days = 1; days <= maxDaysBack; days += 1) {
		const key = getJstYmdShifted(now, -days);
		const snapshot = await loadPokecaSummarySnapshot(stateStore, key, rankTarget);
		if (snapshot) {
			return { dateKey: key, snapshot };
		}
	}
	return null;
}

function hasPokecaChangeMetrics(cards: PokecaSummaryCard[]): boolean {
	return cards.some(
		(card) =>
			(typeof card.riseFallPrice7 === "number" && Number.isFinite(card.riseFallPrice7)) ||
			(typeof card.riseFallRate7 === "number" && Number.isFinite(card.riseFallRate7)),
	);
}

async function archivePokecaSummaryImages(
	cards: PokecaSummaryCard[],
	dateKey: string,
	env: MonitorEnv,
): Promise<{ archived: number; skipped: number; failed: number }> {
	const bucket = env.POKECA_IMAGE_ARCHIVE;
	if (!bucket || !isPokecaImageArchiveEnabled(env)) {
		return { archived: 0, skipped: cards.length, failed: 0 };
	}
	let archived = 0;
	let skipped = 0;
	let failed = 0;
	for (const [index, card] of cards.entries()) {
		if (!card.imageUrl) {
			card.imageR2Key = null;
			skipped += 1;
			continue;
		}
		try {
			const imageRes = await fetch(card.imageUrl, {
				headers: { "user-agent": "Mozilla/5.0" },
			});
			if (!imageRes.ok) {
				card.imageR2Key = null;
				failed += 1;
				continue;
			}
			const contentType = imageRes.headers.get("content-type");
			if (!String(contentType ?? "").toLowerCase().startsWith("image/")) {
				card.imageR2Key = null;
				skipped += 1;
				continue;
			}
			const baseKey = makePokecaArchiveImageKey(dateKey, index, card.url);
			const objectKey = `${baseKey}${getPokecaArchiveImageExtension(contentType)}`;
			await bucket.put(objectKey, imageRes.body, {
				httpMetadata: contentType ? { contentType } : undefined,
				customMetadata: {
					cardName: card.cardName,
					sourceUrl: card.url,
					imageUrl: card.imageUrl,
					fetchedAt: card.fetchedAt,
				},
			});
			card.imageR2Key = objectKey;
			archived += 1;
		} catch {
			card.imageR2Key = null;
			failed += 1;
		}
	}
	return { archived, skipped, failed };
}

async function runPokecaSummary(
	env: MonitorEnv,
	options: {
		commit?: boolean;
		logToConsole?: boolean;
		fromSchedule?: boolean;
		rank?: string | null;
		imageLimit?: number;
		templateImageUrl?: string | null;
		preferStoredSnapshot?: boolean;
		persistSnapshotOnly?: boolean;
		persistFetchedSnapshot?: boolean;
		preloadedItems?: PokecaApiItem[] | null;
	} = {},
): Promise<Record<string, unknown>> {
	const {
		commit = false,
		logToConsole = true,
		fromSchedule = false,
		rank,
		imageLimit,
		templateImageUrl,
		preferStoredSnapshot = false,
		persistSnapshotOnly = false,
		persistFetchedSnapshot = true,
		preloadedItems = null,
	} = options;
	const stateStore = createStateStore(env);
	const now = new Date();
	const jstNow = getJstNow(now);
	const dateKey = getJstYmd(now);
	const resolvedRank = resolvePokecaRankTarget(rank, jstNow);
	let rankTarget = resolvedRank.rankTarget;
	let rankSource: "param" | "auto_weekday" | "default" | "ai_theme" = resolvedRank.rankSource;
	if (!rank && rankSource !== "param") {
		const aiPick = await choosePokecaRankTargetByAi(env, stateStore, now);
		if (aiPick.ok && aiPick.rankTarget) {
			rankTarget = aiPick.rankTarget;
			rankSource = "ai_theme";
		}
		const recentHistory = await getPokecaThemeHistory(stateStore);
		if (recentHistory.length >= 2 && recentHistory[0] === rankTarget && recentHistory[1] === rankTarget) {
			const alternatives: PokecaRankTarget[] = ["rank_rise_7", "rank_fall_7", "rank_vol"];
			const next = alternatives.find((candidate) => candidate !== rankTarget);
			if (next) {
				rankTarget = next;
				rankSource = "ai_theme";
			}
		}
	}
	const rankLabel = getPokecaRankLabel(rankTarget);
	const kvKey = getPokecaSummaryDailyKey(dateKey, rankTarget);
	const prevDateKey = getJstYmdShifted(now, -1);
	let cards: PokecaSummaryCard[] | null = null;
	let currentItems: PokecaApiItem[] | null = Array.isArray(preloadedItems) ? preloadedItems : null;
	let fetchedCount = 0;
	let archive = { archived: 0, skipped: 0, failed: 0 };
	let snapshotSource: "stored" | "fetched" = "fetched";

	if (preferStoredSnapshot) {
		const snapshot = await loadPokecaSummarySnapshot(stateStore, dateKey, rankTarget);
		if (snapshot) {
			cards = snapshot.cards;
			fetchedCount = snapshot.apiItemCount;
			snapshotSource = "stored";
			const requiresChangeMetrics = rankTarget === "rank_rise_7" || rankTarget === "rank_fall_7";
			if (requiresChangeMetrics && !hasPokecaChangeMetrics(cards)) {
				cards = null;
				snapshotSource = "fetched";
			}
		}
	}

	if (!cards) {
		const items = currentItems ?? (await fetchPokecaApiItems());
		currentItems = items;
		fetchedCount = items.length;
		cards = pickPokecaCardsFromRank(items, rankTarget).slice(0, POKECA_SNAPSHOT_TOP_LIMIT);
		if (persistFetchedSnapshot) {
			archive = await archivePokecaSummaryImages(cards, dateKey, env);
			const snapshot: PokecaSummarySnapshot = {
				rankTarget,
				cards,
				apiItemCount: items.length,
				snapshotFetchedAt: new Date().toISOString(),
			};
			await stateStore.put(kvKey, JSON.stringify(snapshot));
		}
	}
	if (persistSnapshotOnly) {
		const result = {
			ok: cards.length > 0,
			fromSchedule,
			commitMode: commit,
			committed: false,
			postedToX: false,
			persistSnapshotOnly,
			persistFetchedSnapshot,
			rankTarget,
			rankSource,
			rankLabel,
			fetchedCount,
			displayedCount: 0,
			archive,
			snapshotKey: kvKey,
			snapshotSource,
			snapshotCardCount: cards.length,
			snapshotTopLimit: POKECA_SNAPSHOT_TOP_LIMIT,
			imageLimitUsed: 0,
			messageLengthWeighted: 0,
			previewMessage: "",
			previewImages: [],
			xResponse: null,
		};
		if (logToConsole) console.log(JSON.stringify({ type: "POKECA_SUMMARY_RESULT", ...result }, null, 2));
		return result;
	}

	if (cards.length < POKECA_POST_RANK_LIMIT) {
		const result = {
			ok: false,
			reason: "pokeca_rank_fetch_failed",
			fromSchedule,
			rankTarget,
			rankSource,
			fetchedItems: fetchedCount,
			fetchedCards: cards.length,
		};
		if (logToConsole) console.log(JSON.stringify({ type: "POKECA_SUMMARY_SKIP", ...result }, null, 2));
		return result;
	}
	const rankedCards = cards.slice(0, POKECA_POST_RANK_LIMIT);
	const comparisonSnapshot = await loadRecentPokecaSummarySnapshotForComparison(stateStore, now, rankTarget);
	const comparisonDateKey = comparisonSnapshot?.dateKey ?? prevDateKey;
	const previousCards = comparisonSnapshot?.snapshot.cards?.slice(0, POKECA_SNAPSHOT_TOP_LIMIT) ?? [];
	const previousTopCards = previousCards.slice(0, POKECA_POST_RANK_LIMIT);
	const consecutiveEntries = pickPokecaConsecutiveRankIns(rankedCards, previousTopCards);
	const consecutiveLine = buildPokecaConsecutiveRankLine(consecutiveEntries, rankLabel);
	let originalCandidates = buildPokecaOriginalCandidates(cards, previousCards, comparisonDateKey, dateKey);
	if (originalCandidates.length === 0) {
		try {
			const itemsForOriginal = currentItems ?? (await fetchPokecaApiItems());
			const todayUnionCards = mergePokecaCardsUnique(
				POKECA_SNAPSHOT_RANK_TARGETS.map((target) =>
					pickPokecaCardsFromRank(itemsForOriginal, target).slice(0, POKECA_SNAPSHOT_TOP_LIMIT),
				),
			);
			const baseComparison = (await loadRecentPokecaSummarySnapshotForComparison(stateStore, now, "rank_vol")) ?? comparisonSnapshot;
			const baseComparisonDateKey = baseComparison?.dateKey ?? comparisonDateKey;
			const previousUnionCards = mergePokecaCardsUnique(
				(
					await Promise.all(
						POKECA_SNAPSHOT_RANK_TARGETS.map(async (target) => {
							const snapshot = await loadPokecaSummarySnapshot(stateStore, baseComparisonDateKey, target);
							return snapshot?.cards?.slice(0, POKECA_SNAPSHOT_TOP_LIMIT) ?? [];
						}),
					)
				).filter((group) => group.length > 0),
			);
			const unionCandidates = buildPokecaOriginalCandidates(
				todayUnionCards,
				previousUnionCards,
				baseComparisonDateKey,
				dateKey,
			);
			if (unionCandidates.length > 0) originalCandidates = unionCandidates;
		} catch {
			// keep base candidates
		}
	}
	let selectedOriginalCandidate: PokecaOriginalCandidate | null = null;
	if (originalCandidates.length > 0) {
		const lastFingerprint = String((await stateStore.get(POKECA_SUMMARY_LAST_POST_FINGERPRINT_KEY)) ?? "").trim();
		const recentThemeKeys = await getPokecaOriginalThemeHistory(stateStore);
		selectedOriginalCandidate = pickPokecaOriginalCandidateByScore(originalCandidates, {
			recentThemeKeys,
			lastFingerprint,
		});
		// スコア選定の同点/近似ケースのみAIで補助判定（失敗時はスコア選定を維持）
		if (selectedOriginalCandidate) {
			const topTwo = [...originalCandidates]
				.map((c) => ({
					candidate: c,
					score: scorePokecaOriginalCandidate(c, { recentThemeKeys, lastFingerprint }),
				}))
				.sort((a, b) => b.score - a.score)
				.slice(0, 2);
			if (topTwo.length >= 2 && Math.abs(topTwo[0].score - topTwo[1].score) <= 0.9) {
				const aiCandidatePick = await choosePokecaOriginalCandidateByAi(env, stateStore, now, topTwo.map((x) => x.candidate));
				if (aiCandidatePick.ok && aiCandidatePick.key) {
					selectedOriginalCandidate =
						topTwo.map((x) => x.candidate).find((c) => c.key === aiCandidatePick.key) ?? selectedOriginalCandidate;
				}
			}
		}
	}
	const lastVolVariant = rankTarget === "rank_vol"
		? String((await stateStore.get(POKECA_SUMMARY_LAST_VOL_VARIANT_KEY)) ?? "").trim()
		: "";
	let built = selectedOriginalCandidate
		? buildPokecaOriginalCandidateMessage(selectedOriginalCandidate)
		: buildPokecaSummaryOriginalMessage(rankedCards, rankLabel, rankTarget, now, {
				consecutiveLine,
				prevCards: previousCards,
				prevDateKey: comparisonDateKey,
				dateKey,
				volVariantOffset: 0,
		  });
	if (
		!selectedOriginalCandidate &&
		rankTarget === "rank_vol" &&
		lastVolVariant &&
		built.variantKey &&
		built.variantKey === lastVolVariant
	) {
		built = buildPokecaSummaryOriginalMessage(rankedCards, rankLabel, rankTarget, now, {
			consecutiveLine,
			prevCards: previousCards,
			prevDateKey: comparisonDateKey,
			dateKey,
			volVariantOffset: 1,
		});
	}
	let message = built.text;
	const displayedCount = built.displayedCount;
	let postCards = rankedCards;
	if (selectedOriginalCandidate) {
		const byName = new Map<string, PokecaSummaryCard[]>();
		for (const card of cards) {
			const key = String(card.cardName ?? "").trim();
			const bucket = byName.get(key) ?? [];
			bucket.push(card);
			byName.set(key, bucket);
		}
		const picked = selectedOriginalCandidate.rows
			.map((r) => {
				const key = String(r.cardName ?? "").trim();
				const bucket = byName.get(key);
				if (!bucket || bucket.length === 0) return null;
				return bucket.shift() ?? null;
			})
			.filter((c): c is PokecaSummaryCard => Boolean(c))
			.slice(0, 3);
		if (picked.length > 0) {
			postCards = [...picked, ...rankedCards.filter((c) => !picked.includes(c))].slice(0, POKECA_POST_RANK_LIMIT);
		}
	}
	if (
		!selectedOriginalCandidate &&
		(rankTarget === "rank_rise_7" || rankTarget === "rank_fall_7") &&
		/前日比(?:上昇額|下落額)ランキング/u.test(message)
	) {
		const byName = new Map<string, PokecaSummaryCard[]>();
		for (const card of cards) {
			const key = String(card.cardName ?? "").trim();
			const bucket = byName.get(key) ?? [];
			bucket.push(card);
			byName.set(key, bucket);
		}
		const deltaTop = buildPokecaDailyDeltaEntries(cards, previousCards, rankTarget).slice(0, POKECA_POST_RANK_LIMIT);
		const picked = deltaTop
			.map((entry) => {
				const key = String(entry.cardName ?? "").trim();
				const bucket = byName.get(key);
				if (!bucket || bucket.length === 0) return null;
				return bucket.shift() ?? null;
			})
			.filter((c): c is PokecaSummaryCard => Boolean(c));
		if (picked.length > 0) {
			postCards = [...picked, ...cards.filter((c) => !picked.includes(c))].slice(0, POKECA_POST_RANK_LIMIT);
		}
	}
	const aiBodyResult: { ok: boolean; reason?: string; model?: string | null } = {
		ok: false,
		reason: "original_style_builder_enabled",
		model: null,
	};
	const aiLeadResult: { ok: boolean; reason?: string; model?: string | null } = {
		ok: false,
		reason: "original_style_builder_enabled",
		model: null,
	};
	const accentRankLabel = selectedOriginalCandidate?.label ?? rankLabel;
	const aiAccentResult = await generatePokecaSummaryAiAccent(env, {
		rankLabel: accentRankLabel,
		rankTarget,
		cards: postCards,
	});
	const accentLine =
		aiAccentResult.ok && aiAccentResult.line ? aiAccentResult.line : getDefaultAccentLine(rankTarget, accentRankLabel);
	message = applyPokecaSummaryAccentLine(message, accentLine);
	const expectedTopNames = extractTopRankNamesFromMessage(message);
	const expectedTopNameSet = new Set(expectedTopNames);
	let actualTopNames = postCards.slice(0, 3).map((c) => normalizePokecaCardNameForCompare(c.cardName));
	let cardTextConsistent =
		expectedTopNames.length === 0 ||
		(expectedTopNames.length === actualTopNames.length &&
			expectedTopNames.every((name, idx) => name === actualTopNames[idx]));
	if (!cardTextConsistent && expectedTopNames.length > 0) {
		const byNormalizedName = new Map<string, PokecaSummaryCard[]>();
		for (const card of cards) {
			const key = normalizePokecaCardNameForCompare(card.cardName);
			const bucket = byNormalizedName.get(key) ?? [];
			bucket.push(card);
			byNormalizedName.set(key, bucket);
		}
		const picked = expectedTopNames
			.map((name) => {
				const bucket = byNormalizedName.get(name);
				if (!bucket || bucket.length === 0) return null;
				return bucket.shift() ?? null;
			})
			.filter((c): c is PokecaSummaryCard => Boolean(c));
		if (picked.length > 0) {
			postCards = [
				...picked,
				...cards.filter((c) => !picked.includes(c) && !expectedTopNameSet.has(normalizePokecaCardNameForCompare(c.cardName))),
			].slice(0, POKECA_POST_RANK_LIMIT);
			actualTopNames = postCards.slice(0, expectedTopNames.length).map((c) => normalizePokecaCardNameForCompare(c.cardName));
			cardTextConsistent =
				expectedTopNames.length === actualTopNames.length &&
				expectedTopNames.every((name, idx) => name === actualTopNames[idx]);
		}
	}
	const resolvedImageLimit =
		typeof imageLimit === "number"
			? Math.max(0, Math.min(3, Math.trunc(imageLimit)))
			: POKECA_POST_IMAGE_LIMIT;
	// フォールバック添付用（コラージュ失敗時）の画像候補
	const imageItems = postCards
		.filter((c) => c.imageUrl)
		.slice(0, resolvedImageLimit)
		.map((c) => ({ url: c.imageUrl!, alt: buildPokecaSummaryImageAlt(c.cardName) }));
	// コラージュ用は常に上位3枚を試す
	const collageSourceItems = postCards
		.filter((c) => c.imageUrl)
		.slice(0, 3)
		.map((c) => ({ url: c.imageUrl!, alt: buildPokecaSummaryImageAlt(c.cardName) }));
	const resolvedTemplateImageUrl = resolvePokecaSummaryTemplateImageUrl(env, templateImageUrl ?? null);
	const collageTitle = resolvePokecaSummaryCollageTitle(message, rankLabel);
	const collage = resolvedTemplateImageUrl
		? null
		: await buildPokecaSummaryCollageImage(
				collageTitle,
				collageSourceItems.map((x) => ({ url: x.url, cardName: x.alt })),
		  );

	let postedToX = false;
	let xResponse: unknown = null;
	let skipReason: string | null = null;
	if (commit) {
		if (!cardTextConsistent) {
			skipReason = "card_text_mismatch";
			xResponse = { ok: false, reason: "card_text_mismatch", expectedTopNames, actualTopNames };
		} else {
			const postResult = await postTweetWithImages(
				message,
				{
					mainImageUrl: resolvedTemplateImageUrl || (collage ? null : (imageItems[0]?.url ?? null)),
					lastOneImageUrl: resolvedTemplateImageUrl ? null : (collage ? null : (imageItems[1]?.url ?? null)),
				},
				env,
				{
					mainImageAlt: resolvedTemplateImageUrl
						? `ポケカまとめ画像: ${collageTitle}`
						: collage
							? null
							: (imageItems[0]?.alt ?? null),
					lastOneImageAlt: resolvedTemplateImageUrl ? null : collage ? null : (imageItems[1]?.alt ?? null),
					additionalImageUrls: resolvedTemplateImageUrl ? [] : collage ? [] : imageItems.slice(2).map((x) => x.url),
					additionalImageAlts: resolvedTemplateImageUrl
						? []
						: collage
							? []
							: imageItems.slice(2).map((x) => x.alt),
					inlineImages: collage ? [{ blob: collage.blob, altText: collage.altText }] : [],
				},
			);
			postedToX = postResult.ok;
			xResponse = postResult;
			if (postedToX) {
				await appendPokecaThemeHistory(stateStore, rankTarget);
				if (selectedOriginalCandidate) {
					await appendPokecaOriginalThemeHistory(stateStore, selectedOriginalCandidate.key);
					await stateStore.put(
						POKECA_SUMMARY_LAST_POST_FINGERPRINT_KEY,
						buildPokecaCandidateFingerprint(selectedOriginalCandidate),
					);
				}
				if (!selectedOriginalCandidate && rankTarget === "rank_vol" && built.variantKey) {
					await stateStore.put(POKECA_SUMMARY_LAST_VOL_VARIANT_KEY, built.variantKey);
				}
			}
		}
	}

	const result = {
		ok: true,
		fromSchedule,
		commitMode: commit,
		committed: commit && postedToX,
		postedToX,
		skipReason,
		persistSnapshotOnly,
		persistFetchedSnapshot,
		rankTarget,
		rankSource,
		rankLabel,
		fetchedCount,
		displayedCount,
		consecutiveRankInCount: consecutiveEntries.length,
		consecutiveRankInLine: consecutiveLine,
		aiBodyUsed: aiBodyResult.ok,
		aiBodyReason: aiBodyResult.ok ? null : aiBodyResult.reason ?? "pokeca_ai_body_fallback",
		aiBodyModel: aiBodyResult.model ?? null,
		aiLeadUsed: aiLeadResult.ok,
		aiLeadReason: aiLeadResult.ok ? null : aiLeadResult.reason ?? "pokeca_ai_fallback",
		aiLeadModel: aiLeadResult.model ?? null,
		aiAccentUsed: aiAccentResult.ok,
		aiAccentReason: aiAccentResult.ok ? null : aiAccentResult.reason ?? "pokeca_ai_accent_fallback",
		aiAccentModel: aiAccentResult.model ?? null,
		archive,
		snapshotKey: kvKey,
		snapshotSource,
		comparisonDateKey,
		snapshotCardCount: cards.length,
		snapshotTopLimit: POKECA_SNAPSHOT_TOP_LIMIT,
		imageLimitUsed: resolvedImageLimit,
		templateImageUsed: Boolean(resolvedTemplateImageUrl),
		templateImageUrl: resolvedTemplateImageUrl,
		collageUsed: Boolean(collage),
		collageReason: collage ? "ok" : (lastPokecaCollageDebugReason ?? null),
		collageTitle: collageTitle,
		cardTextConsistent,
		expectedTopNames,
		actualTopNames,
		originalCandidateKey: selectedOriginalCandidate?.key ?? null,
		originalCandidateLabel: selectedOriginalCandidate?.label ?? null,
		messageLengthWeighted: countXWeightedLength(message),
		previewMessage: message,
		previewImages: imageItems.map((x) => ({ url: x.url, cardName: x.alt })),
		xResponse,
	};
	if (logToConsole) console.log(JSON.stringify({ type: "POKECA_SUMMARY_RESULT", ...result }, null, 2));
	return result;
}

async function seedWatchlistFromSnkrdunk(
	stateStore: StateStore,
	options: { targetCount: number; scanLimit: number },
): Promise<{ seeded: number; scanned: number; watchlist: WatchlistEntry[] }> {
	let current = await getWatchlistEntries(stateStore);
	const targetCount = Math.max(1, options.targetCount);
	if (current.length >= targetCount) {
		return { seeded: 0, scanned: 0, watchlist: current };
	}
	const listing = await fetch("https://snkrdunk.com/departments/hobby", {
		headers: { "user-agent": "Mozilla/5.0" },
	});
	let ids: string[] = [];
	let listingSeedRows: Array<{ apparelId: string; cardName: string; price: number; imageUrl: string | null }> = [];
	let seeded = 0;
	let scanned = 0;
	if (listing.ok) {
		const html = await listing.text();
		listingSeedRows = extractSnkrdunkSeedRowsFromListingHtml(html).slice(0, Math.max(options.scanLimit * 3, 24));
		ids = Array.from(
			new Set(
				[...html.matchAll(/\/apparels\/(\d{3,10})/g)]
					.map((m) => String(m[1] ?? "").trim())
					.filter(Boolean),
			),
		);
	}
	const nowIso = new Date().toISOString();
	for (const row of listingSeedRows) {
		if (current.length >= targetCount) break;
		const key = `snkrdunk:${row.apparelId}`;
		const prev = current.find((item) => item.key === key) ?? null;
		const beforePrice = prev?.currentPrice && prev.currentPrice > 0 ? prev.currentPrice : Math.max(1, Math.round(row.price * 0.97));
		const nextHistory = appendWatchPriceHistory(prev?.priceHistory ?? [], nowIso, row.price);
		const nextItem: WatchlistEntry = {
			key,
			cardName: normalizeSnkrdunkCardName(row.cardName),
			card: normalizeSnkrdunkCardName(row.cardName),
			cardId: null,
			sourceUrl: `https://snkrdunk.com/apparels/${row.apparelId}`,
			sourceSite: "snkrdunk",
			firstSeenAt: prev?.firstSeenAt ?? nowIso,
			lastSeenAt: nowIso,
			currentPrice: row.price,
			beforePrice,
			afterPrice: row.price,
			changePct: calcPercentChange(beforePrice, row.price),
			period: "直近",
			imageUrl: normalizeWatchImageUrl(row.imageUrl, "snkrdunk") ?? prev?.imageUrl ?? null,
			firstSeenPrice: prev?.firstSeenPrice ?? beforePrice,
			priceHistory: nextHistory,
		};
		const existed = current.some((item) => item.key === key);
		current = [nextItem, ...current.filter((item) => item.key !== key)]
			.sort((a, b) => new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime())
			.slice(0, WATCHLIST_LIMIT);
		if (!existed) seeded += 1;
	}
	if (ids.length === 0) {
		ids = [...SNKRDUNK_SEED_FALLBACK_IDS];
	}
	if (ids.length === 0) return { seeded: 0, scanned: 0, watchlist: current };
	const jstSeed = getJstDateSeed() % ids.length;
	const ordered = [...ids.slice(jstSeed), ...ids.slice(0, jstSeed)].slice(0, Math.max(1, options.scanLimit));
	for (const id of ordered) {
		if (current.length >= targetCount) break;
		const sourceUrl = `https://snkrdunk.com/apparels/${id}`;
		scanned += 1;
		try {
			const page = await fetchPriceSpikeSourcePage(sourceUrl);
			if (page.status < 200 || page.status >= 400) continue;
			const price = extractCurrentPriceFromSourceHtml(page.html);
			if (!Number.isFinite(price) || price == null || price <= 0) continue;
			const title = extractSourceTitle(page.html) ?? `snkrdunk-${id}`;
			const cardName = normalizeSnkrdunkCardName(title);
			const key = `snkrdunk:${id}`;
			const prev = current.find((item) => item.key === key) ?? null;
			const beforePrice =
				prev?.currentPrice && prev.currentPrice > 0 ? prev.currentPrice : Math.max(1, Math.round(price * 0.97));
			const nextHistory = appendWatchPriceHistory(prev?.priceHistory ?? [], nowIso, price);
			const sourceOrigin = new URL(page.finalUrl || sourceUrl).origin;
			const imageUrl = normalizeWatchImageUrl(extractOgImageUrl(page.html, sourceOrigin), "snkrdunk");
			const nextItem: WatchlistEntry = {
				key,
				cardName,
				card: cardName,
				cardId: null,
				sourceUrl,
				sourceSite: "snkrdunk",
				firstSeenAt: prev?.firstSeenAt ?? nowIso,
				lastSeenAt: nowIso,
				currentPrice: price,
				beforePrice,
				afterPrice: price,
				changePct: calcPercentChange(beforePrice, price),
				period: "直近",
				imageUrl: imageUrl ?? prev?.imageUrl ?? null,
				firstSeenPrice: prev?.firstSeenPrice ?? beforePrice,
				priceHistory: nextHistory,
			};
			const existed = current.some((item) => item.key === key);
			current = [nextItem, ...current.filter((item) => item.key !== key)]
				.sort((a, b) => new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime())
				.slice(0, WATCHLIST_LIMIT);
			if (!existed) seeded += 1;
		} catch {
			// keep seeding loop resilient
		}
	}
	await stateStore.put(WATCHLIST_KEY, JSON.stringify(current));
	return { seeded, scanned, watchlist: current };
}

async function generateMarketSummaryMessage(
	picked: WatchlistEntry[],
	theme: { label: string; emoji: string; sortBy: "change_desc" | "change_asc" | "spike_recent" | "price_desc" },
	env: MonitorEnv,
): Promise<{ ok: boolean; message?: string; reason?: string }> {
	if (!isMarketSummaryAiEnabled(env)) {
		return { ok: false, reason: "market_summary_ai_disabled" };
	}
	if (!env.ANTHROPIC_API_KEY) return { ok: false, reason: "missing_anthropic_api_key" };
	const model = resolveMarketSummaryModel(env);
	const jstLabel = getJstMarketSummaryLabel();
	const lines = picked.map((item, idx) => {
		const startPrice = getSummaryStartPrice(item);
		const range = `${formatJstMonthDay(getSummaryRangeStartDate(item))}→${formatJstMonthDay(item.lastSeenAt)}`;
		const pct = calcPercentChange(startPrice, item.currentPrice);
		return `${idx + 1}. rank=${getRankBadge(idx)} card=${item.cardName} changeEmoji=${getChangeEmoji(pct)} price=${formatNumber(startPrice)}→${formatNumber(item.currentPrice)} range=${range} pct=${signedPercentText(pct)}`;
	});
	const prompt = [
		"以下の監視銘柄データを元に、X投稿文を1本作成してください。",
		`日付ラベル: ${jstLabel}`,
		`曜日テーマ: ${theme.label} (${theme.emoji})`,
		"",
		"【監視銘柄】",
		...lines,
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
	theme: { label: string; sortBy?: "change_desc" | "change_asc" | "spike_recent" | "price_desc" },
): string {
	const label = getJstMarketSummaryLabel();
	const lines: string[] = [`【${label}${theme.label}】`];
	const priceOnly = theme.sortBy === "price_desc";
	for (const [idx, item] of picked.slice(0, 5).entries()) {
		const startPrice = getSummaryStartPrice(item);
		const pct = calcPercentChange(startPrice, item.currentPrice);
		const rank = getRankBadge(idx);
		const key = compactCardLabel(item.cardName);
		const range = `${formatJstMonthDay(getSummaryRangeStartDate(item))}→${formatJstMonthDay(item.lastSeenAt)}`;
		if (priceOnly) {
			lines.push("", `${rank} ${key}`, `現在価格 ${formatNumber(item.currentPrice)}円`);
		} else {
			lines.push(
				"",
				`${rank} ${key}`,
				`${formatNumber(startPrice)}円→${formatNumber(item.currentPrice)}円（${range} ${signedPercentText(pct)}）`,
			);
		}
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

function normalizeSnkrdunkCardName(title: string): string {
	const cleaned = String(title ?? "")
		.replace(/\s+/g, " ")
		.replace(/\s*[-|｜]\s*スニーカーダンク.*$/i, "")
		.replace(/\s*[-|｜]\s*SNKRDUNK.*$/i, "")
		.trim();
	return cleaned || "ポケモンカード";
}

function isLikelyPokemonCardLabel(label: string): boolean {
	const text = String(label ?? "").trim();
	if (!text) return false;
	// Allow broad Pokemon card names while excluding major non-Pokemon categories.
	if (/ワンピース|one\s*piece|遊戯王|デュエマ|デュエルマスターズ|ドラゴンボール|バトスピ|ヴァイス|union\s*arena|ユニオンアリーナ|gundam|ガンダム|フィギュア|プラモ/i.test(text)) {
		return false;
	}
	return true;
}

function hasMeaningfulChangeForSummary(item: WatchlistEntry): boolean {
	const startPrice = getSummaryStartPrice(item);
	const pct = Math.abs(calcPercentChange(startPrice, item.currentPrice));
	if (pct >= 1) return true;
	const startDay = formatJstMonthDay(getSummaryRangeStartDate(item));
	const endDay = formatJstMonthDay(item.lastSeenAt);
	return startDay !== endDay;
}

function extractSnkrdunkSeedRowsFromListingHtml(
	html: string,
): Array<{ apparelId: string; cardName: string; price: number; imageUrl: string | null }> {
	const rows: Array<{ apparelId: string; cardName: string; price: number; imageUrl: string | null }> = [];
	const pattern =
		/\\"apparelId\\":(\d{3,10}),\\"localizedName\\":\\"([^\\"]+)\\"[\s\S]{0,260}?\\"price\\":([0-9]{2,9})[\s\S]{0,260}?\\"imageUrl\\":\\"([^\\"]+)\\"/g;
	let m: RegExpExecArray | null;
	while ((m = pattern.exec(html)) !== null) {
		const apparelId = String(m[1] ?? "").trim();
		const rawName = decodeHtmlEntities(String(m[2] ?? "").replace(/\\\//g, "/")).trim();
		const price = Number(m[3] ?? NaN);
		const imageUrl = String(m[4] ?? "").replace(/\\\//g, "/").trim();
		if (!apparelId) continue;
		if (!Number.isFinite(price) || price <= 0) continue;
		if (!isLikelyPokemonCardLabel(rawName)) continue;
		const cardName = normalizeSnkrdunkCardName(rawName);
		rows.push({
			apparelId,
			cardName,
			price,
			imageUrl: normalizeWatchImageUrl(imageUrl, "snkrdunk"),
		});
	}
	const dedup = new Map<string, { apparelId: string; cardName: string; price: number; imageUrl: string | null }>();
	for (const row of rows) {
		if (!dedup.has(row.apparelId) || (dedup.get(row.apparelId)?.price ?? 0) < row.price) {
			dedup.set(row.apparelId, row);
		}
	}
	return [...dedup.values()].sort((a, b) => b.price - a.price);
}

function parseBooleanEnv(value: string | undefined, defaultValue: boolean): boolean {
	const normalized = String(value ?? "").trim().toLowerCase();
	if (!normalized) return defaultValue;
	if (["1", "true", "yes", "on"].includes(normalized)) return true;
	if (["0", "false", "no", "off"].includes(normalized)) return false;
	return defaultValue;
}

function isMarketSummaryAiEnabled(env: MonitorEnv): boolean {
	return parseBooleanEnv(env.MARKET_SUMMARY_USE_AI, true);
}

function isPokecaSummaryAiEnabled(env: MonitorEnv): boolean {
	return parseBooleanEnv(env.POKECA_SUMMARY_USE_AI, true);
}

function isXPostingEnabled(env: MonitorEnv): boolean {
	return parseBooleanEnv(env.X_POST_ENABLED, true);
}

function isXApiGuardEnabled(env: MonitorEnv): boolean {
	return parseBooleanEnv(env.X_API_GUARD_ENABLED, true);
}

function resolveXApiDailyRequestLimit(env: MonitorEnv): number {
	const parsed = Math.trunc(Number(env.X_API_DAILY_REQUEST_LIMIT ?? X_API_DEFAULT_DAILY_REQUEST_LIMIT));
	if (!Number.isFinite(parsed)) return X_API_DEFAULT_DAILY_REQUEST_LIMIT;
	return Math.max(1, Math.min(1000, parsed));
}

function isXAutoLikeEnabled(env: MonitorEnv): boolean {
	return parseBooleanEnv(env.X_AUTO_LIKE_ENABLED, false);
}

function resolveXAutoLikeDailyLimit(env: MonitorEnv): number {
	const parsed = Math.trunc(Number(env.X_AUTO_LIKE_DAILY_LIMIT ?? X_AUTO_LIKE_DEFAULT_DAILY_LIMIT));
	if (!Number.isFinite(parsed)) return X_AUTO_LIKE_DEFAULT_DAILY_LIMIT;
	return Math.max(1, Math.min(200, parsed));
}

function resolveXAutoLikeMaxPerRun(env: MonitorEnv, override: number | null): number {
	if (override != null && Number.isFinite(Number(override))) {
		return Math.max(0, Math.min(10, Math.trunc(Number(override))));
	}
	const parsed = Math.trunc(Number(env.X_AUTO_LIKE_MAX_PER_RUN ?? X_AUTO_LIKE_DEFAULT_MAX_PER_RUN));
	if (!Number.isFinite(parsed)) return X_AUTO_LIKE_DEFAULT_MAX_PER_RUN;
	return Math.max(1, Math.min(10, parsed));
}

function resolveXAutoLikeQuery(env: MonitorEnv): string {
	const custom = String(env.X_AUTO_LIKE_QUERY ?? "").trim();
	if (custom) return custom;
	return X_AUTO_LIKE_DEFAULT_QUERY;
}

function isXAutoLikeAiEnabled(env: MonitorEnv): boolean {
	return parseBooleanEnv(env.X_AUTO_LIKE_AI_ENABLED, false);
}

function resolveXAutoLikeAiDailyLimit(env: MonitorEnv): number {
	const parsed = Math.trunc(Number(env.X_AUTO_LIKE_AI_DAILY_LIMIT ?? X_AUTO_LIKE_AI_DEFAULT_DAILY_LIMIT));
	if (!Number.isFinite(parsed)) return X_AUTO_LIKE_AI_DEFAULT_DAILY_LIMIT;
	return Math.max(0, Math.min(100, parsed));
}

function resolveXAutoLikeAiMaxPerRun(env: MonitorEnv): number {
	const parsed = Math.trunc(Number(env.X_AUTO_LIKE_AI_MAX_PER_RUN ?? X_AUTO_LIKE_AI_DEFAULT_MAX_PER_RUN));
	if (!Number.isFinite(parsed)) return X_AUTO_LIKE_AI_DEFAULT_MAX_PER_RUN;
	return Math.max(0, Math.min(10, parsed));
}

function resolveXAutoLikeAiModel(env: MonitorEnv): string {
	const custom = String(env.X_AUTO_LIKE_AI_MODEL ?? "").trim();
	if (custom) return custom;
	return X_AUTO_LIKE_AI_DEFAULT_MODEL;
}

function resolveMarketSummaryModel(env: MonitorEnv): string {
	const custom = String(env.MARKET_SUMMARY_MODEL ?? "").trim();
	if (custom) return custom;
	return DEFAULT_MARKET_SUMMARY_MODEL;
}

function resolvePokecaSummaryModel(env: MonitorEnv): string {
	const custom = String(env.POKECA_SUMMARY_MODEL ?? "").trim();
	if (custom) return custom;
	return DEFAULT_POKECA_SUMMARY_MODEL;
}

function normalizePokecaSummaryAiLead(text: string): string {
	const firstLine = String(text ?? "")
		.replace(/```[\s\S]*?```/g, " ")
		.replace(/https?:\/\/\S+/g, " ")
		.replace(/#[\p{L}\p{N}_]+/gu, " ")
		.split(/\n+/)
		.map((line) => line.trim())
		.find(Boolean);
	if (!firstLine) return "";
	const compact = firstLine.replace(/\s+/g, " ").trim();
	const cleaned = compact.replace(/^[「『【\[]+|[」』】\]]+$/g, "").trim();
	return fitToXWeightedLength(cleaned, 52);
}

function fitToXWeightedLength(text: string, maxLength: number): string {
	let value = String(text ?? "").trim();
	while (value && countXWeightedLength(value) > maxLength) {
		value = value.slice(0, -1).trimEnd();
	}
	return value;
}

function validatePokecaSummaryAiLead(text: string): { ok: boolean; reason?: string } {
	const value = String(text ?? "").trim();
	if (!value) return { ok: false, reason: "empty_ai_text" };
	if (/https?:\/\/\S+/.test(value)) return { ok: false, reason: "ai_contains_url" };
	if (/#[\p{L}\p{N}_]+/u.test(value)) return { ok: false, reason: "ai_contains_hashtag" };
	if (countXWeightedLength(value) > 52) return { ok: false, reason: "ai_text_too_long" };
	return { ok: true };
}

function normalizePokecaSummaryAiAccent(text: string): string {
	const firstLine = String(text ?? "")
		.replace(/```[\s\S]*?```/g, " ")
		.replace(/https?:\/\/\S+/g, " ")
		.split(/\n+/)
		.map((line) => line.trim())
		.find(Boolean);
	if (!firstLine) return "";
	return firstLine.replace(/\s+/g, " ");
}

function validatePokecaSummaryAiAccent(text: string): { ok: boolean; reason?: string } {
	const value = String(text ?? "").trim();
	if (!value) return { ok: false, reason: "empty_ai_text" };
	if (/https?:\/\/\S+/.test(value)) return { ok: false, reason: "ai_contains_url" };
	if (/#[\p{L}\p{N}_]+/u.test(value)) return { ok: false, reason: "ai_contains_hashtag" };
	if (countXWeightedLength(value) > 34) return { ok: false, reason: "ai_text_too_long" };
	if (!/[🔥📈📉✨⚡👀🎯💡🚀✅]/u.test(value)) return { ok: false, reason: "ai_missing_emoji" };
	return { ok: true };
}

function getDefaultAccentLine(rankTarget: PokecaRankTarget, rankLabel?: string): string {
	const label = String(rankLabel ?? "").trim();
	if (label) {
		if (label.includes("下落")) return "📉 変動幅の大きい銘柄をチェック";
		if (label.includes("取引") || label.includes("出来高")) return "👀 取引が集まった銘柄に注目";
		return "📈 値動きの強い銘柄をチェック";
	}
	if (rankTarget === "rank_fall_7") return "📉 変動幅の大きい銘柄をチェック";
	if (rankTarget === "rank_vol") return "👀 取引が集まった銘柄に注目";
	return "📈 値動きの強い銘柄をチェック";
}

async function generatePokecaSummaryAiAccent(
	env: MonitorEnv,
	params: {
		rankLabel: string;
		rankTarget: PokecaRankTarget;
		cards: PokecaSummaryCard[];
	},
): Promise<{ ok: boolean; line?: string; reason?: string; model?: string | null }> {
	if (!isPokecaSummaryAiEnabled(env)) return { ok: false, reason: "pokeca_summary_ai_disabled", model: null };
	if (!env.ANTHROPIC_API_KEY) return { ok: false, reason: "missing_anthropic_api_key", model: null };
	const model = resolvePokecaSummaryModel(env);
	const topRows = params.cards
		.slice(0, 3)
		.map((card, idx) => `${idx + 1}. ${stripPokecaCardVariant(card.cardName)} ${formatNumber(card.price)}円`)
		.join("\n");
	const prompt = [
		"X投稿に入れる短い1行コメントを作成してください。",
		`種別: ${params.rankLabel} (${params.rankTarget})`,
		"上位3件:",
		topRows,
		"",
		"制約:",
		"- 1行のみ",
		"- 12〜30文字",
		"- 絵文字を1〜3個入れる",
		"- URL/ハッシュタグ禁止",
		"- 煽り・断定・予想は禁止",
	].join("\n");
	const response = await callAnthropicTextGeneration({
		system: "短い市場コメントを作る編集者。出力は本文1行のみ。",
		prompt,
		apiKey: env.ANTHROPIC_API_KEY,
		model,
	});
	if (!response.ok || !response.text) {
		return { ok: false, reason: response.reason ?? "anthropic_failed", model };
	}
	const normalized = normalizePokecaSummaryAiAccent(response.text);
	const validation = validatePokecaSummaryAiAccent(normalized);
	if (!validation.ok) {
		return { ok: false, reason: validation.reason ?? "invalid_ai_text", model };
	}
	return { ok: true, line: normalized, model };
}

function applyPokecaSummaryAccentLine(message: string, accentLine: string): string {
	const line = String(accentLine ?? "").trim();
	if (!line) return message;
	const rows = String(message ?? "").split("\n");
	const normalized = line.replace(/\s+/g, " ").trim();
	const alreadyExists = rows.some((row) => row.replace(/\s+/g, " ").trim() === normalized);
	if (alreadyExists) return message;
	let insertAt = rows.findIndex((row) => /^\d{1,2}\/\d{1,2}（/.test(String(row).trim()));
	if (insertAt < 0) insertAt = 0;
	const next = [...rows.slice(0, insertAt + 1), line, ...rows.slice(insertAt + 1)].join("\n");
	return countXWeightedLength(next) <= POKECA_TWEET_TEXT_LIMIT ? next : message;
}

async function getXApiGuardState(stateStore: StateStore, dateKey: string): Promise<{ count: number }> {
	const key = `${X_API_GUARD_DAILY_PREFIX}${dateKey}`;
	const raw = await stateStore.get(key);
	if (!raw) return { count: 0 };
	try {
		const parsed = JSON.parse(raw) as { count?: number };
		const count = Number.isFinite(Number(parsed.count)) ? Math.max(0, Math.trunc(Number(parsed.count))) : 0;
		return { count };
	} catch {
		return { count: 0 };
	}
}

async function setXApiGuardCount(stateStore: StateStore, dateKey: string, count: number): Promise<void> {
	const key = `${X_API_GUARD_DAILY_PREFIX}${dateKey}`;
	await stateStore.put(
		key,
		JSON.stringify({
			dateKey,
			count: Math.max(0, Math.trunc(Number(count) || 0)),
			updatedAt: new Date().toISOString(),
		}),
	);
}

function getNextJstMidnightIso(now = new Date()): string {
	const jst = new Date(now.getTime() + JST_OFFSET_MS);
	jst.setUTCHours(24, 0, 0, 0);
	return new Date(jst.getTime() - JST_OFFSET_MS).toISOString();
}

async function getXApiPausedUntil(stateStore: StateStore): Promise<Date | null> {
	const raw = (await stateStore.get(X_API_GUARD_PAUSED_UNTIL_KEY)) ?? "";
	const value = String(raw).trim();
	if (!value) return null;
	const dt = new Date(value);
	if (!Number.isFinite(dt.getTime())) return null;
	return dt;
}

async function pauseXApiUntilNextJstDay(stateStore: StateStore): Promise<string> {
	const untilIso = getNextJstMidnightIso();
	await stateStore.put(X_API_GUARD_PAUSED_UNTIL_KEY, untilIso);
	return untilIso;
}

async function xApiFetch(
	env: MonitorEnv,
	input: RequestInfo | URL,
	init?: RequestInit,
): Promise<Response> {
	if (!isXApiGuardEnabled(env)) {
		return fetch(input, init);
	}
	const stateStore = createStateStore(env);
	const now = new Date();
	const pausedUntil = await getXApiPausedUntil(stateStore);
	if (pausedUntil && pausedUntil.getTime() > now.getTime()) {
		return new Response(
			JSON.stringify({
				title: "XApiPaused",
				detail: `X API is paused until ${pausedUntil.toISOString()}`,
			}),
			{ status: 429, headers: { "content-type": "application/json" } },
		);
	}

	const dateKey = getJstYmd(now);
	const guard = await getXApiGuardState(stateStore, dateKey);
	const dailyLimit = resolveXApiDailyRequestLimit(env);
	if (guard.count >= dailyLimit) {
		const untilIso = await pauseXApiUntilNextJstDay(stateStore);
		return new Response(
			JSON.stringify({
				title: "XApiDailyLimitReached",
				detail: `Reached daily limit ${dailyLimit}. Paused until ${untilIso}`,
			}),
			{ status: 429, headers: { "content-type": "application/json" } },
		);
	}

	const res = await fetch(input, init);
	await setXApiGuardCount(stateStore, dateKey, guard.count + 1);
	if (res.status === 402) {
		await pauseXApiUntilNextJstDay(stateStore);
	}
	return res;
}

function normalizePokecaSummaryAiMessage(text: string): string {
	return String(text ?? "")
		.replace(/```[\s\S]*?```/g, " ")
		.replace(/\r\n/g, "\n")
		.split("\n")
		.map((line) => line.replace(/\s+$/g, ""))
		.join("\n")
		.trim();
}

function validatePokecaSummaryAiMessage(
	text: string,
	params: {
		cardLines: string[];
		collectedLine: string;
	},
): { ok: boolean; reason?: string } {
	if (!text) return { ok: false, reason: "empty_ai_text" };
	if (countXWeightedLength(text) > POKECA_TWEET_TEXT_LIMIT) return { ok: false, reason: "ai_text_too_long" };
	if (/https?:\/\/\S+/u.test(text)) return { ok: false, reason: "ai_contains_url" };
	const hashtags = text.match(/#[\p{L}\p{N}_]+/gu) ?? [];
	if (hashtags.length !== 1 || hashtags[0] !== "#ポケカ") {
		return { ok: false, reason: "ai_hashtag_policy_violation" };
	}
	if (!text.includes(`#ポケカ`)) return { ok: false, reason: "ai_missing_hashtag" };
	if (/TOP\d+/u.test(text)) return { ok: false, reason: "ai_contains_top_header" };
	if (!text.includes(params.collectedLine)) return { ok: false, reason: "ai_missing_collected_line" };
	for (const line of params.cardLines) {
		if (!text.includes(line)) return { ok: false, reason: "ai_missing_card_line" };
	}
	const lines = text
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean);
	const fixedLineSet = new Set<string>([
		...params.cardLines,
		"#ポケカ",
	]);
	const hasFreeLine = lines.some((line) => !fixedLineSet.has(line));
	if (!hasFreeLine) return { ok: false, reason: "ai_missing_free_comment_line" };
	return { ok: true };
}

async function generatePokecaSummaryAiMessage(
	env: MonitorEnv,
	params: {
		rankLabel: string;
		rankTarget: PokecaRankTarget;
		cards: PokecaSummaryCard[];
		now: Date;
		consecutiveLine: string | null;
	},
): Promise<{ ok: boolean; message?: string; displayedCount?: number; reason?: string; model?: string }> {
	if (!isPokecaSummaryAiEnabled(env)) return { ok: false, reason: "pokeca_summary_ai_disabled" };
	if (!env.ANTHROPIC_API_KEY) return { ok: false, reason: "missing_anthropic_api_key" };
	const model = resolvePokecaSummaryModel(env);
	const rankCountCandidates = [POKECA_POST_RANK_LIMIT, 8, 5, 4, 3].filter(
		(n) => n > 0 && params.cards.length >= n,
	);
	const rankWindow = getPokecaRankWindowLabel(params.rankTarget);
	const dateLabel = formatJstDateLabel(params.now);
	const collectedLine = `${dateLabel}（${rankWindow}）`;
	const consecutiveLine = String(params.consecutiveLine ?? "").trim() || null;
	let lastReason = "ai_generation_failed";

	for (const rankCount of rankCountCandidates) {
		const selectedCards = params.cards.slice(0, rankCount);
		const cardLines = selectedCards.map((card, idx) => buildPokecaSummaryRankLine(card, idx, params.rankTarget));
		const fixedLines = [collectedLine, ...cardLines, "#ポケカ"].join("\n");
		const prompt = [
			"以下の固定情報を使って、X投稿文を1本作成してください。",
			"",
			`ランキング種別: ${params.rankLabel}`,
			`内部キー: ${params.rankTarget}`,
			"",
			"必須ルール:",
			"- 出力は投稿本文のみ",
			"- URLを含めない",
			"- ハッシュタグは #ポケカ のみ",
			"- 断定予測・煽り禁止",
			"- 文字数は280以内",
			"- 下のカード行は『1文字も変更せず』同順序で全行を含める",
			"- `【...TOPN】` の見出しは使わない",
			"- 冒頭1行はタイトル風にし、絵文字を1〜3個入れてにぎやかにする",
			"- カード行以外に、読み手向けの自由コメント行を1行以上入れる",
			"- 文字数が厳しい場合は、日付行や連続ランクイン行を省略してよい",
			"",
			`補足候補（日付）: ${collectedLine}`,
			`補足候補（連続ランクイン）: ${consecutiveLine ?? "なし"}`,
			"",
			"この行は必ず含めてください:",
			fixedLines,
		].join("\n");
		const response = await callAnthropicTextGeneration({
			system:
				"あなたはTCGSTOREのX運用担当。事実データを崩さず、読みやすい市場まとめ投稿を作る編集者。",
			prompt,
			apiKey: env.ANTHROPIC_API_KEY,
			model,
		});
		if (!response.ok || !response.text) {
			lastReason = response.reason ?? "anthropic_failed";
			continue;
		}
		const normalized = normalizePokecaSummaryAiMessage(response.text);
		const validation = validatePokecaSummaryAiMessage(normalized, {
			cardLines,
			collectedLine,
		});
		if (!validation.ok) {
			lastReason = validation.reason ?? "invalid_ai_text";
			continue;
		}
		return { ok: true, message: normalized, displayedCount: rankCount, model };
	}
	return { ok: false, reason: lastReason, model };
}

async function generatePokecaSummaryAiLead(
	env: MonitorEnv,
	params: {
		rankLabel: string;
		rankTarget: PokecaRankTarget;
		topCards: PokecaSummaryCard[];
		consecutiveCount: number;
	},
): Promise<{ ok: boolean; lead?: string; reason?: string; model?: string }> {
	if (!isPokecaSummaryAiEnabled(env)) return { ok: false, reason: "pokeca_summary_ai_disabled" };
	if (!env.ANTHROPIC_API_KEY) return { ok: false, reason: "missing_anthropic_api_key" };
	const model = resolvePokecaSummaryModel(env);
	const topRows = params.topCards
		.slice(0, 3)
		.map(
			(card, idx) =>
				`${idx + 1}. ${card.cardName} ${formatNumber(card.price)}円` +
				`${buildPokecaChangeText(card) ? `（${buildPokecaChangeText(card)}）` : ""}`,
		)
		.join("\n");
	const prompt = [
		"次のランキング投稿に添える「ひとこと」を1行だけ作成してください。",
		"",
		`ランキング種別: ${params.rankLabel}`,
		`内部キー: ${params.rankTarget}`,
		`2日連続ランクイン件数(TOP10): ${params.consecutiveCount}`,
		"上位3件:",
		topRows,
		"",
		"出力ルール:",
		"- 1行のみ",
		"- 20〜42文字程度",
		"- 日本語",
		"- URL/ハッシュタグ禁止",
		"- 断定予測・煽りは禁止",
		"- 「観測メモ」「集計」「スクレイピング」という語は禁止",
	].join("\n");
	const response = await callAnthropicTextGeneration({
		system:
			"あなたはTCGSTOREのX運用担当。データ投稿の前置きとなる自然な1行コメントを、簡潔かつ事実ベースで作成する。",
		prompt,
		apiKey: env.ANTHROPIC_API_KEY,
		model,
	});
	if (!response.ok || !response.text) {
		return { ok: false, reason: response.reason ?? "anthropic_failed", model };
	}
	const normalized = normalizePokecaSummaryAiLead(response.text);
	const validation = validatePokecaSummaryAiLead(normalized);
	if (!validation.ok) {
		return { ok: false, reason: validation.reason ?? "invalid_ai_text", model };
	}
	return { ok: true, lead: normalized, model };
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
		forceLevelParam === "under_1" || forceLevelParam === "under_5"
			? forceLevelParam
			: null;
	const activeForceLevel = forceLevel ?? requestForceLevel;

	const stateStore = createStateStore(env);
	const marketContext = await getLatestMarketContext(stateStore);
	const items = await fetchAllCandidateItems();
	let fastMonitorNeeded = false;

	const results: Array<Record<string, unknown>> = [];

	for (const item of items) {
		const detail = await fetchItemDetail(item);

		const pickedTitle = pickTitle(item, detail);
		const title = pickedTitle.title;
		const matchedMarketContext = pickAlertMarketContext(title, marketContext);

		const under5Key = `${item.source}:${item.url}:under5`;
		const under1Key = `${item.source}:${item.url}:under1`;

		const under5Posted = (await stateStore.get(under5Key)) === "1";
		const under1Posted = (await stateStore.get(under1Key)) === "1";

		let action = "none";
		let committed = false;
		let postedToX = false;
		let xResponse: unknown = null;
		let previewMessage: string | null = null;

		const shouldForceUnder1 = activeForceLevel === "under_1";
		const shouldForceUnder5 = activeForceLevel === "under_5";
		const thresholds = ALERT_THRESHOLDS[item.source];

		const metricValue =
			thresholds.unit === "count" ? detail.detailRemaining : detail.percent;
		const hasMetric = Number.isFinite(metricValue);
		if (!hasMetric && !shouldForceUnder1 && !shouldForceUnder5) continue;
		if (thresholds.unit === "count" && hasMetric && (metricValue as number) <= thresholds.low && !under1Posted) {
			fastMonitorNeeded = true;
		}

		if (((hasMetric && (metricValue as number) <= thresholds.high) || shouldForceUnder1) && !under1Posted) {
			action = "notify_under_1";
			previewMessage = buildAlertMessage({
				source: item.source,
				title,
				remaining: detail.detailRemaining,
				totalCount: detail.totalCount,
				url: item.url,
				level: "under_1",
				includeLastPrize: Boolean(detail.lastOneImageUrl),
				topPrizeNames: detail.topPrizeNames,
				lastOnePrizeName: detail.lastOnePrizeName,
				marketContext: matchedMarketContext,
			});

			if (commit) {
				const imageAlt = buildThresholdAlertImageAlt(title, detail.lastOnePrizeName);
				const postResult = await postTweetWithImages(
					previewMessage,
					{
						mainImageUrl: detail.mainImageUrl,
						lastOneImageUrl: detail.lastOneImageUrl,
					},
					env,
					{ mainImageAlt: imageAlt, lastOneImageAlt: imageAlt },
				);

				postedToX = postResult.ok;
				xResponse = postResult;

				if (postResult.ok) {
					await stateStore.put(under1Key, "1");
					committed = true;
				}
			}
		} else if (((hasMetric && (metricValue as number) <= thresholds.low) || shouldForceUnder5) && !under5Posted) {
			action = "notify_under_5";
			previewMessage = buildAlertMessage({
				source: item.source,
				title,
				remaining: detail.detailRemaining,
				totalCount: detail.totalCount,
				url: item.url,
				level: "under_5",
				includeLastPrize: Boolean(detail.lastOneImageUrl),
				topPrizeNames: detail.topPrizeNames,
				lastOnePrizeName: detail.lastOnePrizeName,
				marketContext: matchedMarketContext,
			});

			if (commit) {
				const imageAlt = buildThresholdAlertImageAlt(title, detail.lastOnePrizeName);
				const postResult = await postTweetWithImages(
					previewMessage,
					{
						mainImageUrl: detail.mainImageUrl,
						lastOneImageUrl: detail.lastOneImageUrl,
					},
					env,
					{ mainImageAlt: imageAlt, lastOneImageAlt: imageAlt },
				);

				postedToX = postResult.ok;
				xResponse = postResult;

				if (postResult.ok) {
					await stateStore.put(under5Key, "1");
					committed = true;
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
			under5Posted,
			under1Posted,
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
		fastMonitorNeeded,
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
		"[tcgstore-x] STATE binding is missing. Using in-memory fallback store for this process.",
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
	topPrizeNames,
	lastOnePrizeName,
	marketContext,
}: {
	source: MonitorSource;
	title: string;
	remaining: number | null;
	totalCount: number | null;
	url: string;
	level: AlertLevel;
	includeLastPrize: boolean;
	topPrizeNames: string[];
	lastOnePrizeName: string | null;
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
			topPrizeNames,
			lastOnePrizeName,
			marketContext,
		});
	}
	const safeRemaining = Number.isFinite(remaining) ? String(remaining) : "?";
	const safeTotal = Number.isFinite(totalCount) ? String(totalCount) : "?";
	const headerPrefix = source === "tcgstore" ? "TCGSTOREオリパ" : "メルカリくじ";
	const lastPrizeLabel = source === "tcgstore" ? "ラスト賞" : "ラスイチ賞";
	const hotIcon = level === "under_1" ? "🔥" : "🏆";

	const lines: string[] = [];

	if (level === "under_1") {
		lines.push(`🚨 ${headerPrefix}「${title}」`, "残りわずか!");
	} else {
		lines.push(`🎯 ${headerPrefix}「${title}」`, "残り少なくなってきました!");
	}

	lines.push("", `残り${safeRemaining}回（全${safeTotal}回）`, "");
	if (includeLastPrize) {
		const safeLastPrizeName = sanitizeCardNameForPost(lastOnePrizeName ?? "").slice(0, 28).trim();
		const targetLine = safeLastPrizeName
			? `${hotIcon} ${lastPrizeLabel}「${safeLastPrizeName}」を狙え`
			: `${hotIcon} ${lastPrizeLabel}を狙え`;
		lines.push(targetLine, "");
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
	topPrizeNames,
	lastOnePrizeName,
	marketContext,
}: {
	title: string;
	remaining: number | null;
	totalCount: number | null;
	url: string;
	level: AlertLevel;
	includeLastPrize: boolean;
	topPrizeNames: string[];
	lastOnePrizeName: string | null;
	marketContext: LatestMarketContext | null;
}): string {
	const safeRemaining = Number.isFinite(remaining) ? formatNumber(remaining as number) : "?";
	const safeTotal = Number.isFinite(totalCount) ? formatNumber(totalCount as number) : "?";
	const headerEmoji = level === "under_1" ? "🚨" : "🎯";
	const phaseLine =
		level === "under_1"
			? "残りわずかです。気になる方は早めに確認してください。"
			: "残りが少なくなってきました。気になる方はチェックしてください。";

	const lines: string[] = [
		`${headerEmoji} メルカリくじ「${title}」`,
		"",
		`残り${safeRemaining}回（全${safeTotal}回）`,
		phaseLine,
		"",
	];
	if (includeLastPrize) {
		const lastPrizeName = sanitizeCardNameForPost(lastOnePrizeName ?? "").slice(0, 28).trim();
		const targetLine = lastPrizeName
			? `🏆 ラスイチ賞「${lastPrizeName}」を狙え`
			: "🏆 ラスイチ賞を狙え";
		lines.push(targetLine, "");
	}
	const marketLine = buildAlertMarketLine(marketContext);
	if (marketLine) {
		lines.push(marketLine, "");
	}
	lines.push(url);
	return lines.join("\n");
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
		additionalImageAlts?: (string | null)[];
		inlineImages?: Array<{ blob: Blob; altText?: string | null }>;
	} = {},
): Promise<Record<string, unknown> & { ok: boolean }> {
	const endpoint = "https://api.x.com/2/tweets";
	if (!isXPostingEnabled(env)) {
		return {
			ok: false,
			status: 0,
			error: "x_posting_disabled",
		};
	}

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
	let altAppliedCount = 0;

	const additionalUrls = options.additionalImageUrls ?? [];
	const additionalAlts = options.additionalImageAlts ?? [];
	const inlineImages = options.inlineImages ?? [];
	const imageCandidates: Array<
		| { kind: "url"; url: string; altText: string | null }
		| { kind: "blob"; blob: Blob; altText: string | null }
	> = [
		{ url: images.mainImageUrl || "", altText: options.mainImageAlt ?? null },
		{ url: images.lastOneImageUrl || "", altText: options.lastOneImageAlt ?? null },
		...additionalUrls.map((url, i) => ({
			url: String(url ?? ""),
			altText: additionalAlts[i] ?? null,
		})),
	]
		.filter((x) => Boolean(x.url))
		.map((x) => ({ kind: "url" as const, ...x }));
	for (const item of inlineImages) {
		if (!(item?.blob instanceof Blob)) continue;
		imageCandidates.push({ kind: "blob", blob: item.blob, altText: item.altText ?? null });
	}

	const seenImageUrl = new Set<string>();
	for (const candidate of imageCandidates) {
		let uploadResult: Record<string, unknown> & { ok: boolean; status: number; mediaId?: string };
		let sourceLabel = "inline_image";
		if (candidate.kind === "url") {
			if (seenImageUrl.has(candidate.url)) continue;
			seenImageUrl.add(candidate.url);
			sourceLabel = candidate.url;
			uploadResult = await uploadImageToX(candidate.url, env);
		} else {
			uploadResult = await uploadImageBlobToX(candidate.blob, env);
		}

		uploadedMedia.push({
			sourceUrl: sourceLabel,
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
				const normalizedAltText = candidate.altText.trim();
				const altResult = await setXMediaAltText(mediaId, normalizedAltText, env);
				uploadedMedia.push({
					sourceUrl: sourceLabel,
					type: "alt_text",
					altText: normalizedAltText,
					...altResult,
				});
				if (!altResult.ok) {
					return {
						ok: false,
						status: altResult.status || 0,
						error: "Image alt text failed",
						uploadedMedia,
					};
				}
				altAppliedCount += 1;
			}
		}

	if (altAppliedCount > 0) {
		await sleep(400);
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

	const res = await xApiFetch(env, endpoint, {
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

	if (!res.ok) {
		const fallbackResult = await postTweetV1Fallback({
			text,
			mediaIds,
			env,
		});
		if (fallbackResult.ok) {
			return {
				...fallbackResult,
				mediaIds,
				uploadedMedia,
				fallbackUsed: true,
			};
		}
		return {
			ok: false,
			status: res.status,
			data,
			mediaIds,
			uploadedMedia,
			fallbackUsed: true,
			fallbackResponse: fallbackResult,
		};
	}

	return {
		ok: res.ok,
		status: res.status,
		data,
		mediaIds,
		uploadedMedia,
	};
}

async function getXAuthenticatedAccount(
	env: MonitorEnv,
): Promise<Record<string, unknown> & { ok: boolean; status: number }> {
	if (!env.X_API_KEY || !env.X_API_KEY_SECRET || !env.X_ACCESS_TOKEN || !env.X_ACCESS_TOKEN_SECRET) {
		return { ok: false, status: 0, error: "Missing X secrets" };
	}
	const endpoint = "https://api.x.com/2/users/me?user.fields=id,name,username,verified";
	const authorization = await buildOAuth1Header({
		method: "GET",
		url: endpoint,
		consumerKey: env.X_API_KEY,
		consumerSecret: env.X_API_KEY_SECRET,
		token: env.X_ACCESS_TOKEN,
		tokenSecret: env.X_ACCESS_TOKEN_SECRET,
	});
	const res = await xApiFetch(env, endpoint, {
		method: "GET",
		headers: { Authorization: authorization },
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
	};
}

async function runXAutoLike(
	env: MonitorEnv,
	options: XAutoLikeOptions = {},
): Promise<Record<string, unknown>> {
	const { commit = false, logToConsole = true, fromSchedule = false, maxLikesPerRun = null } = options;
	const enabled = isXAutoLikeEnabled(env);
	if (fromSchedule && !enabled) {
		const result = {
			ok: false,
			reason: "x_auto_like_disabled",
			fromSchedule,
			commitMode: commit,
			enabled,
		};
		if (logToConsole) console.log(JSON.stringify({ type: "X_AUTO_LIKE_SKIP", ...result }, null, 2));
		return result;
	}
	if (!env.X_API_KEY || !env.X_API_KEY_SECRET || !env.X_ACCESS_TOKEN || !env.X_ACCESS_TOKEN_SECRET) {
		const result = {
			ok: false,
			reason: "missing_x_credentials",
			fromSchedule,
			commitMode: commit,
			enabled,
		};
		if (logToConsole) console.log(JSON.stringify({ type: "X_AUTO_LIKE_SKIP", ...result }, null, 2));
		return result;
	}

	const account = await getXAuthenticatedAccount(env);
	const accountData = (account.data as { data?: { id?: string; username?: string } } | null)?.data ?? null;
	const accountId = String(accountData?.id ?? "").trim();
	const accountUsername = String(accountData?.username ?? "").trim();
	if (!account.ok || !accountId) {
		const result = {
			ok: false,
			reason: "x_account_unavailable",
			fromSchedule,
			commitMode: commit,
			enabled,
			status: account.status,
			account,
		};
		if (logToConsole) console.log(JSON.stringify({ type: "X_AUTO_LIKE_SKIP", ...result }, null, 2));
		return result;
	}

	const stateStore = createStateStore(env);
	const dateKey = getJstYmd(new Date());
	const stateKey = `${X_AUTO_LIKE_STATE_PREFIX}${dateKey}`;
	const state = await loadXAutoLikeState(stateStore, stateKey, dateKey);
	const dailyLimit = resolveXAutoLikeDailyLimit(env);
	const remainingToday = Math.max(0, dailyLimit - state.count);
	const maxPerRunResolved = resolveXAutoLikeMaxPerRun(env, maxLikesPerRun);
	const desiredLikes = Math.min(remainingToday, maxPerRunResolved);
	if (desiredLikes <= 0) {
		const result = {
			ok: true,
			reason: "daily_limit_reached",
			fromSchedule,
			commitMode: commit,
			enabled,
			dateKey,
			dailyLimit,
			likedToday: state.count,
			remainingToday,
		};
		if (logToConsole) console.log(JSON.stringify({ type: "X_AUTO_LIKE_RESULT", ...result }, null, 2));
		return result;
	}

	const query = resolveXAutoLikeQuery(env);
	const search = await searchXRecentTweets(query, env);
	if (!search.ok) {
		const result = {
			ok: false,
			reason: "x_search_failed",
			fromSchedule,
			commitMode: commit,
			enabled,
			query,
			status: search.status,
			error: search.error ?? null,
			response: search.data,
		};
		if (logToConsole) console.log(JSON.stringify({ type: "X_AUTO_LIKE_SKIP", ...result }, null, 2));
		return result;
	}

	const existingLikedIds = new Set(state.likedIds);
	const existingLikedAuthorIds = new Set(state.likedAuthorIds);
	const inspectedTweets = search.tweets
		.map((tweet) => {
			const text = String(tweet.text ?? "");
			const sentiment = evaluateXAutoLikeSentiment(text);
			const commercial = evaluateXAutoLikeCommercial(text, tweet.authorUsername);
			const authorRisk = evaluateXAutoLikeAuthorRisk({
				authorUsername: tweet.authorUsername,
				authorDescription: tweet.authorDescription,
				authorCreatedAt: tweet.authorCreatedAt,
			});
			const isSelf = !tweet.authorId || tweet.authorId === accountId;
			const isDuplicate = existingLikedIds.has(tweet.id);
			const alreadyLikedAuthorToday = existingLikedAuthorIds.has(tweet.authorId);
			return {
				tweetId: tweet.id,
				authorId: tweet.authorId ?? "",
				authorUsername: tweet.authorUsername ?? null,
				text,
				createdAt: tweet.createdAt ?? null,
				authorCreatedAt: tweet.authorCreatedAt ?? null,
				authorDescription: tweet.authorDescription ?? null,
				sentiment,
				commercial,
				authorRisk,
				isSelf,
				isDuplicate,
				alreadyLikedAuthorToday,
			};
		})
		.filter((tweet) => {
			if (!tweet.tweetId) return false;
			if (tweet.isSelf) return false;
			if (tweet.isDuplicate) return false;
			if (tweet.alreadyLikedAuthorToday) return false;
			if (tweet.authorRisk.isRejected) return false;
			return true;
		});

	const aiEnabled = isXAutoLikeAiEnabled(env) && Boolean(env.ANTHROPIC_API_KEY);
	const aiDailyLimit = resolveXAutoLikeAiDailyLimit(env);
	const aiRemainingToday = Math.max(0, aiDailyLimit - state.aiChecks);
	const aiMaxPerRun = resolveXAutoLikeAiMaxPerRun(env);
	const aiBudgetForRun = Math.min(aiRemainingToday, aiMaxPerRun);
	const aiModel = resolveXAutoLikeAiModel(env);

	const ruleCandidates = inspectedTweets.filter(
		(tweet) =>
			tweet.sentiment.ok &&
			tweet.commercial.hitKeywords.length === 0 &&
			!tweet.alreadyLikedAuthorToday &&
			!tweet.authorRisk.isRejected,
	);
	let selected = ruleCandidates.slice(0, desiredLikes);

	const aiEvaluated: Array<Record<string, unknown>> = [];
	if (commit && selected.length < desiredLikes && aiEnabled && aiBudgetForRun > 0) {
		const aiPool = inspectedTweets.filter((tweet) => {
			if (tweet.sentiment.ok) return false;
			if (tweet.sentiment.negativeHits.length > 0) return false;
			if (tweet.commercial.hitKeywords.length > 0) return false;
			if (tweet.alreadyLikedAuthorToday) return false;
			if (tweet.authorRisk.isRejected) return false;
			return true;
		});
		const aiNeed = desiredLikes - selected.length;
		const aiTargets = aiPool.slice(0, Math.max(aiNeed, 1) + aiBudgetForRun - 1);
		let aiUsedNow = 0;
		for (const tweet of aiTargets) {
			if (aiUsedNow >= aiBudgetForRun) break;
			const aiResult = await evaluateXAutoLikeBoundaryWithAi({
				text: tweet.text,
				authorUsername: tweet.authorUsername,
				env,
				model: aiModel,
			});
			aiUsedNow += 1;
			state.aiChecks += 1;
			aiEvaluated.push({
				tweetId: tweet.tweetId,
				authorUsername: tweet.authorUsername,
				ok: aiResult.ok,
				reason: aiResult.reason ?? null,
			});
			if (aiResult.ok) {
				selected.push(tweet);
			}
			if (selected.length >= desiredLikes) break;
		}
	}

	const liked: Array<Record<string, unknown>> = [];
	const failed: Array<Record<string, unknown>> = [];
	const skipped = ruleCandidates.slice(desiredLikes).map((tweet) => ({
		tweetId: tweet.tweetId,
		authorId: tweet.authorId,
		authorUsername: tweet.authorUsername,
		reason: "run_limit",
	}));

	if (commit) {
		for (const item of selected) {
			const likeResult = await likeTweetOnX(accountId, item.tweetId, env);
			if (likeResult.ok) {
				liked.push({
					tweetId: item.tweetId,
					authorId: item.authorId,
					authorUsername: item.authorUsername,
					createdAt: item.createdAt,
					positiveHits: item.sentiment.positiveHits,
				});
				state.count += 1;
				state.likedIds.push(item.tweetId);
				state.likedAuthorIds.push(item.authorId);
			} else {
				failed.push({
					tweetId: item.tweetId,
					authorId: item.authorId,
					authorUsername: item.authorUsername,
					status: likeResult.status,
					error: likeResult.error ?? null,
				});
			}
		}
		state.likedIds = dedupePreserveLast(state.likedIds).slice(-500);
		state.likedAuthorIds = dedupePreserveLast(state.likedAuthorIds).slice(-500);
		await stateStore.put(stateKey, JSON.stringify(state));
	}

	const result = {
		ok: true,
		fromSchedule,
		commitMode: commit,
		enabled,
		dateKey,
		accountId,
		accountUsername,
		query,
		dailyLimit,
		likedToday: state.count,
		remainingToday: Math.max(0, dailyLimit - state.count),
		likedAuthorCountToday: state.likedAuthorIds.length,
		maxLikesPerRun: maxPerRunResolved,
		aiEnabled,
		aiModel: aiEnabled ? aiModel : null,
		aiDailyLimit,
		aiChecksToday: state.aiChecks,
		aiRemainingToday: Math.max(0, aiDailyLimit - state.aiChecks),
		aiMaxPerRun,
		aiBudgetForRun,
		searchResultCount: search.tweets.length,
		candidateCount: ruleCandidates.length,
		selectedCount: selected.length,
		likedCount: liked.length,
		failedCount: failed.length,
		selectedPreview: selected.map((item) => ({
			tweetId: item.tweetId,
			authorId: item.authorId,
			authorUsername: item.authorUsername,
			createdAt: item.createdAt,
			positiveHits: item.sentiment.positiveHits,
			commercialHits: item.commercial.hitKeywords,
			authorRiskReason: item.authorRisk.reason,
			text: fitToXWeightedLength(item.text.replace(/\s+/g, " ").trim(), 80),
		})),
		liked,
		failed,
		aiEvaluatedCount: aiEvaluated.length,
		aiEvaluated,
		skippedCount: skipped.length,
	};
	if (logToConsole) console.log(JSON.stringify({ type: "X_AUTO_LIKE_RESULT", ...result }, null, 2));
	return result;
}

async function searchXRecentTweets(
	query: string,
	env: MonitorEnv,
): Promise<{
	ok: boolean;
	status: number;
	data?: unknown;
	error?: string;
	tweets: Array<{
		id: string;
		text: string;
		authorId: string;
		authorUsername: string | null;
		createdAt: string | null;
		authorCreatedAt: string | null;
		authorDescription: string | null;
	}>;
}> {
	const endpoint = new URL("https://api.x.com/2/tweets/search/recent");
	endpoint.searchParams.set("query", query);
	endpoint.searchParams.set("max_results", "30");
	endpoint.searchParams.set("tweet.fields", "author_id,created_at,lang,text");
	endpoint.searchParams.set("expansions", "author_id");
	endpoint.searchParams.set("user.fields", "id,username,created_at,description");
	const endpointUrl = endpoint.toString();

	const authorization = await buildOAuth1Header({
		method: "GET",
		url: endpointUrl,
		consumerKey: env.X_API_KEY ?? "",
		consumerSecret: env.X_API_KEY_SECRET ?? "",
		token: env.X_ACCESS_TOKEN ?? "",
		tokenSecret: env.X_ACCESS_TOKEN_SECRET ?? "",
	});

	const res = await xApiFetch(env, endpointUrl, {
		method: "GET",
		headers: {
			Authorization: authorization,
		},
	});
	const raw = await res.text();
	let data: {
		data?: Array<{ id?: string; text?: string; author_id?: string; created_at?: string }>;
		includes?: { users?: Array<{ id?: string; username?: string; created_at?: string; description?: string }> };
	} | { raw: string };
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
			error: "x_recent_search_failed",
			tweets: [],
		};
	}

	const users = new Map<string, { username: string; createdAt: string | null; description: string | null }>();
	for (const user of (data as {
		includes?: { users?: Array<{ id?: string; username?: string; created_at?: string; description?: string }> };
	})?.includes
		?.users ?? []) {
		const id = String(user.id ?? "").trim();
		const username = String(user.username ?? "").trim();
		if (!id || !username) continue;
		users.set(id, {
			username,
			createdAt: String(user.created_at ?? "").trim() || null,
			description: String(user.description ?? "").trim() || null,
		});
	}
	const tweets = ((data as { data?: Array<{ id?: string; text?: string; author_id?: string; created_at?: string }> })
		.data ?? [])
		.map((item) => {
			const authorId = String(item.author_id ?? "").trim();
			const user = users.get(authorId) ?? null;
			return {
				id: String(item.id ?? "").trim(),
				text: String(item.text ?? ""),
				authorId,
				authorUsername: user?.username ?? null,
				createdAt: String(item.created_at ?? "").trim() || null,
				authorCreatedAt: user?.createdAt ?? null,
				authorDescription: user?.description ?? null,
			};
		})
		.filter((item) => item.id && item.text && item.authorId);
	return {
		ok: true,
		status: res.status,
		data,
		tweets,
	};
}

async function likeTweetOnX(
	userId: string,
	tweetId: string,
	env: MonitorEnv,
): Promise<Record<string, unknown> & { ok: boolean; status: number }> {
	const endpoint = `https://api.x.com/2/users/${encodeURIComponent(userId)}/likes`;
	const authorization = await buildOAuth1Header({
		method: "POST",
		url: endpoint,
		consumerKey: env.X_API_KEY ?? "",
		consumerSecret: env.X_API_KEY_SECRET ?? "",
		token: env.X_ACCESS_TOKEN ?? "",
		tokenSecret: env.X_ACCESS_TOKEN_SECRET ?? "",
	});
	const res = await xApiFetch(env, endpoint, {
		method: "POST",
		headers: {
			Authorization: authorization,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ tweet_id: tweetId }),
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

async function loadXAutoLikeState(
	stateStore: StateStore,
	key: string,
	dateKey: string,
): Promise<XAutoLikeState> {
	const raw = await stateStore.get(key);
	if (!raw) {
		return {
			dateKey,
			count: 0,
			likedIds: [],
			likedAuthorIds: [],
			aiChecks: 0,
		};
	}
	try {
		const parsed = JSON.parse(raw) as Partial<XAutoLikeState>;
		const likedIds = Array.isArray(parsed.likedIds) ? parsed.likedIds.map((id) => String(id)).filter(Boolean) : [];
		const likedAuthorIds = Array.isArray(parsed.likedAuthorIds)
			? parsed.likedAuthorIds.map((id) => String(id)).filter(Boolean)
			: [];
		return {
			dateKey,
			count: Number.isFinite(Number(parsed.count)) ? Math.max(0, Math.trunc(Number(parsed.count))) : 0,
			likedIds,
			likedAuthorIds,
			aiChecks: Number.isFinite(Number(parsed.aiChecks)) ? Math.max(0, Math.trunc(Number(parsed.aiChecks))) : 0,
		};
	} catch {
		return {
			dateKey,
			count: 0,
			likedIds: [],
			likedAuthorIds: [],
			aiChecks: 0,
		};
	}
}

function dedupePreserveLast(values: string[]): string[] {
	const seen = new Set<string>();
	const out: string[] = [];
	for (let i = values.length - 1; i >= 0; i--) {
		const value = String(values[i] ?? "").trim();
		if (!value || seen.has(value)) continue;
		seen.add(value);
		out.push(value);
	}
	out.reverse();
	return out;
}

function evaluateXAutoLikeSentiment(text: string): { ok: boolean; positiveHits: string[]; negativeHits: string[] } {
	const normalized = String(text ?? "").replace(/\s+/g, " ").trim();
	const lower = normalized.toLowerCase();
	const positiveHits = X_AUTO_LIKE_POSITIVE_KEYWORDS.filter((word) => normalized.includes(word));
	const negativeHits = X_AUTO_LIKE_NEGATIVE_KEYWORDS.filter(
		(word) => normalized.includes(word) || lower.includes(word.toLowerCase()),
	);
	if (negativeHits.length > 0) {
		return { ok: false, positiveHits, negativeHits };
	}
	if (positiveHits.length === 0) {
		return { ok: false, positiveHits, negativeHits };
	}
	if (/https?:\/\/\S+/i.test(normalized) && !/開封|当たっ|ゲット|嬉し|うれし/i.test(normalized)) {
		return { ok: false, positiveHits, negativeHits };
	}
	return { ok: true, positiveHits, negativeHits };
}

function evaluateXAutoLikeCommercial(
	text: string,
	authorUsername: string | null,
): { hitKeywords: string[] } {
	const normalized = String(text ?? "").replace(/\s+/g, " ").trim();
	const username = String(authorUsername ?? "").trim().toLowerCase();
	const hitKeywords = X_AUTO_LIKE_COMMERCIAL_KEYWORDS.filter((word) => {
		const lowerWord = word.toLowerCase();
		return normalized.includes(word) || username.includes(lowerWord);
	});
	return { hitKeywords };
}

function evaluateXAutoLikeAuthorRisk(params: {
	authorUsername: string | null;
	authorDescription: string | null;
	authorCreatedAt: string | null;
}): { isRejected: boolean; reason: string | null } {
	const username = String(params.authorUsername ?? "").trim().toLowerCase();
	const description = String(params.authorDescription ?? "").trim();
	const descriptionLower = description.toLowerCase();

	const createdAtRaw = String(params.authorCreatedAt ?? "").trim();
	const createdAt = createdAtRaw ? new Date(createdAtRaw) : null;
	if (createdAt && Number.isFinite(createdAt.getTime())) {
		const ageDays = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
		if (ageDays >= 0 && ageDays < X_AUTO_LIKE_NEW_ACCOUNT_DAYS) {
			return { isRejected: true, reason: `new_account_${ageDays}d` };
		}
	}

	const commercialProfileWords = X_AUTO_LIKE_COMMERCIAL_KEYWORDS.filter((word) => {
		const w = word.toLowerCase();
		return username.includes(w) || description.includes(word) || descriptionLower.includes(w);
	});
	if (commercialProfileWords.length > 0) {
		return { isRejected: true, reason: `commercial_profile:${commercialProfileWords[0]}` };
	}

	return { isRejected: false, reason: null };
}

async function evaluateXAutoLikeBoundaryWithAi(params: {
	text: string;
	authorUsername: string | null;
	env: MonitorEnv;
	model: string;
}): Promise<{ ok: boolean; reason?: string }> {
	const { text, authorUsername, env, model } = params;
	if (!env.ANTHROPIC_API_KEY) return { ok: false, reason: "missing_anthropic_api_key" };
	const prompt = [
		"次の投稿に公式アカウントが「いいね」して問題ないかを判定してください。",
		"目的はフォロー獲得。個人のポジティブ体験はOK、販売/買取宣伝やネガティブはNGです。",
		"出力はJSONのみ: {\"decision\":\"like\"|\"skip\",\"reason\":\"短く\"}",
		"",
		`author_username: ${String(authorUsername ?? "")}`,
		`text: ${String(text ?? "").slice(0, 500)}`,
	].join("\n");
	const response = await callAnthropicTextGeneration({
		system: "SNS運用の判定者。JSONのみで返答する。",
		prompt,
		apiKey: env.ANTHROPIC_API_KEY,
		model,
	});
	if (!response.ok || !response.text) {
		return { ok: false, reason: response.reason ?? "anthropic_failed" };
	}
	const raw = response.text.trim();
	const normalized = raw.replace(/```json|```/gi, "").trim();
	try {
		const parsed = JSON.parse(normalized) as { decision?: string; reason?: string };
		const decision = String(parsed.decision ?? "").trim().toLowerCase();
		if (decision === "like") return { ok: true, reason: String(parsed.reason ?? "").trim() || "ai_like" };
		return { ok: false, reason: String(parsed.reason ?? "").trim() || "ai_skip" };
	} catch {
		if (/\"decision\"\s*:\s*\"like\"/i.test(normalized) || /\blike\b/i.test(normalized)) {
			return { ok: true, reason: "ai_like_text" };
		}
		return { ok: false, reason: "ai_parse_failed" };
	}
}

async function uploadImageBlobToX(
	imageBlob: Blob,
	env: MonitorEnv,
): Promise<Record<string, unknown> & { ok: boolean; status: number; mediaId?: string }> {
	const endpoint = "https://upload.twitter.com/1.1/media/upload.json";
	const form = new FormData();
	form.append("media", imageBlob, "pokeca-summary-collage.png");

	const authorization = await buildOAuth1Header({
		method: "POST",
		url: endpoint,
		consumerKey: env.X_API_KEY ?? "",
		consumerSecret: env.X_API_KEY_SECRET ?? "",
		token: env.X_ACCESS_TOKEN ?? "",
		tokenSecret: env.X_ACCESS_TOKEN_SECRET ?? "",
	});

	const res = await xApiFetch(env, endpoint, {
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

async function postTweetV1Fallback({
	text,
	mediaIds,
	env,
}: {
	text: string;
	mediaIds: string[];
	env: MonitorEnv;
}): Promise<Record<string, unknown> & { ok: boolean; status: number }> {
	const endpointBase = "https://api.x.com/1.1/statuses/update.json";
	const params = new URLSearchParams();
	params.set("status", text);
	if (mediaIds.length > 0) {
		params.set("media_ids", mediaIds.join(","));
	}
	params.set("tweet_mode", "extended");
	const endpoint = `${endpointBase}?${params.toString()}`;

	const authorization = await buildOAuth1Header({
		method: "POST",
		url: endpoint,
		consumerKey: env.X_API_KEY ?? "",
		consumerSecret: env.X_API_KEY_SECRET ?? "",
		token: env.X_ACCESS_TOKEN ?? "",
		tokenSecret: env.X_ACCESS_TOKEN_SECRET ?? "",
	});

	const res = await xApiFetch(env, endpoint, {
		method: "POST",
		headers: {
			Authorization: authorization,
		},
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
		endpoint: endpointBase,
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

	const res = await xApiFetch(env, endpoint, {
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
	const res = await xApiFetch(env, endpoint, {
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

	const res = await xApiFetch(env, endpoint, {
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

	const res = await xApiFetch(env, endpoint, {
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

	const res = await xApiFetch(env, endpoint, {
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
				if (sourceSite === "snkrdunk" && !isLikelyPokemonCardLabel(cardName)) return null;
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
	const lastOnePrizeName = extractMercariLastOnePrizeName(html, text);

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
		lastOnePrizeName,
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
	const lastOnePrizeName = extractTcgStoreLastPrizeName(html, text);

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
		lastOnePrizeName,
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

function extractMercariLastOnePrizeName(html: string, plainText: string): string | null {
	const text = String(plainText ?? "").replace(/\s+/g, " ");
	const textPatterns = [
		/ラスイチ賞\s*[:：]?\s*([^。]{1,120}?)(?=(?:[A-Z]賞|[0-9]等|残り|\/|¥|$))/u,
		/ラストワン賞\s*[:：]?\s*([^。]{1,120}?)(?=(?:[A-Z]賞|[0-9]等|残り|\/|¥|$))/u,
	];
	for (const pattern of textPatterns) {
		const match = text.match(pattern);
		const cleaned = sanitizeCardNameForPost(String(match?.[1] ?? "")).trim();
		if (cleaned && cleaned.length >= 2) return cleaned.slice(0, 40);
	}
	const htmlPatterns = [
		/ラスイチ賞[\s\S]{0,1600}?<img[^>]+alt="([^"]+)"/iu,
		/ラストワン賞[\s\S]{0,1600}?<img[^>]+alt="([^"]+)"/iu,
	];
	for (const pattern of htmlPatterns) {
		const match = html.match(pattern);
		const cleaned = sanitizeCardNameForPost(decodeHtmlEntities(String(match?.[1] ?? ""))).trim();
		if (cleaned && cleaned.length >= 2) return cleaned.slice(0, 40);
	}
	return null;
}

function extractTcgStoreLastPrizeName(html: string, plainText: string): string | null {
	const text = String(plainText ?? "").replace(/\s+/g, " ");
	const textPatterns = [
		/ラスト賞\s*[:：]?\s*([^。]{1,120}?)(?=(?:[A-Z]賞|[0-9]等|残り|\/|¥|$))/u,
		/LAST\s*PRIZE\s*[:：]?\s*([^。]{1,120}?)(?=(?:[A-Z]賞|[0-9]等|残り|\/|¥|$))/iu,
	];
	for (const pattern of textPatterns) {
		const match = text.match(pattern);
		const cleaned = sanitizeCardNameForPost(String(match?.[1] ?? "")).trim();
		if (cleaned && cleaned.length >= 2) return cleaned.slice(0, 40);
	}
	const htmlPatterns = [
		/ラスト賞[\s\S]{0,1800}?<img[^>]+alt=["']([^"']+)["']/iu,
		/LAST[\s\S]{0,1800}?<img[^>]+alt=["']([^"']+)["']/iu,
	];
	for (const pattern of htmlPatterns) {
		const match = html.match(pattern);
		const cleaned = sanitizeCardNameForPost(decodeHtmlEntities(String(match?.[1] ?? ""))).trim();
		if (cleaned && cleaned.length >= 2) return cleaned.slice(0, 40);
	}
	return null;
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

function buildThresholdAlertImageAlt(title: string, lastOnePrizeName: string | null): string {
	const prizeText = sanitizeCardNameForPost(lastOnePrizeName ?? "").trim() || "名称未取得";
	return `${title} | ラスト賞: ${prizeText}`.slice(0, 1000);
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
