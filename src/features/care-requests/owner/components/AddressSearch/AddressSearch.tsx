"use client";

import { useEffect, useRef, useState } from "react";

import Modal from "@/components/ui/Modal/Modal";
import SearchInput from "@/components/ui/SearchInput/SearchInput";
import Pagination from "@/components/ui/Pagination/Pagination";

import styles from "./AddressSearch.module.css";

export interface SelectedAddress {
  zonecode: string;
  address: string;
  sido: string;
  sigungu: string | null;
  bname: string | null;
}

interface AddressResult extends SelectedAddress {
  id: string;
  jibunAddress: string;
}

interface AddressSearchResponse {
  addresses: AddressResult[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

interface AddressSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (address: SelectedAddress) => void;
}

export default function AddressSearch({ isOpen, onClose, onSelect }: AddressSearchProps) {
  const [keyword, setKeyword] = useState("");
  const [searchedKeyword, setSearchedKeyword] = useState("");

  const [addresses, setAddresses] = useState<AddressResult[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const controllerRef = useRef<AbortController | null>(null);

  // 컴포넌트가 해제되면 진행 중인 요청 취소
  useEffect(() => {
    return () => {
      controllerRef.current?.abort();
    };
  }, []);

  const fetchAddresses = async (searchKeyword: string, page: number) => {
    controllerRef.current?.abort();

    const controller = new AbortController();
    controllerRef.current = controller;

    setIsLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        keyword: searchKeyword,
        page: String(page),
      });

      const response = await fetch(`/api/address-search?${params.toString()}`, {
        signal: controller.signal,
      });

      const data: AddressSearchResponse & {
        message?: string;
      } = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "주소 검색에 실패했어요.");
      }

      if (controller.signal.aborted) return;

      setAddresses(data.addresses);
      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
      setTotalCount(data.totalCount);
    } catch (caughtError) {
      if (controller.signal.aborted) return;

      setAddresses([]);
      setTotalPages(0);
      setTotalCount(0);

      setError(
        caughtError instanceof Error ? caughtError.message : "주소 검색 중 오류가 발생했어요.",
      );
    } finally {
      if (controllerRef.current === controller) {
        controllerRef.current = null;
        setIsLoading(false);
      }
    }
  };

  const handleSearch = (value: string) => {
    const trimmed = value.trim();

    if (trimmed.length < 2) {
      controllerRef.current?.abort();
      controllerRef.current = null;

      setSearchedKeyword("");
      setAddresses([]);
      setTotalPages(0);
      setTotalCount(0);
      setIsLoading(false);
      setError("검색어를 두 글자 이상 입력해 주세요.");
      return;
    }

    setSearchedKeyword(trimmed);
    void fetchAddresses(trimmed, 1);
  };

  const handlePageChange = (page: number) => {
    if (isLoading || !searchedKeyword || page === currentPage) {
      return;
    }

    void fetchAddresses(searchedKeyword, page);
  };

  const handleSelect = (item: AddressResult) => {
    onSelect({
      zonecode: item.zonecode,
      address: item.address,
      sido: item.sido,
      sigungu: item.sigungu,
      bname: item.bname,
    });

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="주소 검색" className={styles.modal}>
      <div className={styles.container}>
        <SearchInput
          value={keyword}
          onChange={setKeyword}
          onSearch={handleSearch}
          placeholder="도로명, 건물명 또는 지번 검색"
          disabled={isLoading}
        />

        {error && (
          <p className={styles.errorMessage} role="alert">
            {error}
          </p>
        )}

        {isLoading ? (
          <p className={styles.statusMessage} role="status">
            주소를 검색하고 있어요...
          </p>
        ) : searchedKeyword && !error ? (
          <div className={styles.resultArea}>
            <p className={styles.resultCount}>
              검색 결과 <strong>{totalCount.toLocaleString("ko-KR")}</strong>건
            </p>

            {addresses.length === 0 ? (
              <p className={styles.statusMessage}>검색된 주소가 없어요.</p>
            ) : (
              <>
                <ul className={styles.resultList}>
                  {addresses.map((item, index) => (
                    <li key={`${item.id}-${index}`} className={styles.resultItem}>
                      <button
                        type="button"
                        className={styles.resultButton}
                        onClick={() => handleSelect(item)}
                      >
                        <strong className={styles.zipcode}>{item.zonecode}</strong>

                        <span className={styles.addressLine}>
                          <span className={styles.addressBadge}>도로명</span>
                          <span>{item.address}</span>
                        </span>

                        <span className={styles.addressLine}>
                          <span className={styles.addressBadge}>지번</span>
                          <span>{item.jibunAddress}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>

                {totalPages > 1 && (
                  <Pagination
                    className={styles.pagination}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            )}
          </div>
        ) : (
          <div className={styles.guide}>
            <strong>주소 검색 TIP</strong>
            <p>도로명과 건물번호를 함께 입력하면 더 정확하게 검색할 수 있어요.</p>
            <p className={styles.example}>예) 중앙로 1205, 테헤란로 152</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
