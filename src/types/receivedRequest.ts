export type ServiceType = "SHORT_CARE" | "REGULAR_CARE";

export type Region =
  | "SEOUL"
  | "GYEONGGI"
  | "INCHEON"
  | "GANGWON"
  | "CHUNGBUK"
  | "CHUNGNAM"
  | "SEJONG"
  | "DAEJEON"
  | "JEONBUK"
  | "JEONNAM"
  | "GWANGJU"
  | "GYEONGBUK"
  | "GYEONGNAM"
  | "DAEGU"
  | "ULSAN"
  | "BUSAN"
  | "JEJU";

export type ReceivedRequestSort = "LATEST" | "START_DATE_ASC";

export interface ReceivedRequestItem {
  careRequest: {
    id: string;
    createdAt: string;
    serviceType: ServiceType;
    startDate: string;
    endDate: string;
    sido: string;
    sigungu: string | null;
    bname: string | null;
    owner: {
      nickname: string;
    };
  };
  designatedRequestId: string | null;
}

export interface ReceivedRequestsResponse {
  items: ReceivedRequestItem[];
  availableRegions: Region[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface ReceivedRequestsParams {
  page: number;
  pageSize: 8;
  serviceTypes: ServiceType[];
  designatedOnly: boolean;
  regions: Region[];
  keyword: string;
  sort: ReceivedRequestSort;
}
