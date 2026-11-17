import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

// 실제 SSE 코드를 읽고 테스트 환경에서 실행할 JS로 변환
const source = readFileSync(new URL("../src/lib/sse/sseClient.ts", import.meta.url), "utf8");

const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
    esModuleInterop: true,
  },
}).outputText;

function createClient(fetchMock, refreshMock) {
  let token = "expired-token";
  const exports = {};

  // 실제 인증 API 대신 테스트용 함수를 연결
  const mocks = {
    axios: {
      __esModule: true,
      default: {
        isAxiosError: (error) => error?.isAxiosError === true,
      },
    },
    "@/features/auth/api/authApi": {
      refreshAccessToken: refreshMock,
    },
    "@/lib/auth/accessToken": {
      getAccessToken: () => token,
      setAccessToken: (value) => {
        token = value;
      },
    },
  };

  vm.runInNewContext(compiled, {
    exports,
    require: (id) => {
      if (!(id in mocks)) {
        throw new Error(`예상하지 못한 의존성: ${id}`);
      }
      return mocks[id];
    },
    fetch: fetchMock,
    Response,
    TextDecoder,
    AbortController,
    setTimeout,
    clearTimeout,
    console,
  });

  return {
    connectSse: exports.connectSse,
    getToken: () => token,
    setToken: (value) => {
      token = value;
    },
  };
}

function expiredResponse() {
  return new Response(JSON.stringify({ code: "TOKEN_EXPIRED" }), {
    status: 401,
    headers: { "content-type": "application/json" },
  });
}

function successResponse(notificationId = "mock-1") {
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(
        new TextEncoder().encode(
          `event: notification.created\ndata: {"notificationId":"${notificationId}"}\n\n`,
        ),
      );
      controller.close();
    },
  });

  return new Response(stream, {
    status: 200,
    headers: { "content-type": "text/event-stream" },
  });
}

function observe(client, timeoutMs = 1500) {
  let disconnect = () => {};

  const result = new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("SSE 테스트 응답 시간 초과"));
    }, timeoutMs);

    disconnect = client.connectSse(
      (event) => {
        clearTimeout(timer);
        resolve({ kind: "event", event });
      },
      {
        onAuthError: (error) => {
          clearTimeout(timer);
          resolve({ kind: "auth-error", error });
        },
      },
    );
  });

  return { result, disconnect: () => disconnect() };
}

// 테스트 1: Access Token 만료 → Refresh → SSE 재연결
test("TOKEN_EXPIRED 발생 시 토큰 갱신 후 SSE 연결", async () => {
  const tokens = [];
  let refreshCount = 0;

  const client = createClient(
    async (_url, options) => {
      const token = options.headers.Authorization;
      tokens.push(token);

      return token === "Bearer expired-token" ? expiredResponse() : successResponse();
    },
    async () => {
      refreshCount += 1;
      return { accessToken: "new-token" };
    },
  );

  const watcher = observe(client);

  try {
    const result = await watcher.result;

    assert.equal(result.kind, "event");
    assert.equal(result.event.type, "notification.created");
    assert.equal(result.event.data.notificationId, "mock-1");
    assert.equal(refreshCount, 1);
    assert.equal(client.getToken(), "new-token");

    assert.deepEqual(tokens, ["Bearer expired-token", "Bearer new-token"]);
  } finally {
    watcher.disconnect();
  }
});

// 테스트 2: Refresh Token 무효 → 재연결 중단
test("Refresh Token 무효 시 인증 실패 전달", async () => {
  let refreshCount = 0;

  const client = createClient(
    async () => expiredResponse(),
    async () => {
      refreshCount += 1;

      throw {
        isAxiosError: true,
        response: {
          status: 401,
          data: { code: "REFRESH_TOKEN_INVALID" },
        },
      };
    },
  );

  const watcher = observe(client);

  try {
    const result = await watcher.result;

    assert.equal(result.kind, "auth-error");
    assert.equal(result.error.shouldClearSession, true);
    assert.equal(result.error.tokenAtFailure, "expired-token");
    assert.equal(refreshCount, 1);
    assert.equal(client.getToken(), "expired-token");
  } finally {
    watcher.disconnect();
  }
});

