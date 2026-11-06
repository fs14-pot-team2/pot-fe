import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const PAGE_SIZE = 10;

interface JusoItem {
  roadAddr: string;
  roadAddrPart1: string;
  jibunAddr: string;
  zipNo: string;
  siNm: string;
  sggNm: string;
  emdNm: string;
  liNm: string;
  bdMgtSn: string;
}

interface JusoResponse {
  results?: {
    common?: {
      totalCount: string;
      errorCode: string;
      errorMessage: string;
    };
    juso?: JusoItem[];
  };
}

export async function GET(request: NextRequest) {
  const keyword = request.nextUrl.searchParams.get("keyword")?.trim() ?? "";

  const pageParam = request.nextUrl.searchParams.get("page") ?? "1";
  const page = Number(pageParam);

  if (keyword.length < 2 || keyword.length > 100) {
    return NextResponse.json({ message: "검색어를 2~100자로 입력해 주세요." }, { status: 400 });
  }

  if (!Number.isSafeInteger(page) || page < 1 || page > 1000) {
    return NextResponse.json({ message: "올바르지 않은 페이지 번호예요." }, { status: 400 });
  }

  const apiKey = process.env.JUSO_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { message: "도로명주소 API 키가 설정되지 않았어요." },
      { status: 503 },
    );
  }

  const params = new URLSearchParams({
    confmKey: apiKey,
    currentPage: String(page),
    countPerPage: String(PAGE_SIZE),
    keyword,
    resultType: "json",
  });

  try {
    const response = await fetch(
      `https://business.juso.go.kr/addrlink/addrLinkApi.do?${params.toString()}`,
      {
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      },
    );

    if (!response.ok) {
      throw new Error("도로명주소 API 요청 실패");
    }

    const data = (await response.json()) as JusoResponse;
    const common = data.results?.common;

    if (!common) {
      throw new Error("주소 검색 응답 형식이 올바르지 않아요.");
    }

    if (common.errorCode !== "0") {
      return NextResponse.json(
        {
          message: common.errorMessage || "주소 검색에 실패했어요.",
        },
        { status: 502 },
      );
    }

    const totalCount = Number(common.totalCount) || 0;

    const addresses = (data.results?.juso ?? []).map((item) => ({
      id: item.bdMgtSn,
      zonecode: item.zipNo,
      address: item.roadAddrPart1 || item.roadAddr,
      jibunAddress: item.jibunAddr,
      sido: item.siNm,
      sigungu: item.sggNm.trim() || null,
      bname: item.liNm?.trim() || item.emdNm?.trim() || null,
    }));

    return NextResponse.json({
      addresses,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / PAGE_SIZE),
    });
  } catch {
    return NextResponse.json({ message: "주소 검색 서버에 연결하지 못했어요." }, { status: 502 });
  }
}
