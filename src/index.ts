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

type DailyTcgPreviewOptions = {
	count?: number;
	logToConsole?: boolean;
};

type PriceSpikeItem = {
	card: string;
	before: number;
	after: number;
	change_pct: number;
	fetched_at: string;
	period?: string;
};

type PriceSpikePayload = {
	source: string;
	spikes: PriceSpikeItem[];
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
};

type StateStore = {
	get: (key: string) => Promise<string | null>;
	put: (key: string, value: string) => Promise<void>;
};

const localStateFallback = new Map<string, string>();
const TCGSTORE_LAST_URL_KEY = "last_oripa_url";
const TCGSTORE_HISTORY_KEY = "oripa_url_history";
const MERCARI_LAST_URL_KEY = "last_mercari_url";
const MERCARI_HISTORY_KEY = "mercari_url_history";
const HISTORY_SIZE = 5;
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
- 絵文字は toneMode=calm の時は0〜1個、toneMode=hype の時は1〜3個。使うなら先頭に置く
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
		if (mode === "price_spike") {
			const commit = reqUrl.searchParams.get("commit") === "1";
			const result = await runPriceSpikeMode(request, env, { commit, logToConsole: true });
			return jsonResponse(result);
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
		if (isDailySpotlightCron(event)) {
			await runDailyRandomSpotlight(env, {
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

	const historyRaw = await stateStore.get(TCGSTORE_HISTORY_KEY);
	const recentUrls: string[] = historyRaw ? JSON.parse(historyRaw) : [];
	// 後方互換: 旧キーの値もhistoryに含める
	const legacyUrl = await stateStore.get(TCGSTORE_LAST_URL_KEY);
	if (legacyUrl && !recentUrls.includes(legacyUrl)) recentUrls.push(legacyUrl);

	const dateSeed = getJstDateSeed();

	let selectedIndex = dateSeed % validCandidates.length;
	// 直近HISTORY_SIZE件に含まれる場合は次の候補へ（全周して見つからなければそのまま）
	if (validCandidates.length > 1) {
		for (let i = 0; i < validCandidates.length; i++) {
			const idx = (selectedIndex + i) % validCandidates.length;
			if (!recentUrls.includes(validCandidates[idx].url)) {
				selectedIndex = idx;
				break;
			}
		}
	}
	if (pickOffset !== 0) {
		selectedIndex = (selectedIndex + pickOffset + validCandidates.length) % validCandidates.length;
	}

	const selected = validCandidates[selectedIndex];
	const selectedDetail = await fetchTcgStoreOripaDetail(selected.id);
	const selectedWithDetail: TcgStoreOripaCandidate = {
		...selected,
		maxPerDay: selected.maxPerDay ?? selectedDetail.maxPerDay,
	};
	const messageResult = await buildDailyTcgStorePostMessage({
		selected: selectedWithDetail,
		validCandidates,
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
			const newHistory = [selected.url, ...recentUrls].slice(0, HISTORY_SIZE);
			await stateStore.put(TCGSTORE_HISTORY_KEY, JSON.stringify(newHistory));
			committed = true;
		}
	}

	const result = {
		ok: true,
		fromSchedule,
		commitMode: commit,
		candidateCount: validCandidates.length,
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
		lastPostedUrl: recentUrls[0] ?? null,
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
	return event.cron === "0 3 * * *" || event.cron === "0 12 * * *";
}

async function runDailyRandomSpotlight(
	env: MonitorEnv,
	options: { commit?: boolean; logToConsole?: boolean; fromSchedule?: boolean } = {},
): Promise<Record<string, unknown>> {
	const { commit = false, logToConsole = true, fromSchedule = false } = options;
	const dateSeed = getJstDateSeed();
	const preferredSource = pickDailySpotlightSource(dateSeed);
	const first =
		preferredSource === "mercari"
			? await runDailyMercariSpotlight(env, { commit, logToConsole, fromSchedule })
			: await runDailyTcgStoreSpotlight(env, { commit, logToConsole, fromSchedule });
	if (first.ok) {
		const result = { ok: true, selectedSource: preferredSource, primary: first, fallbackUsed: false };
		if (logToConsole) console.log(JSON.stringify({ type: "DAILY_RANDOM_RESULT", ...result }, null, 2));
		return result;
	}
	const reason = String(first.reason ?? "");
	const canFallback = reason === "no_candidates";
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
		const spike = spikes[0];
		if (!spike || !spike.card) {
			return { ok: false, error: "invalid_payload", committed: false, postedToX: false, previewMessage: "" };
		}
		const stateStore = createStateStore(env);
		const key = `price_spike:${String(spike.card).trim()}`;
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
				{ mainImageUrl: null, lastOneImageUrl: null },
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

async function generatePriceSpikeMessage(
	spike: PriceSpikeItem,
	env: MonitorEnv,
): Promise<{ ok: boolean; message?: string; reason?: string }> {
	if (!env.ANTHROPIC_API_KEY) return { ok: false, reason: "missing_anthropic_api_key" };
	const model = env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
	const period = normalizePriceSpikePeriod(spike.period);
	const prompt = [
		"以下の条件でX投稿文を1本作成してください。",
		"",
		`カード名: ${spike.card}`,
		`前回価格: ${formatNumber(spike.before)}円`,
		`現在価格: ${formatNumber(spike.after)}円`,
		`変化率: +${Number(spike.change_pct).toFixed(2)}%`,
		`比較期間: ${period}`,
		`取得時刻: ${spike.fetched_at}`,
		"",
		"【出力ルール】",
		"- 1行目: カード名 + 『{period}で+{変化率}%』の形式で、期間軸を明確に示す（例: リザードンex SAR、1週間で+33%。）",
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
	const lines = [
		`${spike.card}、${period}で+${Number(spike.change_pct).toFixed(2)}%。`,
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

function escapeRegExp(text: string): string {
	return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function pickDailySpotlightSource(dateSeed: number): "tcgstore" | "mercari" {
	const mixed = ((dateSeed * 2654435761) >>> 0) % 2;
	return mixed === 0 ? "tcgstore" : "mercari";
}

async function runDailyMercariSpotlight(
	env: MonitorEnv,
	options: DailyMercariOptions = {},
): Promise<Record<string, unknown>> {
	const { commit = false, logToConsole = true, fromSchedule = false, pickOffset = 0 } = options;
	const stateStore = createStateStore(env);
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
	const mercariHistoryRaw = await stateStore.get(MERCARI_HISTORY_KEY);
	const mercariRecentUrls: string[] = mercariHistoryRaw ? JSON.parse(mercariHistoryRaw) : [];
	const legacyMercariUrl = await stateStore.get(MERCARI_LAST_URL_KEY);
	if (legacyMercariUrl && !mercariRecentUrls.includes(legacyMercariUrl)) mercariRecentUrls.push(legacyMercariUrl);

	let selectedIndex = dateSeed % candidates.length;
	if (candidates.length > 1) {
		for (let i = 0; i < candidates.length; i++) {
			const idx = (selectedIndex + i) % candidates.length;
			if (!mercariRecentUrls.includes(candidates[idx].item.url)) {
				selectedIndex = idx;
				break;
			}
		}
	}
	if (pickOffset !== 0) {
		selectedIndex = (selectedIndex + pickOffset + candidates.length) % candidates.length;
	}
	const selected = candidates[selectedIndex];
	const message = buildDailyMercariMessage({
		title: selected.title.title,
		url: selected.item.url,
		remaining: selected.detail.detailRemaining,
		totalCount: selected.detail.totalCount,
	});
	let postedToX = false;
	let committed = false;
	let xResponse: unknown = null;
	if (commit) {
		const postResult = await postTweetWithImages(
			message,
			{ mainImageUrl: selected.detail.mainImageUrl, lastOneImageUrl: null },
			env,
		);
		postedToX = postResult.ok;
		xResponse = postResult;
		if (postResult.ok) {
			await stateStore.put(MERCARI_LAST_URL_KEY, selected.item.url);
			const newMercariHistory = [selected.item.url, ...mercariRecentUrls].slice(0, HISTORY_SIZE);
			await stateStore.put(MERCARI_HISTORY_KEY, JSON.stringify(newMercariHistory));
			committed = true;
		}
	}
	const result = {
		ok: true,
		source: "mercari",
		fromSchedule,
		commitMode: commit,
		selectedIndex,
		candidateCount: candidates.length,
		selected: {
			title: selected.title.title,
			titleSource: selected.title.source,
			url: selected.item.url,
			remaining: selected.detail.detailRemaining,
			totalCount: selected.detail.totalCount,
			percent: selected.detail.percent,
			mainImageUrl: selected.detail.mainImageUrl,
		},
		lastPostedUrl: mercariRecentUrls[0] ?? null,
		previewMessage: message,
		postedToX,
		committed,
		xResponse,
	};
	if (logToConsole) console.log(JSON.stringify({ type: "MERCARI_DAILY_RESULT", ...result }, null, 2));
	return result;
}

function buildDailyMercariMessage({
	title,
	url,
	remaining,
	totalCount,
}: {
	title: string;
	url: string;
	remaining: number | null;
	totalCount: number | null;
}): string {
	const rem =
		Number.isFinite(remaining) && Number.isFinite(totalCount) && totalCount && totalCount > 0
			? `残り${formatNumber(remaining as number)}回（全${formatNumber(totalCount)}回）`
			: "販売中のくじをピックアップ";
	const seed = hashSeed(`${title}|${url}|${rem}`);
	const titleEmojis = ["👀", "😏", "😮‍💨", "🫠", ""];
	const lineEndEmojis = ["😏", "👀", "😮‍💨", "🫠", ""];
	const oneLiners = [
		"名前だけで反応する人、いるやつ。",
		"この並び、やっぱり強い。",
		"こういうの、見た瞬間に止まる。",
		"見覚えある人ほど気になるやつ。",
		"懐かしいのに、ちゃんと強い。",
		"王道の空気、静かに残ってる。",
		"刺さる人には一瞬で刺さるやつ。",
		"わかる人には、説明いらない。",
	];
	const titleEmoji = titleEmojis[seed % titleEmojis.length];
	const lineEmoji = lineEndEmojis[(seed >>> 1) % lineEndEmojis.length];
	const oneLiner = oneLiners[(seed >>> 2) % oneLiners.length];
	return [
		"🎉本日のメルカリくじ紹介🎉",
		`🎯 ${title}${titleEmoji ? ` ${titleEmoji}` : ""}`,
		"",
		rem,
		`${oneLiner}${lineEmoji}`,
		"",
		url,
	].join("\n");
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

	const phrase = DAILY_PHRASES[dateSeed % DAILY_PHRASES.length];
	const fallbackMessage = buildDailyTcgStoreFallbackMessage({
		title: selected.name,
		price: selected.price,
		priceUnit: selected.priceUnit,
		phrase,
		url: selected.url,
	});
	return {
		message: applyHashtagPolicy(fallbackMessage, selected.url, requiredTags),
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
		"  例: 「1等確率0.1%のリザードンSAR入り」「最低保証1,100coin・赤字なしで引ける」「1口999coinで〇〇狙い」",
		"  NG: 「⚡黒炎の舞」のような商品名だけの冒頭",
		...(lengthMode === "short"
			? [
					"- ★文字数モード: short★ URL込みで60〜90文字。1〜2文で要点だけサラッと書く。余計な説明は不要。",
					"  事実1つ＋一言だけでOK。例: 「1等確率0.1%、999coinで引けるリザードン入りオリパ。\\n{URL}」",
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
		"- 上位賞の確率データが提供されている場合、具体的な確率を積極的に引用する（読み手の判断材料になる）",
		...(top2Odds
			? [
					`- 1等+2等の言い回しは「1等と2等は約${top2Odds.peoplePerOne}人に1人」を優先する（この商品の事実値: ${top2Odds.percentage.toFixed(2)}%）`,
				]
			: []),
		"- 『1等+2等合計確率』を、全体の保証表現（必ず/全員/100%）に置き換えてはいけない",
		"- ランク名からカテゴリ解釈を作らない（例: Legendary以上 / Legendaryクラス / 上位グレード などは禁止）",
		"- カード名の英単語は原文を勝手に補正しない（例: API原文が Legndary なら Legendary に直さない）",
		"- 『リターンより体験を楽しむ』『目安になる』など、購買意欲を削ぐ曖昧・消極表現は禁止",
		...(top2Probability != null && top2Probability < 1
			? [
					`- 1等+2等合計確率は${top2Probability.toFixed(2)}%（低確率）。魅力として煽らず、低確率である事実を中立に伝える。`,
					"- 「当たりやすい」「狙いやすい」「期待感が上がる」などの誘導表現は禁止。",
				]
			: []),
		`- テンションモードがhypeの時は絵文字1〜3個でメリハリ強め、calmの時は0〜1個で落ち着かせる`,
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
	const startsWithEmoji = /^[\p{Extended_Pictographic}]/u.test(text.trim());
	const bodyText = text.replace(url, "").trim();
	const body = bodyText.toLowerCase();

	const minLen = lengthMode === "short" ? 60 : 100;
	const maxLen = lengthMode === "short" ? 90 : 140;
	if (length < minLen) reasons.push(`文字数が短すぎます(${length}, ${lengthMode}モード最低${minLen})`);
	if (length > maxLen) reasons.push(`文字数が長すぎます(${length}, ${lengthMode}モード最大${maxLen})`);
	if (!text.endsWith(url)) reasons.push("URLが末尾にありません");
	if ((text.match(/#/g) || []).length > 2) reasons.push("ハッシュタグが多すぎます");
	if (!text.includes(url)) reasons.push("URLが含まれていません");
	const maxEmoji = toneMode === "hype" ? 3 : 1;
	if (emojiCount > maxEmoji) reasons.push("絵文字が多すぎます");
	if (emojiCount > 0 && !startsWithEmoji) reasons.push("絵文字は先頭に置いてください");
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
	if (top2Probability != null && top2Probability < 1) {
		if (
			/当たりやす|狙いやす|期待感が(上が|変わ)|魅力|熱い|チャンス|高確率|引き得|アツい/.test(
				text,
			)
		) {
			reasons.push("上位賞低確率（1%未満）なのに煽り表現を検出しました");
		}
	}
	if (
		!/1等|2等|人に1人|最低|保証|1日1回|低額|coinで引ける|挑戦できる|狙い/u.test(text)
	) {
		reasons.push("読み手メリットの具体表現が不足しています");
	}
	const top2Odds = calcTop2Odds(detailFacts, selected.supply);
	if (
		top2Odds &&
		top2Odds.percentage >= 1 &&
		top2Odds.percentage <= 20 &&
		(/1等|2等/.test(text) || /上位/.test(text)) &&
		!new RegExp(`1等.*2等.*${top2Odds.peoplePerOne}人に1人|${top2Odds.peoplePerOne}人に1人.*1等.*2等`).test(
			text,
		)
	) {
		reasons.push(
			`1等+2等の確率は「${top2Odds.peoplePerOne}人に1人」の言い回しを優先してください`,
		);
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
		"#ポケカ";
	if (pattern === "urgency") {
		// Keep urgency posts concise: one tag only.
		return ["#ポケカ"];
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
	const items = await fetchAllCandidateItems();

	const results: Array<Record<string, unknown>> = [];

	for (const item of items) {
		const detail = await fetchItemDetail(item);
		if (detail.percent == null) continue;

		const pickedTitle = pickTitle(item, detail);
		const title = pickedTitle.title;

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

		if ((detail.percent <= 1 || shouldForceUnder1) && !under1Posted) {
			action = "notify_under_1";
			previewMessage = buildAlertMessage({
				source: item.source,
				title,
				remaining: detail.detailRemaining,
				totalCount: detail.totalCount,
				url: item.url,
				level: "under_1",
				includeLastPrize: Boolean(detail.lastOneImageUrl),
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
					await stateStore.put(under1Key, "1");
					committed = true;
				}
			}
		} else if ((detail.percent <= 5 || shouldForceUnder5) && !under5Posted) {
			action = "notify_under_5";
			previewMessage = buildAlertMessage({
				source: item.source,
				title,
				remaining: detail.detailRemaining,
				totalCount: detail.totalCount,
				url: item.url,
				level: "under_5",
				includeLastPrize: Boolean(detail.lastOneImageUrl),
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
}: {
	source: MonitorSource;
	title: string;
	remaining: number | null;
	totalCount: number | null;
	url: string;
	level: AlertLevel;
	includeLastPrize: boolean;
}): string {
	if (source === "mercari") {
		return buildMercariAlertMessage({
			title,
			remaining,
			totalCount,
			url,
			level,
			includeLastPrize,
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
		lines.push(`${hotIcon} ${lastPrizeLabel}を狙え`, "");
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
}: {
	title: string;
	remaining: number | null;
	totalCount: number | null;
	url: string;
	level: AlertLevel;
	includeLastPrize: boolean;
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
		level === "under_1"
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

async function postTweetWithImages(
	text: string,
	images: { mainImageUrl?: string | null; lastOneImageUrl?: string | null },
	env: MonitorEnv,
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

	const imageCandidates = [images.mainImageUrl || null, images.lastOneImageUrl || null].filter(
		Boolean,
	) as string[];

	const uniqueImageUrls = [...new Set(imageCandidates)];

	for (const imageUrl of uniqueImageUrls) {
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

		mediaIds.push(String(uploadResult.mediaId));
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

	const imageUrls = extractImageUrls(html, "https://nft.jp.mercari.com");
	const mainImageUrl =
		extractOgImageUrl(html, "https://nft.jp.mercari.com") || imageUrls[0] || null;
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

	return [...urls];
}

function extractOgImageUrl(html: string, baseOrigin: string): string | null {
	const match = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
	if (!match?.[1]) return null;
	return normalizeUrl(match[1], baseOrigin);
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