test("401 UNAUTHORIZED는 재발급 없이 인증 오류를 전달한다", async () => {
  let requestCount = 0;
  let refreshCount = 0;

  const client = createClient(
    async () => {
      requestCount += 1;
      return new Response(JSON.stringify({ code: "UNAUTHORIZED" }), {
        status: 401,
      });
    },
    async () => {
      refreshCount += 1;
      return { accessToken: "new-token" };
    },
  );

  const watcher = observe(client);

  try {
    const result = await watcher.result;

    assert.equal(result.kind, "auth-error");
    assert.equal(result.error.shouldClearSession, true);
    assert.equal(result.error.tokenAtFailure, "expired-token");
    assert.equal(requestCount, 1);
    assert.equal(refreshCount, 0);
  } finally {
    watcher.disconnect();
  }
});

test("403 권한 오류는 세션 종료를 요청하지 않는다", async () => {
  let requestCount = 0;

  const client = createClient(
    async () => {
      requestCount += 1;
      return new Response(null, { status: 403 });
    },
    async () => ({ accessToken: "new-token" }),
  );

  const watcher = observe(client);

  try {
    const result = await watcher.result;

    assert.equal(result.kind, "auth-error");
    assert.equal(result.error.shouldClearSession, false);
    assert.equal(requestCount, 1);
    assert.equal(client.getToken(), "expired-token");
  } finally {
    watcher.disconnect();
  }
});

test("토큰 갱신 후에도 401이면 무한 재발급하지 않는다", async () => {
  let requestCount = 0;
  let refreshCount = 0;

  const client = createClient(
    async () => {
      requestCount += 1;

      return new Response(JSON.stringify({ code: "TOKEN_EXPIRED" }), {
        status: 401,
      });
    },
    async () => {
      refreshCount += 1;
      return { accessToken: "new-token" };
    },
  );

  const watcher = observe(client);

  try {
    const result = await watcher.result;

    assert.equal(result.kind, "auth-error");
    assert.equal(result.error.shouldClearSession, false);
    assert.equal(requestCount, 2);
    assert.equal(refreshCount, 1);
    assert.equal(client.getToken(), "new-token");
  } finally {
    watcher.disconnect();
  }
});

test("다른 API가 먼저 토큰을 갱신하면 최신 토큰을 재사용한다", async () => {
  let resolveFirstRequest;
  const firstResponse = new Promise((resolve) => {
    resolveFirstRequest = resolve;
  });

  const requestedTokens = [];
  let refreshCount = 0;

  const client = createClient(
    async (_url, options) => {
      const authorization = options.headers.Authorization;
      requestedTokens.push(authorization);

      if (authorization === "Bearer expired-token") {
        return firstResponse;
      }

      return successResponse();
    },
    async () => {
      refreshCount += 1;
      return { accessToken: "unexpected-token" };
    },
  );

  const watcher = observe(client);

  try {
    // SSE의 첫 번째 응답을 기다리는 동안 다른 API가 토큰을 갱신
    client.setToken("api-refreshed-token");

    // 뒤늦게 SSE의 이전 요청에서 401 응답 도착
    resolveFirstRequest(expiredResponse());

    const result = await watcher.result;

    assert.equal(result.kind, "event");
    assert.equal(client.getToken(), "api-refreshed-token");
    assert.equal(refreshCount, 0);

    assert.deepEqual(requestedTokens, ["Bearer expired-token", "Bearer api-refreshed-token"]);
  } finally {
    watcher.disconnect();
  }
});

test("토큰 재발급 중 로그아웃하면 이전 갱신 결과를 무시한다", async () => {
  let notifyRefreshStarted;
  const refreshStarted = new Promise((resolve) => {
    notifyRefreshStarted = resolve;
  });

  let finishRefresh;
  const pendingRefresh = new Promise((resolve) => {
    finishRefresh = resolve;
  });

  let requestCount = 0;
  let eventCount = 0;
  let authErrorCount = 0;

  const client = createClient(
    async () => {
      requestCount += 1;
      return expiredResponse();
    },
    async () => {
      notifyRefreshStarted();
      return pendingRefresh;
    },
  );

  const disconnect = client.connectSse(
    () => {
      eventCount += 1;
    },
    {
      onAuthError: () => {
        authErrorCount += 1;
      },
    },
  );

  try {
    // Refresh 요청이 시작될 때까지 기다림
    await refreshStarted;

    // 재발급 완료 전에 로그아웃
    client.setToken(null);
    disconnect();

    // 로그아웃 이후 이전 Refresh 요청이 성공
    finishRefresh({ accessToken: "late-token" });

    await new Promise((resolve) => setImmediate(resolve));

    assert.equal(client.getToken(), null);
    assert.equal(requestCount, 1);
    assert.equal(eventCount, 0);
    assert.equal(authErrorCount, 0);
  } finally {
    disconnect();
  }
});

