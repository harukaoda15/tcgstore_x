import { env, createExecutionContext, waitOnExecutionContext } from "cloudflare:test";
import { afterEach, describe, expect, it, vi } from "vitest";
import worker from "../src/index";

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

function buildFetchMock(handlers: Record<string, (input: RequestInfo | URL, init?: RequestInit) => Response | Promise<Response>>) {
	return vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
		const url = input instanceof Request ? input.url : String(input);
		const handler = handlers[url];
		if (!handler) {
			throw new Error(`Unhandled fetch: ${url}`);
		}
		return handler(input, init);
	});
}

afterEach(() => {
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

describe("stream schedule automation", () => {
	it("builds a preview message from a published spreadsheet CSV", async () => {
		const csvUrl = "https://sheet.example.com/stream.csv";
		const csv = [
			"日付,時間,タイトル,メモ,URL,画像",
			"2026/03/23,20:00,ポケカ対戦,新弾を3BOX開封,https://example.com/live,https://example.com/schedule.png",
			"2026/03/23,22:00,雑談,質問返し,https://example.com/live,https://example.com/schedule.png",
			"2026/03/24,21:00,別日の配信,,,",
		].join("\n");
		const fetchMock = buildFetchMock({
			[csvUrl]: async () => new Response(csv, { status: 200 }),
		});
		vi.stubGlobal("fetch", fetchMock);

		const request = new IncomingRequest(
			"https://example.com/?mode=stream_schedule_preview&target_date=2026-03-23",
		);
		const ctx = createExecutionContext();
		const response = await worker.fetch(
			request,
			{
				...env,
				STREAM_SCHEDULE_CSV_URL: csvUrl,
				STREAM_SCHEDULE_HASHTAGS: "配信予定 TCGSTORE",
			},
			ctx,
		);
		await waitOnExecutionContext(ctx);

		const payload = (await response.json()) as {
			ok: boolean;
			targetDate: string;
			entryCount: number;
			previewMessage: string;
			appendedUrl: string | null;
		};
		expect(payload.ok).toBe(true);
		expect(payload.targetDate).toBe("2026-03-23");
		expect(payload.entryCount).toBe(2);
		expect(payload.previewMessage).toContain("ポケカ対戦");
		expect(payload.previewMessage).toContain("雑談");
		expect(payload.previewMessage).toContain("#配信予定 #TCGSTORE");
		expect(payload.appendedUrl).toBe("https://example.com/live");
	});

	it("posts only once for the same target date during scheduled runs", async () => {
		const csvUrl = "https://sheet.example.com/stream-scheduled.csv";
		const targetDate = "2099-05-01";
		const csv = [
			"date,time,title,note",
			`${targetDate},20:00,夜の配信,ランクマ`,
		].join("\n");
		let tweetCalls = 0;
		const fetchMock = buildFetchMock({
			[csvUrl]: async () => new Response(csv, { status: 200 }),
			"https://api.x.com/2/tweets": async () => {
				tweetCalls += 1;
				return new Response(JSON.stringify({ data: { id: "1" } }), {
					status: 201,
					headers: { "content-type": "application/json" },
				});
			},
		});
		vi.stubGlobal("fetch", fetchMock);

		const sharedEnv = {
			...env,
			STREAM_SCHEDULE_CSV_URL: csvUrl,
			STREAM_SCHEDULE_POST_HOUR_JST: "9",
			X_API_KEY: "key",
			X_API_KEY_SECRET: "secret",
			X_ACCESS_TOKEN: "token",
			X_ACCESS_TOKEN_SECRET: "token-secret",
		};
		const scheduledEvent = {
			cron: "*/10 * * * *",
			scheduledTime: new Date(`${targetDate}T00:10:00.000Z`).getTime(),
			noRetry() {},
		} as ScheduledEvent;

		const ctx1 = createExecutionContext();
		await worker.scheduled(scheduledEvent, sharedEnv, ctx1);
		await waitOnExecutionContext(ctx1);

		const ctx2 = createExecutionContext();
		await worker.scheduled(scheduledEvent, sharedEnv, ctx2);
		await waitOnExecutionContext(ctx2);

		expect(tweetCalls).toBe(1);
	});

	it("supports google sheet edit url and matrix-style schedule rows", async () => {
		const editUrl =
			"https://docs.google.com/spreadsheets/d/1lXDt66zqzO8HSnGPUYgS1aaU2asRfVR9ey2MJzq9N4k/edit?gid=438564440#gid=438564440";
		const exportUrl =
			"https://docs.google.com/spreadsheets/d/1lXDt66zqzO8HSnGPUYgS1aaU2asRfVR9ey2MJzq9N4k/export?format=csv&gid=438564440";
		const jst = new Date(Date.now() + 9 * 60 * 60 * 1000);
		const month = jst.getUTCMonth() + 1;
		const day = jst.getUTCDate();
		const targetDate = `${jst.getUTCFullYear()}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
		const md = `${month}/${day}`;
		const csv = [
			",バックヤード,配信者,3/1,3/2",
			",配信時刻予定,秋葉原,18:00-22:00,",
			",,目黒,19:30-22:30,",
			",,稼働人数,2,2",
		]
			.join("\n")
			.replace("3/1", md);

		const fetchMock = buildFetchMock({
			[exportUrl]: async () => new Response(csv, { status: 200 }),
		});
		vi.stubGlobal("fetch", fetchMock);

		const request = new IncomingRequest(
			`https://example.com/?mode=stream_schedule_preview&target_date=${targetDate}`,
		);
		const ctx = createExecutionContext();
		const response = await worker.fetch(
			request,
			{
				...env,
				STREAM_SCHEDULE_CSV_URL: editUrl,
				STREAM_SCHEDULE_HASHTAGS: "配信予定",
			},
			ctx,
		);
		await waitOnExecutionContext(ctx);

		const payload = (await response.json()) as {
			ok: boolean;
			targetDate: string;
			entryCount: number;
			previewMessage: string;
		};
		expect(payload.ok).toBe(true);
		expect(payload.targetDate).toBe(targetDate);
		expect(payload.entryCount).toBe(2);
		expect(payload.previewMessage).toContain("秋葉原配信");
		expect(payload.previewMessage).toContain("目黒配信");
	});
});

describe("tcj marketplace digest", () => {
	it("creates snapshot first and then detects listed/purchased diffs", async () => {
		const polygonUrl =
			"https://api.tcgstore.io/api/v1/marketplace?skip=0&limit=100&orderBy=published_at&orderDirection=desc&chain_id=polygon&search=";
		const oasysUrl =
			"https://api.tcgstore.io/api/v1/marketplace?skip=0&limit=100&orderBy=published_at&orderDirection=desc&chain_id=oasys&search=";
		const polygonRun1 = {
			data: [
				{
					id: "p1",
					status: 1,
					listing_type: 1,
					chain_id: 137,
					token_id: "101",
					created_at: "2026-03-29T10:00:00.000Z",
					current_price: 100,
					current_currency_id: 5,
					card: { name: "リザードンex", main_image_url: "https://example.com/p1.png" },
				},
				{
					id: "p2",
					status: 1,
					listing_type: 1,
					chain_id: 137,
					token_id: "102",
					created_at: "2026-03-29T10:05:00.000Z",
					current_price: 150,
					current_currency_id: 5,
					card: { name: "ピカチュウex", main_image_url: "https://example.com/p2.png" },
				},
			],
		};
		const polygonRun2 = {
			data: [
				{
					id: "p2",
					status: 1,
					listing_type: 1,
					chain_id: 137,
					token_id: "102",
					created_at: "2026-03-29T10:05:00.000Z",
					current_price: 150,
					current_currency_id: 5,
					card: { name: "ピカチュウex", main_image_url: "https://example.com/p2.png" },
				},
				{
					id: "p3",
					status: 1,
					listing_type: 1,
					chain_id: 137,
					token_id: "103",
					created_at: "2026-03-29T10:10:00.000Z",
					current_price: 180,
					current_currency_id: 5,
					card: { name: "ミュウex", main_image_url: "https://example.com/p3.png" },
				},
			],
		};
		const oasysRun = {
			data: [
				{
					id: "o1",
					status: 1,
					listing_type: 1,
					chain_id: 248,
					token_id: "201",
					created_at: "2026-03-29T10:20:00.000Z",
					current_price: 25,
					current_currency_id: 6,
					card: { name: "ゲンガー", main_image_url: "https://example.com/o1.png" },
				},
			],
		};

		let runIndex = 0;
		let callInRun = 0;
		const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
			const url = input instanceof Request ? input.url : String(input);
			if (url === polygonUrl) {
				const payload = runIndex === 0 ? polygonRun1 : polygonRun2;
				callInRun += 1;
				return new Response(JSON.stringify(payload), {
					status: 200,
					headers: { "content-type": "application/json" },
				});
			}
			if (url === oasysUrl) {
				callInRun += 1;
				const response = new Response(JSON.stringify(oasysRun), {
					status: 200,
					headers: { "content-type": "application/json" },
				});
				if (callInRun % 2 === 0) runIndex += 1;
				return response;
			}
			throw new Error(`Unhandled fetch: ${url}`);
		});
		vi.stubGlobal("fetch", fetchMock);

		const firstReq = new IncomingRequest("https://example.com/?mode=tcj_marketplace_preview");
		const firstCtx = createExecutionContext();
		const firstRes = await worker.fetch(firstReq, env, firstCtx);
		await waitOnExecutionContext(firstCtx);
		const firstPayload = (await firstRes.json()) as { ok: boolean; reason?: string; eventCount?: number };
		expect(firstPayload.ok).toBe(true);
		expect(firstPayload.reason).toBe("tcj_marketplace_initial_snapshot_created");
		expect(firstPayload.eventCount ?? 0).toBe(0);

		const secondReq = new IncomingRequest("https://example.com/?mode=tcj_marketplace_preview");
		const secondCtx = createExecutionContext();
		const secondRes = await worker.fetch(secondReq, env, secondCtx);
		await waitOnExecutionContext(secondCtx);
		const secondPayload = (await secondRes.json()) as {
			ok: boolean;
			listedCount: number;
			purchasedCount: number;
			previewMessage: string;
		};
		expect(secondPayload.ok).toBe(true);
		expect(secondPayload.listedCount).toBe(1);
		expect(secondPayload.purchasedCount).toBe(1);
		expect(secondPayload.previewMessage).toContain("🆕 新着出品");
		expect(secondPayload.previewMessage).toContain("ミュウex");
		expect(secondPayload.previewMessage).toContain("listing_id=p3");
		expect(secondPayload.previewMessage).toContain("#TCGSTORE #NFT #ポケカ");
	});

	it("uses purchase template when only purchased events are detected", async () => {
		const polygonUrl =
			"https://api.tcgstore.io/api/v1/marketplace?skip=0&limit=100&orderBy=published_at&orderDirection=desc&chain_id=polygon&search=";
		const oasysUrl =
			"https://api.tcgstore.io/api/v1/marketplace?skip=0&limit=100&orderBy=published_at&orderDirection=desc&chain_id=oasys&search=";
		const polygonRun1 = {
			data: [
				{
					id: "p1",
					status: 1,
					listing_type: 1,
					chain_id: 137,
					token_id: "101",
					created_at: "2026-03-29T10:00:00.000Z",
					current_price: 100,
					current_currency_id: 5,
					card: { name: "リザードンex", main_image_url: "https://example.com/p1.png" },
				},
				{
					id: "p2",
					status: 1,
					listing_type: 1,
					chain_id: 137,
					token_id: "102",
					created_at: "2026-03-29T10:05:00.000Z",
					current_price: 150,
					current_currency_id: 5,
					card: { name: "ピカチュウex", main_image_url: "https://example.com/p2.png" },
				},
			],
		};
		const polygonRun2 = {
			data: [
				{
					id: "p2",
					status: 1,
					listing_type: 1,
					chain_id: 137,
					token_id: "102",
					created_at: "2026-03-29T10:05:00.000Z",
					current_price: 150,
					current_currency_id: 5,
					card: { name: "ピカチュウex", main_image_url: "https://example.com/p2.png" },
				},
			],
		};
		const oasysRun = {
			data: [
				{
					id: "o1",
					status: 1,
					listing_type: 1,
					chain_id: 248,
					token_id: "201",
					created_at: "2026-03-29T10:20:00.000Z",
					current_price: 25,
					current_currency_id: 6,
					card: { name: "ゲンガー", main_image_url: "https://example.com/o1.png" },
				},
			],
		};

		let runIndex = 0;
		let callInRun = 0;
		const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
			const url = input instanceof Request ? input.url : String(input);
			if (url === polygonUrl) {
				const payload = runIndex === 0 ? polygonRun1 : polygonRun2;
				callInRun += 1;
				return new Response(JSON.stringify(payload), {
					status: 200,
					headers: { "content-type": "application/json" },
				});
			}
			if (url === oasysUrl) {
				callInRun += 1;
				const response = new Response(JSON.stringify(oasysRun), {
					status: 200,
					headers: { "content-type": "application/json" },
				});
				if (callInRun % 2 === 0) runIndex += 1;
				return response;
			}
			throw new Error(`Unhandled fetch: ${url}`);
		});
		vi.stubGlobal("fetch", fetchMock);

		const firstReq = new IncomingRequest("https://example.com/?mode=tcj_marketplace_preview");
		const firstCtx = createExecutionContext();
		const firstRes = await worker.fetch(firstReq, env, firstCtx);
		await waitOnExecutionContext(firstCtx);
		const firstPayload = (await firstRes.json()) as { ok: boolean; reason?: string };
		expect(firstPayload.ok).toBe(true);
		expect(firstPayload.reason).toBe("tcj_marketplace_initial_snapshot_created");

		const secondReq = new IncomingRequest("https://example.com/?mode=tcj_marketplace_preview");
		const secondCtx = createExecutionContext();
		const secondRes = await worker.fetch(secondReq, env, secondCtx);
		await waitOnExecutionContext(secondCtx);
		const secondPayload = (await secondRes.json()) as {
			ok: boolean;
			listedCount: number;
			purchasedCount: number;
			previewMessage: string;
		};
		expect(secondPayload.ok).toBe(true);
		expect(secondPayload.listedCount).toBe(0);
		expect(secondPayload.purchasedCount).toBe(1);
		expect(secondPayload.previewMessage).toContain("🎉 購入成立");
		expect(secondPayload.previewMessage).toContain("市場が動いてます");
		expect(secondPayload.previewMessage).toContain("listing_id=p1");
		expect(secondPayload.previewMessage).toContain("#TCGSTORE #NFT #ポケカ");
	});
});