test("재발급 중 계정이 변경되면 새로운 계정의 토큰을 유지한다", async () => {
  let notifyRefreshStarted;
  const refreshStarted = new Promise((resolve) => {
    notifyRefreshStarted = resolve;
  });

  let finishRefresh;
  const pendingRefresh = new Promise((resolve) => {
    finishRefresh = resolve;
  });

  const requestedTokens = [];

  const client = createClient(
    async (_url, options) => {
      const token = options.headers.Authorization;
      requestedTokens.push(token);

      return token === "Bearer expired-token" ? expiredResponse() : successResponse("new-user");
    },
    async () => {
      notifyRefreshStarted();
      return pendingRefresh;
    },
  );

  const watcher = observe(client);

  try {
    await refreshStarted;

    // 토큰 재발급 완료 전에 다른 계정으로 변경
    client.setToken("new-user-token");

    // 이전 계정의 Refresh 요청이 뒤늦게 성공
    finishRefresh({ accessToken: "old-user-refreshed-token" });

    const result = await watcher.result;

    assert.equal(result.kind, "event");
    assert.equal(result.event.data.notificationId, "new-user");
    assert.equal(client.getToken(), "new-user-token");

    assert.deepEqual(requestedTokens, ["Bearer expired-token", "Bearer new-user-token"]);
  } finally {
    watcher.disconnect();
  }
});

test("계정 변경 후 이전 SSE 연결의 200 응답은 무시한다", async () => {
  let finishOldRequest;
  const oldResponse = new Promise((resolve) => {
    finishOldRequest = resolve;
  });

  const requestedTokens = [];

  const client = createClient(
    async (_url, options) => {
      const token = options.headers.Authorization;
      requestedTokens.push(token);

      if (token === "Bearer expired-token") {
        return oldResponse;
      }

      return successResponse("new-user");
    },
    async () => {
      throw new Error("Refresh API를 호출하면 안 됩니다.");
    },
  );

  const watcher = observe(client);

  try {
    // 이전 SSE 요청이 대기 중인 상태에서 계정 전환
    client.setToken("new-user-token");

    // 예전 계정으로 요청한 SSE가 뒤늦게 성공
    finishOldRequest(successResponse("old-user"));

    const result = await watcher.result;

    assert.equal(result.kind, "event");
    assert.equal(result.event.data.notificationId, "new-user");
    assert.equal(client.getToken(), "new-user-token");

    assert.deepEqual(requestedTokens, ["Bearer expired-token", "Bearer new-user-token"]);
  } finally {
    watcher.disconnect();
  }
});

test("이미 연결된 SSE에서 계정 변경 후 이전 이벤트를 무시한다", async () => {
  let streamController;
  let notifyOpened;

  const opened = new Promise((resolve) => {
    notifyOpened = resolve;
  });

  const requestedTokens = [];

  const client = createClient(
    async (_url, options) => {
      const authorization = options.headers.Authorization;
      requestedTokens.push(authorization);

      if (authorization === "Bearer expired-token") {
        const stream = new ReadableStream({
          start(controller) {
            streamController = controller;
          },
        });

        notifyOpened();

        return new Response(stream, {
          status: 200,
          headers: { "content-type": "text/event-stream" },
        });
      }

      return successResponse("new-user");
    },
    async () => {
      throw new Error("Refresh API가 호출되면 안 됩니다.");
    },
  );

  const watcher = observe(client, 5000);

  try {
    await opened;
    await new Promise((resolve) => setImmediate(resolve));

    // 기존 SSE 연결이 열린 상태에서 다른 계정으로 변경
    client.setToken("new-user-token");

    // 이전 계정의 이벤트가 뒤늦게 도착
    streamController.enqueue(
      new TextEncoder().encode(
        'event: notification.created\ndata: {"notificationId":"old-user"}\n\n',
      ),
    );
    streamController.close();

    const result = await watcher.result;

    // 이전 계정의 이벤트가 아닌 새 계정의 이벤트만 전달되어야 함
    assert.equal(result.kind, "event");
    assert.equal(result.event.data.notificationId, "new-user");
    assert.equal(client.getToken(), "new-user-token");

    assert.deepEqual(requestedTokens, ["Bearer expired-token", "Bearer new-user-token"]);
  } finally {
    watcher.disconnect();
  }
});
